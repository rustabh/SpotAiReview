"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/rbac";
import crypto from "crypto";

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return { error: undefined };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function impersonateSignIn(token: string) {
  try {
    await signIn("impersonate", { token, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "This login link has expired." };
    }
    throw error;
  }
}

/**
 * Super-admin-only: mints a one-time token and signs straight into the
 * target business owner's dashboard. Every call is audit-logged.
 */
export async function loginAsOwnerAction(targetUserId: string) {
  const admin = await requireSuperAdmin();
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target || target.role !== "BUSINESS_OWNER") {
    return { error: "User not found." };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.impersonationToken.create({
    data: { token, targetUserId, createdById: admin.id, expiresAt: new Date(Date.now() + 60_000) },
  });
  await prisma.auditLog.create({
    data: { actorUserId: admin.id, action: "LOGIN_AS_OWNER", targetType: "User", targetId: targetUserId },
  });

  return impersonateSignIn(token);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
