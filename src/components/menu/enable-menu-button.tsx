"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enableMenuModule } from "@/actions/menu";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function EnableMenuButton({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function onClick() {
    setError(undefined);
    startTransition(async () => {
      const result = await enableMenuModule(businessId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={onClick} loading={pending}>Enable Spot Menu for this business</Button>
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
