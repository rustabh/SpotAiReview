import Link from "next/link";
import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function DashboardTopbar() {
  return (
    <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-2 md:hidden">
        <LogoMark size={26} />
        <p className="text-sm font-semibold">AiReview</p>
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/dashboard/feedback">
          <Button variant="ghost" size="icon" title="Private feedback">
            <Bell size={17} />
          </Button>
        </Link>
        <Link href="/dashboard/campaigns/new">
          <Button size="sm">
            <Plus size={15} /> New QR
          </Button>
        </Link>
      </div>
    </div>
  );
}
