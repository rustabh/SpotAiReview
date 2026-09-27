import "server-only";

/**
 * Every Febble Spot module a business can turn on. A business category ships
 * defaults (BusinessCategory.defaultFeatures); a business can override any
 * individual key (Business.featureOverrides) without needing a developer or
 * a new category — this is the entire "business type engine".
 */
export const FEATURE_KEYS = [
  "menu",
  "products",
  "services",
  "tables",
  "ordering",
  "appointments",
  "pos",
  "reviews",
  "digitalCard",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];
export type FeatureFlags = Partial<Record<FeatureKey, boolean>>;

const PLATFORM_DEFAULTS: Record<FeatureKey, boolean> = {
  menu: false,
  products: false,
  services: false,
  tables: false,
  ordering: false,
  appointments: false,
  pos: false,
  reviews: true,
  digitalCard: true,
};

function asFeatureFlags(value: unknown): FeatureFlags {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: FeatureFlags = {};
  for (const key of FEATURE_KEYS) {
    const v = (value as Record<string, unknown>)[key];
    if (typeof v === "boolean") out[key] = v;
  }
  return out;
}

/**
 * Effective value per feature = business override, else category default,
 * else the platform default above. This is the ONLY function anything in
 * the app should call to decide whether a module is visible — never read
 * category.defaultFeatures or business.featureOverrides directly.
 */
export function getEffectiveFeatures(business: {
  featureOverrides?: unknown;
  category?: { defaultFeatures?: unknown } | null;
}): Record<FeatureKey, boolean> {
  const categoryDefaults = asFeatureFlags(business.category?.defaultFeatures);
  const overrides = asFeatureFlags(business.featureOverrides);

  const result = {} as Record<FeatureKey, boolean>;
  for (const key of FEATURE_KEYS) {
    result[key] = overrides[key] ?? categoryDefaults[key] ?? PLATFORM_DEFAULTS[key];
  }
  return result;
}
