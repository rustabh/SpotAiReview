"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProductCategory,
  renameProductCategory,
  deleteProductCategory,
  moveProductCategory,
  deleteProduct,
  toggleProductAvailability,
} from "@/actions/menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductForm } from "./product-form";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Check, X as XIcon, Flame, UtensilsCrossed } from "lucide-react";
import type { MenuCategory, MenuProduct } from "./types";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function CatalogueBuilder({
  businessId,
  categories,
  uncategorized,
}: {
  businessId: string;
  categories: MenuCategory[];
  uncategorized: MenuProduct[];
}) {
  const router = useRouter();
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [productModal, setProductModal] = useState<{ product: MenuProduct | null; categoryId?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const allCategories = categories;

  async function onAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setBusy(true);
    await createProductCategory(businessId, newCategoryName);
    setBusy(false);
    setNewCategoryName("");
    setAddingCategory(false);
    router.refresh();
  }

  async function onRename(id: string) {
    if (!renameValue.trim()) return setRenamingId(null);
    await renameProductCategory(id, businessId, renameValue);
    setRenamingId(null);
    router.refresh();
  }

  async function onDeleteCategory(id: string) {
    if (!confirm("Delete this category? Its products will move to Uncategorized.")) return;
    await deleteProductCategory(id, businessId);
    router.refresh();
  }

  async function onMove(id: string, direction: "up" | "down") {
    await moveProductCategory(id, businessId, direction);
    router.refresh();
  }

  async function onDeleteProduct(id: string) {
    if (!confirm("Delete this product? This can't be undone.")) return;
    await deleteProduct(id, businessId);
    router.refresh();
  }

  async function onToggleAvailability(product: MenuProduct) {
    await toggleProductAvailability(product.id, businessId, !product.isAvailable);
    router.refresh();
  }

  function renderProductRow(p: MenuProduct) {
    return (
      <li key={p.id} className="flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {p.isVeg === true && <span className="h-3 w-3 shrink-0 rounded-sm border-2 border-emerald-600" title="Veg" />}
            {p.isVeg === false && <span className="h-3 w-3 shrink-0 rounded-sm border-2 border-red-600" title="Non-Veg" />}
            <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
            {p.spiceLevel && (
              <span className="flex items-center gap-0.5 text-xs text-ink-400">
                <Flame size={11} /> {p.spiceLevel}
              </span>
            )}
            {!p.isAvailable && <Badge tone="neutral">Out of stock</Badge>}
          </div>
          {p.description && <p className="mt-0.5 truncate text-xs text-ink-400">{p.description}</p>}
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
            {p.discountPrice != null ? (
              <>
                <span className="font-medium text-foreground">{formatRupees(p.discountPrice)}</span>
                <span className="line-through">{formatRupees(p.price)}</span>
              </>
            ) : (
              <span className="font-medium text-foreground">{formatRupees(p.price)}</span>
            )}
            {p.variants.length > 0 && <span>· {p.variants.length} variant{p.variants.length === 1 ? "" : "s"}</span>}
            {p.modifierGroups.length > 0 && <span>· {p.modifierGroups.length} add-on group{p.modifierGroups.length === 1 ? "" : "s"}</span>}
          </div>
        </div>
        <button
          onClick={() => onToggleAvailability(p)}
          className="shrink-0 rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800"
          title={p.isAvailable ? "Mark out of stock" : "Mark available"}
        >
          {p.isAvailable ? <Check size={15} /> : <XIcon size={15} />}
        </button>
        <button
          onClick={() => setProductModal({ product: p })}
          className="shrink-0 rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button onClick={() => onDeleteProduct(p.id)} className="shrink-0 rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600" title="Delete">
          <Trash2 size={14} />
        </button>
      </li>
    );
  }

  const isEmpty = allCategories.length === 0 && uncategorized.length === 0;

  return (
    <div className="space-y-6">
      {isEmpty && (
        <EmptyState
          icon={UtensilsCrossed}
          title="Your menu is empty"
          description="Add your first category (e.g. Starters, Main Course) or a product directly, then fill in variants and add-ons as needed."
        />
      )}

      <div className="space-y-4">
        {allCategories.map((cat, i) => (
          <Card key={cat.id} className="p-5">
            <div className="flex items-center justify-between gap-3">
              {renamingId === cat.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="h-9" autoFocus />
                  <Button size="sm" onClick={() => onRename(cat.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setRenamingId(null)}>Cancel</Button>
                </div>
              ) : (
                <h3 className="font-heading text-base font-bold text-foreground">{cat.name}</h3>
              )}
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => onMove(cat.id, "up")} disabled={i === 0} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30 dark:hover:bg-ink-800">
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => onMove(cat.id, "down")}
                  disabled={i === allCategories.length - 1}
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30 dark:hover:bg-ink-800"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => {
                    setRenamingId(cat.id);
                    setRenameValue(cat.name);
                  }}
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  <Pencil size={13} />
                </button>
                <button onClick={() => onDeleteCategory(cat.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {cat.products.length > 0 ? (
              <ul className="mt-2 divide-y divide-border">{cat.products.map(renderProductRow)}</ul>
            ) : (
              <p className="mt-3 text-sm text-ink-400">No products in this category yet.</p>
            )}

            <Button size="sm" variant="outline" className="mt-3" onClick={() => setProductModal({ product: null, categoryId: cat.id })}>
              <Plus size={13} /> Add product
            </Button>
          </Card>
        ))}

        {uncategorized.length > 0 && (
          <Card className="p-5">
            <h3 className="font-heading text-base font-bold text-foreground">Uncategorized</h3>
            <ul className="mt-2 divide-y divide-border">{uncategorized.map(renderProductRow)}</ul>
          </Card>
        )}
      </div>

      {addingCategory ? (
        <form onSubmit={onAddCategory} className="flex items-center gap-2">
          <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Starters" autoFocus className="max-w-xs" />
          <Button type="submit" size="sm" loading={busy}>Add</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setAddingCategory(false)}>Cancel</Button>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setAddingCategory(true)}>
            <Plus size={15} /> Add category
          </Button>
          <Button variant="outline" onClick={() => setProductModal({ product: null })}>
            <Plus size={15} /> Add product without a category
          </Button>
        </div>
      )}

      <Modal open={!!productModal} onClose={() => setProductModal(null)} title={productModal?.product ? "Edit product" : "Add product"} wide>
        {productModal && (
          <ProductForm
            businessId={businessId}
            categories={allCategories}
            product={productModal.product}
            defaultCategoryId={productModal.categoryId}
            onDone={() => setProductModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
