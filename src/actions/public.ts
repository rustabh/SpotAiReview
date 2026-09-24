"use server";

import { prisma } from "@/lib/prisma";
import type { AIProviderName as PrismaAIProviderName } from "@prisma/client";
import { logEvent } from "@/lib/analytics";
import { getAIProvider, estimateCostUsd, hasEnoughSignal, type AIGroundingContext, type TransformInstruction } from "@/lib/ai";
import type { ActionResult } from "./auth";

function asProviderEnum(name: string): PrismaAIProviderName {
  return name as PrismaAIProviderName;
}

const MAX_AI_ACTIONS_PER_SESSION = 12;

export async function getPublicPlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      monthlyPrice: true,
      yearlyPrice: true,
      businessLimit: true,
      campaignLimit: true,
      aiGenerationsPerMonth: true,
      teamMemberLimit: true,
      advancedInsights: true,
    },
  });
}

export async function getCampaignBySlug(slug: string) {
  const campaign = await prisma.reviewCampaign.findUnique({
    where: { slug },
    include: {
      business: {
        include: {
          category: { include: { attributes: { orderBy: { order: "asc" } }, questions: { orderBy: { order: "asc" } } } },
          googleReviewConfig: true,
        },
      },
    },
  });

  if (!campaign || campaign.status !== "ACTIVE" || campaign.business.status !== "ACTIVE") return null;
  return campaign;
}

export async function startOrResumeSession(input: {
  campaignSlug: string;
  existingSessionId?: string | null;
  deviceType?: string;
}) {
  const campaign = await getCampaignBySlug(input.campaignSlug);
  if (!campaign) return { ok: false as const, error: "This review link is no longer active." };

  if (input.existingSessionId) {
    const existing = await prisma.customerSession.findUnique({ where: { id: input.existingSessionId } });
    if (existing && existing.campaignId === campaign.id) {
      return { ok: true as const, sessionId: existing.id, campaign };
    }
  }

  const session = await prisma.customerSession.create({
    data: {
      businessId: campaign.businessId,
      campaignId: campaign.id,
      deviceType: input.deviceType ?? "unknown",
      currentStep: "landing",
    },
  });

  await logEvent({ businessId: campaign.businessId, campaignId: campaign.id, sessionId: session.id, type: "SCAN" });
  await logEvent({ businessId: campaign.businessId, campaignId: campaign.id, sessionId: session.id, type: "SESSION_STARTED" });

  return { ok: true as const, sessionId: session.id, campaign };
}

export async function submitLanguage(sessionId: string, language: string): Promise<ActionResult> {
  const session = await prisma.customerSession.findUnique({ where: { id: sessionId } });
  if (!session) return { ok: false, error: "Session not found." };

  await prisma.customerSession.update({ where: { id: sessionId }, data: { language, currentStep: "rating" } });
  await logEvent({ businessId: session.businessId, campaignId: session.campaignId, sessionId, type: "LANGUAGE_SELECTED", metadata: { language } });
  return { ok: true, data: undefined };
}

export async function submitFeedback(input: {
  sessionId: string;
  rating: number;
  selectedAttributes: string[];
  writtenFeedback: string;
  language: string;
}): Promise<ActionResult> {
  const session = await prisma.customerSession.findUnique({ where: { id: input.sessionId } });
  if (!session) return { ok: false, error: "Session not found." };
  if (input.rating < 1 || input.rating > 5) return { ok: false, error: "Invalid rating." };

  await prisma.customerFeedback.upsert({
    where: { sessionId: input.sessionId },
    create: {
      sessionId: input.sessionId,
      businessId: session.businessId,
      rating: input.rating,
      selectedAttributes: input.selectedAttributes,
      writtenFeedback: input.writtenFeedback || null,
      language: input.language,
    },
    update: {
      rating: input.rating,
      selectedAttributes: input.selectedAttributes,
      writtenFeedback: input.writtenFeedback || null,
      language: input.language,
    },
  });

  await prisma.customerSession.update({
    where: { id: input.sessionId },
    data: { currentStep: "ai-review", completedAt: new Date() },
  });

  await logEvent({ businessId: session.businessId, campaignId: session.campaignId, sessionId: input.sessionId, type: "RATING_GIVEN", metadata: { rating: input.rating } });
  if (input.selectedAttributes.length) {
    await logEvent({ businessId: session.businessId, campaignId: session.campaignId, sessionId: input.sessionId, type: "ATTRIBUTES_SELECTED", metadata: { attributes: input.selectedAttributes } });
  }
  await logEvent({ businessId: session.businessId, campaignId: session.campaignId, sessionId: input.sessionId, type: "FEEDBACK_SUBMITTED" });

  return { ok: true, data: undefined };
}

export async function addMoreFeedbackDetail(sessionId: string, extraText: string): Promise<ActionResult> {
  const feedback = await prisma.customerFeedback.findUnique({ where: { sessionId } });
  if (!feedback) return { ok: false, error: "We couldn't find your feedback. Please start again." };

  const combined = [feedback.writtenFeedback, extraText].filter(Boolean).join(" ");
  await prisma.customerFeedback.update({ where: { sessionId }, data: { writtenFeedback: combined } });
  return { ok: true, data: undefined };
}

async function buildGroundingContext(sessionId: string): Promise<{ ctx: AIGroundingContext; businessId: string; campaignId: string } | null> {
  const session = await prisma.customerSession.findUnique({
    where: { id: sessionId },
    include: {
      feedback: true,
      business: { include: { category: true, services: true } },
    },
  });
  if (!session || !session.feedback) return null;

  const ctx: AIGroundingContext = {
    businessName: session.business.name,
    categoryName: session.business.category.name,
    businessDescription: session.business.description,
    services: session.business.services.map((s) => s.name),
    rating: session.feedback.rating,
    selectedAttributes: (session.feedback.selectedAttributes as string[]) ?? [],
    customerFeedback: session.feedback.writtenFeedback ?? "",
    language: session.language ?? session.feedback.language ?? "en",
    tone: session.business.aiTone,
  };

  return { ctx, businessId: session.businessId, campaignId: session.campaignId };
}

async function assertUnderRateLimit(sessionId: string): Promise<string | null> {
  const settings = await prisma.platformSettings.findFirst();
  const limit = settings?.maxAIGenerationsPerSession ?? MAX_AI_ACTIONS_PER_SESSION;
  const count = await prisma.aIUsage.count({ where: { sessionId } });
  if (count >= limit) return "You've reached the limit for AI review generations on this visit. Please write your own review or try again later.";
  return null;
}

export async function generateAIDrafts(sessionId: string): Promise<ActionResult<{ drafts: { id: string; variant: string; content: string }[] } | { needMoreInfo: true }>> {
  const built = await buildGroundingContext(sessionId);
  if (!built) return { ok: false, error: "We couldn't find your feedback. Please start again." };
  const { ctx, businessId, campaignId } = built;

  if (!hasEnoughSignal(ctx)) {
    return { ok: true, data: { needMoreInfo: true } };
  }

  const limitError = await assertUnderRateLimit(sessionId);
  if (limitError) return { ok: false, error: limitError };

  const provider = await getAIProvider();
  const result = await provider.generateDrafts(ctx);

  const created = await prisma.$transaction(
    result.variants.map((v) =>
      prisma.aIReviewDraft.create({
        data: {
          sessionId,
          variant: v.variant,
          content: v.content,
          tone: ctx.tone,
          length: v.variant === "SHORT" ? "SHORT" : v.variant === "DETAILED" ? "DETAILED" : "MEDIUM",
          provider: asProviderEnum(result.provider),
          model: result.model,
        },
      })
    )
  );

  await prisma.aIUsage.create({
    data: {
      businessId,
      sessionId,
      purpose: "GENERATE_DRAFTS",
      provider: asProviderEnum(result.provider),
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCostUsd: estimateCostUsd(result.model, result.inputTokens, result.outputTokens),
    },
  });

  await logEvent({ businessId, campaignId, sessionId, type: "AI_DRAFT_GENERATED" });

  return { ok: true, data: { drafts: created.map((d) => ({ id: d.id, variant: d.variant, content: d.content })) } };
}

export async function transformDraft(sessionId: string, originalContent: string, instruction: TransformInstruction): Promise<ActionResult<{ id: string; content: string }>> {
  const built = await buildGroundingContext(sessionId);
  if (!built) return { ok: false, error: "We couldn't find your feedback. Please start again." };
  const { ctx, businessId, campaignId } = built;

  const limitError = await assertUnderRateLimit(sessionId);
  if (limitError) return { ok: false, error: limitError };

  const provider = await getAIProvider();
  const result = await provider.transformDraft({ originalContent, instruction, context: ctx });

  const draft = await prisma.aIReviewDraft.create({
    data: {
      sessionId,
      variant: instruction === "REGENERATE" ? "REGENERATED" : "CUSTOM",
      content: result.content,
      tone: ctx.tone,
      length: "MEDIUM",
      provider: asProviderEnum(result.provider),
      model: result.model,
    },
  });

  await prisma.aIUsage.create({
    data: {
      businessId,
      sessionId,
      purpose: "TRANSFORM_DRAFT",
      provider: asProviderEnum(result.provider),
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCostUsd: estimateCostUsd(result.model, result.inputTokens, result.outputTokens),
    },
  });

  await logEvent({ businessId, campaignId, sessionId, type: "DRAFT_TRANSFORMED", metadata: { instruction } });

  return { ok: true, data: { id: draft.id, content: draft.content } };
}

export async function markDraftCopied(sessionId: string, draftId: string): Promise<ActionResult> {
  const session = await prisma.customerSession.findUnique({ where: { id: sessionId } });
  if (!session) return { ok: false, error: "Session not found." };

  await prisma.aIReviewDraft.updateMany({ where: { sessionId }, data: { isFinal: false } });
  await prisma.aIReviewDraft.update({ where: { id: draftId }, data: { isCopied: true, isFinal: true } });
  await logEvent({ businessId: session.businessId, campaignId: session.campaignId, sessionId, type: "DRAFT_COPIED" });
  return { ok: true, data: undefined };
}

export async function recordGoogleClick(sessionId: string): Promise<ActionResult<{ url: string }>> {
  const session = await prisma.customerSession.findUnique({
    where: { id: sessionId },
    include: { campaign: true, business: { include: { googleReviewConfig: true } } },
  });
  if (!session) return { ok: false, error: "Session not found." };

  const url = session.campaign.googleReviewUrlOverride || session.business.googleReviewConfig?.googleReviewUrl;
  if (!url) return { ok: false, error: "This business hasn't set up a Google review link yet." };

  await logEvent({ businessId: session.businessId, campaignId: session.campaignId, sessionId, type: "GOOGLE_CLICK" });
  return { ok: true, data: { url } };
}

export async function submitPrivateFeedback(sessionId: string, message: string, contactInfo?: string): Promise<ActionResult> {
  const session = await prisma.customerSession.findUnique({ where: { id: sessionId } });
  if (!session) return { ok: false, error: "Session not found." };
  if (!message.trim()) return { ok: false, error: "Please share a few details." };

  await prisma.privateFeedback.upsert({
    where: { sessionId },
    create: { sessionId, businessId: session.businessId, message, contactInfo: contactInfo || null },
    update: { message, contactInfo: contactInfo || null },
  });

  await logEvent({ businessId: session.businessId, campaignId: session.campaignId, sessionId, type: "PRIVATE_FEEDBACK_SUBMITTED" });

  const owners = await prisma.businessMember.findMany({ where: { businessId: session.businessId, role: { in: ["OWNER", "MANAGER"] } } });
  const business = await prisma.business.findUnique({ where: { id: session.businessId } });
  await prisma.notification.createMany({
    data: owners.map((o) => ({
      userId: o.userId,
      businessId: session.businessId,
      type: "PRIVATE_FEEDBACK",
      title: "New private feedback",
      message: `A customer left private feedback for ${business?.name ?? "your business"}.`,
    })),
  });

  return { ok: true, data: undefined };
}
