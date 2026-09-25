import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getInviteByToken } from "@/actions/team";
import { getCurrentUser } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InviteAcceptForm } from "@/components/auth/invite-accept-form";
import { InviteAcceptButton } from "@/components/auth/invite-accept-button";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite) {
    return (
      <Card>
        <CardHeader className="flex-col items-start pb-4">
          <CardTitle className="text-xl">Invite not found</CardTitle>
          <CardDescription>This invite link is invalid, has already been used, or has expired.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert tone="error"><AlertTriangle size={14} className="mr-1 inline" /> Ask the business owner to send you a new invite.</Alert>
          <Link href="/login" className="mt-4 block"><Button className="w-full" variant="outline">Go to login</Button></Link>
        </CardContent>
      </Card>
    );
  }

  const roleLabel = invite.role === "MANAGER" ? "Manager" : "Staff";
  const currentUser = await getCurrentUser();

  if (invite.hasAccount) {
    const isMatchingUser = currentUser && (currentUser.email ?? "").toLowerCase() === invite.email;

    return (
      <Card>
        <CardHeader className="flex-col items-start pb-4">
          <CardTitle className="text-xl">Join {invite.business.name}</CardTitle>
          <CardDescription>You&apos;ve been invited as a {roleLabel.toLowerCase()}.</CardDescription>
        </CardHeader>
        <CardContent>
          {isMatchingUser ? (
            <InviteAcceptButton token={token} />
          ) : (
            <>
              <Alert tone="info">
                An AiReview account already exists for <strong>{invite.email}</strong>. Log in with that account to accept this invite.
              </Alert>
              <Link href={`/login?next=/invite/${token}`} className="mt-4 block">
                <Button className="w-full">Log in to accept</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-col items-start pb-4">
        <CardTitle className="text-xl">Join {invite.business.name}</CardTitle>
        <CardDescription>You&apos;ve been invited as a {roleLabel.toLowerCase()}. Create your account to accept.</CardDescription>
      </CardHeader>
      <CardContent>
        <InviteAcceptForm token={token} email={invite.email} />
      </CardContent>
    </Card>
  );
}
