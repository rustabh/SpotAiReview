"use client";

import { useRouter } from "next/navigation";
import { advanceOrderStatus, cancelOrder } from "@/actions/orders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

type Order = {
  id: string;
  code: string;
  status: string;
  type: string;
  totalAmount: number;
  customerName: string | null;
  posSyncStatus: string;
  createdAt: string | Date;
  tableSession: { table: { number: string; section: string | null } } | null;
  items: { id: string; productName: string; variantName: string | null; quantity: number; modifiers: { id: string; name: string }[] }[];
};

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "brand"> = {
  RECEIVED: "warning",
  ACCEPTED: "brand",
  PREPARING: "brand",
  READY: "success",
  SERVED: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
};

const NEXT_LABEL: Record<string, string> = {
  RECEIVED: "Accept",
  ACCEPTED: "Start Preparing",
  PREPARING: "Mark Ready",
  READY: "Mark Served",
  SERVED: "Mark Completed",
};

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatTime(d: string | Date) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function OrderQueue({ businessId, orders }: { businessId: string; orders: Order[] }) {
  const router = useRouter();

  async function onAdvance(orderId: string) {
    await advanceOrderStatus(orderId, businessId);
    router.refresh();
  }

  async function onCancel(orderId: string) {
    if (!confirm("Cancel this order?")) return;
    await cancelOrder(orderId, businessId);
    router.refresh();
  }

  if (orders.length === 0) {
    return <p className="py-12 text-center text-sm text-ink-400">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Card key={o.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-heading font-bold text-foreground">#{o.code}</p>
                <Badge tone={STATUS_TONE[o.status] ?? "neutral"}>{o.status}</Badge>
                {o.posSyncStatus === "FAILED" && <Badge tone="danger">POS sync failed</Badge>}
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
                <Clock size={11} /> {formatTime(o.createdAt)}
                {o.tableSession && ` · Table ${o.tableSession.table.number}`}
                {o.customerName && ` · ${o.customerName}`}
              </p>
            </div>
            <p className="font-semibold text-foreground">{formatRupees(o.totalAmount)}</p>
          </div>

          <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            {o.items.map((item) => (
              <li key={item.id} className="text-ink-600">
                {item.quantity}× {item.productName}{item.variantName ? ` (${item.variantName})` : ""}
                {item.modifiers.length > 0 && <span className="text-ink-400"> — {item.modifiers.map((m) => m.name).join(", ")}</span>}
              </li>
            ))}
          </ul>

          {o.status !== "COMPLETED" && o.status !== "CANCELLED" && (
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              {NEXT_LABEL[o.status] && (
                <Button size="sm" onClick={() => onAdvance(o.id)}>{NEXT_LABEL[o.status]}</Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onCancel(o.id)}>Cancel</Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
