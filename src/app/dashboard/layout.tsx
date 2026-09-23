import { redirect } from "next/navigation";
import { requireUser } from "@/lib/rbac";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role === "SUPER_ADMIN") redirect("/admin");

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userName={user.name ?? user.email ?? "Business Owner"} />
      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
