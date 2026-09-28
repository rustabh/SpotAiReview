export type CartLineModifier = { id: string; name: string; priceDelta: number };

export type CartLine = {
  key: string; // productId + variantId + sorted modifier ids, so identical selections merge
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  modifiers: CartLineModifier[];
  specialInstructions?: string;
};

export function cartLineKey(productId: string, variantId: string | undefined, modifierIds: string[]) {
  return `${productId}::${variantId ?? ""}::${[...modifierIds].sort().join(",")}`;
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}
