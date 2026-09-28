"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/rbac";
import { getEffectiveFeatures } from "@/lib/features";
import { resolveTableByToken, getOrCreateOpenSession } from "./tables";
import { getPOSProvider, type PosOrderStatus } from "@/lib/pos";
import type { ActionResult } from "./auth";
import type { $Enums } from "@prisma/client";

const MAX_SPECIAL_INSTRUCTIONS = 300;
const MAX_QUANTITY_PER_LINE = 50;

function sanitizeInstructions(text: string | undefined) {
  if (!text) return null;
  // Strip control characters; there's no shell/SQL to inject into (Prisma params are already
  // safe), this just keeps stray control bytes out of an order a kitchen screen will display.
  // eslint-disable-next-line no-control-regex
  const cleaned = text.replace(/[\x00-\x1f\x7f]/g, "").trim();
  return cleaned ? cleaned.slice(0, MAX_SPECIAL_INSTRUCTIONS) : null;
}

function generateOrderCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `SP${n}${Math.floor(Math.random() * 10)}`;
}

// ---------------------------------------------------------------------------
// Public — no login, called from the table's order page.
// ---------------------------------------------------------------------------

export type PlaceOrderItemInput = {
  productId: string;
  variantId?: string;
  modifierOptionIds: string[];
  quantity: number;
  specialInstructions?: string;
};

export type PlaceOrderInput = {
  qrToken: string;
  items: PlaceOrderItemInput[];
  customerName?: string;
  customerPhone?: string;
  specialInstructions?: string;
  idempotencyKey: string;
};

export type PlaceOrderResult = { orderId: string; code: string };

export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult<PlaceOrderResult>> {
  if (!input.idempotencyKey) return { ok: false, error: "Missing idempotency key." };

  // A retried request (double-tap, client retry) returns the order already created for this key.
  const existingOrder = await prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existingOrder) return { ok: true, data: { orderId: existingOrder.id, code: existingOrder.code } };

  const table = await resolveTableByToken(input.qrToken);
  if (!table) return { ok: false, error: "This table link is no longer valid." };

  const features = getEffectiveFeatures(table.business);
  if (!features.ordering) return { ok: false, error: "Ordering isn't available for this business." };

  if (!input.items.length) return { ok: false, error: "Your cart is empty." };
  if (input.items.length > 50) return { ok: false, error: "Too many items in one order." };
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_LINE) {
      return { ok: false, error: "Enter a valid quantity for each item." };
    }
  }

  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, businessId: table.businessId, isAvailable: true },
    include: { variants: true, modifierGroups: { include: { options: true } } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Server-side pricing — the client's numbers are never trusted, only which product/variant/
  // modifier IDs were selected. This is the same principle billing.ts already follows for plans.
  const lineItems: {
    productId: string;
    productName: string;
    variantId: string | null;
    variantName: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    specialInstructions: string | null;
    modifiers: { modifierOptionId: string; name: string; priceDelta: number }[];
  }[] = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) return { ok: false, error: "One of the items in your cart is no longer available." };

    let variant = null;
    if (item.variantId) {
      variant = product.variants.find((v) => v.id === item.variantId) ?? null;
      if (!variant) return { ok: false, error: `Please re-select an option for ${product.name}.` };
    }

    const selectedOptions = new Map<string, { id: string; name: string; priceDelta: number; groupId: string }>();
    for (const group of product.modifierGroups) {
      const selectedInGroup = group.options.filter((o) => item.modifierOptionIds.includes(o.id));
      if (selectedInGroup.length < group.minSelect || selectedInGroup.length > group.maxSelect) {
        return { ok: false, error: `Please select ${group.minSelect === group.maxSelect ? group.maxSelect : `${group.minSelect}-${group.maxSelect}`} option(s) for "${group.name}" on ${product.name}.` };
      }
      for (const o of selectedInGroup) selectedOptions.set(o.id, { id: o.id, name: o.name, priceDelta: o.priceDelta, groupId: group.id });
    }

    const unitPrice = (product.discountPrice ?? product.price) + (variant?.priceDelta ?? 0) + [...selectedOptions.values()].reduce((sum, o) => sum + o.priceDelta, 0);

    lineItems.push({
      productId: product.id,
      productName: product.name,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      specialInstructions: sanitizeInstructions(item.specialInstructions),
      modifiers: [...selectedOptions.values()].map((o) => ({ modifierOptionId: o.id, name: o.name, priceDelta: o.priceDelta })),
    });
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const session = await getOrCreateOpenSession(table.id);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        businessId: table.businessId,
        tableSessionId: session.id,
        code: generateOrderCode(),
        type: "DINE_IN",
        customerName: input.customerName?.trim().slice(0, 100) || null,
        customerPhone: input.customerPhone?.trim().slice(0, 20) || null,
        specialInstructions: sanitizeInstructions(input.specialInstructions),
        subtotal,
        totalAmount: subtotal,
        idempotencyKey: input.idempotencyKey,
      },
    });

    for (const line of lineItems) {
      const orderItem = await tx.orderItem.create({
        data: {
          orderId: created.id,
          productId: line.productId,
          productName: line.productName,
          variantId: line.variantId,
          variantName: line.variantName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.lineTotal,
          specialInstructions: line.specialInstructions,
        },
      });
      for (const mod of line.modifiers) {
        await tx.orderItemModifier.create({
          data: { orderItemId: orderItem.id, modifierOptionId: mod.modifierOptionId, name: mod.name, priceDelta: mod.priceDelta },
        });
      }
    }

    return created;
  });

  // Sync to POS after the order is safely committed — a POS failure here must never lose the
  // order itself; it only leaves posSyncStatus reflecting the failure for staff/admin to see.
  try {
    const provider = await getPOSProvider(table.businessId);
    const { posOrderId } = await provider.createOrder({
      orderCode: order.code,
      type: "DINE_IN",
      tableLabel: table.number,
      customerName: order.customerName ?? undefined,
      customerPhone: order.customerPhone ?? undefined,
      items: lineItems.map((l) => ({
        productExternalId: undefined,
        productName: l.productName,
        variantName: l.variantName ?? undefined,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        modifiers: l.modifiers.map((m) => ({ name: m.name, priceDelta: m.priceDelta })),
      })),
      subtotal,
      taxAmount: 0,
      totalAmount: subtotal,
    });
    await prisma.order.update({ where: { id: order.id }, data: { posOrderId, posSyncStatus: "SYNCED" } });
  } catch {
    await prisma.order.update({ where: { id: order.id }, data: { posSyncStatus: "FAILED", posSyncError: "Could not reach the POS system." } });
  }

  revalidatePath("/dashboard/orders");
  return { ok: true, data: { orderId: order.id, code: order.code } };
}

const POS_TO_ORDER_STATUS: Record<PosOrderStatus, $Enums.OrderStatus> = {
  RECEIVED: "RECEIVED",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

/** Public — the customer's order-tracking view. Syncs from the POS on read (controlled, not polled server-side). */
export async function getOrderForCustomer(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { modifiers: true } }, tableSession: { include: { table: true } } },
  });
  if (!order) return null;

  if (order.posOrderId && order.status !== "COMPLETED" && order.status !== "CANCELLED") {
    try {
      const provider = await getPOSProvider(order.businessId);
      const posStatus = await provider.getOrderStatus(order.posOrderId);
      const mapped = POS_TO_ORDER_STATUS[posStatus];
      if (mapped && mapped !== order.status) {
        return prisma.order.update({
          where: { id: order.id },
          data: { status: mapped },
          include: { items: { include: { modifiers: true } }, tableSession: { include: { table: true } } },
        });
      }
    } catch {
      // Status sync is best-effort — show the last known status rather than failing the page.
    }
  }

  return order;
}

// ---------------------------------------------------------------------------
// Owner / staff dashboard
// ---------------------------------------------------------------------------

export async function listOrders(businessId: string, status?: $Enums.OrderStatus) {
  await requireBusinessAccess(businessId);
  return prisma.order.findMany({
    where: { businessId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: { include: { modifiers: true } }, tableSession: { include: { table: true } } },
  });
}

const NEXT_STATUS: Partial<Record<$Enums.OrderStatus, $Enums.OrderStatus>> = {
  RECEIVED: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
  SERVED: "COMPLETED",
};

export async function advanceOrderStatus(orderId: string, businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.businessId !== businessId) return { ok: false, error: "Order not found." };

  const next = NEXT_STATUS[order.status];
  if (!next) return { ok: false, error: "This order is already at its final status." };

  await prisma.order.update({ where: { id: orderId }, data: { status: next } });
  revalidatePath("/dashboard/orders");
  return { ok: true, data: undefined };
}

export async function cancelOrder(orderId: string, businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.businessId !== businessId) return { ok: false, error: "Order not found." };
  if (order.status === "COMPLETED" || order.status === "CANCELLED") {
    return { ok: false, error: "This order can no longer be cancelled." };
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });

  if (order.posOrderId) {
    try {
      const provider = await getPOSProvider(businessId);
      await provider.cancelOrder(order.posOrderId);
    } catch {
      // The local cancellation already happened and is the source of truth for this dashboard;
      // a POS-side cancel failure doesn't get surfaced as an error to the staff member here.
    }
  }

  revalidatePath("/dashboard/orders");
  return { ok: true, data: undefined };
}
