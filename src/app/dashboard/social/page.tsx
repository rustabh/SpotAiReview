import { listMyBusinesses } from "@/actions/business";
import { getSocialPageData } from "@/actions/social";
import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Building2, Share2 } from "lucide-react";
import { SocialPostsPanel } from "@/components/dashboard/social-posts-panel";

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string; error?: string; connected?: string }>;
}) {
  const [businesses, params] = await Promise.all([listMyBusinesses(), searchParams]);
  const businessId = params.businessId || businesses[0]?.id;

  if (!businessId) {
    return (
      <div>
        <PageHeader title="Social Auto-Posting" description="AI-drafted Facebook & Instagram posts made from your menu." />
        <EmptyState icon={Building2} title="Add a business first" description="Create a business before connecting Facebook." />
      </div>
    );
  }

  const data = await getSocialPageData(businessId);

  return (
    <div>
      <PageHeader
        title="Social Auto-Posting"
        description="AI picks a real menu photo, writes the caption, and posts it to Facebook & Instagram."
        action={businesses.length > 1 ? <BusinessSwitcher businesses={businesses} value={businessId} basePath="/dashboard/social" /> : undefined}
      />

      {params.error && <Alert tone="error" className="mb-4">{decodeURIComponent(params.error)}</Alert>}
      {params.connected && <Alert tone="success" className="mb-4">Connected! Generate your first post below.</Alert>}

      {!data.configured ? (
        <Card>
          <CardHeader><CardTitle>Not set up yet</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-ink-500">
              Social auto-posting isn&apos;t configured on this platform yet. This needs a Meta developer app with Facebook Login and the
              Instagram Graph API products added, and <strong>Meta&apos;s App Review approval</strong> for the{" "}
              <code className="rounded bg-ink-100 px-1 py-0.5 text-xs dark:bg-ink-800">pages_manage_posts</code> and{" "}
              <code className="rounded bg-ink-100 px-1 py-0.5 text-xs dark:bg-ink-800">instagram_content_publish</code> permissions — that
              approval happens on Meta&apos;s side and can&apos;t be skipped from here. Once{" "}
              <code className="rounded bg-ink-100 px-1 py-0.5 text-xs dark:bg-ink-800">FACEBOOK_APP_ID</code>,{" "}
              <code className="rounded bg-ink-100 px-1 py-0.5 text-xs dark:bg-ink-800">FACEBOOK_APP_SECRET</code>, and{" "}
              <code className="rounded bg-ink-100 px-1 py-0.5 text-xs dark:bg-ink-800">SOCIAL_TOKEN_ENCRYPTION_KEY</code> are set, this page
              goes live automatically.
            </p>
          </CardContent>
        </Card>
      ) : !data.connection || data.connection.status === "DISCONNECTED" ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <Share2 size={28} className="text-brand-600" />
            <div>
              <p className="font-semibold text-foreground">Connect Facebook & Instagram</p>
              <p className="mt-1 max-w-md text-sm text-ink-500">
                Once connected, AI turns your menu into ready-to-post content — a real product photo plus a caption it writes for you.
                Nothing goes live until you approve it, unless you turn on auto-post.
              </p>
            </div>
            <a href={`/api/social/connect?businessId=${businessId}`}>
              <Button>Connect Facebook Page</Button>
            </a>
          </CardContent>
        </Card>
      ) : data.connection.status === "PENDING_PAGE" ? (
        <Alert tone="info">
          Almost there — <a className="font-medium underline" href={`/dashboard/social/select-page?businessId=${businessId}`}>choose which Facebook Page</a> this business is.
        </Alert>
      ) : data.connection.status === "AUTH_ERROR" ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="font-semibold text-foreground">Facebook disconnected this account</p>
            <p className="max-w-md text-sm text-ink-500">{data.connection.lastError ?? "Access was revoked or expired. Reconnect to keep auto-posting."}</p>
            <a href={`/api/social/connect?businessId=${businessId}`}>
              <Button>Reconnect Facebook Page</Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <SocialPostsPanel businessId={businessId} connection={data.connection} posts={data.posts} />
      )}
    </div>
  );
}
