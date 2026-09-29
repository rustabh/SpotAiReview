"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Facebook, Instagram } from "lucide-react";
import { selectSocialPage } from "@/actions/social";

type SocialPage = { id: string; name: string; instagramUsername: string | null };

export function SocialPagePicker({ businessId, pages }: { businessId: string; pages: SocialPage[] }) {
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);

  async function onSelect(page: SocialPage) {
    setSelecting(page.id);
    const result = await selectSocialPage(businessId, page.id);
    setSelecting(null);
    if (result.ok) router.push(`/dashboard/social?businessId=${businessId}&connected=1`);
  }

  if (pages.length === 0) {
    return <EmptyState icon={Facebook} title="No Pages found" description="This Facebook account doesn't manage any Pages." />;
  }

  return (
    <div className="space-y-3">
      {pages.map((page) => (
        <Card key={page.id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Facebook size={18} className="text-brand-600" />
            <div>
              <p className="font-medium text-foreground">{page.name}</p>
              {page.instagramUsername ? (
                <p className="flex items-center gap-1 text-xs text-ink-400">
                  <Instagram size={12} /> Linked to @{page.instagramUsername}
                </p>
              ) : (
                <Badge tone="neutral">No Instagram linked</Badge>
              )}
            </div>
          </div>
          <Button size="sm" loading={selecting === page.id} disabled={selecting !== null} onClick={() => onSelect(page)}>
            Select
          </Button>
        </Card>
      ))}
    </div>
  );
}
