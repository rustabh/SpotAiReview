import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { getPublicBusinessBySlug, getPublicMenu } from "@/actions/menu";
import { LogoMark } from "@/components/brand/logo-mark";
import { PublicMenuView } from "@/components/menu/public-menu-view";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const business = await getPublicBusinessBySlug(slug);
  return { title: business ? `${business.name} — Menu` : "Menu", robots: { index: false, follow: false } };
}

export default async function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getPublicBusinessBySlug(slug);

  if (!business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 text-center dark:bg-ink-900">
        <ShieldAlert className="mb-3 text-ink-400" size={32} />
        <h1 className="text-lg font-semibold text-foreground">This menu link isn&apos;t available</h1>
        <p className="mt-1 max-w-xs text-sm text-ink-500">Please check the link or ask the business directly.</p>
      </div>
    );
  }

  const menu = await getPublicMenu(business.id);
  const isEmpty = menu.categories.length === 0 && menu.uncategorized.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 py-5 text-center">
        <div className="mx-auto flex max-w-lg flex-col items-center">
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt={business.name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <LogoMark size={28} />
          )}
          <h1 className="mt-3 font-heading text-xl font-bold text-foreground">{business.name}</h1>
          <p className="mt-1 text-sm font-medium text-brand-600">{business.category.name}</p>
          {business.description && <p className="mt-2 max-w-md text-sm text-ink-500">{business.description}</p>}
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {isEmpty ? (
          <p className="py-16 text-center text-sm text-ink-400">The menu isn&apos;t ready yet — please check back soon.</p>
        ) : (
          <PublicMenuView categories={menu.categories} uncategorized={menu.uncategorized} />
        )}
      </main>
    </div>
  );
}
