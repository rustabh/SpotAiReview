import { requireSuperAdmin } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSuperAdmin();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar userName={user.name ?? user.email ?? "Super Admin"} />
      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
