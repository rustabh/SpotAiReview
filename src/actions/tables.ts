"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/rbac";
import { generateQrPngDataUrl, generateQrSvg, tableOrderUrl } from "@/lib/qr";
import type { ActionResult } from "./auth";

function assertCanManage(membershipRole: string | undefined) {
  return membershipRole !== "STAFF";
}

function generateQrToken() {
  return crypto.randomBytes(10).toString("hex");
}

export async function listTables(businessId: string) {
  await requireBusinessAccess(businessId);
  return prisma.restaurantTable.findMany({
    where: { businessId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTable(
  businessId: string,
  input: { number: string; section?: string; capacity?: number }
): Promise<ActionResult<{ id: string }>> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage tables." };

  const number = input.number.trim();
  if (!number) return { ok: false, error: "Table number is required." };

  const existing = await prisma.restaurantTable.findUnique({ where: { businessId_number: { businessId, number } } });
  if (existing) return { ok: false, error: `Table "${number}" already exists.` };

  const created = await prisma.restaurantTable.create({
    data: {
      businessId,
      number,
      section: input.section?.trim() || null,
      capacity: input.capacity || null,
      qrToken: generateQrToken(),
    },
  });
  revalidatePath("/dashboard/tables");
  return { ok: true, data: { id: created.id } };
}

/** Creates tables 1..count in one go — the common "set up 20 tables" first-run case. */
export async function createTablesBulk(businessId: string, count: number): Promise<ActionResult<{ created: number }>> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage tables." };
  if (!Number.isFinite(count) || count < 1 || count > 200) return { ok: false, error: "Enter a number between 1 and 200." };

  const existing = await prisma.restaurantTable.findMany({ where: { businessId }, select: { number: true } });
  const existingNumbers = new Set(existing.map((t) => t.number));

  let created = 0;
  for (let i = 1; i <= count; i++) {
    const number = String(i);
    if (existingNumbers.has(number)) continue;
    await prisma.restaurantTable.create({ data: { businessId, number, qrToken: generateQrToken() } });
    created++;
  }

  revalidatePath("/dashboard/tables");
  return { ok: true, data: { created } };
}

export async function deleteTable(id: string, businessId: string): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage tables." };

  const existing = await prisma.restaurantTable.findUnique({ where: { id } });
  if (!existing || existing.businessId !== businessId) return { ok: false, error: "Table not found." };

  await prisma.restaurantTable.delete({ where: { id } });
  revalidatePath("/dashboard/tables");
  return { ok: true, data: undefined };
}

export async function getTableQrCode(id: string, businessId: string) {
  await requireBusinessAccess(businessId);
  const table = await prisma.restaurantTable.findUnique({ where: { id } });
  if (!table || table.businessId !== businessId) return null;

  const url = tableOrderUrl(table.qrToken);
  const [pngDataUrl, svg] = await Promise.all([generateQrPngDataUrl(url), generateQrSvg(url)]);
  return { pngDataUrl, svg, url };
}

export async function toggleTableActive(id: string, businessId: string, isActive: boolean): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage tables." };

  const existing = await prisma.restaurantTable.findUnique({ where: { id } });
  if (!existing || existing.businessId !== businessId) return { ok: false, error: "Table not found." };

  await prisma.restaurantTable.update({ where: { id }, data: { isActive } });
  revalidatePath("/dashboard/tables");
  return { ok: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Public — no login. A table's QR resolves through these with no auth check;
// the qrToken itself (10 random bytes) is the only thing that has to be kept
// secret-ish, exactly like a review campaign's slug.
// ---------------------------------------------------------------------------

export async function resolveTableByToken(qrToken: string) {
  const table = await prisma.restaurantTable.findUnique({
    where: { qrToken },
    include: { business: { include: { category: true } } },
  });
  if (!table || !table.isActive || table.business.status !== "ACTIVE") return null;
  return table;
}

function generateSessionCode() {
  const year = new Date().getFullYear();
  const n = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `TS-${year}-${n}`;
}

/**
 * The mechanism behind "multiple people at the same table": every scan of
 * the same table's QR while a session is still OPEN joins that same
 * session, so their orders group together automatically. A closed or
 * missing session gets a fresh one.
 */
export async function getOrCreateOpenSession(tableId: string) {
  // Best-effort, not strictly race-safe: two scans landing in the same instant could each
  // create a session. Acceptable for now — worst case is two sessions for one table moment,
  // not a lost or duplicated order — and staff can merge via a future "merge session" action.
  const open = await prisma.tableSession.findFirst({ where: { tableId, status: "OPEN" }, orderBy: { openedAt: "desc" } });
  if (open) return open;

  return prisma.tableSession.create({
    data: { businessId: (await prisma.restaurantTable.findUniqueOrThrow({ where: { id: tableId } })).businessId, tableId, code: generateSessionCode() },
  });
}
