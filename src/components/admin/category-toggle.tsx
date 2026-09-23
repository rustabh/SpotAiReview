"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCategoryStatus } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function CategoryToggle({ categoryId, isActive }: { categoryId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          await updateCategoryStatus(categoryId, !isActive);
          router.refresh();
        })
      }
    >
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
