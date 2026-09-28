export type MenuVariant = { id: string; name: string; priceDelta: number; isDefault: boolean };
export type MenuModifierOption = { id: string; name: string; priceDelta: number };
export type MenuModifierGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: MenuModifierOption[];
};
export type MenuProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  discountPrice: number | null;
  isVeg: boolean | null;
  spiceLevel: string | null;
  isAvailable: boolean;
  categoryId: string | null;
  variants: MenuVariant[];
  modifierGroups: MenuModifierGroup[];
};
export type MenuCategory = { id: string; name: string; isActive: boolean; products: MenuProduct[] };
