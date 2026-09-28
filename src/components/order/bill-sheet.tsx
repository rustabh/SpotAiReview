"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { RATING_OPTIONS } from "@/lib/ratings";
import {
  createBillCheckoutOrder,
  verifyBillPayment,
  choosePayAtCounter,
  rateSessionOverall,
  rateOrderItem,
  type TableSessionView,
} from "@/actions/table-session";
import type { $Enums } from "@prisma/client";

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

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function RatingChips({
  selected,
  onSelect,
}: {
  selected: $Enums.RatingSentiment | null;
  onSelect: (value: $Enums.RatingSentiment) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {RATING_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            selected === opt.value
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-border bg-surface text-ink-500 hover:border-brand-300"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function BillSheet({
  open,
  onClose,
  qrToken,
  session,
  onPaid,
  onUpdate,
}: {
  open: boolean;
  onClose: () => void;
  qrToken: string;
  session: TableSessionView;
  onPaid: (session: TableSessionView) => void;
  onUpdate: (session: TableSessionView) => void;
}) {
  const [loading, setLoading] = useState<"online" | "counter" | null>(null);
  const [error, setError] = useState<string | undefined>();

  async function onRateOverall(rating: $Enums.RatingSentiment) {
    const result = await rateSessionOverall(qrToken, rating);
    if (result.ok) onUpdate(result.data);
  }

  async function onRateItem(orderItemId: string, rating: $Enums.RatingSentiment) {
    const result = await rateOrderItem(qrToken, orderItemId, rating);
    if (result.ok) onUpdate(result.data);
  }

  async function onPayOnline() {
    setError(undefined);
    setLoading("online");
    const result = await createBillCheckoutOrder(qrToken);
    if (!result.ok) {
      setLoading(null);
      setError(result.error);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setLoading(null);
      setError("Could not load the payment gateway. Check your connection and try again.");
      return;
    }

    const { keyId, orderId, amount, currency } = result.data;
    const razorpay = new window.Razorpay({
      key: keyId,
      order_id: orderId,
      amount,
      currency,
      name: session.code,
      description: "Table bill",
      theme: { color: "#27272a" },
      modal: { ondismiss: () => setLoading(null) },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verified = await verifyBillPayment({
          qrToken,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        setLoading(null);
        if (!verified.ok) {
          setError(verified.error);
          return;
        }
        onPaid(verified.data);
      },
    });
    razorpay.open();
  }

  async function onPayAtCounter() {
    setError(undefined);
    setLoading("counter");
    const result = await choosePayAtCounter(qrToken);
    setLoading(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onUpdate(result.data);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Your bill">
      <div className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <div className="divide-y divide-border">
          {session.orders.map((o) => (
            <div key={o.id} className="py-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">#{o.code}</span>
                <span className="text-ink-500">{formatRupees(o.totalAmount)}</span>
              </div>
              <ul className="space-y-2.5">
                {o.items.map((item) => (
                  <li key={item.id}>
                    <p className="text-sm text-ink-600">
                      {item.quantity}× {item.productName}
                      {item.variantName ? ` (${item.variantName})` : ""}
                    </p>
                    <div className="mt-1">
                      <RatingChips selected={item.rating} onSelect={(rating) => onRateItem(item.id, rating)} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatRupees(session.totalAmount)}</span>
        </div>

        <div className="border-t border-border pt-3">
          <p className="mb-2 text-sm font-semibold text-foreground">How was your visit overall?</p>
          <RatingChips selected={session.overallRating} onSelect={onRateOverall} />
        </div>

        {session.paymentMethod === "COUNTER" ? (
          <p className="text-center text-sm text-ink-500">You chose to pay at the counter — staff will confirm shortly.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button loading={loading === "online"} disabled={loading === "counter"} onClick={onPayOnline}>
              Pay Online
            </Button>
            <Button variant="outline" loading={loading === "counter"} disabled={loading === "online"} onClick={onPayAtCounter}>
              Pay at Counter
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
