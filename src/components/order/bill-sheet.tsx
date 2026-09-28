"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createBillCheckoutOrder, verifyBillPayment, choosePayAtCounter, type TableSessionView } from "@/actions/table-session";

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

export function BillSheet({
  open,
  onClose,
  qrToken,
  session,
  onPaid,
  onCounterChosen,
}: {
  open: boolean;
  onClose: () => void;
  qrToken: string;
  session: TableSessionView;
  onPaid: (session: TableSessionView) => void;
  onCounterChosen: (session: TableSessionView) => void;
}) {
  const [loading, setLoading] = useState<"online" | "counter" | null>(null);
  const [error, setError] = useState<string | undefined>();

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
      theme: { color: "#2563eb" },
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
    onCounterChosen(result.data);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Your bill">
      <div className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <ul className="divide-y divide-border">
          {session.orders.map((o) => (
            <li key={o.id} className="py-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">#{o.code}</span>
                <span className="text-ink-500">{formatRupees(o.totalAmount)}</span>
              </div>
              <p className="mt-0.5 text-xs text-ink-400">
                {o.items.map((i) => `${i.quantity}× ${i.productName}${i.variantName ? ` (${i.variantName})` : ""}`).join(", ")}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatRupees(session.totalAmount)}</span>
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
