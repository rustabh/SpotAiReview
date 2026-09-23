"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCampaign, updateCampaign } from "@/actions/campaign";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type Business = { id: string; name: string };

export function CampaignForm({
  businesses,
  defaultBusinessId,
  campaignId,
  defaultValues,
}: {
  businesses: Business[];
  defaultBusinessId?: string;
  campaignId?: string;
  defaultValues?: Record<string, string>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const v = defaultValues ?? {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const input = Object.fromEntries(fd.entries());

    const result = campaignId ? await updateCampaign(campaignId, input) : await createCampaign(input);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const id = campaignId ?? (result.data as { campaignId: string }).campaignId;
    router.push(`/dashboard/campaigns/${id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <div>
        <Label htmlFor="businessId">Business *</Label>
        <Select id="businessId" name="businessId" required defaultValue={v.businessId ?? defaultBusinessId} disabled={!!campaignId}>
          <option value="">Select a business</option>
          {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="name">Campaign name *</Label>
        <Input id="name" name="name" required placeholder="e.g. Reception QR, Table 4, Billing Counter" defaultValue={v.name} />
      </div>
      <div>
        <Label htmlFor="placement">Placement</Label>
        <Input id="placement" name="placement" placeholder="e.g. Reception, Table 3, Invoice" defaultValue={v.placement} />
      </div>
      <div>
        <Label htmlFor="ctaText">Call to action</Label>
        <Input id="ctaText" name="ctaText" defaultValue={v.ctaText || "Scan to Share Your Experience"} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} defaultValue={v.description} placeholder="Optional internal note" />
      </div>
      <div>
        <Label htmlFor="googleReviewUrlOverride">Override Google review URL</Label>
        <Input id="googleReviewUrlOverride" name="googleReviewUrlOverride" placeholder="Leave blank to use the business's default" defaultValue={v.googleReviewUrlOverride} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" loading={loading}>{campaignId ? "Save Changes" : "Create Campaign"}</Button>
      </div>
    </form>
  );
}
