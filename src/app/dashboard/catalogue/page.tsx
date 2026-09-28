import { listMyBusinesses } from "@/actions/business";
import { listMenu, listUncategorizedProducts } from "@/actions/menu";
import { getEffectiveFeatures } from "@/lib/features";
import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { EmptyState } from "@/components/ui/empty-state";
import { EnableMenuButton } from "@/components/menu/enable-menu-button";
import { CatalogueBuilder } from "@/components/menu/catalogue-builder";
import { UtensilsCrossed, Building2 } from "lucide-react";

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string }>;
}) {
  const [businesses, params] = await Promise.all([listMyBusinesses(), searchParams]);
  const businessId = params.businessId || businesses[0]?.id;

  if (!businessId) {
    return (
      <div>
        <PageHeader title="Spot Menu" description="Build your digital menu or product catalogue." />
        <EmptyState icon={Building2} title="Add a business first" description="Create a business before building a menu or catalogue." />
      </div>
    );
  }

  const business = businesses.find((b) => b.id === businessId)!;
  const features = getEffectiveFeatures(business);

  return (
    <div>
      <PageHeader
        title="Spot Menu"
        description="Categories, products, variants and add-ons — shown on your Smart Link and used for ordering."
        action={businesses.length > 1 ? <BusinessSwitcher businesses={businesses} value={businessId} basePath="/dashboard/catalogue" /> : undefined}
      />

      {!features.menu && !features.products ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Spot Menu isn't enabled for this business yet"
          description={`${business.name} is set up as "${business.category.name}", which doesn't turn this on by default. You can still enable it — useful if you sell food, products, or anything else worth listing.`}
          action={<EnableMenuButton businessId={businessId} />}
        />
      ) : (
        <CatalogueContent businessId={businessId} />
      )}
    </div>
  );
}

async function CatalogueContent({ businessId }: { businessId: string }) {
  const [categories, uncategorized] = await Promise.all([listMenu(businessId), listUncategorizedProducts(businessId)]);
  return <CatalogueBuilder businessId={businessId} categories={categories} uncategorized={uncategorized} />;
}
