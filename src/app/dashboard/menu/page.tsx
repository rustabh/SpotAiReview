import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { logoutAction } from "@/actions/session";
import { Building2, Sparkles, Users, CreditCard, Settings, LogOut, ChevronRight } from "lucide-react";

const ITEMS = [
  { href: "/dashboard/businesses", label: "My Businesses", icon: Building2 },
  { href: "/dashboard/ai-insights", label: "AI Insights", icon: Sparkles },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function MenuPage() {
  return (
    <div>
      <PageHeader title="Menu" />
      <Card className="divide-y divide-border overflow-hidden">
        {ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between px-4 py-3.5 text-sm font-medium text-foreground hover:bg-ink-50 dark:hover:bg-ink-800">
            <span className="flex items-center gap-3"><item.icon size={17} className="text-ink-400" /> {item.label}</span>
            <ChevronRight size={16} className="text-ink-300" />
          </Link>
        ))}
        <form action={logoutAction}>
          <button type="submit" className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut size={17} /> Log out
          </button>
        </form>
      </Card>
    </div>
  );
}
