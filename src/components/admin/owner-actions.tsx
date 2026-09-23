"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserStatus } from "@/actions/admin";
import { loginAsOwnerAction } from "@/actions/session";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle2, LogIn } from "lucide-react";

export function OwnerActions({ userId, status }: { userId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggleSuspend() {
    startTransition(async () => {
      await setUserStatus(userId, status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED");
      router.refresh();
    });
  }

  function loginAsOwner() {
    if (!window.confirm("Log in as this business owner? This action is audit-logged.")) return;
    startTransition(async () => {
      await loginAsOwnerAction(userId);
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button size="icon" variant="ghost" title="Login as Owner" onClick={loginAsOwner} loading={pending}>
        <LogIn size={14} />
      </Button>
      <Button size="icon" variant="ghost" title={status === "SUSPENDED" ? "Activate" : "Suspend"} onClick={toggleSuspend}>
        {status === "SUSPENDED" ? <CheckCircle2 size={14} /> : <Ban size={14} />}
      </Button>
    </div>
  );
}
