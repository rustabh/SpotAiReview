import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Use at the top of any /dashboard page/action. Redirects unauthenticated users. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Use at the top of any /admin page/action. */
export async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard");
  return user;
}

export async function requireBusinessOwnerRole() {
  const user = await requireUser();
  if (user.role !== "BUSINESS_OWNER") redirect("/admin");
  return user;
}

/**
 * Guarantees the current user has a membership row on the given business.
 * This is the single choke point that prevents one business owner from
 * reading/mutating another owner's data by tampering with an ID.
 */
export async function requireBusinessAccess(businessId: string) {
  const user = await requireUser();
  if (user.role === "SUPER_ADMIN") {
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) redirect("/admin/businesses");
    return { user, membership: null, business };
  }

  const membership = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: user.id, businessId } },
    include: { business: true },
  });
  if (!membership) redirect("/dashboard");
  return { user, membership, business: membership.business };
}

export async function businessIdsForUser(userId: string) {
  const memberships = await prisma.businessMember.findMany({
    where: { userId },
    select: { businessId: true },
  });
  return memberships.map((m) => m.businessId);
}
