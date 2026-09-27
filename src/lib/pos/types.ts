export type PosCategory = { externalId: string; name: string; order?: number };

export type PosModifierOption = { externalId: string; name: string; priceDelta: number };

export type PosModifierGroup = {
  externalId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: PosModifierOption[];
};

export type PosVariant = { externalId: string; name: string; priceDelta: number };

export type PosProduct = {
  externalId: string;
  categoryExternalId?: string;
  name: string;
  description?: string;
  price: number; // smallest currency unit
  isVeg?: boolean;
  isAvailable: boolean;
  variants: PosVariant[];
  modifierGroups: PosModifierGroup[];
};

export type PosMenuSnapshot = { categories: PosCategory[]; products: PosProduct[] };

export type PosOrderLineInput = {
  productExternalId?: string;
  productName: string;
  variantExternalId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  modifiers: { externalId?: string; name: string; priceDelta: number }[];
};

export type PosOrderInput = {
  orderCode: string; // Febble's own order code (e.g. SP1024), never the POS's own
  type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableLabel?: string;
  customerName?: string;
  customerPhone?: string;
  items: PosOrderLineInput[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
};

export type PosOrderStatus = "RECEIVED" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";

/**
 * The one interface every POS integration implements. The ordering flow
 * (src/actions/orders.ts) calls only this — never a provider class by name —
 * so a new POS drops in without touching order creation, status polling, or
 * cancellation logic anywhere else in the app.
 */
export interface POSProvider {
  readonly name: string;
  testConnection(): Promise<{ ok: boolean; error?: string }>;
  syncMenu(): Promise<PosMenuSnapshot>;
  createOrder(order: PosOrderInput): Promise<{ posOrderId: string }>;
  getOrderStatus(posOrderId: string): Promise<PosOrderStatus>;
  cancelOrder(posOrderId: string): Promise<void>;
}
