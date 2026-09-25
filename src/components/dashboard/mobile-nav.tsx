"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_NAV_ITEMS } from "./nav-items";

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium"
          >
            <span
              className={cn(
                "relative flex h-8 w-11 items-center justify-center rounded-full transition-colors duration-200",
                active && "bg-brand-50 dark:bg-brand-900/30"
              )}
            >
              <Icon size={19} className={active ? "text-brand-600" : "text-ink-400"} />
            </span>
            <span className={cn(active ? "text-brand-600" : "text-ink-400")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
