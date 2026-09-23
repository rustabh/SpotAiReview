"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess, requireUser, businessIdsForUser } from "@/lib/rbac";
import { businessSchema } from "@/lib/validations/business";
import { slugify, uniqueSlug } from "@/lib/utils";
import type { ActionResult } from "./auth";

export async function listMyBusinesses() {
  const user = await requireUser();
  if (user.role === "SUPER_ADMIN") {
    return prisma.business.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  }
  const ids = await businessIdsForUser(user.id);
  return prisma.business.findMany({
    where: { id: { in: ids } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBusiness(input: unknown): Promise<ActionResult<{ businessId: string }>> {
  const user = await requireUser();
  if (user.role !== "BUSINESS_OWNER") return { ok: false, error: "Only business owners can create businesses." };

  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const plan = await prisma.subscription.findFirst({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
  if (plan) {
    const existingCount = (await businessIdsForUser(user.id)).length;
    if (existingCount >= plan.plan.businessLimit) {
      return {
        ok: false,
        error: `Your ${plan.plan.name} plan allows up to ${plan.plan.businessLimit} business${plan.plan.businessLimit === 1 ? "" : "es"}. Upgrade to add more.`,
      };
    }
  }

  const slug = await uniqueSlug(
    (s) => prisma.business.findUnique({ where: { slug: s } }),
    () => slugify(`${data.name}-${Math.random().toString(36).slice(2, 6)}`)
  );

  const business = await prisma.business.create({
    data: {
      name: data.name,
      slug,
      categoryId: data.categoryId,
      subcategory: data.subcategory || null,
      description: data.description || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      instagramUrl: data.instagramUrl || null,
      facebookUrl: data.facebookUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      youtubeUrl: data.youtubeUrl || null,
      usp: data.usp || null,
      targetAudience: data.targetAudience || null,
      brandTone: data.brandTone || null,
      primaryColor: data.primaryColor || undefined,
      secondaryColor: data.secondaryColor || undefined,
      buttonColor: data.buttonColor || undefined,
      createdById: user.id,
      members: { create: { userId: user.id, role: "OWNER", acceptedAt: new Date() } },
      googleReviewConfig: { create: { googleReviewUrl: data.googleReviewUrl } },
    },
  });

  revalidatePath("/dashboard/businesses");
  return { ok: true, data: { businessId: business.id } };
}

export async function updateBusiness(businessId: string, input: unknown): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (membership && membership.role === "STAFF") return { ok: false, error: "You don't have permission to edit this business." };

  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  await prisma.business.update({
    where: { id: businessId },
    data: {
      name: data.name,
      categoryId: data.categoryId,
      subcategory: data.subcategory || null,
      description: data.description || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      instagramUrl: data.instagramUrl || null,
      facebookUrl: data.facebookUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      youtubeUrl: data.youtubeUrl || null,
      usp: data.usp || null,
      targetAudience: data.targetAudience || null,
      brandTone: data.brandTone || null,
      primaryColor: data.primaryColor || undefined,
      secondaryColor: data.secondaryColor || undefined,
      buttonColor: data.buttonColor || undefined,
      googleReviewConfig: {
        upsert: {
          create: { googleReviewUrl: data.googleReviewUrl },
          update: { googleReviewUrl: data.googleReviewUrl },
        },
      },
    },
  });

  revalidatePath(`/dashboard/businesses/${businessId}`);
  return { ok: true, data: undefined };
}

export async function updateBusinessBranding(
  businessId: string,
  input: { logoUrl?: string; coverImageUrl?: string }
): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  await prisma.business.update({
    where: { id: businessId },
    data: { logoUrl: input.logoUrl || null, coverImageUrl: input.coverImageUrl || null },
  });
  revalidatePath(`/dashboard/businesses/${businessId}`);
  return { ok: true, data: undefined };
}

export async function getBusinessDetail(businessId: string) {
  const { business } = await requireBusinessAccess(businessId);
  return prisma.business.findUnique({
    where: { id: business.id },
    include: {
      category: { include: { attributes: true, questions: true } },
      googleReviewConfig: true,
      campaigns: { include: { qrCode: true }, orderBy: { createdAt: "desc" } },
      members: { include: { user: true } },
      _count: { select: { feedback: true, campaigns: true } },
    },
  });
}
