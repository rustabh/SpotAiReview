"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setBusinessStatus, deleteBusiness } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Pencil, Ban, CheckCircle2, Trash2 } from "lucide-react";

export function BusinessActions({ businessId, status }: { businessId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggleSuspend() {
    startTransition(async () => {
      await setBusinessStatus(businessId, status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED");
      router.refresh();
    });
  }

  function onDelete() {
    if (!window.confirm("Permanently delete this business and all of its data? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteBusiness(businessId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/businesses/${businessId}/edit`}>
        <Button size="icon" variant="ghost" title="Edit"><Pencil size={14} /></Button>
      </Link>
      <Button size="icon" variant="ghost" title={status === "SUSPENDED" ? "Activate" : "Suspend"} onClick={toggleSuspend} loading={pending}>
        {status === "SUSPENDED" ? <CheckCircle2 size={14} /> : <Ban size={14} />}
      </Button>
      <Button size="icon" variant="ghost" title="Delete" onClick={onDelete}>
        <Trash2 size={14} className="text-red-600" />
      </Button>
    </div>
  );
}
