"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { getOrderForCustomer } from "@/actions/orders";
import { Card } from "@/components/ui/card";

const STEPS: { status: string; label: string }[] = [
  { status: "RECEIVED", label: "Order Received" },
  { status: "ACCEPTED", label: "Accepted" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY", label: "Ready" },
  { status: "SERVED", label: "Served" },
  { status: "COMPLETED", label: "Completed" },
];

type OrderItemModifier = { id: string; name: string; priceDelta: number };
type OrderItem = { id: string; productName: string; variantName: string | null; quantity: number; lineTotal: number; modifiers: OrderItemModifier[] };
export type TrackedOrder = {
  id: string;
  code: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  tableSession: { table: { number: string } } | null;
};

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function OrderTracker({ orderId, initialOrder }: { orderId: string; initialOrder: TrackedOrder }) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    if (order.status === "COMPLETED" || order.status === "CANCELLED") return;
    const interval = setInterval(async () => {
      const latest = await getOrderForCustomer(orderId);
      if (latest) setOrder(latest as unknown as TrackedOrder);
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId, order.status]);

  if (order.status === "CANCELLED") {
    return (
      <Card className="p-6 text-center">
        <XCircle className="mx-auto mb-2 text-red-500" size={28} />
        <p className="font-semibold text-foreground">This order was cancelled</p>
        <p className="mt-1 text-sm text-ink-400">Order #{order.code}</p>
      </Card>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-ink-400">Order #{order.code}</p>
        <div className="mt-5 space-y-4">
          {STEPS.map((step, i) => {
            const done = i <= currentIndex;
            return (
              <div key={step.status} className="flex items-center gap-3">
                {done ? <CheckCircle2 size={20} className="text-brand-600" /> : <Circle size={20} className="text-ink-300" />}
                <span className={done ? "font-medium text-foreground" : "text-ink-400"}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Order summary</p>
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-foreground">{item.quantity}× {item.productName}{item.variantName ? ` (${item.variantName})` : ""}</p>
                {item.modifiers.length > 0 && <p className="text-xs text-ink-400">{item.modifiers.map((m) => m.name).join(", ")}</p>}
              </div>
              <span className="text-ink-500">{formatRupees(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-foreground">
          <span>Total</span>
          <span>{formatRupees(order.totalAmount)}</span>
        </div>
      </Card>
    </div>
  );
}
