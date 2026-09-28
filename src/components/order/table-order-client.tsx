"use client";

import { useState } from "react";
import { ShoppingCart, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductPicker } from "./product-picker";
import { CartSheet } from "./cart-sheet";
import { SessionPanel } from "./session-panel";
import { cartTotal, type CartLine } from "./cart-types";
import type { MenuCategory, MenuProduct } from "@/components/menu/types";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function ProductCard({ product, onSelect }: { product: MenuProduct; onSelect: () => void }) {
  return (
    <Card className="flex items-start gap-3 p-4">
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-ink-100 dark:bg-ink-800">
          <UtensilsCrossed size={20} className="text-ink-300" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {product.isVeg === true && <span className="h-3 w-3 shrink-0 rounded-sm border-2 border-emerald-600" />}
          {product.isVeg === false && <span className="h-3 w-3 shrink-0 rounded-sm border-2 border-red-600" />}
          <p className="text-sm font-semibold text-foreground">{product.name}</p>
        </div>
        {product.description && <p className="mt-1 line-clamp-2 text-xs text-ink-400">{product.description}</p>}
        <div className="mt-2 flex items-center gap-2">
          {product.discountPrice != null ? (
            <>
              <span className="text-sm font-medium text-foreground">{formatRupees(product.discountPrice)}</span>
              <span className="text-xs text-ink-400 line-through">{formatRupees(product.price)}</span>
            </>
          ) : (
            <span className="text-sm font-medium text-foreground">{formatRupees(product.price)}</span>
          )}
          {product.variants.length > 0 && <span className="text-xs text-ink-400">from</span>}
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={onSelect} className="shrink-0">Add</Button>
    </Card>
  );
}

export function TableOrderClient({
  qrToken,
  categories,
  uncategorized,
}: {
  qrToken: string;
  categories: MenuCategory[];
  uncategorized: MenuProduct[];
}) {
  const [pickerProduct, setPickerProduct] = useState<MenuProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [refreshSignal, setRefreshSignal] = useState(0);

  function onSelectProduct(product: MenuProduct) {
    if (product.variants.length === 0 && product.modifierGroups.length === 0) {
      // No choices to make — add directly with quantity 1, merging with an identical existing line.
      const key = `${product.id}::::`;
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        if (existing) return prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l));
        return [
          ...prev,
          {
            key,
            productId: product.id,
            productName: product.name,
            unitPrice: product.discountPrice ?? product.price,
            quantity: 1,
            modifiers: [],
          },
        ];
      });
      return;
    }
    setPickerProduct(product);
  }

  function addLine(line: CartLine) {
    setLines((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) return prev.map((l) => (l.key === line.key ? { ...l, quantity: l.quantity + line.quantity } : l));
      return [...prev, line];
    });
  }

  function updateQuantity(key: string, quantity: number) {
    setLines((prev) => (quantity <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, quantity } : l))));
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="pb-28">
      <SessionPanel qrToken={qrToken} refreshSignal={refreshSignal} />

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h2 className="mb-3 font-heading text-lg font-bold text-foreground">{cat.name}</h2>
            <div className="space-y-3">
              {cat.products.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={() => onSelectProduct(p)} />
              ))}
            </div>
          </div>
        ))}
        {uncategorized.length > 0 && (
          <div>
            {categories.length > 0 && <h2 className="mb-3 font-heading text-lg font-bold text-foreground">More</h2>}
            <div className="space-y-3">
              {uncategorized.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={() => onSelectProduct(p)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-4 backdrop-blur">
          <div className="mx-auto max-w-lg">
            <Button className="w-full" size="lg" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={16} /> View Cart · {itemCount} item{itemCount === 1 ? "" : "s"} · {formatRupees(cartTotal(lines))}
            </Button>
          </div>
        </div>
      )}

      <ProductPicker product={pickerProduct} onClose={() => setPickerProduct(null)} onAdd={addLine} />
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        qrToken={qrToken}
        lines={lines}
        onUpdateQuantity={updateQuantity}
        onRemove={removeLine}
        onPlaced={() => {
          setLines([]);
          setRefreshSignal((n) => n + 1);
        }}
      />
    </div>
  );
}
