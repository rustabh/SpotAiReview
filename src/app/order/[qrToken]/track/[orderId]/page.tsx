import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { getOrderForCustomer } from "@/actions/orders";
import { LogoMark } from "@/components/brand/logo-mark";
import { OrderTracker, type TrackedOrder } from "@/components/order/order-tracker";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OrderTrackingPage({ params }: { params: Promise<{ qrToken: string; orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrderForCustomer(orderId);

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 text-center dark:bg-ink-900">
        <ShieldAlert className="mb-3 text-ink-400" size={32} />
        <h1 className="text-lg font-semibold text-foreground">We couldn&apos;t find this order</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-col items-center border-b border-border bg-surface px-6 py-5 text-center">
        <LogoMark size={26} />
        <p className="mt-2 text-sm font-medium text-ink-500">Table {order.tableSession?.table.number ?? "—"}</p>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6">
        <OrderTracker orderId={orderId} initialOrder={order as unknown as TrackedOrder} />
      </main>
    </div>
  );
}
