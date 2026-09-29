"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Leaf, Flame, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { gradientFor, iconFor } from "@/lib/menu-visuals";
import type { MenuCategory, MenuProduct } from "./types";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function ProductCard({ product }: { product: MenuProduct }) {
  const Icon = iconFor(product.name);
  const [from, to] = gradientFor(product.id);

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <div className="relative aspect-square w-full">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
            <Icon size={38} strokeWidth={1.5} className="text-white/85" />
          </div>
        )}

        {product.isVeg != null && (
          <span
            className={cn(
              "absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded-sm border-2 bg-white/90",
              product.isVeg ? "border-emerald-600" : "border-red-600"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", product.isVeg ? "bg-emerald-600" : "bg-red-600")} />
          </span>
        )}

        {product.isPopular && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-card">
            <Flame size={10} /> Popular
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="line-clamp-1 text-sm font-semibold text-foreground">{product.name}</p>
        {product.description && <p className="mt-0.5 line-clamp-2 text-xs text-ink-400">{product.description}</p>}
        <div className="mt-auto flex items-baseline gap-1.5 pt-2.5">
          {product.discountPrice != null ? (
            <>
              <span className="text-base font-bold text-foreground">{formatRupees(product.discountPrice)}</span>
              <span className="text-xs text-ink-400 line-through">{formatRupees(product.price)}</span>
            </>
          ) : (
            <span className="text-base font-bold text-foreground">{formatRupees(product.price)}</span>
          )}
          {product.variants.length > 0 && <span className="text-xs text-ink-400">onwards</span>}
        </div>
      </div>
    </Card>
  );
}

function ProductGrid({ products }: { products: MenuProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((p, idx) => (
        <motion.div
          key={p.id}
          className="h-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.3) }}
        >
          <ProductCard product={p} />
        </motion.div>
      ))}
    </div>
  );
}

/** A read-only, no-login catalogue — the Smart Link customers see when they scan the QR or tap NFC. No cart, no ordering. */
export function PublicMenuView({ categories, uncategorized }: { categories: MenuCategory[]; uncategorized: MenuProduct[] }) {
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  const hasVegItems = useMemo(
    () => categories.some((c) => c.products.some((p) => p.isVeg != null)) || uncategorized.some((p) => p.isVeg != null),
    [categories, uncategorized]
  );

  function matchesFilters(p: MenuProduct) {
    if (vegOnly && p.isVeg !== true) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  }

  const filteredCategories = useMemo(
    () => categories.map((c) => ({ ...c, products: c.products.filter(matchesFilters) })).filter((c) => c.products.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, search, vegOnly]
  );
  const filteredUncategorized = useMemo(
    () => uncategorized.filter(matchesFilters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uncategorized, search, vegOnly]
  );
  const hasFilters = search.trim().length > 0 || vegOnly;
  const noResults = hasFilters && filteredCategories.length === 0 && filteredUncategorized.length === 0;

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 mb-5 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the menu"
            className="h-9 w-full rounded-full border border-border bg-surface pl-9 pr-8 text-sm text-foreground placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
              <X size={14} />
            </button>
          )}
        </div>
        {hasVegItems && (
          <button
            onClick={() => setVegOnly((v) => !v)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors",
              vegOnly ? "border-emerald-600 bg-emerald-600 text-white" : "border-border text-ink-600"
            )}
          >
            <Leaf size={14} /> Veg
          </button>
        )}
      </div>

      {noResults ? (
        <p className="py-16 text-center text-sm text-ink-400">No items match your search{vegOnly ? " and veg filter" : ""}. Try something else.</p>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((cat) => (
            <div key={cat.id}>
              <div className="mb-3 flex items-baseline gap-2">
                <span className="h-4 w-1 rounded-full bg-brand-600" />
                <h2 className="font-heading text-lg font-bold text-foreground">{cat.name}</h2>
                <span className="text-xs font-medium text-ink-400">{cat.products.length}</span>
              </div>
              <ProductGrid products={cat.products} />
            </div>
          ))}
          {filteredUncategorized.length > 0 && (
            <div>
              {filteredCategories.length > 0 && (
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="h-4 w-1 rounded-full bg-brand-600" />
                  <h2 className="font-heading text-lg font-bold text-foreground">More</h2>
                  <span className="text-xs font-medium text-ink-400">{filteredUncategorized.length}</span>
                </div>
              )}
              <ProductGrid products={filteredUncategorized} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
