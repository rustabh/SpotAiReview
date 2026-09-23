import { listAllPlans } from "@/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlanEditor } from "@/components/admin/plan-editor";

export default async function AdminPlansPage() {
  const plans = await listAllPlans();

  return (
    <div>
      <PageHeader title="Subscription Plans" description="Configure pricing and usage limits. Payment provider integration (Razorpay/Stripe) can be wired up against this data model." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <Card key={p.id}>
            <CardHeader><CardTitle>{p.name}</CardTitle></CardHeader>
            <CardContent><PlanEditor plan={p} /></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
