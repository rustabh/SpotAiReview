"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "./nav-items";
import { logoutAction } from "@/actions/session";
import { LogOut, ShieldCheck } from "lucide-react";

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-sm font-bold text-white">S</div>
        <div>
          <p className="text-sm font-semibold leading-none">Spot AI Review</p>
          <p className="text-[11px] text-ink-400 leading-none mt-0.5 flex items-center gap-1"><ShieldCheck size={10} /> Super Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
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
          <p className="truncate text-sm font-medium text-foreground">{userName}</p>
          <form action={logoutAction}>
            <button type="submit" className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Log out">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
