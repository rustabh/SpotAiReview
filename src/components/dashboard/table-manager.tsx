"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTable, createTablesBulk, deleteTable, toggleTableActive, getTableQrCode } from "@/actions/tables";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { QrCard } from "@/components/dashboard/qr-card";
import { Alert } from "@/components/ui/alert";
import { Plus, Trash2, QrCode as QrIcon } from "lucide-react";
import { slugify } from "@/lib/utils";

type Table = { id: string; number: string; section: string | null; capacity: number | null; isActive: boolean };

export function TableManager({ businessId, businessName, tables }: { businessId: string; businessName: string; tables: Table[] }) {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [section, setSection] = useState("");
  const [bulkCount, setBulkCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [qr, setQr] = useState<{ pngDataUrl: string; svg: string; url: string; label: string } | null>(null);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const result = await createTable(businessId, { number, section: section || undefined });
    setLoading(false);
    if (!result.ok) return setError(result.error);
    setNumber("");
    setSection("");
    router.refresh();
  }

  async function onBulkCreate() {
    setError(undefined);
    setBulkLoading(true);
    const result = await createTablesBulk(businessId, Number(bulkCount));
    setBulkLoading(false);
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this table? Its QR code will stop working.")) return;
    await deleteTable(id, businessId);
    router.refresh();
  }

  async function onToggle(t: Table) {
    await toggleTableActive(t.id, businessId, !t.isActive);
    router.refresh();
  }

  async function onViewQr(t: Table) {
    const result = await getTableQrCode(t.id, businessId);
    if (result) setQr({ ...result, label: `Table ${t.number}` });
  }

  return (
    <div className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}

      {tables.length === 0 ? (
        <p className="text-sm text-ink-400">No tables yet — add them one by one, or create several at once below.</p>
      ) : (
        <ul className="divide-y divide-border">
          {tables.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">Table {t.number}</p>
                {t.section && <span className="text-xs text-ink-400">{t.section}</span>}
                {!t.isActive && <Badge tone="neutral">Inactive</Badge>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onViewQr(t)} className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800" title="View QR">
                  <QrIcon size={15} />
                </button>
                <button
                  onClick={() => onToggle(t)}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  {t.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => onDelete(t.id)} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onAdd} className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-3">
        <div>
          <Label htmlFor="table-number">Table number</Label>
          <Input id="table-number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="12" className="w-28" required />
        </div>
        <div>
          <Label htmlFor="table-section">Section (optional)</Label>
          <Input id="table-section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="Terrace" className="w-36" />
        </div>
        <Button type="submit" size="sm" loading={loading}><Plus size={14} /> Add table</Button>
      </form>

      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-border p-3">
        <div>
          <Label htmlFor="bulk-count">Set up multiple tables at once</Label>
          <Input id="bulk-count" type="number" min={1} max={200} value={bulkCount} onChange={(e) => setBulkCount(e.target.value)} className="w-24" />
        </div>
        <Button size="sm" variant="outline" onClick={onBulkCreate} loading={bulkLoading}>Create tables 1–{bulkCount || "N"}</Button>
      </div>

      <Modal open={!!qr} onClose={() => setQr(null)} title={qr?.label ?? ""}>
        {qr && <QrCard pngDataUrl={qr.pngDataUrl} svg={qr.svg} url={qr.url} fileName={`${slugify(businessName)}-${slugify(qr.label)}`} />}
      </Modal>
    </div>
  );
}
