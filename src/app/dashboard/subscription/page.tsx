import { getMySubscription } from "@/actions/subscription";
import { listAllPlans } from "@/actions/admin";
import { isRazorpayConfigured } from "@/lib/payments/razorpay";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { PlanSwitchButton } from "@/components/dashboard/plan-switch-button";

function formatPrice(paise: number) {
  return paise === 0 ? "Free" : `₹${(paise / 100).toLocaleString("en-IN")}/mo`;
}

export default async function SubscriptionPage() {
  const [{ subscription, businessCount, campaignCount }, plans] = await Promise.all([getMySubscription(), listAllPlans()]);
  const configured = isRazorpayConfigured();

  return (
    <div>
      <PageHeader title="Subscription" description="Your current plan and usage limits." />

      <Alert tone={configured ? "success" : "info"} className="mb-6">
        {configured
          ? "Payments are processed securely via Razorpay. Switching to a paid plan below will open a secure checkout."
          : "No payment gateway is connected in this environment yet — switching plans below updates your limits directly for demo purposes. Paid checkout activates automatically once Razorpay keys are configured."}
      </Alert>

      {subscription && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{subscription.plan.name} Plan</CardTitle>
            <Badge tone="success">{subscription.status}</Badge>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div><p className="text-ink-400">Businesses</p><p className="font-medium">{businessCount} / {subscription.plan.businessLimit}</p></div>
            <div><p className="text-ink-400">Campaigns</p><p className="font-medium">{campaignCount} / {subscription.plan.campaignLimit}</p></div>
            <div><p className="text-ink-400">AI generations / mo</p><p className="font-medium">{subscription.plan.aiGenerationsPerMonth}</p></div>
            <div><p className="text-ink-400">Team members</p><p className="font-medium">{subscription.plan.teamMemberLimit}</p></div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <Card key={p.id} className={p.id === subscription?.planId ? "ring-2 ring-brand-500" : ""}>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground">{p.name}</h3>
              <p className="mt-1 text-2xl font-semibold">{formatPrice(p.monthlyPrice)}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-ink-500">
                <li>{p.businessLimit} business{p.businessLimit > 1 ? "es" : ""}</li>
                <li>{p.campaignLimit} campaigns</li>
                <li>{p.aiGenerationsPerMonth.toLocaleString()} AI generations/mo</li>
                <li>{p.teamMemberLimit} team member{p.teamMemberLimit > 1 ? "s" : ""}</li>
                <li>{p.advancedInsights ? "Advanced AI insights" : "Basic insights"}</li>
              </ul>
              <div className="mt-4">
                <PlanSwitchButton planId={p.id} planName={p.name} isCurrent={p.id === subscription?.planId} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
