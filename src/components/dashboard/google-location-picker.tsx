"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin } from "lucide-react";
import { selectGoogleLocation } from "@/actions/google-reviews";

type Location = { name: string; title: string; accountName: string };

export function LocationPicker({ businessId, locations }: { businessId: string; locations: Location[] }) {
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);

  async function onSelect(loc: Location) {
    setSelecting(loc.name);
    const result = await selectGoogleLocation(businessId, loc.accountName, loc.name, loc.title);
    setSelecting(null);
    if (result.ok) router.push(`/dashboard/google-reviews?businessId=${businessId}&connected=1`);
  }

  if (locations.length === 0) {
    return <EmptyState icon={MapPin} title="No locations found" description="This Google account has no Business Profile locations." />;
  }

  return (
    <div className="space-y-3">
      {locations.map((loc) => (
        <Card key={loc.name} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-brand-600" />
            <p className="font-medium text-foreground">{loc.title}</p>
          </div>
          <Button size="sm" loading={selecting === loc.name} disabled={selecting !== null} onClick={() => onSelect(loc)}>
            Select
          </Button>
        </Card>
      ))}
    </div>
  );
}
