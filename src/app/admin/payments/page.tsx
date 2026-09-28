import { listAllPayments } from "@/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { $Enums } from "@prisma/client";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

const STATUS_TONE: Record<$Enums.PaymentStatus, "neutral" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  SUCCEEDED: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
};

export default async function AdminPaymentsPage() {
  const payments = await listAllPayments();

  return (
    <div>
      <PageHeader title="Payments" description="Every subscription charge attempted on the platform, most recent first." />

      {payments.length === 0 ? (
        <EmptyState icon={Receipt} title="No payments yet" description="Charges from paid plan checkouts will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{p.subscription.user.name}</p>
                    <p className="text-xs text-ink-400">{p.subscription.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{p.plan?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{formatRupees(p.amount)}</td>
                  <td className="px-4 py-3 text-ink-500">{p.provider}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
