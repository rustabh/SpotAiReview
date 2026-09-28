"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/rbac";
import { resolveTableByToken } from "./tables";
import { createRazorpayOrder, verifyRazorpayPaymentSignature, isRazorpayConfigured } from "@/lib/payments/razorpay";
import type { ActionResult } from "./auth";
import type { $Enums } from "@prisma/client";

// ---------------------------------------------------------------------------
// Public — no login. A table session is shared by everyone scanning the same
// table's QR while it's open, so "your orders" and the bill are scoped to the
// table, not to any one customer's phone — exactly what lets a party keep
// ordering more rounds and then settle up together at the end.
// ---------------------------------------------------------------------------

export type SessionOrderView = {
  id: string;
  code: string;
  status: $Enums.OrderStatus;
  totalAmount: number;
  createdAt: Date;
  items: { id: string; productName: string; variantName: string | null; quantity: number }[];
};

export type TableSessionView = {
  sessionId: string;
  code: string;
  totalAmount: number;
  billRequestedAt: Date | null;
  paymentMethod: $Enums.TableSessionPaymentMethod | null;
  paidAt: Date | null;
  orders: SessionOrderView[];
};

const OPEN_SESSION_INCLUDE = {
  orders: {
    where: { status: { not: "CANCELLED" as const } },
    include: { items: true },
    orderBy: { createdAt: "asc" as const },
  },
};

async function loadOpenSession(qrToken: string) {
  const table = await resolveTableByToken(qrToken);
  if (!table) return null;

  const session = await prisma.tableSession.findFirst({
    where: { tableId: table.id, status: "OPEN" },
    orderBy: { openedAt: "desc" },
    include: OPEN_SESSION_INCLUDE,
  });
  if (!session) return null;

  return { table, session };
}

type LoadedSession = NonNullable<Awaited<ReturnType<typeof loadOpenSession>>>["session"];

function toView(session: LoadedSession): TableSessionView {
  return {
    sessionId: session.id,
    code: session.code,
    totalAmount: session.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    billRequestedAt: session.billRequestedAt,
    paymentMethod: session.paymentMethod,
    paidAt: session.paidAt,
    orders: session.orders.map((o) => ({
      id: o.id,
      code: o.code,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({ id: i.id, productName: i.productName, variantName: i.variantName, quantity: i.quantity })),
    })),
  };
}

/** Public — polled by the customer's order page to show live status of everything ordered at this table. */
export async function getTableSessionView(qrToken: string): Promise<TableSessionView | null> {
  const loaded = await loadOpenSession(qrToken);
  if (!loaded) return null;
  return toView(loaded.session);
}

/** Public — marks that the table wants its bill. Idempotent — calling it again just returns the current state. */
export async function requestBill(qrToken: string): Promise<ActionResult<TableSessionView>> {
  const loaded = await loadOpenSession(qrToken);
  if (!loaded) return { ok: false, error: "No active order found for this table." };
  if (loaded.session.orders.length === 0) return { ok: false, error: "Place an order before requesting the bill." };

  const session = loaded.session.billRequestedAt
    ? loaded.session
    : await prisma.tableSession.update({
        where: { id: loaded.session.id },
        data: { billRequestedAt: new Date() },
        include: OPEN_SESSION_INCLUDE,
      });

  revalidatePath("/dashboard/orders");
  return { ok: true, data: toView(session) };
}

/** Public — customer chose "Pay at Counter". The session stays OPEN until staff confirms cash was collected. */
export async function choosePayAtCounter(qrToken: string): Promise<ActionResult<TableSessionView>> {
  const loaded = await loadOpenSession(qrToken);
  if (!loaded) return { ok: false, error: "No active order found for this table." };

  const session = await prisma.tableSession.update({
    where: { id: loaded.session.id },
    data: { paymentMethod: "COUNTER", billRequestedAt: loaded.session.billRequestedAt ?? new Date() },
    include: OPEN_SESSION_INCLUDE,
  });

  revalidatePath("/dashboard/orders");
  return { ok: true, data: toView(session) };
}

export type BillCheckoutData = { keyId: string; orderId: string; amount: number; currency: string };

/** Public — starts a Razorpay checkout for the whole table's bill, total recomputed server-side from live orders. */
export async function createBillCheckoutOrder(qrToken: string): Promise<ActionResult<BillCheckoutData>> {
  if (!isRazorpayConfigured()) return { ok: false, error: "Online payment isn't set up yet — please pay at the counter." };

  const loaded = await loadOpenSession(qrToken);
  if (!loaded) return { ok: false, error: "No active order found for this table." };
  if (loaded.session.orders.length === 0) return { ok: false, error: "Place an order before paying." };

  const totalAmount = loaded.session.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  if (totalAmount <= 0) return { ok: false, error: "Nothing to pay." };

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder({
      amount: totalAmount,
      receipt: loaded.session.code,
      notes: { tableSessionId: loaded.session.id, businessId: loaded.table.businessId },
    });
  } catch (err) {
    console.error("[table-session] Failed to create Razorpay order:", err);
    return { ok: false, error: "Could not start payment. Please try again or pay at the counter." };
  }

  await prisma.tableSession.update({
    where: { id: loaded.session.id },
    data: { razorpayOrderId: razorpayOrder.id, billRequestedAt: loaded.session.billRequestedAt ?? new Date() },
  });

  return {
    ok: true,
    data: { keyId: process.env.RAZORPAY_KEY_ID!, orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency },
  };
}

/** Public — verifies the Razorpay Checkout signature and closes the session once the bill is paid. */
export async function verifyBillPayment(input: {
  qrToken: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<ActionResult<TableSessionView>> {
  const loaded = await loadOpenSession(input.qrToken);
  if (!loaded) return { ok: false, error: "No active order found for this table." };
  if (loaded.session.razorpayOrderId !== input.razorpayOrderId) return { ok: false, error: "This payment doesn't match the current bill." };

  const valid = verifyRazorpayPaymentSignature({
    orderId: input.razorpayOrderId,
    paymentId: input.razorpayPaymentId,
    signature: input.razorpaySignature,
  });
  if (!valid) return { ok: false, error: "Payment verification failed." };

  const session = await prisma.tableSession.update({
    where: { id: loaded.session.id },
    data: { paymentMethod: "ONLINE", paidAt: new Date(), status: "CLOSED", closedAt: new Date() },
    include: OPEN_SESSION_INCLUDE,
  });

  revalidatePath("/dashboard/orders");
  return { ok: true, data: toView(session) };
}

// ---------------------------------------------------------------------------
// Owner / staff dashboard
// ---------------------------------------------------------------------------

export type BillRequestRow = {
  sessionId: string;
  tableNumber: string;
  tableSection: string | null;
  totalAmount: number;
  paymentMethod: $Enums.TableSessionPaymentMethod | null;
  billRequestedAt: Date;
};

/** Sessions whose table has asked for the bill and is waiting on staff. */
export async function listBillRequests(businessId: string): Promise<BillRequestRow[]> {
  await requireBusinessAccess(businessId);
  const sessions = await prisma.tableSession.findMany({
    where: { businessId, status: "OPEN", billRequestedAt: { not: null } },
    include: { table: true, orders: { where: { status: { not: "CANCELLED" } } } },
    orderBy: { billRequestedAt: "asc" },
  });
  return sessions.map((s) => ({
    sessionId: s.id,
    tableNumber: s.table.number,
    tableSection: s.table.section,
    totalAmount: s.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    paymentMethod: s.paymentMethod,
    billRequestedAt: s.billRequestedAt!,
  }));
}

/** Staff confirms cash was collected at the counter — closes the session, freeing the table for the next guest. */
export async function markSessionPaidCash(sessionId: string, businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);

  const session = await prisma.tableSession.findUnique({ where: { id: sessionId } });
  if (!session || session.businessId !== businessId) return { ok: false, error: "Session not found." };
  if (session.status !== "OPEN") return { ok: false, error: "This session is already closed." };

  await prisma.tableSession.update({
    where: { id: sessionId },
    data: { paymentMethod: "COUNTER", paidAt: new Date(), status: "CLOSED", closedAt: new Date() },
  });

  revalidatePath("/dashboard/orders");
  return { ok: true, data: undefined };
}
