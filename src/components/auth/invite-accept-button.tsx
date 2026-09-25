"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteForExistingUser } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function InviteAcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function onAccept() {
    setError(undefined);
    setLoading(true);
    const result = await acceptInviteForExistingUser(token);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div>
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      <Button className="w-full" loading={loading} onClick={onAccept}>
        Accept Invite
      </Button>
    </div>
  );
}
