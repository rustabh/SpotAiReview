import { requireUser } from "@/lib/rbac";
import { listMyBusinesses } from "@/actions/business";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TeamManager } from "@/components/dashboard/team-manager";
import { Users } from "lucide-react";

export default async function TeamPage() {
  const user = await requireUser();
  const businesses = await listMyBusinesses();

  if (businesses.length === 0) {
    return (
      <div>
        <PageHeader title="Team" description="Invite people to help manage your businesses." />
        <EmptyState icon={Users} title="Add a business first" description="Team management is per-business." />
      </div>
    );
  }

  const businessesWithMembers = await Promise.all(
    businesses.map(async (b) => ({
      business: b,
      members: await prisma.businessMember.findMany({ where: { businessId: b.id }, include: { user: true }, orderBy: { role: "asc" } }),
    }))
  );

  return (
    <div>
      <PageHeader title="Team" description="Owners see everything. Managers can manage campaigns and analytics. Staff can only view feedback." />
      <div className="space-y-6">
        {businessesWithMembers.map(({ business, members }) => {
          const myMembership = members.find((m) => m.user.id === user.id);
          return (
            <Card key={business.id}>
              <CardHeader><CardTitle>{business.name}</CardTitle></CardHeader>
              <CardContent>
                <TeamManager businessId={business.id} members={members} canManage={myMembership?.role === "OWNER"} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
