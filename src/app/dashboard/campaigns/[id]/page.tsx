import { notFound } from "next/navigation";
import { getCampaignDetail } from "@/actions/campaign";
import { generateQrPngDataUrl, generateQrSvg, campaignUrl } from "@/lib/qr";
import { PageHeader } from "@/components/dashboard/page-header";
import { QrCard } from "@/components/dashboard/qr-card";
import { CampaignForm } from "@/components/dashboard/campaign-form";
import { CampaignStatusToggle } from "@/components/dashboard/campaign-status-toggle";
import { NfcDevices } from "@/components/dashboard/nfc-devices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaignDetail(id);
  if (!campaign) notFound();

  const url = campaignUrl(campaign.slug);
  const [pngDataUrl, svg] = await Promise.all([
    generateQrPngDataUrl(url, { fg: campaign.qrCode?.foregroundColor, bg: campaign.qrCode?.backgroundColor }),
    generateQrSvg(url, { fg: campaign.qrCode?.foregroundColor, bg: campaign.qrCode?.backgroundColor }),
  ]);

  return (
    <div>
      <PageHeader
        title={campaign.name}
        description={`${campaign.code} · ${campaign.business.name}`}
        action={<CampaignStatusToggle campaignId={campaign.id} businessId={campaign.businessId} status={campaign.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <QrCard pngDataUrl={pngDataUrl} svg={svg} url={url} fileName={slugify(campaign.name)} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Campaign Details</CardTitle></CardHeader>
            <CardContent>
              <CampaignForm
                businesses={[{ id: campaign.business.id, name: campaign.business.name }]}
                campaignId={campaign.id}
                defaultValues={{
                  businessId: campaign.businessId,
                  name: campaign.name,
                  placement: campaign.placement ?? "",
                  ctaText: campaign.ctaText,
                  description: campaign.description ?? "",
                  googleReviewUrlOverride: campaign.googleReviewUrlOverride ?? "",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>NFC Devices</CardTitle></CardHeader>
            <CardContent>
              <NfcDevices campaignId={campaign.id} businessId={campaign.businessId} devices={campaign.nfcDevices} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
