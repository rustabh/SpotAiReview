import Link from "next/link";
import { listMyBusinesses } from "@/actions/business";
import { getGoogleReviewsPageData } from "@/actions/google-reviews";
import { getGmbAuditView } from "@/actions/gmb-audit";
import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building2, Reply } from "lucide-react";
import { GoogleReviewsPanel } from "@/components/dashboard/google-reviews-panel";
import { GmbAuditPanel } from "@/components/dashboard/gmb-audit-panel";

export default async function GoogleReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string; error?: string; connected?: string; tab?: string }>;
}) {
  const [businesses, params] = await Promise.all([listMyBusinesses(), searchParams]);
  const businessId = params.businessId || businesses[0]?.id;
  const tab = params.tab === "audit" ? "audit" : "reviews";

  if (!businessId) {
    return (
      <div>
        <PageHeader title="Google Reviews" description="AI-drafted replies to your Google Business Profile reviews." />
        <EmptyState icon={Building2} title="Add a business first" description="Create a business before connecting Google." />
      </div>
    );
  }

  const data = await getGoogleReviewsPageData(businessId);
  const isConnected = data.configured && data.connection?.status === "CONNECTED";
  const audit = isConnected ? await getGmbAuditView(businessId) : null;

  return (
    <div>
      <PageHeader
        title="Google Business"
        description="AI-drafted review replies and a ranking audit for your Google Business Profile."
        action={businesses.length > 1 ? <BusinessSwitcher businesses={businesses} value={businessId} basePath="/dashboard/google-reviews" /> : undefined}
      />

      {params.error && <Alert tone="error" className="mb-4">{decodeURIComponent(params.error)}</Alert>}
      {params.connected && <Alert tone="success" className="mb-4">Connected! Syncing your reviews now.</Alert>}

      {isConnected && (
        <div className="mb-5 flex gap-2 border-b border-border">
          {[
            { id: "reviews", label: "Reviews" },
            { id: "audit", label: "Ranking Audit" },
          ].map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/google-reviews?businessId=${businessId}&tab=${t.id}`}
              className={cn(
                "border-b-2 px-3 pb-2.5 text-sm font-medium transition-colors",
                tab === t.id ? "border-brand-600 text-foreground" : "border-transparent text-ink-400 hover:text-ink-600"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {!data.configured ? (
        <Card>
          <CardHeader><CardTitle>Not set up yet</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-ink-500">
              Google Business Profile isn&apos;t configured on this platform yet. This needs a Google Cloud project with the Business
              Profile API enabled, <strong>API access approved by Google</strong> (a manual request only takes effect once Google grants it —
              this can&apos;t be skipped from here), and an OAuth client. Once <code className="rounded bg-ink-100 px-1 py-0.5 text-xs dark:bg-ink-800">GOOGLE_BUSINESS_CLIENT_ID</code>,{" "}
              <code className="rounded bg-ink-100 px-1 py-0.5 text-xs dark:bg-ink-800">GOOGLE_BUSINESS_CLIENT_SECRET</code>, and{" "}
              <code className="rounded bg-ink-100 px-1 py-0.5 text-xs dark:bg-ink-800">GOOGLE_TOKEN_ENCRYPTION_KEY</code> are set, this page
              goes live automatically.
            </p>
          </CardContent>
        </Card>
      ) : !data.connection || data.connection.status === "DISCONNECTED" ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <Reply size={28} className="text-brand-600" />
            <div>
              <p className="font-semibold text-foreground">Connect your Google Business Profile</p>
              <p className="mt-1 max-w-md text-sm text-ink-500">
                Once connected, every new Google review gets an AI-drafted reply automatically. You stay in control — nothing posts to
                Google until you approve it, unless you turn on auto-post.
              </p>
            </div>
            <a href={`/api/google-business/connect?businessId=${businessId}`}>
              <Button>Connect Google Business Profile</Button>
            </a>
          </CardContent>
        </Card>
      ) : data.connection.status === "PENDING_LOCATION" ? (
        <Alert tone="info">
          Almost there — <a className="font-medium underline" href={`/dashboard/google-reviews/select-location?businessId=${businessId}`}>choose which Google location</a> this business is.
        </Alert>
      ) : data.connection.status === "AUTH_ERROR" ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="font-semibold text-foreground">Google disconnected this account</p>
            <p className="max-w-md text-sm text-ink-500">{data.connection.lastError ?? "Access was revoked or expired. Reconnect to keep replying automatically."}</p>
            <a href={`/api/google-business/connect?businessId=${businessId}`}>
              <Button>Reconnect Google Business Profile</Button>
            </a>
          </CardContent>
        </Card>
      ) : tab === "audit" ? (
        <GmbAuditPanel businessId={businessId} initialAudit={audit} />
      ) : (
        <GoogleReviewsPanel businessId={businessId} connection={data.connection} reviews={data.reviews} />
      )}
    </div>
  );
}
