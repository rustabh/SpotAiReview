import { listMyBusinesses } from "@/actions/business";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ReviewSettingsForm } from "@/components/dashboard/review-settings-form";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const businesses = await listMyBusinesses();

  if (businesses.length === 0) {
    return (
      <div>
        <PageHeader title="Settings" description="Configure your review experience and branding." />
        <EmptyState icon={Settings} title="Add a business first" description="Settings apply per business." />
      </div>
    );
  }

  const fullBusinesses = await prisma.business.findMany({ where: { id: { in: businesses.map((b) => b.id) } } });

  return (
    <div>
      <PageHeader title="Settings" description="Configure the AI review experience and branding for each business." />
      <div className="space-y-6">
        {fullBusinesses.map((b) => (
          <Card key={b.id}>
            <CardHeader><CardTitle>{b.name}</CardTitle></CardHeader>
            <CardContent>
              <ReviewSettingsForm
                businessId={b.id}
                aiTone={b.aiTone}
                aiLength={b.aiLength}
                defaultLanguage={b.defaultLanguage}
                allowedLanguages={(b.allowedLanguages as string[]) ?? ["en"]}
                logoUrl={b.logoUrl ?? ""}
                coverImageUrl={b.coverImageUrl ?? ""}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
