"use server";

import { prisma } from "@/lib/prisma";
import { requireUser, businessIdsForUser } from "@/lib/rbac";

export async function getMySubscription() {
  const user = await requireUser();
  const [subscription, businessCount, campaignCount] = await Promise.all([
    prisma.subscription.findFirst({ where: { userId: user.id }, include: { plan: true }, orderBy: { createdAt: "desc" } }),
    businessIdsForUser(user.id).then((ids) => ids.length),
    prisma.reviewCampaign.count({ where: { business: { members: { some: { userId: user.id } } } } }),
  ]);
  return { subscription, businessCount, campaignCount };
}

/** The owner's own billing history — every charge attempted against their subscription(s), most recent first. */
export async function getMyPayments() {
  const user = await requireUser();
  return prisma.payment.findMany({
    where: { subscription: { userId: user.id } },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
