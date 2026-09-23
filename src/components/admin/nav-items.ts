import { LayoutDashboard, Building2, Users, Tags, CreditCard, Settings, ScrollText } from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/owners", label: "Business Owners", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/plans", label: "Plans", icon: CreditCard },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;
