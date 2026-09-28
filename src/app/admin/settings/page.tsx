import { getPlatformSettings } from "@/actions/platform";
import { getRazorpayMode, isRazorpayWebhookConfigured } from "@/lib/payments/razorpay";
import { isGoogleBusinessConfigured } from "@/lib/google/business-profile";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformSettingsForm } from "@/components/admin/platform-settings-form";

const MODE_BADGE = {
  live: { tone: "success" as const, label: "Live — real charges" },
  test: { tone: "warning" as const, label: "Test mode" },
  unconfigured: { tone: "neutral" as const, label: "Not configured" },
};

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();
  const mode = getRazorpayMode();
  const webhookConfigured = isRazorpayWebhookConfigured();
  const googleConfigured = isGoogleBusinessConfigured();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <PageHeader title="Platform Settings" description="Global configuration for the AiReview platform." />
        <Card>
          <CardHeader className="flex-col items-start pb-4">
            <CardTitle>Payments</CardTitle>
            <CardDescription>Read-only — set via RAZORPAY_* environment variables, not editable here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Razorpay</span>
              <Badge tone={MODE_BADGE[mode].tone}>{MODE_BADGE[mode].label}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Webhook secret</span>
              <Badge tone={webhookConfigured ? "success" : "neutral"}>{webhookConfigured ? "Configured" : "Not set"}</Badge>
            </div>
            {mode === "test" && (
              <p className="text-xs text-ink-400">
                Checkout works end-to-end but no real money moves. Switch RAZORPAY_KEY_ID/SECRET to your live keys
                (Razorpay Dashboard → Settings → API Keys, once KYC-activated) to accept real payments.
              </p>
            )}
            {mode === "unconfigured" && (
              <p className="text-xs text-ink-400">
                Plan changes switch instantly with no charge until Razorpay keys are set — useful for demos.
              </p>
            )}
            {mode === "live" && !webhookConfigured && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Live keys are active but no webhook secret is set — payment confirmation relies solely on the
                customer&apos;s browser completing the checkout call. Add RAZORPAY_WEBHOOK_SECRET so payments still
                activate if they close the tab too early.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col items-start pb-4">
          <CardTitle>Google Business Profile</CardTitle>
          <CardDescription>Read-only — set via GOOGLE_BUSINESS_* / GOOGLE_TOKEN_ENCRYPTION_KEY environment variables.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Review auto-reply</span>
            <Badge tone={googleConfigured ? "success" : "neutral"}>{googleConfigured ? "Configured" : "Not configured"}</Badge>
          </div>
          {!googleConfigured && (
            <p className="text-xs text-ink-400">
              Requires a Google Cloud project with the Business Profile API enabled, an OAuth client, and{" "}
              <strong>Google&apos;s approval of an API access request</strong> — that approval step happens on Google&apos;s side and
              can&apos;t be skipped. Once approved, set GOOGLE_BUSINESS_CLIENT_ID, GOOGLE_BUSINESS_CLIENT_SECRET, and
              GOOGLE_TOKEN_ENCRYPTION_KEY and this lights up for every business automatically.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <PlatformSettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
