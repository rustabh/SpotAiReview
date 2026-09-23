import "server-only";
import { prisma } from "@/lib/prisma";
import type { AnalyticsEventType, Prisma } from "@prisma/client";

export async function logEvent(params: {
  businessId: string;
  campaignId?: string | null;
  sessionId?: string | null;
  type: AnalyticsEventType;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.analyticsEvent.create({
    data: {
      businessId: params.businessId,
      campaignId: params.campaignId ?? null,
      sessionId: params.sessionId ?? null,
      type: params.type,
      metadata: params.metadata,
    },
  });
}
