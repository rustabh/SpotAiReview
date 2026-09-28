"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  UtensilsCrossed,
  Plus,
  Minus,
  Search,
  Leaf,
  Flame,
  X,
  Soup,
  Sandwich,
  CupSoda,
  Coffee,
  IceCreamCone,
  Salad,
  Pizza,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductPicker } from "./product-picker";
import { CartSheet } from "./cart-sheet";
import { SessionPanel } from "./session-panel";
import { cartTotal, type CartLine } from "./cart-types";
import { cn } from "@/lib/utils";
import type { MenuCategory, MenuProduct } from "@/components/menu/types";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// A warm, appetizing gradient per product (stable per id) for the placeholder shown until a
// real photo is set — deliberately illustrative rather than a plain gray box or a broken image.
const GRADIENTS: [string, string][] = [
  ["#fb923c", "#ef4444"],
  ["#34d399", "#059669"],
  ["#60a5fa", "#4f46e5"],
  ["#f472b6", "#db2777"],
  ["#fbbf24", "#d97706"],
  ["#a78bfa", "#7c3aed"],
];

function gradientFor(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function iconFor(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (/chicken|mutton|kebab|tikka|seekh|grill|tandoori|fish/.test(n)) return Flame;
  if (/biryani|pulao|dal|curry|gravy|makhani|masala|rice/.test(n)) return Soup;
  if (/naan|roti|bread|paratha|kulcha/.test(n)) return Sandwich;
  if (/cola|soda|juice|lassi|shake|mojito|water/.test(n)) return CupSoda;
  if (/coffee|tea|chai/.test(n)) return Coffee;
  if (/ice cream|kulfi|gulab|dessert|sweet|cake/.test(n)) return IceCreamCone;
  if (/salad/.test(n)) return Salad;
  if (/pizza/.test(n)) return Pizza;
  return UtensilsCrossed;
}

function ProductCard({
  product,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: {
  product: MenuProduct;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const steppable = product.variants.length === 0 && product.modifierGroups.length === 0;
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

        {!steppable && quantity > 0 && (
          <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white shadow-card">
            {quantity}
          </span>
        )}

        {product.isPopular && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-card">
            <Flame size={10} /> Popular
          </span>
        )}

        {steppable && quantity > 0 ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-brand-600 p-1 text-white shadow-card"
          >
            <button onClick={onDecrement} aria-label={`Remove one ${product.name}`} className="flex h-7 w-7 items-center justify-center rounded-full active:bg-white/15">
              <Minus size={14} />
            </button>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={quantity}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-4 text-center text-sm font-semibold"
              >
                {quantity}
              </motion.span>
            </AnimatePresence>
            <button onClick={onIncrement} aria-label={`Add one more ${product.name}`} className="flex h-7 w-7 items-center justify-center rounded-full active:bg-white/15">
              <Plus size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onAdd}
            aria-label={`Add ${product.name}`}
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-card"
          >
            <Plus size={18} />
          </motion.button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="line-clamp-1 text-sm font-semibold text-foreground">{product.name}</p>
        {product.description && <p className="mt-0.5 line-clamp-1 text-xs text-ink-400">{product.description}</p>}
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

function ProductGrid({
  products,
  quantityByProduct,
  onAdd,
  onIncrement,
  onDecrement,
}: {
  products: MenuProduct[];
  quantityByProduct: Map<string, number>;
  onAdd: (p: MenuProduct) => void;
  onIncrement: (p: MenuProduct) => void;
  onDecrement: (p: MenuProduct) => void;
}) {
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
          <ProductCard
            product={p}
            quantity={quantityByProduct.get(p.id) ?? 0}
            onAdd={() => onAdd(p)}
            onIncrement={() => onIncrement(p)}
            onDecrement={() => onDecrement(p)}
          />
        </motion.div>
      ))}
    </div>
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

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

  const navSections = useMemo(
    () => [...filteredCategories.map((c) => ({ id: c.id, name: c.name })), ...(filteredUncategorized.length > 0 ? [{ id: "uncategorized", name: "More" }] : [])],
    [filteredCategories, filteredUncategorized]
  );

  useEffect(() => {
    if (navSections.length <= 1) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id.replace("section-", ""));
      },
      { rootMargin: "-130px 0px -70% 0px", threshold: 0 }
    );
    navSections.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [navSections]);

  function scrollToSection(id: string) {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const quantityByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of lines) map.set(l.productId, (map.get(l.productId) ?? 0) + l.quantity);
    return map;
  }, [lines]);

  function addSimple(product: MenuProduct) {
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
  }

  function decrementSimple(product: MenuProduct) {
    const key = `${product.id}::::`;
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((l) => l.key !== key);
      return prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity - 1 } : l));
    });
  }

  function onSelectProduct(product: MenuProduct) {
    if (product.variants.length === 0 && product.modifierGroups.length === 0) {
      addSimple(product);
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

      <div className="sticky top-0 z-30 -mx-4 mb-5 space-y-2.5 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => setVegOnly((v) => !v)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors",
              vegOnly ? "border-emerald-600 bg-emerald-600 text-white" : "border-border text-ink-600"
            )}
          >
            <Leaf size={14} /> Veg
          </button>
        </div>

        {navSections.length > 1 && (
          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex gap-2">
              {navSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    activeSection === s.id ? "border-brand-600 bg-brand-600 text-white" : "border-border text-ink-600"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {noResults ? (
        <p className="py-16 text-center text-sm text-ink-400">No items match your search{vegOnly ? " and veg filter" : ""}. Try something else.</p>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((cat) => (
            <div key={cat.id} id={`section-${cat.id}`} className="scroll-mt-32">
              <div className="mb-3 flex items-baseline gap-2">
                <span className="h-4 w-1 rounded-full bg-brand-600" />
                <h2 className="font-heading text-lg font-bold text-foreground">{cat.name}</h2>
                <span className="text-xs font-medium text-ink-400">{cat.products.length}</span>
              </div>
              <ProductGrid products={cat.products} quantityByProduct={quantityByProduct} onAdd={onSelectProduct} onIncrement={addSimple} onDecrement={decrementSimple} />
            </div>
          ))}
          {filteredUncategorized.length > 0 && (
            <div id="section-uncategorized" className="scroll-mt-32">
              {filteredCategories.length > 0 && (
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="h-4 w-1 rounded-full bg-brand-600" />
                  <h2 className="font-heading text-lg font-bold text-foreground">More</h2>
                  <span className="text-xs font-medium text-ink-400">{filteredUncategorized.length}</span>
                </div>
              )}
              <ProductGrid products={filteredUncategorized} quantityByProduct={quantityByProduct} onAdd={onSelectProduct} onIncrement={addSimple} onDecrement={decrementSimple} />
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-4 backdrop-blur"
          >
            <div className="mx-auto max-w-lg">
              <Button className="w-full" size="lg" onClick={() => setCartOpen(true)}>
                <ShoppingCart size={16} /> View Cart · {itemCount} item{itemCount === 1 ? "" : "s"} · {formatRupees(cartTotal(lines))}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
