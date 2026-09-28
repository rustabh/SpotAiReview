"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProduct, type ProductInput } from "@/actions/menu";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Plus, Trash2 } from "lucide-react";
import type { MenuCategory, MenuProduct } from "./types";

type VariantRow = { name: string; priceDeltaRupees: number };
type OptionRow = { name: string; priceDeltaRupees: number };
type GroupRow = { name: string; minSelect: number; maxSelect: number; isRequired: boolean; options: OptionRow[] };

function toVariantRows(product: MenuProduct | null): VariantRow[] {
  return product?.variants.map((v) => ({ name: v.name, priceDeltaRupees: v.priceDelta / 100 })) ?? [];
}
function toGroupRows(product: MenuProduct | null): GroupRow[] {
  return (
    product?.modifierGroups.map((g) => ({
      name: g.name,
      minSelect: g.minSelect,
      maxSelect: g.maxSelect,
      isRequired: g.isRequired,
      options: g.options.map((o) => ({ name: o.name, priceDeltaRupees: o.priceDelta / 100 })),
    })) ?? []
  );
}

export function ProductForm({
  businessId,
  categories,
  product,
  defaultCategoryId,
  onDone,
}: {
  businessId: string;
  categories: MenuCategory[];
  product: MenuProduct | null;
  defaultCategoryId?: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? defaultCategoryId ?? "");
  const [price, setPrice] = useState(product ? product.price / 100 : 0);
  const [discountPrice, setDiscountPrice] = useState<string>(product?.discountPrice != null ? String(product.discountPrice / 100) : "");
  const [dietTag, setDietTag] = useState<string>(product?.isVeg === true ? "veg" : product?.isVeg === false ? "non-veg" : "none");
  const [spiceLevel, setSpiceLevel] = useState(product?.spiceLevel ?? "");
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [variants, setVariants] = useState<VariantRow[]>(toVariantRows(product));
  const [groups, setGroups] = useState<GroupRow[]>(toGroupRows(product));

  function addVariant() {
    setVariants((v) => [...v, { name: "", priceDeltaRupees: 0 }]);
  }
  function addGroup() {
    setGroups((g) => [...g, { name: "", minSelect: 0, maxSelect: 1, isRequired: false, options: [] }]);
  }
  function addOption(groupIndex: number) {
    setGroups((g) => g.map((grp, i) => (i === groupIndex ? { ...grp, options: [...grp.options, { name: "", priceDeltaRupees: 0 }] } : grp)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    const input: ProductInput = {
      id: product?.id,
      categoryId: categoryId || null,
      name,
      description,
      imageUrl,
      priceRupees: Number(price),
      discountPriceRupees: discountPrice.trim() ? Number(discountPrice) : null,
      isVeg: dietTag === "veg" ? true : dietTag === "non-veg" ? false : null,
      spiceLevel: spiceLevel || null,
      isAvailable,
      variants: variants.filter((v) => v.name.trim()).map((v) => ({ name: v.name, priceDeltaRupees: Number(v.priceDeltaRupees) || 0 })),
      modifierGroups: groups
        .filter((g) => g.name.trim())
        .map((g) => ({
          name: g.name,
          minSelect: Number(g.minSelect) || 0,
          maxSelect: Number(g.maxSelect) || 1,
          isRequired: g.isRequired,
          options: g.options.filter((o) => o.name.trim()).map((o) => ({ name: o.name, priceDeltaRupees: Number(o.priceDeltaRupees) || 0 })),
        })),
    };

    const result = await saveProduct(businessId, input);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Paneer Tikka" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Grilled cottage cheese marinated in spiced yogurt." />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
        </div>
        <div>
          <Label htmlFor="discountPrice">Discount price (₹, optional)</Label>
          <Input id="discountPrice" type="number" min={0} step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="diet">Diet tag</Label>
          <Select id="diet" value={dietTag} onChange={(e) => setDietTag(e.target.value)}>
            <option value="none">Not applicable</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-Veg</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="spice">Spice level (optional)</Label>
          <Input id="spice" value={spiceLevel} onChange={(e) => setSpiceLevel(e.target.value)} placeholder="Medium" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-200">
        <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="h-4 w-4 rounded border-border" />
        Available for ordering
      </label>

      {/* Variants */}
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Variants</p>
          <Button type="button" size="sm" variant="outline" onClick={addVariant}><Plus size={13} /> Add variant</Button>
        </div>
        <p className="mt-1 text-xs text-ink-400">e.g. Half / Full — leave empty if this item has no size options.</p>
        <div className="mt-3 space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Half"
                value={v.name}
                onChange={(e) => setVariants((arr) => arr.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
                className="flex-1"
              />
              <Input
                type="number"
                step="0.01"
                placeholder="+₹0"
                value={v.priceDeltaRupees}
                onChange={(e) => setVariants((arr) => arr.map((r, j) => (j === i ? { ...r, priceDeltaRupees: Number(e.target.value) } : r)))}
                className="w-28"
              />
              <button type="button" onClick={() => setVariants((arr) => arr.filter((_, j) => j !== i))} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modifier groups */}
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Add-ons &amp; modifiers</p>
          <Button type="button" size="sm" variant="outline" onClick={addGroup}><Plus size={13} /> Add group</Button>
        </div>
        <p className="mt-1 text-xs text-ink-400">e.g. &quot;Add-ons&quot; (Extra Cheese, Extra Sauce) or &quot;Spice Level&quot; (Mild, Medium, Hot).</p>
        <div className="mt-3 space-y-4">
          {groups.map((g, gi) => (
            <div key={gi} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add-ons"
                  value={g.name}
                  onChange={(e) => setGroups((arr) => arr.map((r, j) => (j === gi ? { ...r, name: e.target.value } : r)))}
                  className="flex-1"
                />
                <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-500">
                  <input
                    type="checkbox"
                    checked={g.isRequired}
                    onChange={(e) => setGroups((arr) => arr.map((r, j) => (j === gi ? { ...r, isRequired: e.target.checked } : r)))}
                    className="h-3.5 w-3.5 rounded border-border"
                  />
                  Required
                </label>
                <Input
                  type="number"
                  min={0}
                  value={g.maxSelect}
                  onChange={(e) => setGroups((arr) => arr.map((r, j) => (j === gi ? { ...r, maxSelect: Number(e.target.value) } : r)))}
                  className="w-16"
                  title="Max selections"
                />
                <button type="button" onClick={() => setGroups((arr) => arr.filter((_, j) => j !== gi))} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-2 space-y-2 pl-3">
                {g.options.map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <Input
                      placeholder="Extra Cheese"
                      value={o.name}
                      onChange={(e) =>
                        setGroups((arr) => arr.map((r, j) => (j === gi ? { ...r, options: r.options.map((op, k) => (k === oi ? { ...op, name: e.target.value } : op)) } : r)))
                      }
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="+₹0"
                      value={o.priceDeltaRupees}
                      onChange={(e) =>
                        setGroups((arr) =>
                          arr.map((r, j) => (j === gi ? { ...r, options: r.options.map((op, k) => (k === oi ? { ...op, priceDeltaRupees: Number(e.target.value) } : op)) } : r))
                        )
                      }
                      className="w-24"
                    />
                    <button
                      type="button"
                      onClick={() => setGroups((arr) => arr.map((r, j) => (j === gi ? { ...r, options: r.options.filter((_, k) => k !== oi) } : r)))}
                      className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="ghost" onClick={() => addOption(gi)}><Plus size={12} /> Add option</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" loading={loading}>{product ? "Save changes" : "Add product"}</Button>
    </form>
  );
}
