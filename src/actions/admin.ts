"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/rbac";
import { createBusinessOwnerSchema, categorySchema } from "@/lib/validations/auth";
import { slugify } from "@/lib/utils";
import type { Prisma } from "@prisma/client";
import type { ActionResult } from "./auth";

async function audit(actorUserId: string, action: string, targetType: string, targetId?: string, metadata?: Prisma.InputJsonValue) {
  await prisma.auditLog.create({ data: { actorUserId, action, targetType, targetId, metadata } });
}

export async function createBusinessOwner(input: unknown): Promise<ActionResult<{ userId: string; temporaryPassword: string }>> {
  const admin = await requireSuperAdmin();
  const parsed = createBusinessOwnerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) return { ok: false, error: "A user with this email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase().trim(), passwordHash, role: "BUSINESS_OWNER", status: "ACTIVE" },
  });

  const freePlan = await prisma.plan.findFirst({ where: { slug: "free" } });
  if (freePlan) {
    await prisma.subscription.create({
      data: { userId: user.id, planId: freePlan.id, status: "ACTIVE", billingCycle: "MONTHLY" },
    });
  }

  await audit(admin.id, "CREATE_BUSINESS_OWNER", "User", user.id, { email: user.email });
  revalidatePath("/admin/owners");
  return { ok: true, data: { userId: user.id, temporaryPassword: password } };
}

export async function setUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED"): Promise<ActionResult> {
  const admin = await requireSuperAdmin();
  await prisma.user.update({ where: { id: userId }, data: { status } });
  await audit(admin.id, `SET_USER_STATUS_${status}`, "User", userId);
  revalidatePath("/admin/owners");
  return { ok: true, data: undefined };
}

export async function setBusinessStatus(businessId: string, status: "ACTIVE" | "SUSPENDED" | "INACTIVE"): Promise<ActionResult> {
  const admin = await requireSuperAdmin();
  await prisma.business.update({ where: { id: businessId }, data: { status } });
  await audit(admin.id, `SET_BUSINESS_STATUS_${status}`, "Business", businessId);
  revalidatePath("/admin/businesses");
  return { ok: true, data: undefined };
}

export async function deleteBusiness(businessId: string): Promise<ActionResult> {
  const admin = await requireSuperAdmin();
  await prisma.business.delete({ where: { id: businessId } });
  await audit(admin.id, "DELETE_BUSINESS", "Business", businessId);
  revalidatePath("/admin/businesses");
  return { ok: true, data: undefined };
}

export async function createCategory(input: unknown): Promise<ActionResult<{ categoryId: string }>> {
  const admin = await requireSuperAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, description, aiContext, attributes, questions } = parsed.data;

  const slug = slugify(name);
  const existing = await prisma.businessCategory.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: "A category with this name already exists." };

  const category = await prisma.businessCategory.create({
    data: {
      name,
      slug,
      description: description || null,
      aiContext: aiContext || null,
      isCustom: true,
      createdById: admin.id,
      attributes: { create: attributes.map((label, order) => ({ label, order })) },
      questions: { create: (questions ?? []).map((text, order) => ({ text, order })) },
    },
  });

  revalidatePath("/admin/categories");
  return { ok: true, data: { categoryId: category.id } };
}

export async function updateCategoryStatus(categoryId: string, isActive: boolean): Promise<ActionResult> {
  await requireSuperAdmin();
  await prisma.businessCategory.update({ where: { id: categoryId }, data: { isActive } });
  revalidatePath("/admin/categories");
  return { ok: true, data: undefined };
}

export async function getAdminOverview() {
  await requireSuperAdmin();

  const [totalBusinesses, activeBusinesses, totalOwners, totalScans, totalAIGenerations, totalGoogleClicks, activeSubscriptions] =
    await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "BUSINESS_OWNER" } }),
      prisma.analyticsEvent.count({ where: { type: "SCAN" } }),
      prisma.aIUsage.count(),
      prisma.analyticsEvent.count({ where: { type: "GOOGLE_CLICK" } }),
      prisma.subscription.count({ where: { status: { in: ["ACTIVE", "TRIALING"] } } }),
    ]);

  const recentBusinesses = await prisma.business.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { category: true, createdBy: true },
  });

  const topCampaigns = await prisma.analyticsEvent.groupBy({
    by: ["campaignId"],
    where: { type: "SCAN", campaignId: { not: null } },
    _count: { campaignId: true },
    orderBy: { _count: { campaignId: "desc" } },
    take: 5,
  });
  const campaignDetails = await prisma.reviewCampaign.findMany({
    where: { id: { in: topCampaigns.map((c) => c.campaignId as string) } },
    include: { business: true },
  });

  return {
    totalBusinesses,
    activeBusinesses,
    totalOwners,
    totalScans,
    totalAIGenerations,
    totalGoogleClicks,
    activeSubscriptions,
    recentBusinesses,
    topCampaigns: topCampaigns.map((c) => ({
      count: c._count.campaignId,
      campaign: campaignDetails.find((cd) => cd.id === c.campaignId),
    })),
  };
}

export async function listAllBusinesses() {
  await requireSuperAdmin();
  const businesses = await prisma.business.findMany({
    include: {
      category: true,
      members: { where: { role: "OWNER" }, include: { user: { include: { subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 } } } } },
      _count: { select: { campaigns: true, feedback: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    businesses.map(async (b) => {
      const [scans, googleClicks, aiUsage] = await Promise.all([
        prisma.analyticsEvent.count({ where: { businessId: b.id, type: "SCAN" } }),
        prisma.analyticsEvent.count({ where: { businessId: b.id, type: "GOOGLE_CLICK" } }),
        prisma.aIUsage.count({ where: { businessId: b.id } }),
      ]);
      return { ...b, metrics: { scans, googleClicks, aiUsage } };
    })
  );
}

export async function listAllOwners() {
  await requireSuperAdmin();
  return prisma.user.findMany({
    where: { role: "BUSINESS_OWNER" },
    include: {
      businessMemberships: { include: { business: true } },
      subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllCategories() {
  return prisma.businessCategory.findMany({
    include: { attributes: true, questions: true, _count: { select: { businesses: true } } },
    orderBy: { name: "asc" },
  });
}

export async function listAllPlans() {
  return prisma.plan.findMany({ orderBy: { monthlyPrice: "asc" } });
}

export async function updatePlan(planId: string, input: Partial<{
  monthlyPrice: number; yearlyPrice: number; businessLimit: number; campaignLimit: number;
  aiGenerationsPerMonth: number; teamMemberLimit: number; isActive: boolean;
}>): Promise<ActionResult> {
  await requireSuperAdmin();
  await prisma.plan.update({ where: { id: planId }, data: input });
  revalidatePath("/admin/plans");
  return { ok: true, data: undefined };
}

export async function getAuditLogs(take = 50) {
  await requireSuperAdmin();
  return prisma.auditLog.findMany({ take, orderBy: { createdAt: "desc" }, include: { actor: true } });
}
