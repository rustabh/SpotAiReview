import Link from "next/link";
import { listMyBusinesses } from "@/actions/business";
import { listCampaignsForBusiness } from "@/actions/campaign";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { QrCode, Plus, ExternalLink } from "lucide-react";
import { campaignUrl } from "@/lib/qr";

export default async function CampaignsPage() {
  const businesses = await listMyBusinesses();
  const campaignsByBusiness = await Promise.all(
    businesses.map(async (b) => ({ business: b, campaigns: await listCampaignsForBusiness(b.id) }))
  );
  const hasAnyCampaign = campaignsByBusiness.some((g) => g.campaigns.length > 0);

  return (
    <div>
      <PageHeader
        title="Campaigns & QR"
        description="Every QR code, NFC tap and digital link that leads customers to your review page."
        action={
          businesses.length > 0 ? (
            <Link href="/dashboard/campaigns/new">
              <Button><Plus size={15} /> New Campaign</Button>
            </Link>
          ) : undefined
        }
      />

      {businesses.length === 0 ? (
        <EmptyState icon={QrCode} title="Add a business first" description="Create a business before setting up QR campaigns." action={<Link href="/dashboard/businesses/new"><Button>Add Business</Button></Link>} />
      ) : !hasAnyCampaign ? (
        <EmptyState
          icon={QrCode}
          title="No campaigns yet"
          description="Create a QR campaign and start collecting experiences."
          action={<Link href="/dashboard/campaigns/new"><Button><Plus size={15} /> Create QR Campaign</Button></Link>}
        />
      ) : (
        <div className="space-y-8">
          {campaignsByBusiness.filter((g) => g.campaigns.length > 0).map(({ business, campaigns }) => (
            <div key={business.id}>
              <h2 className="mb-3 text-sm font-semibold text-ink-500">{business.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-ink-400">{c.placement || "No placement"}</p>
                        </div>
                        <Badge tone={c.status === "ACTIVE" ? "success" : "neutral"}>{c.status}</Badge>
                      </div>
                      <p className="mt-2 text-xs font-mono text-ink-400">{c.code}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <Link href={`/dashboard/campaigns/${c.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full"><QrCode size={14} /> View QR</Button>
                        </Link>
                        <a href={campaignUrl(c.slug)} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost"><ExternalLink size={14} /></Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
