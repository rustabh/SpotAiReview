import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomToken(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
  }
  return out;
}

/** Public, non-sequential slug used in /r/[slug] URLs. */
export function generateCampaignSlug() {
  return randomToken(7);
}

/** Human-friendly campaign code, e.g. SPOT-RVW-8H3K92 */
export function generateCampaignCode() {
  return `SPOT-RVW-${randomToken(6)}`;
}

export async function uniqueSlug<T>(
  check: (slug: string) => Promise<T | null>,
  generator: () => string,
  maxAttempts = 10
) {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generator();
    const existing = await check(candidate);
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique slug");
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function percentage(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}
