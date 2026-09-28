"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { markSessionPaidCash, type BillRequestRow } from "@/actions/table-session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function BillRequests({ businessId, requests }: { businessId: string; requests: BillRequestRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (requests.length === 0) return null;

  async function onMarkPaid(sessionId: string) {
    setBusyId(sessionId);
    await markSessionPaidCash(sessionId, businessId);
    setBusyId(null);
    router.refresh();
  }

  return (
    <Card className="mb-5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Receipt size={16} className="text-brand-600" />
        <p className="text-sm font-semibold text-foreground">Bill requests waiting on staff</p>
      </div>
      <ul className="space-y-2">
        {requests.map((r) => (
          <li key={r.sessionId} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Table {r.tableNumber}
                {r.tableSection ? ` · ${r.tableSection}` : ""}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{formatRupees(r.totalAmount)}</span>
                {r.paymentMethod === "COUNTER" ? (
                  <Badge tone="warning">Cash — awaiting collection</Badge>
                ) : (
                  <Badge tone="brand">Awaiting online payment</Badge>
                )}
              </div>
            </div>
            {r.paymentMethod === "COUNTER" && (
              <Button size="sm" loading={busyId === r.sessionId} onClick={() => onMarkPaid(r.sessionId)}>
                Mark Paid (Cash)
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
