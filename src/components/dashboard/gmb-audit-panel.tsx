"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { runGmbAudit, type GmbAuditView } from "@/actions/gmb-audit";
import type { GmbAuditCheck, GmbAuditCheckStatus } from "@/lib/google/audit";

function formatDate(d: Date) {
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

const STATUS_ICON: Record<GmbAuditCheckStatus, typeof CheckCircle2> = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
};

const STATUS_COLOR: Record<GmbAuditCheckStatus, string> = {
  pass: "text-emerald-600",
  warn: "text-amber-500",
  fail: "text-red-600",
};

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 55) return "text-amber-500";
  return "text-red-600";
}

function CheckRow({ check }: { check: GmbAuditCheck }) {
  const Icon = STATUS_ICON[check.status];
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon size={18} className={`mt-0.5 shrink-0 ${STATUS_COLOR[check.status]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{check.label}</p>
        <p className="text-xs text-ink-400">{check.detail}</p>
        {check.recommendation && <p className="mt-1 text-xs text-ink-500">{check.recommendation}</p>}
      </div>
    </div>
  );
}

export function GmbAuditPanel({ businessId, initialAudit }: { businessId: string; initialAudit: GmbAuditView | null }) {
  const [audit, setAudit] = useState(initialAudit);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onRun() {
    setError(undefined);
    setRunning(true);
    const result = await runGmbAudit(businessId);
    setRunning(false);
    if (!result.ok) return setError(result.error);
    setAudit(result.data);
  }

  if (!audit) {
    return (
      <Card className="p-10 text-center">
        <Gauge size={28} className="mx-auto mb-3 text-brand-600" />
        <p className="font-semibold text-foreground">No audit yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">
          Check how complete your Google Business Profile is and what to fix first to rank higher in local search.
        </p>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <Button className="mt-4" loading={running} onClick={onRun}>
          Run Ranking Audit
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`font-heading text-4xl font-bold ${scoreTone(audit.score)}`}>{audit.score}</div>
            <div>
              <p className="text-sm font-semibold text-foreground">out of 100</p>
              <p className="text-xs text-ink-400">Last audited {formatDate(audit.auditedAt)}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" loading={running} onClick={onRun}>
            <RefreshCw size={13} /> Re-run Audit
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <p className="mt-4 border-t border-border pt-4 text-sm text-ink-600">{audit.summary}</p>
      </Card>

      <Card className="divide-y divide-border p-4">
        {audit.checks.map((c) => (
          <CheckRow key={c.id} check={c} />
        ))}
      </Card>
    </div>
  );
}
