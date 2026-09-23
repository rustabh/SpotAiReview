"use client";

import { useState, useTransition } from "react";
import { setCampaignStatus } from "@/actions/campaign";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CampaignStatusToggle({ campaignId, businessId, status }: { campaignId: string; businessId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [current, setCurrent] = useState(status);

  function toggle() {
    const next = current === "ACTIVE" ? "PAUSED" : "ACTIVE";
    startTransition(async () => {
      const result = await setCampaignStatus(campaignId, businessId, next);
      if (result.ok) {
        setCurrent(next);
        router.refresh();
      }
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={toggle} loading={pending}>
      {current === "ACTIVE" ? "Pause Campaign" : "Activate Campaign"}
    </Button>
  );
}
