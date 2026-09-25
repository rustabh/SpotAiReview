"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/rbac";
import type { ActionResult } from "./auth";

export async function inviteTeamMember(businessId: string, email: string, role: "MANAGER" | "STAFF"): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (membership && membership.role !== "OWNER") return { ok: false, error: "Only the business owner can manage the team." };

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    return { ok: false, error: "No AiReview account found for this email yet. Ask them to register first, then invite them." };
  }

  const existing = await prisma.businessMember.findUnique({ where: { userId_businessId: { userId: user.id, businessId } } });
  if (existing) return { ok: false, error: "This person is already on your team." };

  await prisma.businessMember.create({
    data: { userId: user.id, businessId, role, acceptedAt: new Date() },
  });

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
