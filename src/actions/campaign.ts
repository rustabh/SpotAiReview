"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/rbac";
import { campaignSchema } from "@/lib/validations/business";
import { generateCampaignCode, generateCampaignSlug, uniqueSlug } from "@/lib/utils";
import type { ActionResult } from "./auth";

export async function createCampaign(input: unknown): Promise<ActionResult<{ campaignId: string }>> {
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const { membership } = await requireBusinessAccess(data.businessId);
  if (membership && membership.role === "STAFF") return { ok: false, error: "You don't have permission to create campaigns." };

  const owner = await prisma.businessMember.findFirst({ where: { businessId: data.businessId, role: "OWNER" } });
  if (owner) {
    const sub = await prisma.subscription.findFirst({ where: { userId: owner.userId }, include: { plan: true }, orderBy: { createdAt: "desc" } });
    if (sub) {
      const existingCount = await prisma.reviewCampaign.count({ where: { businessId: data.businessId } });
      if (existingCount >= sub.plan.campaignLimit) {
        return { ok: false, error: `Your ${sub.plan.name} plan allows up to ${sub.plan.campaignLimit} campaigns. Upgrade to add more.` };
      }
    }
  }

  const slug = await uniqueSlug(
    (s) => prisma.reviewCampaign.findUnique({ where: { slug: s } }),
    generateCampaignSlug
  );
  const code = await uniqueSlug(
    (c) => prisma.reviewCampaign.findUnique({ where: { code: c } }),
    generateCampaignCode
  );

  const campaign = await prisma.reviewCampaign.create({
    data: {
      businessId: data.businessId,
      name: data.name,
      slug,
      code,
      placement: data.placement || null,
      description: data.description || null,
      ctaText: data.ctaText || "Scan to Share Your Experience",
      googleReviewUrlOverride: data.googleReviewUrlOverride || null,
      qrCode: { create: {} },
    },
  });

  revalidatePath("/dashboard/campaigns");
  return { ok: true, data: { campaignId: campaign.id } };
}

export async function updateCampaign(campaignId: string, input: unknown): Promise<ActionResult> {
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  await requireBusinessAccess(data.businessId);
  const campaign = await prisma.reviewCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.businessId !== data.businessId) return { ok: false, error: "Campaign not found." };

  await prisma.reviewCampaign.update({
    where: { id: campaignId },
    data: {
      name: data.name,
      placement: data.placement || null,
      description: data.description || null,
      ctaText: data.ctaText || "Scan to Share Your Experience",
      googleReviewUrlOverride: data.googleReviewUrlOverride || null,
    },
  });

  revalidatePath("/dashboard/campaigns");
  return { ok: true, data: undefined };
}

export async function setCampaignStatus(campaignId: string, businessId: string, status: "ACTIVE" | "PAUSED" | "ARCHIVED"): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  await prisma.reviewCampaign.update({ where: { id: campaignId }, data: { status } });
  revalidatePath("/dashboard/campaigns");
  return { ok: true, data: undefined };
}

export async function updateQrStyle(
  campaignId: string,
  businessId: string,
  input: { style?: string; foregroundColor?: string; backgroundColor?: string; includeLogo?: boolean }
): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  await prisma.qRCode.upsert({
    where: { campaignId },
    create: { campaignId, ...input },
    update: input,
  });
  revalidatePath("/dashboard/qr");
  return { ok: true, data: undefined };
}

export async function addNfcDevice(campaignId: string, businessId: string, label: string, uid: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  await prisma.nFCDevice.create({ data: { campaignId, label, uid } });
  revalidatePath("/dashboard/qr");
  return { ok: true, data: undefined };
}

export async function getCampaignDetail(campaignId: string) {
  const campaign = await prisma.reviewCampaign.findUnique({
    where: { id: campaignId },
    include: { business: true, qrCode: true, nfcDevices: true },
  });
  if (!campaign) return null;
  await requireBusinessAccess(campaign.businessId);
  return campaign;
}

export async function listCampaignsForBusiness(businessId: string) {
  await requireBusinessAccess(businessId);
  return prisma.reviewCampaign.findMany({
    where: { businessId },
    include: { qrCode: true, nfcDevices: true },
    orderBy: { createdAt: "desc" },
  });
}
