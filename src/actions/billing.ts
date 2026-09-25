"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { isRazorpayConfigured, createRazorpayOrder, verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";
import { sendEmail, paymentConfirmationEmail } from "@/lib/email";
import { rateLimit, requestIp, retryAfterMessage } from "@/lib/rate-limit";
import type { ActionResult } from "./auth";

export type CheckoutOrderResult =
  | { mode: "free"; planId: string }
  | { mode: "checkout"; keyId: string; orderId: string; amount: number; currency: string; paymentId: string; planName: string };

/**
 * Starts a plan change. Free plans (and any plan when Razorpay isn't
 * configured, so the product still demos end-to-end) switch instantly.
 * Paid plans, once RAZORPAY_KEY_ID/SECRET are set, create a real Razorpay
 * order that the client opens in Checkout; the plan only activates once
 * verifyCheckoutPayment (or the webhook) confirms a successful charge.
 */
export async function createCheckoutOrder(planId: string): Promise<ActionResult<CheckoutOrderResult>> {
  const user = await requireUser();
  const ip = await requestIp();
  const limit = rateLimit(`checkout:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) return { ok: false, error: retryAfterMessage(limit.retryAfterMs) };

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) return { ok: false, error: "This plan is not available." };

  if (plan.monthlyPrice === 0 || !isRazorpayConfigured()) {
    await switchPlanDirectly(user.id, plan.id);
    return { ok: true, data: { mode: "free", planId: plan.id } };
  }

  let subscription = await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: { userId: user.id, planId: plan.id, status: "TRIALING", billingCycle: "MONTHLY" },
    });
  }

  const payment = await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      planId: plan.id,
      amount: plan.monthlyPrice,
      currency: plan.currency,
      status: "PENDING",
      provider: "RAZORPAY",
    },
  });

  try {
    const order = await createRazorpayOrder({
      amount: plan.monthlyPrice,
      currency: plan.currency,
      receipt: payment.id,
      notes: { userId: user.id, planId: plan.id, paymentId: payment.id },
    });

    await prisma.payment.update({ where: { id: payment.id }, data: { providerRef: order.id } });

    return {
      ok: true,
      data: {
        mode: "checkout",
        keyId: process.env.RAZORPAY_KEY_ID!,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment.id,
        planName: plan.name,
      },
    };
  } catch (err) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    console.error("[billing] Failed to create Razorpay order:", err);
    return { ok: false, error: "Could not start checkout. Please try again." };
  }
}

export async function verifyCheckoutPayment(input: {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<ActionResult> {
  const user = await requireUser();

  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    include: { subscription: true },
  });
  if (!payment || payment.subscription.userId !== user.id) return { ok: false, error: "Payment not found." };
  if (payment.status === "SUCCEEDED") return { ok: true, data: undefined }; // already confirmed (e.g. by webhook)
  if (payment.providerRef !== input.razorpayOrderId) return { ok: false, error: "Order mismatch." };

  const valid = verifyRazorpayPaymentSignature({
    orderId: input.razorpayOrderId,
    paymentId: input.razorpayPaymentId,
    signature: input.razorpaySignature,
  });

  if (!valid) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return { ok: false, error: "Payment verification failed." };
  }

  await activateSubscriptionForPayment(payment.id);
  revalidatePath("/dashboard/subscription");
  return { ok: true, data: undefined };
}

/** Shared by both the client-side verification call and the Razorpay webhook — idempotent. */
export async function activateSubscriptionForPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { subscription: { include: { user: true } }, plan: true },
  });
  if (!payment || payment.status === "SUCCEEDED" || !payment.plan) return;

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + (payment.subscription.billingCycle === "YEARLY" ? 12 : 1));

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } }),
    prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: { planId: payment.plan.id, status: "ACTIVE", currentPeriodStart: new Date(), currentPeriodEnd: periodEnd },
    }),
  ]);

  await sendEmail({
    to: payment.subscription.user.email,
    subject: "Payment received — AiReview",
    html: paymentConfirmationEmail(payment.amount, payment.currency, payment.plan.name),
  });
}

async function switchPlanDirectly(userId: string, planId: string) {
  const existing = await prisma.subscription.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
  if (existing) {
    await prisma.subscription.update({ where: { id: existing.id }, data: { planId, status: "ACTIVE" } });
  } else {
    await prisma.subscription.create({ data: { userId, planId, status: "ACTIVE", billingCycle: "MONTHLY" } });
  }
  revalidatePath("/dashboard/subscription");
}
