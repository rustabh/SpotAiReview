import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Buckets are per server instance and reset on cold start — a basic,
// zero-dependency deterrent against casual abuse, not a hard guarantee.
// Swap in Upstash Redis (or similar) for real distributed rate limiting.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export async function requestIp() {
  const { headers } = await import("next/headers");
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}

export function retryAfterMessage(retryAfterMs: number) {
  const seconds = Math.ceil(retryAfterMs / 1000);
  if (seconds < 60) return `Too many attempts. Try again in ${seconds}s.`;
  return `Too many attempts. Try again in ${Math.ceil(seconds / 60)} min.`;
}
