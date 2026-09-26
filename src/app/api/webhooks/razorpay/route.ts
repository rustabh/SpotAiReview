import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";
import { activateSubscriptionForPayment, markPaymentFailedByOrderId } from "@/actions/billing";

/**
 * Server-to-server confirmation from Razorpay — the reliable source of
 * truth for activating a plan, independent of whether the customer's
 * browser stays open long enough for the client-side verification call to
 * complete. Configure this URL (…/api/webhooks/razorpay) in the Razorpay
 * dashboard under Settings → Webhooks, subscribed to "payment.captured".
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const orderId: string | undefined = event.payload?.payment?.entity?.order_id ?? event.payload?.order?.entity?.id;
    if (orderId) {
      const payment = await prisma.payment.findFirst({ where: { providerRef: orderId } });
      if (payment) await activateSubscriptionForPayment(payment.id);
    }
  }

  if (event.event === "payment.failed") {
    const orderId: string | undefined = event.payload?.payment?.entity?.order_id;
    if (orderId) await markPaymentFailedByOrderId(orderId);
  }

  return NextResponse.json({ ok: true });
}
