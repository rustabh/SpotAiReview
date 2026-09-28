"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/rbac";
import type { ActionResult } from "./auth";

function assertCanManage(membershipRole: string | undefined) {
  return membershipRole !== "STAFF";
}

export async function listMenu(businessId: string) {
  await requireBusinessAccess(businessId);
  return prisma.productCategory.findMany({
    where: { businessId },
    orderBy: { order: "asc" },
    include: {
      products: {
        orderBy: { order: "asc" },
        include: {
          variants: { orderBy: { order: "asc" } },
          modifierGroups: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });
}

/** Products with no category (categoryId null) — shown as "Uncategorized" in the builder. */
export async function listUncategorizedProducts(businessId: string) {
  await requireBusinessAccess(businessId);
  return prisma.product.findMany({
    where: { businessId, categoryId: null },
    orderBy: { order: "asc" },
    include: {
      variants: { orderBy: { order: "asc" } },
      modifierGroups: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
    },
  });
}

/** Public — no login. Only available products, for the customer-facing menu/order page. */
export async function getPublicMenu(businessId: string) {
  const categories = await prisma.productCategory.findMany({
    where: { businessId, isActive: true },
    orderBy: { order: "asc" },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { order: "asc" },
        include: {
          variants: { orderBy: { order: "asc" } },
          modifierGroups: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });

  const uncategorized = await prisma.product.findMany({
    where: { businessId, categoryId: null, isAvailable: true },
    orderBy: { order: "asc" },
    include: {
      variants: { orderBy: { order: "asc" } },
      modifierGroups: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
    },
  });

  return { categories: categories.filter((c) => c.products.length > 0), uncategorized };
}

/** One-click enable for businesses whose category defaults don't already include it. */
export async function enableMenuModule(businessId: string): Promise<ActionResult> {
  const { membership, business } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to change this." };

  const overrides = (business.featureOverrides as Record<string, boolean> | null) ?? {};
  await prisma.business.update({
    where: { id: businessId },
    data: { featureOverrides: { ...overrides, menu: true, products: true } },
  });
  revalidatePath("/dashboard/catalogue");
  return { ok: true, data: undefined };
}

export async function createProductCategory(businessId: string, name: string): Promise<ActionResult<{ id: string }>> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage the menu." };
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Category name is required." };

  const count = await prisma.productCategory.count({ where: { businessId } });
  const created = await prisma.productCategory.create({ data: { businessId, name: trimmed, order: count } });
  revalidatePath("/dashboard/catalogue");
  return { ok: true, data: { id: created.id } };
}

export async function renameProductCategory(id: string, businessId: string, name: string): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage the menu." };
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Category name is required." };

  const existing = await prisma.productCategory.findUnique({ where: { id } });
  if (!existing || existing.businessId !== businessId) return { ok: false, error: "Category not found." };

  await prisma.productCategory.update({ where: { id }, data: { name: trimmed } });
  revalidatePath("/dashboard/catalogue");
  return { ok: true, data: undefined };
}

export async function deleteProductCategory(id: string, businessId: string): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage the menu." };

  const existing = await prisma.productCategory.findUnique({ where: { id } });
  if (!existing || existing.businessId !== businessId) return { ok: false, error: "Category not found." };

  // Products in this category move to "Uncategorized" rather than being deleted —
  // menu items should never disappear just because their grouping did.
  await prisma.$transaction([
    prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } }),
    prisma.productCategory.delete({ where: { id } }),
  ]);
  revalidatePath("/dashboard/catalogue");
  return { ok: true, data: undefined };
}

export async function moveProductCategory(id: string, businessId: string, direction: "up" | "down"): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage the menu." };

  const categories = await prisma.productCategory.findMany({ where: { businessId }, orderBy: { order: "asc" } });
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return { ok: false, error: "Category not found." };
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= categories.length) return { ok: true, data: undefined };

  await prisma.$transaction([
    prisma.productCategory.update({ where: { id: categories[index].id }, data: { order: categories[swapWith].order } }),
    prisma.productCategory.update({ where: { id: categories[swapWith].id }, data: { order: categories[index].order } }),
  ]);
  revalidatePath("/dashboard/catalogue");
  return { ok: true, data: undefined };
}

export type ProductVariantInput = { name: string; priceDeltaRupees: number; isDefault?: boolean };
export type ProductModifierOptionInput = { name: string; priceDeltaRupees: number };
export type ProductModifierGroupInput = {
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: ProductModifierOptionInput[];
};

export type ProductInput = {
  id?: string;
  categoryId?: string | null;
  name: string;
  description?: string;
  imageUrl?: string;
  priceRupees: number;
  discountPriceRupees?: number | null;
  isVeg?: boolean | null;
  spiceLevel?: string | null;
  isAvailable: boolean;
  variants: ProductVariantInput[];
  modifierGroups: ProductModifierGroupInput[];
};

/**
 * Creates or fully replaces a product, including its variants and modifier
 * groups/options. Existing variants/modifiers are dropped and recreated from
 * the submitted state rather than diffed — simple and safe, since orders
 * snapshot the product/variant/modifier names at order time (OrderItem) and
 * only hold a nullable reference back here, so replacing them never corrupts
 * past order history.
 */
export async function saveProduct(businessId: string, input: ProductInput): Promise<ActionResult<{ id: string }>> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage the menu." };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Product name is required." };
  if (!Number.isFinite(input.priceRupees) || input.priceRupees < 0) return { ok: false, error: "Enter a valid price." };
  if (input.discountPriceRupees != null && input.discountPriceRupees >= input.priceRupees) {
    return { ok: false, error: "Discount price must be lower than the regular price." };
  }

  const data = {
    businessId,
    categoryId: input.categoryId || null,
    name,
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    price: Math.round(input.priceRupees * 100),
    discountPrice: input.discountPriceRupees != null ? Math.round(input.discountPriceRupees * 100) : null,
    isVeg: input.isVeg ?? null,
    spiceLevel: input.spiceLevel?.trim() || null,
    isAvailable: input.isAvailable,
  };

  try {
    const product = await prisma.$transaction(async (tx) => {
      let p;
      if (input.id) {
        const existing = await tx.product.findUnique({ where: { id: input.id } });
        if (!existing || existing.businessId !== businessId) throw new Error("Product not found.");
        p = await tx.product.update({ where: { id: input.id }, data });
        await tx.productVariant.deleteMany({ where: { productId: p.id } });
        await tx.productModifierGroup.deleteMany({ where: { productId: p.id } }); // cascades to options
      } else {
        const count = await tx.product.count({ where: { businessId, categoryId: data.categoryId } });
        p = await tx.product.create({ data: { ...data, order: count } });
      }

      for (const [i, v] of input.variants.entries()) {
        if (!v.name.trim()) continue;
        await tx.productVariant.create({
          data: { productId: p.id, name: v.name.trim(), priceDelta: Math.round(v.priceDeltaRupees * 100), isDefault: v.isDefault ?? false, order: i },
        });
      }

      for (const [i, g] of input.modifierGroups.entries()) {
        if (!g.name.trim()) continue;
        const group = await tx.productModifierGroup.create({
          data: {
            productId: p.id,
            name: g.name.trim(),
            minSelect: g.minSelect,
            maxSelect: g.maxSelect,
            isRequired: g.isRequired,
            order: i,
          },
        });
        for (const [j, o] of g.options.entries()) {
          if (!o.name.trim()) continue;
          await tx.productModifierOption.create({
            data: { groupId: group.id, name: o.name.trim(), priceDelta: Math.round(o.priceDeltaRupees * 100), order: j },
          });
        }
      }

      return p;
    });

    revalidatePath("/dashboard/catalogue");
    return { ok: true, data: { id: product.id } };
  } catch {
    return { ok: false, error: "Could not save the product. Please try again." };
  }
}

export async function deleteProduct(id: string, businessId: string): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage the menu." };

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || existing.businessId !== businessId) return { ok: false, error: "Product not found." };

  await prisma.product.delete({ where: { id } });
  revalidatePath("/dashboard/catalogue");
  return { ok: true, data: undefined };
}

export async function toggleProductAvailability(id: string, businessId: string, isAvailable: boolean): Promise<ActionResult> {
  const { membership } = await requireBusinessAccess(businessId);
  if (!assertCanManage(membership?.role)) return { ok: false, error: "You don't have permission to manage the menu." };

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || existing.businessId !== businessId) return { ok: false, error: "Product not found." };

  await prisma.product.update({ where: { id }, data: { isAvailable } });
  revalidatePath("/dashboard/catalogue");
  return { ok: true, data: undefined };
}
