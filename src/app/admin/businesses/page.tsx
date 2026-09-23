import { listAllBusinesses } from "@/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BusinessActions } from "@/components/admin/business-actions";
import { Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminBusinessesPage() {
  const businesses = await listAllBusinesses();

  return (
    <div>
      <PageHeader title="Businesses" description="Every business registered on the platform." />

      {businesses.length === 0 ? (
        <EmptyState icon={Building2} title="No businesses yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium text-right">Scans</th>
                <th className="px-4 py-3 font-medium text-right">AI Usage</th>
                <th className="px-4 py-3 font-medium text-right">Google Clicks</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => {
                const owner = b.members[0]?.user;
                const plan = owner?.subscriptions[0]?.plan.name ?? "—";
                return (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{b.name}</td>
                    <td className="px-4 py-3 text-ink-500">{owner?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-500">{b.category.name}</td>
                    <td className="px-4 py-3">
                      <Badge tone={b.status === "ACTIVE" ? "success" : b.status === "SUSPENDED" ? "danger" : "neutral"}>{b.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{plan}</td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3 text-right">{b.metrics.scans}</td>
                    <td className="px-4 py-3 text-right">{b.metrics.aiUsage}</td>
                    <td className="px-4 py-3 text-right">{b.metrics.googleClicks}</td>
                    <td className="px-4 py-3"><BusinessActions businessId={b.id} status={b.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
