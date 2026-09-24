import Link from "next/link";
import { requireUser } from "@/lib/rbac";
import { getOwnerOverview } from "@/actions/analytics";
import { listMyBusinesses } from "@/actions/business";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Building2, QrCode, Sparkles, ExternalLink, Plus, MessageSquare, BarChart3 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const [overview, businesses] = await Promise.all([getOwnerOverview(), listMyBusinesses()]);

  const firstName = (user.name ?? "there").split(" ")[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">Good morning, {firstName}</h1>
        <p className="mt-1 text-sm text-ink-500">Here&apos;s how your businesses are doing.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Businesses" value={overview.totalBusinesses} icon={Building2} />
        <StatCard label="Total Scans" value={overview.totalScans} icon={QrCode} />
        <StatCard label="AI Reviews" value={overview.aiGenerated} icon={Sparkles} />
        <StatCard label="Google Clicks" value={overview.googleClicks} icon={ExternalLink} />
      </div>

      {businesses.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={Building2}
          title="No businesses yet"
          description="Create your first business to start collecting customer feedback."
          action={
            <Link href="/dashboard/businesses/new">
              <Button><Plus size={15} /> Add Business</Button>
            </Link>
          }
        />
      ) : (
        <>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Link href="/dashboard/campaigns/new">
                <Button variant="outline" className="w-full justify-start"><QrCode size={15} /> Create QR</Button>
              </Link>
              <Link href="/dashboard/businesses/new">
                <Button variant="outline" className="w-full justify-start"><Plus size={15} /> Add Business</Button>
              </Link>
              <Link href="/dashboard/feedback">
                <Button variant="outline" className="w-full justify-start"><MessageSquare size={15} /> View Feedback</Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-start"><BarChart3 size={15} /> View Analytics</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.recentFeedback.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">Customer feedback will appear here.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {overview.recentFeedback.map((f) => (
                    <li key={f.id} className="flex items-start justify-between gap-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{f.business.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">{f.writtenFeedback || "No written feedback"}</p>
                        <p className="mt-0.5 text-xs text-ink-400">{formatDateTime(f.createdAt)}</p>
                      </div>
                      <Badge tone={f.rating >= 4 ? "success" : f.rating === 3 ? "warning" : "danger"}>{f.rating}★</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
