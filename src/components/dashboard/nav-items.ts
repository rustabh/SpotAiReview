import { LayoutDashboard, Building2, QrCode, MessageSquare, BarChart3, Sparkles, Settings, CreditCard, Users } from "lucide-react";

export const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/businesses", label: "My Businesses", icon: Building2 },
  { href: "/dashboard/campaigns", label: "Campaigns & QR", icon: QrCode },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/ai-insights", label: "AI Insights", icon: Sparkles },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/feedback", label: "Reviews", icon: MessageSquare },
  { href: "/dashboard/campaigns", label: "QR", icon: QrCode },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/menu", label: "Menu", icon: Settings },
] as const;
