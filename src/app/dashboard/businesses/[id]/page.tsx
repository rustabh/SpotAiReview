import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinessDetail } from "@/actions/business";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pencil, QrCode, Plus, ExternalLink, Users } from "lucide-react";
import { campaignUrl } from "@/lib/qr";

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getBusinessDetail(id);
  if (!business) notFound();

  return (
    <div>
      <PageHeader
        title={business.name}
        description={business.category.name}
        action={
          <Link href={`/dashboard/businesses/${business.id}/edit`}>
            <Button variant="outline"><Pencil size={14} /> Edit</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
              <Link href={`/dashboard/campaigns/new?businessId=${business.id}`}>
                <Button size="sm" variant="outline"><Plus size={14} /> New Campaign</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {business.campaigns.length === 0 ? (
                <EmptyState
                  icon={QrCode}
                  title="No campaigns yet"
                  description="Create a QR campaign and start collecting experiences."
                  action={<Link href={`/dashboard/campaigns/new?businessId=${business.id}`}><Button size="sm"><Plus size={14} /> Create QR Campaign</Button></Link>}
                />
              ) : (
                <ul className="divide-y divide-border">
                  {business.campaigns.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <Link href={`/dashboard/campaigns/${c.id}`} className="font-medium text-foreground hover:underline">{c.name}</Link>
                        <p className="truncate text-xs text-ink-400">{c.placement || "No placement set"} · {c.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={c.status === "ACTIVE" ? "success" : "neutral"}>{c.status}</Badge>
                        <a href={campaignUrl(c.slug)} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="icon"><ExternalLink size={14} /></Button>
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Team</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {business.members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={14} className="text-ink-400" />
                      <span className="font-medium text-foreground">{m.user.name}</span>
                      <span className="text-ink-400">{m.user.email}</span>
                    </div>
                    <Badge>{m.role}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Google Review</CardTitle></CardHeader>
            <CardContent>
              {business.googleReviewConfig ? (
                <a href={business.googleReviewConfig.googleReviewUrl} target="_blank" rel="noreferrer" className="break-all text-sm text-brand-600 hover:underline">
                  {business.googleReviewConfig.googleReviewUrl}
                </a>
              ) : (
                <p className="text-sm text-ink-400">No Google review link set.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Experience Attributes</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {business.category.attributes.map((a) => (
                <Badge key={a.id} tone="brand">{a.label}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Snapshot</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-500">Campaigns</span><span className="font-medium">{business._count.campaigns}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">Feedback collected</span><span className="font-medium">{business._count.feedback}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
