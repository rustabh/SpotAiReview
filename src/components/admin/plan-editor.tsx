"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePlan } from "@/actions/admin";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  businessLimit: number;
  campaignLimit: number;
  aiGenerationsPerMonth: number;
  teamMemberLimit: number;
  isActive: boolean;
};

export function PlanEditor({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [values, setValues] = useState(plan);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Plan>(key: K, value: Plan[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save() {
    setSaving(true);
    await updatePlan(plan.id, {
      monthlyPrice: Number(values.monthlyPrice),
      yearlyPrice: Number(values.yearlyPrice),
      businessLimit: Number(values.businessLimit),
      campaignLimit: Number(values.campaignLimit),
      aiGenerationsPerMonth: Number(values.aiGenerationsPerMonth),
      teamMemberLimit: Number(values.teamMemberLimit),
      isActive: values.isActive,
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Monthly price (paise)</Label><Input type="number" value={values.monthlyPrice} onChange={(e) => set("monthlyPrice", Number(e.target.value))} /></div>
        <div><Label>Yearly price (paise)</Label><Input type="number" value={values.yearlyPrice} onChange={(e) => set("yearlyPrice", Number(e.target.value))} /></div>
        <div><Label>Business limit</Label><Input type="number" value={values.businessLimit} onChange={(e) => set("businessLimit", Number(e.target.value))} /></div>
        <div><Label>Campaign limit</Label><Input type="number" value={values.campaignLimit} onChange={(e) => set("campaignLimit", Number(e.target.value))} /></div>
        <div><Label>AI generations / mo</Label><Input type="number" value={values.aiGenerationsPerMonth} onChange={(e) => set("aiGenerationsPerMonth", Number(e.target.value))} /></div>
        <div><Label>Team members</Label><Input type="number" value={values.teamMemberLimit} onChange={(e) => set("teamMemberLimit", Number(e.target.value))} /></div>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-ink-500">
          <input type="checkbox" checked={values.isActive} onChange={(e) => set("isActive", e.target.checked)} /> Active
        </label>
        <Button size="sm" onClick={save} loading={saving}>Save</Button>
      </div>
    </div>
  );
}
