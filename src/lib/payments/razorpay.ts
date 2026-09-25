import "server-only";
import crypto from "crypto";

const API_BASE = "https://api.razorpay.com/v1";

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
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
