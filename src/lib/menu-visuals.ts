import { UtensilsCrossed, Flame, Soup, Sandwich, CupSoda, Coffee, IceCreamCone, Salad, Pizza, type LucideIcon } from "lucide-react";

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

export function gradientFor(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export function iconFor(name: string): LucideIcon {
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
