import Link from "next/link";
import { getAdminOverview } from "@/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, QrCode, Sparkles, ExternalLink, CreditCard } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();

  return (
    <div>
      <PageHeader title="Platform Dashboard" description="Everything happening across Spot AI Review." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Businesses" value={overview.totalBusinesses} icon={Building2} />
        <StatCard label="Active Businesses" value={overview.activeBusinesses} icon={Building2} />
        <StatCard label="Business Owners" value={overview.totalOwners} icon={Users} />
        <StatCard label="Total Scans" value={overview.totalScans} icon={QrCode} />
        <StatCard label="AI Generations" value={overview.totalAIGenerations} icon={Sparkles} />
        <StatCard label="Active Subscriptions" value={overview.activeSubscriptions} icon={CreditCard} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Businesses</CardTitle></CardHeader>
          <CardContent>
            {overview.recentBusinesses.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">No businesses yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {overview.recentBusinesses.map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <Link href={`/admin/businesses`} className="text-sm font-medium text-foreground hover:underline">{b.name}</Link>
                      <p className="text-xs text-ink-400">{b.category.name} · {b.createdBy.name}</p>
                    </div>
                    <p className="text-xs text-ink-400">{formatDate(b.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Campaigns by Scans</CardTitle></CardHeader>
          <CardContent>
            {overview.topCampaigns.filter((c) => c.campaign).length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">No scans recorded yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {overview.topCampaigns.filter((c) => c.campaign).map((c) => (
                  <li key={c.campaign!.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.campaign!.name}</p>
                      <p className="text-xs text-ink-400">{c.campaign!.business.name}</p>
                    </div>
                    <Badge tone="brand">{c.count} scans</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ExternalLink size={15} /> Google Clicks Recorded</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{overview.totalGoogleClicks}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
