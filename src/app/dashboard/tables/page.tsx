import { listMyBusinesses } from "@/actions/business";
import { listTables } from "@/actions/tables";
import { getEffectiveFeatures } from "@/lib/features";
import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TableManager } from "@/components/dashboard/table-manager";
import { LayoutGrid, Building2 } from "lucide-react";

export default async function TablesPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string }>;
}) {
  const [businesses, params] = await Promise.all([listMyBusinesses(), searchParams]);
  const businessId = params.businessId || businesses[0]?.id;

  if (!businessId) {
    return (
      <div>
        <PageHeader title="Tables" description="Create tables and generate a QR code for each one." />
        <EmptyState icon={Building2} title="Add a business first" description="Create a business before setting up tables." />
      </div>
    );
  }

  const business = businesses.find((b) => b.id === businessId)!;
  const features = getEffectiveFeatures(business);

  return (
    <div>
      <PageHeader
        title="Tables"
        description="Every table gets its own QR code — scanning it opens the menu with that table already recognized."
        action={businesses.length > 1 ? <BusinessSwitcher businesses={businesses} value={businessId} basePath="/dashboard/tables" /> : undefined}
      />

      {!features.tables ? (
        <EmptyState
          icon={LayoutGrid}
          title="Tables aren't enabled for this business"
          description={`${business.name} is set up as "${business.category.name}", which doesn't use tables by default. Enable Spot Menu for this business first.`}
        />
      ) : (
        <Card>
          <CardHeader className="flex-col items-start pb-4">
            <CardTitle>{business.name}</CardTitle>
            <CardDescription>Scanning a table&apos;s QR takes customers straight to the menu — no login, no manual table selection.</CardDescription>
          </CardHeader>
          <CardContent>
            <TableManagerLoader businessId={businessId} businessName={business.name} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function TableManagerLoader({ businessId, businessName }: { businessId: string; businessName: string }) {
  const tables = await listTables(businessId);
  return <TableManager businessId={businessId} businessName={businessName} tables={tables} />;
}
