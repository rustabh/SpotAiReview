import Link from "next/link";
import { listMyBusinesses } from "@/actions/business";
import { listOrders } from "@/actions/orders";
import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderQueue } from "@/components/dashboard/order-queue";
import { ClipboardList, Building2 } from "lucide-react";
import type { $Enums } from "@prisma/client";

const FILTERS: { label: string; value: $Enums.OrderStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Received", value: "RECEIVED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string; status?: string }>;
}) {
  const [businesses, params] = await Promise.all([listMyBusinesses(), searchParams]);
  const businessId = params.businessId || businesses[0]?.id;

  if (!businessId) {
    return (
      <div>
        <PageHeader title="Orders" description="Every order placed from a table QR, in one queue." />
        <EmptyState icon={Building2} title="Add a business first" description="Create a business before viewing orders." />
      </div>
    );
  }

  const statusFilter = params.status as $Enums.OrderStatus | undefined;
  const orders = await listOrders(businessId, statusFilter);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Every order placed from a table QR, in one queue."
        action={businesses.length > 1 ? <BusinessSwitcher businesses={businesses} value={businessId} basePath="/dashboard/orders" /> : undefined}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={`/dashboard/orders?businessId=${businessId}${f.value ? `&status=${f.value}` : ""}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === f.value ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400" : "border-border text-ink-600"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders yet" description="Orders placed from a table QR will show up here in real time." />
      ) : (
        <OrderQueue businessId={businessId} orders={orders} />
      )}
    </div>
  );
}
