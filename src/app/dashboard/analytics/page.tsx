import { listMyBusinesses } from "@/actions/business";
import { getBusinessFunnel, getBusinessFeedbackStats, getCampaignPerformance, type DateRangeKey } from "@/actions/analytics";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FunnelBars } from "@/components/dashboard/funnel-bars";
import { TimeSeriesChart } from "@/components/dashboard/charts/time-series-chart";
import { RatingChart } from "@/components/dashboard/charts/rating-chart";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { BarChart3, Star, Percent } from "lucide-react";
import { percentage } from "@/lib/utils";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string; range?: DateRangeKey }>;
}) {
  const [businesses, params] = await Promise.all([listMyBusinesses(), searchParams]);
  const businessId = params.businessId || businesses[0]?.id;
  const range = params.range ?? "30d";

  if (!businessId) {
    return (
      <div>
        <PageHeader title="Analytics" description="Track scans, feedback and conversions." />
        <EmptyState icon={BarChart3} title="Add a business first" description="Analytics will appear once you have an active campaign." />
      </div>
    );
  }

  const [{ funnel, timeSeries }, feedbackStats, campaignPerformance] = await Promise.all([
    getBusinessFunnel(businessId, range),
    getBusinessFeedbackStats(businessId, range),
    getCampaignPerformance(businessId),
  ]);

  const conversionRate = percentage(funnel.googleClicks, funnel.scans || 1);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Full funnel from scan to Google review click."
        action={
          <div className="flex gap-2">
            {businesses.length > 1 && <BusinessSwitcher businesses={businesses} value={businessId} basePath="/dashboard/analytics" />}
            <DateRangeFilter basePath="/dashboard/analytics" />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Scans" value={funnel.scans} icon={BarChart3} />
        <StatCard label="Feedback Completed" value={funnel.completed} icon={Percent} />
        <StatCard label="Avg Rating" value={feedbackStats.avgRating || "–"} icon={Star} />
        <StatCard label="Conversion to Google" value={`${conversionRate}%`} icon={Percent} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Scans &amp; Feedback Over Time</CardTitle></CardHeader>
          <CardContent><TimeSeriesChart data={timeSeries} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Review Funnel</CardTitle></CardHeader>
          <CardContent><FunnelBars funnel={funnel} /></CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Rating Distribution</CardTitle></CardHeader>
          <CardContent><RatingChart data={feedbackStats.ratingDistribution} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Campaign Performance</CardTitle></CardHeader>
          <CardContent>
            {campaignPerformance.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">No campaigns yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {campaignPerformance.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-ink-400">{c.placement || c.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{c.scans} scans</p>
                      <p className="text-xs text-ink-400">{c.completions} completed</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
