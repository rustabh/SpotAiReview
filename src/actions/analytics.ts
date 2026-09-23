"use server";

import { prisma } from "@/lib/prisma";
import { requireBusinessAccess, requireUser, businessIdsForUser } from "@/lib/rbac";
import { getAIProvider } from "@/lib/ai";
import { format } from "date-fns";
import { resolveDateRange, type DateRangeKey } from "@/lib/date-range";

export type { DateRangeKey };

export async function getBusinessFunnel(businessId: string, range: DateRangeKey = "30d") {
  await requireBusinessAccess(businessId);
  const { from, to } = resolveDateRange(range);

  const events = await prisma.analyticsEvent.findMany({
    where: { businessId, createdAt: { gte: from, lte: to } },
    select: { type: true, createdAt: true },
  });

  const countOf = (type: string) => events.filter((e) => e.type === type).length;

  const funnel = {
    scans: countOf("SCAN"),
    started: countOf("SESSION_STARTED"),
    completed: countOf("FEEDBACK_SUBMITTED"),
    aiGenerated: countOf("AI_DRAFT_GENERATED"),
    copied: countOf("DRAFT_COPIED"),
    googleClicks: countOf("GOOGLE_CLICK"),
    privateFeedback: countOf("PRIVATE_FEEDBACK_SUBMITTED"),
  };

  const byDay = new Map<string, { date: string; scans: number; feedback: number }>();
  for (const e of events) {
    if (e.type !== "SCAN" && e.type !== "FEEDBACK_SUBMITTED") continue;
    const key = format(e.createdAt, "MMM d");
    const entry = byDay.get(key) ?? { date: key, scans: 0, feedback: 0 };
    if (e.type === "SCAN") entry.scans++;
    if (e.type === "FEEDBACK_SUBMITTED") entry.feedback++;
    byDay.set(key, entry);
  }

  return { funnel, timeSeries: [...byDay.values()] };
}

export async function getBusinessFeedbackStats(businessId: string, range: DateRangeKey = "30d") {
  await requireBusinessAccess(businessId);
  const { from, to } = resolveDateRange(range);

  const feedback = await prisma.customerFeedback.findMany({
    where: { businessId, createdAt: { gte: from, lte: to } },
  });

  const ratingDistribution = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: feedback.filter((f) => f.rating === r).length,
  }));

  const languageCounts = new Map<string, number>();
  for (const f of feedback) languageCounts.set(f.language, (languageCounts.get(f.language) ?? 0) + 1);

  const avgRating = feedback.length ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0;

  return {
    total: feedback.length,
    avgRating: Math.round(avgRating * 10) / 10,
    ratingDistribution,
    languageDistribution: [...languageCounts.entries()].map(([language, count]) => ({ language, count })),
  };
}

export async function getCampaignPerformance(businessId: string) {
  await requireBusinessAccess(businessId);
  const campaigns = await prisma.reviewCampaign.findMany({
    where: { businessId },
    include: { _count: { select: { analyticsEvents: true, sessions: true } } },
  });

  return Promise.all(
    campaigns.map(async (c) => {
      const scans = await prisma.analyticsEvent.count({ where: { campaignId: c.id, type: "SCAN" } });
      const completions = await prisma.analyticsEvent.count({ where: { campaignId: c.id, type: "FEEDBACK_SUBMITTED" } });
      return { id: c.id, name: c.name, code: c.code, placement: c.placement, scans, completions };
    })
  );
}

export async function getRecentFeedback(businessId: string, take = 10) {
  await requireBusinessAccess(businessId);
  return prisma.customerFeedback.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take,
    include: { session: { include: { campaign: true, drafts: { where: { isFinal: true } } } } },
  });
}

export async function getPrivateFeedbackList(businessId: string) {
  await requireBusinessAccess(businessId);
  return prisma.privateFeedback.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: { session: true },
  });
}

export async function markPrivateFeedbackRead(id: string, businessId: string) {
  await requireBusinessAccess(businessId);
  await prisma.privateFeedback.update({ where: { id }, data: { status: "READ" } });
}

export async function getOwnerOverview() {
  const user = await requireUser();
  const businessIds = user.role === "SUPER_ADMIN" ? undefined : await businessIdsForUser(user.id);
  const where = businessIds ? { businessId: { in: businessIds } } : {};
  const businessWhere = businessIds ? { id: { in: businessIds } } : {};

  const [totalBusinesses, totalScans, aiGenerated, googleClicks] = await Promise.all([
    prisma.business.count({ where: businessWhere }),
    prisma.analyticsEvent.count({ where: { ...where, type: "SCAN" } }),
    prisma.analyticsEvent.count({ where: { ...where, type: "AI_DRAFT_GENERATED" } }),
    prisma.analyticsEvent.count({ where: { ...where, type: "GOOGLE_CLICK" } }),
  ]);

  const recentFeedback = await prisma.customerFeedback.findMany({
    where: businessIds ? { businessId: { in: businessIds } } : {},
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { business: true },
  });

  return { totalBusinesses, totalScans, aiGenerated, googleClicks, recentFeedback };
}

export async function generateBusinessInsights(businessId: string) {
  const { business } = await requireBusinessAccess(businessId);
  const category = await prisma.businessCategory.findUnique({ where: { id: business.categoryId } });
  const feedback = await prisma.customerFeedback.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const provider = await getAIProvider();
  return provider.generateInsights({
    businessName: business.name,
    categoryName: category?.name ?? "Business",
    feedbackSamples: feedback.map((f) => ({
      rating: f.rating,
      attributes: (f.selectedAttributes as string[]) ?? [],
      text: f.writtenFeedback,
    })),
  });
}
