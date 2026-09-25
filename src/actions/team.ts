"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess, requireUser } from "@/lib/rbac";
import { sendEmail, teamInviteEmail, teamInviteNewUserEmail } from "@/lib/email";
import { registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import type { ActionResult } from "./auth";

const INVITE_EXPIRY_DAYS = 7;

export async function inviteTeamMember(businessId: string, email: string, role: "MANAGER" | "STAFF"): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (membership && membership.role !== "OWNER") return { ok: false, error: "Only the business owner can manage the team." };

  const normalizedEmail = email.toLowerCase().trim();
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { name: true } });
  if (!business) return { ok: false, error: "Business not found." };

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    const existingMembership = await prisma.businessMember.findUnique({
      where: { userId_businessId: { userId: existingUser.id, businessId } },
    });
    if (existingMembership) return { ok: false, error: "This person is already on your team." };

    await prisma.businessMember.create({
      data: { userId: existingUser.id, businessId, role, acceptedAt: new Date() },
    });
    await sendEmail({
      to: existingUser.email,
      subject: `You've been added to ${business.name} on AiReview`,
      html: teamInviteEmail(business.name, role),
    });
    revalidatePath("/dashboard/team");
    return { ok: true, data: undefined };
  }

  const existingInvite = await prisma.teamInvite.findFirst({
    where: { businessId, email: normalizedEmail, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
  });
  if (existingInvite) return { ok: false, error: "An invite is already pending for this email." };

  const inviter = await requireUser();
  const token = crypto.randomBytes(24).toString("hex");
  await prisma.teamInvite.create({
    data: {
      businessId,
      email: normalizedEmail,
      role,
      token,
      invitedById: inviter.id,
      expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/invite/${token}`;
  await sendEmail({
    to: normalizedEmail,
    subject: `You've been invited to join ${business.name} on AiReview`,
    html: teamInviteNewUserEmail(business.name, role, acceptUrl),
  });

  revalidatePath("/dashboard/team");
  return { ok: true, data: undefined };
}

export async function listPendingInvites(businessId: string) {
  await requireBusinessAccess(businessId);
  return prisma.teamInvite.findMany({
    where: { businessId, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeInvite(inviteId: string, businessId: string): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (membership && membership.role !== "OWNER") return { ok: false, error: "Only the business owner can manage the team." };

  const invite = await prisma.teamInvite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.businessId !== businessId) return { ok: false, error: "Invite not found." };

  await prisma.teamInvite.update({ where: { id: inviteId }, data: { revokedAt: new Date() } });
  revalidatePath("/dashboard/team");
  return { ok: true, data: undefined };
}

export async function removeTeamMember(businessId: string, memberId: string): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (membership && membership.role !== "OWNER") return { ok: false, error: "Only the business owner can manage the team." };

  const target = await prisma.businessMember.findUnique({ where: { id: memberId } });
  if (!target || target.businessId !== businessId) return { ok: false, error: "Member not found." };
  if (target.role === "OWNER") return { ok: false, error: "The owner can't be removed." };

  await prisma.businessMember.delete({ where: { id: memberId } });
  revalidatePath("/dashboard/team");
  return { ok: true, data: undefined };
}

function activeInviteWhere(token: string) {
  return { token, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } } as const;
}

export async function getInviteByToken(token: string) {
  const invite = await prisma.teamInvite.findFirst({
    where: activeInviteWhere(token),
    include: { business: { select: { name: true } } },
  });
  if (!invite) return null;

  const existingUser = await prisma.user.findUnique({ where: { email: invite.email }, select: { id: true } });
  return { ...invite, hasAccount: Boolean(existingUser) };
}

/** For an invited email that already has an AiReview account — just needs to log in and accept. */
export async function acceptInviteForExistingUser(token: string): Promise<ActionResult> {
  const user = await requireUser();
  const invite = await prisma.teamInvite.findFirst({ where: activeInviteWhere(token) });
  if (!invite) return { ok: false, error: "This invite is invalid or has expired." };
  if (invite.email !== (user.email ?? "").toLowerCase()) return { ok: false, error: "This invite was sent to a different email address." };

  const existingMembership = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: user.id, businessId: invite.businessId } },
  });
  if (!existingMembership) {
    await prisma.businessMember.create({
      data: { userId: user.id, businessId: invite.businessId, role: invite.role, acceptedAt: new Date() },
    });
  }
  await prisma.teamInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}

/** For a brand-new invitee: creates their account and joins the business in one step. */
export async function acceptInviteNewUser(token: string, input: unknown): Promise<ActionResult<{ userId: string }>> {
  const invite = await prisma.teamInvite.findFirst({ where: activeInviteWhere(token) });
  if (!invite) return { ok: false, error: "This invite is invalid or has expired." };

  const parsed = registerSchema.omit({ email: true }).safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existing) return { ok: false, error: "An account with this email already exists — log in instead." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: invite.email, passwordHash, role: "BUSINESS_OWNER", status: "ACTIVE" },
  });

  const freePlan = await prisma.plan.findFirst({ where: { slug: "free" } });
  if (freePlan) {
    await prisma.subscription.create({
      data: { userId: user.id, planId: freePlan.id, status: "TRIALING", billingCycle: "MONTHLY" },
    });
  }

  await prisma.businessMember.create({
    data: { userId: user.id, businessId: invite.businessId, role: invite.role, acceptedAt: new Date() },
  });
  await prisma.teamInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });

  return { ok: true, data: { userId: user.id } };
}
