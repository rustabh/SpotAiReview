"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/rbac";
import { getAIProvider } from "@/lib/ai";
import { getLocationDetails } from "@/lib/google/business-profile";
import { getValidAccessToken } from "@/lib/google/tokens";
import { computeGmbAuditChecklist, scoreChecklist, type GmbAuditCheck, type ReviewStats } from "@/lib/google/audit";
import type { ActionResult } from "./auth";
import type { Prisma } from "@prisma/client";

export type GmbAuditView = {
  score: number;
  checks: GmbAuditCheck[];
  summary: string;
  auditedAt: Date;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

async function getReviewStats(businessId: string): Promise<ReviewStats> {
  const [agg, repliedCount, recentCount] = await Promise.all([
    prisma.googleReview.aggregate({ where: { businessId }, _avg: { starRating: true }, _count: true }),
    prisma.googleReview.count({ where: { businessId, replyStatus: "POSTED" } }),
    prisma.googleReview.count({ where: { businessId, reviewCreatedAt: { gte: new Date(Date.now() - THIRTY_DAYS_MS) } } }),
  ]);
  return {
    totalReviews: agg._count,
    averageRating: agg._avg.starRating,
    repliedCount,
    hasReviewInLast30Days: recentCount > 0,
  };
}

/** Cached result from the last time the audit ran — shown on page load without hitting Google again. */
export async function getGmbAuditView(businessId: string): Promise<GmbAuditView | null> {
  await requireBusinessAccess(businessId);
  const connection = await prisma.googleBusinessConnection.findUnique({ where: { businessId } });
  if (!connection?.lastAuditAt) return null;

  return {
    score: connection.lastAuditScore ?? 0,
    checks: (connection.lastAuditChecklist as unknown as GmbAuditCheck[]) ?? [],
    summary: connection.lastAuditSummary ?? "",
    auditedAt: connection.lastAuditAt,
  };
}

/** Fetches the live profile from Google, recomputes the checklist against our own review data, and asks AI to prioritize. */
export async function runGmbAudit(businessId: string): Promise<ActionResult<GmbAuditView>> {
  await requireBusinessAccess(businessId);

  const connection = await prisma.googleBusinessConnection.findUnique({
    where: { businessId },
    include: { business: { include: { category: true } } },
  });
  if (!connection || connection.status !== "CONNECTED" || !connection.googleLocationName) {
    return { ok: false, error: "Connect your Google Business Profile first." };
  }

  try {
    const accessToken = await getValidAccessToken(connection.id);
    const details = await getLocationDetails(accessToken, connection.googleLocationName);
    const stats = await getReviewStats(businessId);

    const checks = computeGmbAuditChecklist(details, stats);
    const score = scoreChecklist(checks);

    const provider = await getAIProvider();
    const summary = await provider.generateGmbAuditSummary({
      businessName: connection.business.name,
      categoryName: connection.business.category.name,
      score,
      checks: checks.map((c) => ({ label: c.label, status: c.status, detail: c.detail, recommendation: c.recommendation })),
    });

    const auditedAt = new Date();
    await prisma.googleBusinessConnection.update({
      where: { id: connection.id },
      data: {
        lastAuditAt: auditedAt,
        lastAuditScore: score,
        lastAuditChecklist: checks as unknown as Prisma.InputJsonValue,
        lastAuditSummary: summary.content,
      },
    });

    revalidatePath("/dashboard/google-reviews");
    return { ok: true, data: { score, checks, summary: summary.content, auditedAt } };
  } catch (err) {
    return { ok: false, error: (err as Error).message || "Could not run the audit. Please try again." };
  }
}
