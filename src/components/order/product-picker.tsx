"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MenuProduct } from "@/components/menu/types";
import { cartLineKey, type CartLine } from "./cart-types";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function ProductPicker({ product, onClose, onAdd }: { product: MenuProduct | null; onClose: () => void; onAdd: (line: CartLine) => void }) {
  const [variantId, setVariantId] = useState<string | undefined>(product?.variants.find((v) => v.isDefault)?.id ?? product?.variants[0]?.id);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();

  const variant = product?.variants.find((v) => v.id === variantId);
  const selectedOptionIds = useMemo(() => Object.values(selected).flat(), [selected]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const base = product.discountPrice ?? product.price;
    const variantDelta = variant?.priceDelta ?? 0;
    const modifierDelta = product.modifierGroups
      .flatMap((g) => g.options)
      .filter((o) => selectedOptionIds.includes(o.id))
      .reduce((sum, o) => sum + o.priceDelta, 0);
    return base + variantDelta + modifierDelta;
  }, [product, variant, selectedOptionIds]);

  function toggleOption(groupId: string, optionId: string, max: number) {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (current.includes(optionId)) return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      if (max === 1) return { ...prev, [groupId]: [optionId] };
      if (current.length >= max) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }

  function handleAdd() {
    if (!product) return;
    for (const group of product.modifierGroups) {
      const count = (selected[group.id] ?? []).length;
      if (count < group.minSelect || count > group.maxSelect) {
        setError(`Select ${group.minSelect === group.maxSelect ? group.maxSelect : `${group.minSelect}-${group.maxSelect}`} option(s) for "${group.name}".`);
        return;
      }
    }
    const modifiers = product.modifierGroups
      .flatMap((g) => g.options)
      .filter((o) => selectedOptionIds.includes(o.id))
      .map((o) => ({ id: o.id, name: o.name, priceDelta: o.priceDelta }));

    onAdd({
      key: cartLineKey(product.id, variantId, selectedOptionIds),
      productId: product.id,
      productName: product.name,
      variantId,
      variantName: variant?.name,
      unitPrice,
      quantity,
      modifiers,
      specialInstructions: note.trim() || undefined,
    });
    onClose();
  }

  return (
    <Modal open={!!product} onClose={onClose} title={product?.name ?? ""}>
      {product && (
        <div className="space-y-5">
          {product.description && <p className="text-sm text-ink-500">{product.description}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {product.variants.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Choose an option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      variantId === v.id ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400" : "border-border text-ink-600"
                    }`}
                  >
                    {v.name} {v.priceDelta > 0 && <span className="text-xs">+{formatRupees(v.priceDelta)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.modifierGroups.map((g) => (
            <div key={g.id}>
              <p className="mb-2 text-sm font-semibold text-foreground">
                {g.name} {g.isRequired && <span className="text-xs font-normal text-ink-400">(required)</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.options.map((o) => {
                  const isSelected = (selected[g.id] ?? []).includes(o.id);
                  return (
                    <button
                      key={o.id}
                      onClick={() => toggleOption(g.id, o.id, g.maxSelect)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        isSelected ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400" : "border-border text-ink-600"
                      }`}
                    >
                      {o.name} {o.priceDelta > 0 && <span className="text-xs">+{formatRupees(o.priceDelta)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-200">Special instructions (optional)</p>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="No onions" maxLength={200} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded-full border border-border text-lg text-ink-600">
                −
              </button>
              <span className="w-6 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(20, q + 1))} className="h-8 w-8 rounded-full border border-border text-lg text-ink-600">
                +
              </button>
            </div>
            <Button onClick={handleAdd}>Add · {formatRupees(unitPrice * quantity)}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
