import { listMyBusinesses } from "@/actions/business";
import { PageHeader } from "@/components/dashboard/page-header";
import { CampaignForm } from "@/components/dashboard/campaign-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewCampaignPage({ searchParams }: { searchParams: Promise<{ businessId?: string }> }) {
  const [businesses, params] = await Promise.all([listMyBusinesses(), searchParams]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Create QR Campaign" description="Every campaign gets its own QR code, unique link and NFC-ready URL." />
      <Card>
        <CardContent className="p-6">
          <CampaignForm businesses={businesses} defaultBusinessId={params.businessId} />
        </CardContent>
      </Card>
    </div>
  );
}
