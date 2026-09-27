import "server-only";
import { prisma } from "@/lib/prisma";
import { MockPOSProvider } from "./mock-provider";
import type { POSProvider } from "./types";

export type { POSProvider } from "./types";
export * from "./types";

/**
 * The order flow's only entry point into POS — it never imports a provider
 * class directly. No POSIntegration row, or one still on MOCK, resolves to
 * MockPOSProvider; a real provider (PetpoojaProvider, Phase 2) is selected
 * here by `provider` once one exists, with zero changes required anywhere
 * else that calls getPOSProvider().
 */
export async function getPOSProvider(businessId: string): Promise<POSProvider> {
  const integration = await prisma.pOSIntegration.findUnique({ where: { businessId } });

  if (!integration || integration.provider === "MOCK") {
    return new MockPOSProvider();
  }

  // Real providers land here in Phase 2, once built against official API
  // docs and this merchant's credentials — see docs/febble-spot-architecture.md §9.
  return new MockPOSProvider();
}
