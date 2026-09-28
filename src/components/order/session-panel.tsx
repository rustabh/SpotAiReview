"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTableSessionView, requestBill, type TableSessionView } from "@/actions/table-session";
import { BillSheet } from "./bill-sheet";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "brand"> = {
  RECEIVED: "warning",
  ACCEPTED: "brand",
  PREPARING: "brand",
  READY: "success",
  SERVED: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
};

/**
 * A table session is shared by everyone scanning the same table's QR, so this
 * polls a table-scoped view (not tied to this browser) — every phone at the
 * table sees the same running list of orders and the same bill.
 */
export function SessionPanel({ qrToken, refreshSignal }: { qrToken: string; refreshSignal: number }) {
  const [session, setSession] = useState<TableSessionView | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [paidSession, setPaidSession] = useState<TableSessionView | null>(null);
  const [requestingBill, setRequestingBill] = useState(false);
  const stopPolling = useRef(false);

  async function refresh() {
    if (stopPolling.current) return;
    const data = await getTableSessionView(qrToken);
    if (!stopPolling.current) setSession(data);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRequestBill() {
    setRequestingBill(true);
    const result = await requestBill(qrToken);
    setRequestingBill(false);
    if (result.ok) {
      setSession(result.data);
      setBillOpen(true);
    }
  }

  function onPaid(updated: TableSessionView) {
    stopPolling.current = true;
    setPaidSession(updated);
    setBillOpen(false);
  }

  if (paidSession) {
    return (
      <Card className="mb-5 p-5 text-center">
        <Receipt className="mx-auto mb-2 text-brand-600" size={26} />
        <p className="font-semibold text-foreground">Bill paid — thank you!</p>
        <p className="mt-1 text-sm text-ink-400">
          {formatRupees(paidSession.totalAmount)} · {paidSession.paymentMethod === "ONLINE" ? "Paid online" : "Paid at counter"}
        </p>
      </Card>
    );
  }

  if (!session || session.orders.length === 0) return null;

  return (
    <Card className="mb-5 overflow-hidden p-0">
      <button onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <div className="flex items-center gap-2.5">
          <ClipboardList size={18} className="text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-foreground">Your Orders · {session.orders.length}</p>
            <p className="text-xs text-ink-400">{formatRupees(session.totalAmount)} so far</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-ink-400" /> : <ChevronDown size={16} className="text-ink-400" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <ul className="space-y-3">
            {session.orders.map((o) => (
              <li key={o.id} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">#{o.code}</span>
                  <Badge tone={STATUS_TONE[o.status] ?? "neutral"}>{o.status}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-ink-400">
                  {o.items.map((i) => `${i.quantity}× ${i.productName}${i.variantName ? ` (${i.variantName})` : ""}`).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-border p-4">
        {session.paymentMethod === "COUNTER" ? (
          <p className="text-center text-sm text-ink-500">Bill requested — pay at the counter when ready. Staff will confirm.</p>
        ) : session.billRequestedAt ? (
          <Button variant="outline" className="w-full" onClick={() => setBillOpen(true)}>
            View bill &amp; pay
          </Button>
        ) : (
          <Button variant="outline" className="w-full" loading={requestingBill} onClick={onRequestBill}>
            Done eating? Request the bill
          </Button>
        )}
      </div>

      <BillSheet open={billOpen} onClose={() => setBillOpen(false)} qrToken={qrToken} session={session} onPaid={onPaid} onUpdate={setSession} />
    </Card>
  );
}
