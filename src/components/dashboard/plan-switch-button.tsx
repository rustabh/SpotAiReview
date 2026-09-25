"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCheckoutOrder, verifyCheckoutPayment } from "@/actions/billing";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PlanSwitchButton({ planId, isCurrent, planName }: { planId: string; isCurrent: boolean; planName: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();

  if (isCurrent) return <Button size="sm" variant="outline" disabled className="w-full">Current Plan</Button>;

  async function handleClick() {
    setError(undefined);
    startTransition(async () => {
      const result = await createCheckoutOrder(planId);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (result.data.mode === "free") {
        router.refresh();
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Could not load the payment gateway. Check your connection and try again.");
        return;
      }

      const { keyId, orderId, amount, currency, paymentId } = result.data;
      const razorpay = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name: "AiReview",
        description: `${planName} plan`,
        theme: { color: "#2563eb" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verified = await verifyCheckoutPayment({
            paymentId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          if (!verified.ok) {
            setError(verified.error);
            return;
          }
          router.refresh();
        },
      });
      razorpay.open();
    });
  }

  return (
    <div>
      <Button size="sm" className="w-full" loading={pending} onClick={handleClick}>
        Switch Plan
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
