import Link from "next/link";
import { listMyBusinesses } from "@/actions/business";
import { getRecentFeedback, getPrivateFeedbackList } from "@/actions/analytics";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { MessageSquare, Lock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ businessId?: string }> }) {
  const [businesses, params] = await Promise.all([listMyBusinesses(), searchParams]);
  const businessId = params.businessId || businesses[0]?.id;

  if (!businessId) {
    return (
      <div>
        <PageHeader title="Feedback" description="Customer feedback will appear here." />
        <EmptyState icon={MessageSquare} title="Add a business first" description="Once you have a business with an active campaign, feedback will show up here." />
      </div>
    );
  }

  const [feedback, privateFeedback] = await Promise.all([
    getRecentFeedback(businessId, 50),
    getPrivateFeedbackList(businessId),
  ]);

  return (
    <div>
      <PageHeader
        title="Feedback"
        description="Every customer response, public and private."
        action={
          businesses.length > 1 ? (
            <BusinessSwitcher businesses={businesses} value={businessId} basePath="/dashboard/feedback" />
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Customer Feedback</CardTitle></CardHeader>
          <CardContent>
            {feedback.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">Customer feedback will appear here.</p>
            ) : (
              <ul className="divide-y divide-border">
                {feedback.map((f) => (
                  <li key={f.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-1">
                        {(f.selectedAttributes as string[]).map((a) => <Badge key={a} tone="brand">{a}</Badge>)}
                      </div>
                      <Badge tone={f.rating >= 4 ? "success" : f.rating === 3 ? "warning" : "danger"}>{f.rating}★</Badge>
                    </div>
                    {f.writtenFeedback && <p className="mt-2 text-sm text-foreground">{f.writtenFeedback}</p>}
                    {f.session.drafts[0] && (
                      <p className="mt-2 rounded-lg bg-ink-50 p-2 text-xs italic text-ink-500 dark:bg-ink-800">
                        Final review: “{f.session.drafts[0].content}”
                      </p>
                    )}
                    <p className="mt-1 text-xs text-ink-400">{formatDateTime(f.createdAt)} · {f.session.campaign.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Lock size={15} /> Private Feedback</CardTitle></CardHeader>
          <CardContent>
            {privateFeedback.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">Private feedback from lower ratings will appear here.</p>
            ) : (
              <ul className="divide-y divide-border">
                {privateFeedback.map((p) => (
                  <li key={p.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <Badge tone={p.status === "NEW" ? "warning" : "neutral"}>{p.status}</Badge>
                      <p className="text-xs text-ink-400">{formatDateTime(p.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{p.message}</p>
                    {p.contactInfo && <p className="mt-1 text-xs text-ink-400">Contact: {p.contactInfo}</p>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {businesses.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {businesses.map((b) => (
            <Link key={b.id} href={`/dashboard/feedback?businessId=${b.id}`}>
              <Badge tone={b.id === businessId ? "brand" : "neutral"}>{b.name}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
