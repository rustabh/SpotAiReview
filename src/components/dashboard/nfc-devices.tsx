"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addNfcDevice } from "@/actions/campaign";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Nfc, Plus } from "lucide-react";

type Device = { id: string; label: string; uid: string; isActive: boolean };

export function NfcDevices({ campaignId, businessId, devices }: { campaignId: string; businessId: string; devices: Device[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await addNfcDevice(campaignId, businessId, String(fd.get("label")), String(fd.get("uid")));
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAdding(false);
    router.refresh();
  }

  return (
    <div>
      {devices.length === 0 && !adding && (
        <p className="text-sm text-ink-400">No NFC devices linked yet. NFC taps use the same URL as this QR.</p>
      )}
      <ul className="space-y-2">
        {devices.map((d) => (
          <li key={d.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
            <span className="flex items-center gap-2"><Nfc size={14} className="text-ink-400" /> {d.label}</span>
            <span className="font-mono text-xs text-ink-400">{d.uid}</span>
          </li>
        ))}
      </ul>

      {adding ? (
        <form onSubmit={onSubmit} className="mt-3 space-y-3 rounded-xl border border-border p-3">
          {error && <Alert tone="error">{error}</Alert>}
          <div>
            <Label htmlFor="label">Label</Label>
            <Input id="label" name="label" required placeholder="e.g. NFC Standee - Entrance" />
          </div>
          <div>
            <Label htmlFor="uid">Tag UID</Label>
            <Input id="uid" name="uid" required placeholder="Physical tag identifier" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={loading}>Add Device</Button>
          </div>
        </form>
      ) : (
        <Button size="sm" variant="outline" className="mt-3" onClick={() => setAdding(true)}>
          <Plus size={14} /> Link NFC Device
        </Button>
      )}
    </div>
  );
}
