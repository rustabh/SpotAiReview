"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/rbac";
import type { AIProviderName } from "@prisma/client";
import type { ActionResult } from "./auth";

export async function getPlatformSettings() {
  const settings = await prisma.platformSettings.findFirst();
  if (settings) return settings;
  return prisma.platformSettings.create({ data: { id: "singleton" } });
}

export async function updatePlatformSettings(input: {
  platformName: string;
  primaryColor: string;
  aiProvider: string;
  aiModel: string;
  defaultSystemPrompt: string;
  maxAIGenerationsPerSession: number;
}): Promise<ActionResult> {
  await requireSuperAdmin();
  const settings = await getPlatformSettings();

  await prisma.platformSettings.update({
    where: { id: settings.id },
    data: {
      platformName: input.platformName,
      primaryColor: input.primaryColor,
      aiProvider: input.aiProvider as AIProviderName,
      aiModel: input.aiModel,
      defaultSystemPrompt: input.defaultSystemPrompt,
      maxAIGenerationsPerSession: input.maxAIGenerationsPerSession,
    },
  });

  revalidatePath("/admin/settings");
  return { ok: true, data: undefined };
}
