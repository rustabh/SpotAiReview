"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SERIES = {
  scans: { label: "Scans", color: "#2563eb" },
  feedback: { label: "Feedback", color: "#d97706" },
} as const;

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: keyof typeof SERIES; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-soft">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES[p.dataKey].color }} />
            <span className="text-ink-400">{SERIES[p.dataKey].label}</span>
            <span className="ml-auto font-medium text-foreground">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimeSeriesChart({ data }: { data: { date: string; scans: number; feedback: number }[] }) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-ink-400">No activity in this range yet.</div>;
  }
  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs">
        {Object.values(SERIES).map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-ink-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
          <defs>
            <linearGradient id="scansFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SERIES.scans.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={SERIES.scans.color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="feedbackFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SERIES.feedback.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={SERIES.feedback.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
          <Area type="monotone" dataKey="scans" name="Scans" stroke={SERIES.scans.color} fill="url(#scansFill)" strokeWidth={2} />
          <Area type="monotone" dataKey="feedback" name="Feedback" stroke={SERIES.feedback.color} fill="url(#feedbackFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
