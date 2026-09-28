import { listMyBusinesses } from "@/actions/business";
import { getGoogleReviewsPageData } from "@/actions/google-reviews";
import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Building2, Reply } from "lucide-react";
import { GoogleReviewsPanel } from "@/components/dashboard/google-reviews-panel";

export default async function GoogleReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string; error?: string; connected?: string }>;
}) {
  const [businesses, params] = await Promise.all([listMyBusinesses(), searchParams]);
  const businessId = params.businessId || businesses[0]?.id;

  if (!businessId) {
    return (
      <div>
        <PageHeader title="Google Reviews" description="AI-drafted replies to your Google Business Profile reviews." />
        <EmptyState icon={Building2} title="Add a business first" description="Create a business before connecting Google." />
      </div>
    );
  }

  const data = await getGoogleReviewsPageData(businessId);

  return (
    <div>
      <PageHeader
        title="Google Reviews"
        description="AI drafts a reply to every new Google review — you approve it (or turn on auto-post) before it goes live."
        action={businesses.length > 1 ? <BusinessSwitcher businesses={businesses} value={businessId} basePath="/dashboard/google-reviews" /> : undefined}
      />

      {params.error && <Alert tone="error" className="mb-4">{decodeURIComponent(params.error)}</Alert>}
      {params.connected && <Alert tone="success" className="mb-4">Connected! Syncing your reviews now.</Alert>}

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
      ) : (
        <GoogleReviewsPanel businessId={businessId} connection={data.connection} reviews={data.reviews} />
      )}
    </div>
  );
}
