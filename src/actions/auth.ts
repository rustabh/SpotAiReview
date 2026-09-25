"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { sendEmail, passwordResetEmail, welcomeEmail } from "@/lib/email";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function registerBusinessOwner(input: unknown): Promise<ActionResult<{ userId: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) return { ok: false, error: "An account with this email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "BUSINESS_OWNER",
      status: "ACTIVE",
    },
  });

  const freePlan = await prisma.plan.findFirst({ where: { slug: "free" } });
  if (freePlan) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: freePlan.id,
        status: "TRIALING",
        billingCycle: "MONTHLY",
      },
    });
  }

  await sendEmail({ to: user.email, subject: "Welcome to AiReview", html: welcomeEmail(user.name) });

  return { ok: true, data: { userId: user.id } };
}

/**
 * The reset link is only ever emailed to the account's own address — never
 * returned to the caller — so requesting a reset for an email you don't own
 * can't be used to hijack that account.
 */
export async function requestPasswordReset(input: unknown): Promise<ActionResult<null>> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a valid email" };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() } });
  if (!user) return { ok: true, data: null }; // don't leak account existence

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + 1000 * 60 * 30) },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/reset-password?token=${token}`;
  await sendEmail({ to: user.email, subject: "Reset your AiReview password", html: passwordResetEmail(resetUrl) });

  return { ok: true, data: null };
}

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const record = await prisma.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { ok: true, data: undefined };
}
