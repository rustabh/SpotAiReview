import { listMyBusinesses } from "@/actions/business";
import { generateBusinessInsights } from "@/actions/analytics";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { Sparkles, ThumbsUp, AlertTriangle } from "lucide-react";

export default async function AiInsightsPage({ searchParams }: { searchParams: Promise<{ businessId?: string }> }) {
  const [businesses, params] = await Promise.all([listMyBusinesses(), searchParams]);
  const businessId = params.businessId || businesses[0]?.id;

  if (!businessId) {
    return (
      <div>
        <PageHeader title="AI Insights" description="Automatic themes from your customer feedback." />
        <EmptyState icon={Sparkles} title="Add a business first" description="AI insights need feedback to analyze." />
      </div>
    );
  }

  const insights = await generateBusinessInsights(businessId);

  return (
    <div>
      <PageHeader
        title="AI Insights"
        description="Patterns Spot AI has noticed in your real customer feedback — never fabricated."
        action={businesses.length > 1 ? <BusinessSwitcher businesses={businesses} value={businessId} basePath="/dashboard/ai-insights" /> : undefined}
      />

      <Card className="mb-6">
        <CardContent className="p-5">
          <p className="flex items-start gap-2 text-sm text-foreground"><Sparkles size={16} className="mt-0.5 shrink-0 text-brand-600" /> {insights.summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ThumbsUp size={15} className="text-emerald-600" /> Positive Themes</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {insights.positiveThemes.length === 0 ? <p className="text-sm text-ink-400">Not enough data yet.</p> : insights.positiveThemes.map((t) => <Badge key={t} tone="success">{t}</Badge>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle size={15} className="text-amber-600" /> Improvement Themes</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {insights.improvementThemes.length === 0 ? <p className="text-sm text-ink-400">No recurring concerns detected.</p> : insights.improvementThemes.map((t) => <Badge key={t} tone="warning">{t}</Badge>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Common Phrases</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {insights.commonPhrases.length === 0 ? <p className="text-sm text-ink-400">Not enough data yet.</p> : insights.commonPhrases.map((t) => <Badge key={t}>{t}</Badge>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
