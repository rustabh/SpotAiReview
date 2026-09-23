import Link from "next/link";
import { listAllOwners } from "@/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { OwnerActions } from "@/components/admin/owner-actions";
import { Users, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminOwnersPage() {
  const owners = await listAllOwners();

  return (
    <div>
      <PageHeader
        title="Business Owners"
        description="Every business owner account on the platform."
        action={<Link href="/admin/owners/new"><Button><Plus size={15} /> Create Business Owner</Button></Link>}
      />

      {owners.length === 0 ? (
        <EmptyState icon={Users} title="No business owners yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Businesses</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{o.name}</td>
                  <td className="px-4 py-3 text-ink-500">{o.email}</td>
                  <td className="px-4 py-3 text-ink-500">{o.businessMemberships.length}</td>
                  <td className="px-4 py-3 text-ink-500">{o.subscriptions[0]?.plan.name ?? "—"}</td>
                  <td className="px-4 py-3"><Badge tone={o.status === "ACTIVE" ? "success" : "danger"}>{o.status}</Badge></td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3"><OwnerActions userId={o.id} status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
