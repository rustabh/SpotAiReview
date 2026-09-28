"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Trash2, CheckCircle2 } from "lucide-react";
import { placeOrder } from "@/actions/orders";
import { cartTotal, type CartLine } from "./cart-types";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function getIdempotencyKey(qrToken: string) {
  const storageKey = `checkout-key:${qrToken}`;
  let key = sessionStorage.getItem(storageKey);
  if (!key) {
    key = crypto.randomUUID();
    sessionStorage.setItem(storageKey, key);
  }
  return key;
}

export function CartSheet({
  open,
  onClose,
  qrToken,
  lines,
  onUpdateQuantity,
  onRemove,
  onPlaced,
}: {
  open: boolean;
  onClose: () => void;
  qrToken: string;
  lines: CartLine[];
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
  onPlaced: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [placedCode, setPlacedCode] = useState<string | undefined>();

  async function onCheckout() {
    setError(undefined);
    setLoading(true);
    const idempotencyKey = getIdempotencyKey(qrToken);
    const result = await placeOrder({
      qrToken,
      items: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        modifierOptionIds: l.modifiers.map((m) => m.id),
        quantity: l.quantity,
        specialInstructions: l.specialInstructions,
      })),
      customerName: name || undefined,
      customerPhone: phone || undefined,
      idempotencyKey,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    sessionStorage.removeItem(`checkout-key:${qrToken}`);
    setName("");
    setPhone("");
    setPlacedCode(result.data.code);
    onPlaced();
    setTimeout(() => {
      setPlacedCode(undefined);
      onClose();
    }, 1400);
  }

  if (placedCode) {
    return (
      <Modal open={open} onClose={onClose} title="Your order">
        <div className="py-8 text-center">
          <CheckCircle2 className="mx-auto mb-2 text-emerald-600" size={32} />
          <p className="font-semibold text-foreground">Order #{placedCode} placed!</p>
          <p className="mt-1 text-sm text-ink-400">Feel free to keep browsing and add more to your table.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Your order">
      <div className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        {lines.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-400">Your cart is empty.</p>
        ) : (
          <ul className="divide-y divide-border">
            {lines.map((l) => (
              <li key={l.key} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{l.productName}{l.variantName ? ` (${l.variantName})` : ""}</p>
                  {l.modifiers.length > 0 && <p className="text-xs text-ink-400">{l.modifiers.map((m) => m.name).join(", ")}</p>}
                  {l.specialInstructions && <p className="text-xs italic text-ink-400">&quot;{l.specialInstructions}&quot;</p>}
                  <div className="mt-1.5 flex items-center gap-2">
                    <button onClick={() => onUpdateQuantity(l.key, l.quantity - 1)} className="h-6 w-6 rounded-full border border-border text-sm text-ink-600">−</button>
                    <span className="w-5 text-center text-sm">{l.quantity}</span>
                    <button onClick={() => onUpdateQuantity(l.key, l.quantity + 1)} className="h-6 w-6 rounded-full border border-border text-sm text-ink-600">+</button>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <p className="text-sm font-medium text-foreground">{formatRupees(l.unitPrice * l.quantity)}</p>
                  <button onClick={() => onRemove(l.key)} className="text-ink-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 && (
          <>
            <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-foreground">
              <span>Total</span>
              <span>{formatRupees(cartTotal(lines))}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="cust-name">Name (optional)</Label>
                <Input id="cust-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="cust-phone">Phone (optional)</Label>
                <Input id="cust-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="For order updates" />
              </div>
            </div>

            <Button className="w-full" size="lg" loading={loading} onClick={onCheckout}>Place Order</Button>
          </>
        )}
      </div>
    </Modal>
  );
}
