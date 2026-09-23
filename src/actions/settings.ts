"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ReviewTone, ReviewLength } from "@prisma/client";
import { requireBusinessAccess } from "@/lib/rbac";
import type { ActionResult } from "./auth";

const TONES = ["NATURAL", "PROFESSIONAL", "FRIENDLY", "CASUAL", "DETAILED"] as const;
const LENGTHS = ["SHORT", "MEDIUM", "DETAILED"] as const;

export async function updateReviewSettings(
  businessId: string,
  input: { aiTone: string; aiLength: string; defaultLanguage: string; allowedLanguages: string[] }
): Promise<ActionResult> {
  await requireBusinessAccess(businessId);

  const aiTone: ReviewTone = TONES.includes(input.aiTone as (typeof TONES)[number]) ? (input.aiTone as ReviewTone) : "NATURAL";
  const aiLength: ReviewLength = LENGTHS.includes(input.aiLength as (typeof LENGTHS)[number]) ? (input.aiLength as ReviewLength) : "MEDIUM";

  await prisma.business.update({
    where: { id: businessId },
    data: {
      aiTone,
      aiLength,
      defaultLanguage: input.defaultLanguage,
      allowedLanguages: input.allowedLanguages,
    },
  });

  revalidatePath("/dashboard/settings");
  return { ok: true, data: undefined };
}

export async function updateBranding(businessId: string, logoUrl: string, coverImageUrl: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  await prisma.business.update({ where: { id: businessId }, data: { logoUrl: logoUrl || null, coverImageUrl: coverImageUrl || null } });
  revalidatePath("/dashboard/settings");
  return { ok: true, data: undefined };
}
