"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchPlan } from "@/actions/subscription";
import { Button } from "@/components/ui/button";

export function PlanSwitchButton({ planId, isCurrent }: { planId: string; isCurrent: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();

  if (isCurrent) return <Button size="sm" variant="outline" disabled className="w-full">Current Plan</Button>;

  return (
    <div>
      <Button
        size="sm"
        className="w-full"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await switchPlan(planId);
            if (!result.ok) setError(result.error);
            else router.refresh();
          })
        }
      >
        Switch Plan
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
