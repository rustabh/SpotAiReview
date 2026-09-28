import type { Metadata } from "next";
import { ShieldAlert, UtensilsCrossed } from "lucide-react";
import { resolveTableByToken } from "@/actions/tables";
import { getPublicMenu } from "@/actions/menu";
import { getEffectiveFeatures } from "@/lib/features";
import { LogoMark } from "@/components/brand/logo-mark";
import { TableOrderClient } from "@/components/order/table-order-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function TableOrderPage({ params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = await params;
  const table = await resolveTableByToken(qrToken);

  if (!table) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 text-center dark:bg-ink-900">
        <ShieldAlert className="mb-3 text-ink-400" size={32} />
        <h1 className="text-lg font-semibold text-foreground">This table link is no longer active</h1>
        <p className="mt-1 max-w-xs text-sm text-ink-500">Please ask a staff member for help.</p>
      </div>
    );
  }

  const features = getEffectiveFeatures(table.business);
  if (!features.ordering) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 text-center dark:bg-ink-900">
        <UtensilsCrossed className="mb-3 text-ink-400" size={32} />
        <h1 className="text-lg font-semibold text-foreground">Ordering isn&apos;t available here</h1>
        <p className="mt-1 max-w-xs text-sm text-ink-500">Please order with a staff member directly.</p>
      </div>
    );
  }

  const menu = await getPublicMenu(table.businessId);
  const isEmpty = menu.categories.length === 0 && menu.uncategorized.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 py-5 text-center">
        <div className="mx-auto flex max-w-lg flex-col items-center">
          <LogoMark size={28} />
          <h1 className="mt-3 font-heading text-xl font-bold text-foreground">{table.business.name}</h1>
          <p className="mt-1 text-sm font-medium text-brand-600">Table {table.number}{table.section ? ` · ${table.section}` : ""}</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {isEmpty ? (
          <p className="py-16 text-center text-sm text-ink-400">The menu isn&apos;t ready yet — please check with a staff member.</p>
        ) : (
          <TableOrderClient qrToken={qrToken} categories={menu.categories} uncategorized={menu.uncategorized} />
        )}
      </main>
    </div>
  );
}
