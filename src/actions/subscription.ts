"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, businessIdsForUser } from "@/lib/rbac";
import type { ActionResult } from "./auth";

export async function getMySubscription() {
  const user = await requireUser();
  const [subscription, businessCount, campaignCount] = await Promise.all([
    prisma.subscription.findFirst({ where: { userId: user.id }, include: { plan: true }, orderBy: { createdAt: "desc" } }),
    businessIdsForUser(user.id).then((ids) => ids.length),
    prisma.reviewCampaign.count({ where: { business: { members: { some: { userId: user.id } } } } }),
  ]);
  return { subscription, businessCount, campaignCount };
}

/**
 * No payment gateway is wired up yet (see Plan/Payment models, built to be
 * Razorpay/Stripe-ready). For this MVP, switching plans updates the
 * subscription directly so the plan-based limits are demonstrable end-to-end.
 */
export async function switchPlan(planId: string): Promise<ActionResult> {
  const user = await requireUser();
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) return { ok: false, error: "This plan is not available." };

  const existing = await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  if (existing) {
    await prisma.subscription.update({ where: { id: existing.id }, data: { planId, status: "ACTIVE" } });
  } else {
    await prisma.subscription.create({ data: { userId: user.id, planId, status: "ACTIVE", billingCycle: "MONTHLY" } });
  }

  revalidatePath("/dashboard/subscription");
  return { ok: true, data: undefined };
}
