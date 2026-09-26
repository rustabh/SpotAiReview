import "server-only";
import crypto from "crypto";

const API_BASE = "https://api.razorpay.com/v1";

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export type RazorpayMode = "live" | "test" | "unconfigured";

/** Razorpay key IDs are always prefixed rzp_live_ or rzp_test_ — cheap way to tell which mode is active. */
export function getRazorpayMode(): RazorpayMode {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId || !process.env.RAZORPAY_KEY_SECRET) return "unconfigured";
  return keyId.startsWith("rzp_live_") ? "live" : "test";
}

export function isRazorpayWebhookConfigured() {
  return Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
}

/**
 * Guards against the single most expensive mistake in this integration: live keys pointed at a
 * non-production deployment (a preview URL, localhost) would take real customer money during
 * testing. Only warns — it doesn't block, since URL detection here is a heuristic — but it puts
 * a loud signal in the server logs the moment it happens.
 */
export function warnIfLiveKeyOnNonProductionUrl() {
  if (getRazorpayMode() !== "live") return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const looksNonProduction = /localhost|127\.0\.0\.1|\.vercel\.app/.test(appUrl);
  if (looksNonProduction) {
    console.warn(
      `[razorpay] WARNING: RAZORPAY_KEY_ID is a LIVE key but NEXT_PUBLIC_APP_URL ("${appUrl}") looks like a ` +
        "non-production deployment. Real charges may be created. Use a test key (rzp_test_...) here instead."
    );
  }
}

function authHeader() {
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

/**
 * Creates a Razorpay Order for a one-time charge (used here for a plan's
 * billing-period amount). `amount` is in the smallest currency unit (paise
 * for INR), matching how Plan prices are already stored in this schema.
 */
export async function createRazorpayOrder(input: {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency ?? "INR",
      receipt: input.receipt,
      notes: input.notes,
      // Explicit, not left to the dashboard's default: without this, a successful checkout can
      // leave the payment merely *authorized* rather than *captured* — the customer sees "paid",
      // we mark the subscription active, but the authorization silently auto-voids after ~5 days
      // and the money never actually settles. This must always be 1 for this flow.
      payment_capture: 1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return { id: data.id, amount: data.amount, currency: data.currency };
}

/** Verifies the signature Razorpay Checkout returns to the browser after a successful payment. */
export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return expected === input.signature;
}

/** Verifies the `X-Razorpay-Signature` header on incoming webhook requests. */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
