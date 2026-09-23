"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SIDEBAR_ITEMS } from "./nav-items";
import { logoutAction } from "@/actions/session";
import { LogOut } from "lucide-react";

export function DashboardSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">S</div>
        <div>
          <p className="text-sm font-semibold leading-none">Spot AI Review</p>
          <p className="text-[11px] text-ink-400 leading-none mt-0.5">by Febble Spot</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {SIDEBAR_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30" : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between rounded-xl px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-ink-400">Business Owner</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800" title="Log out">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
