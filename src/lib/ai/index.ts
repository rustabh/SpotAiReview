import "server-only";
import type { AIProvider } from "./types";
import { MockAIProvider } from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { prisma } from "@/lib/prisma";

export * from "./types";
export { estimateCostUsd } from "./cost";

/**
 * Provider selection is config driven (Super Admin platform settings, falling
 * back to env vars) so the platform is never hard-wired to a single AI
 * vendor. Falls back to the offline mock provider whenever the configured
 * provider has no API key, so the product always works in a demo/sandbox.
 */
export async function getAIProvider(): Promise<AIProvider> {
  const settings = await prisma.platformSettings.findFirst().catch(() => null);
  const configured = (settings?.aiProvider ?? process.env.AI_PROVIDER?.toUpperCase() ?? "MOCK").toLowerCase();
  const model = settings?.aiModel;

  if (configured === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAIProvider(process.env.OPENAI_API_KEY, model || process.env.OPENAI_MODEL);
  }
  if (configured === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(process.env.ANTHROPIC_API_KEY, model || process.env.ANTHROPIC_MODEL);
  }
  if (configured === "gemini" && process.env.GEMINI_API_KEY) {
    throw new Error("Gemini provider is architected but not yet implemented. Set AI_PROVIDER=mock, openai, or anthropic.");
  }

  return new MockAIProvider();
}
