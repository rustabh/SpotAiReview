import "server-only";
import type { POSProvider, PosMenuSnapshot, PosOrderInput, PosOrderStatus } from "./types";

/**
 * Stands in for a real POS behind the exact same interface, so the full
 * order flow — including status progressing over time — works end-to-end
 * with zero external dependency. Nothing here is a placeholder that merely
 * looks like it works: createOrder really allocates an ID, and
 * getOrderStatus really derives status from real elapsed time.
 *
 * The order's creation timestamp is encoded in the returned posOrderId
 * (`MOCK-<timestamp>-<random>`) rather than kept in memory, since a
 * serverless function has no persistent memory between invocations — this
 * makes status derivation both stateless and deterministic.
 */
const STAGE_THRESHOLDS_MS: [number, PosOrderStatus][] = [
  [8_000, "RECEIVED"],
  [20_000, "ACCEPTED"],
  [45_000, "PREPARING"],
  [75_000, "READY"],
  [Infinity, "COMPLETED"],
];

const DEMO_MENU: PosMenuSnapshot = {
  categories: [
    { externalId: "cat-starters", name: "Starters", order: 0 },
    { externalId: "cat-mains", name: "Main Course", order: 1 },
    { externalId: "cat-beverages", name: "Beverages", order: 2 },
  ],
  products: [
    {
      externalId: "item-paneer-tikka",
      categoryExternalId: "cat-starters",
      name: "Paneer Tikka",
      description: "Grilled cottage cheese marinated in spiced yogurt.",
      price: 32000,
      isVeg: true,
      isAvailable: true,
      variants: [
        { externalId: "var-half", name: "Half", priceDelta: 0 },
        { externalId: "var-full", name: "Full", priceDelta: 15000 },
      ],
      modifierGroups: [
        {
          externalId: "mod-spice",
          name: "Spice Level",
          minSelect: 0,
          maxSelect: 1,
          options: [
            { externalId: "opt-mild", name: "Mild", priceDelta: 0 },
            { externalId: "opt-medium", name: "Medium", priceDelta: 0 },
            { externalId: "opt-hot", name: "Extra Spicy", priceDelta: 0 },
          ],
        },
      ],
    },
    {
      externalId: "item-butter-chicken",
      categoryExternalId: "cat-mains",
      name: "Butter Chicken",
      description: "Slow-cooked chicken in a creamy tomato gravy.",
      price: 42000,
      isVeg: false,
      isAvailable: true,
      variants: [],
      modifierGroups: [
        {
          externalId: "mod-addons",
          name: "Add-ons",
          minSelect: 0,
          maxSelect: 3,
          options: [
            { externalId: "opt-extra-gravy", name: "Extra Gravy", priceDelta: 6000 },
            { externalId: "opt-butter-naan", name: "Butter Naan", priceDelta: 5000 },
          ],
        },
      ],
    },
    {
      externalId: "item-coke",
      categoryExternalId: "cat-beverages",
      name: "Coca-Cola",
      description: "300ml chilled bottle.",
      price: 6000,
      isVeg: true,
      isAvailable: true,
      variants: [],
      modifierGroups: [],
    },
  ],
};

export class MockPOSProvider implements POSProvider {
  readonly name = "mock";

  async testConnection() {
    return { ok: true };
  }

  async syncMenu(): Promise<PosMenuSnapshot> {
    return DEMO_MENU;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- order isn't needed to fabricate an ID; kept named for interface clarity
  async createOrder(order: PosOrderInput): Promise<{ posOrderId: string }> {
    const posOrderId = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { posOrderId };
  }

  async getOrderStatus(posOrderId: string): Promise<PosOrderStatus> {
    const match = /^MOCK-(\d+)-/.exec(posOrderId);
    if (!match) return "RECEIVED";
    const createdAt = Number(match[1]);
    const elapsed = Date.now() - createdAt;
    for (const [thresholdMs, status] of STAGE_THRESHOLDS_MS) {
      if (elapsed < thresholdMs) return status;
    }
    return "COMPLETED";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept named for interface clarity
  async cancelOrder(posOrderId: string): Promise<void> {
    // Mock has no backing system to cancel against — the order's own
    // OrderStatus.CANCELLED (set by actions/orders.ts) is the source of truth.
  }
}
