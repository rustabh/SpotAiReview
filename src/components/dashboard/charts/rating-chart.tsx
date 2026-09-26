"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

function colorForRating(rating: number) {
  if (rating <= 2) return "#b91c1c";
  if (rating === 3) return "#d97706";
  return "#059669";
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: { rating: number; count: number } }[] }) {
  if (!active || !payload?.length) return null;
  const { rating, count } = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-soft">
      <p className="font-medium text-foreground">{rating}★ · {count} {count === 1 ? "review" : "reviews"}</p>
    </div>
  );
}

export function RatingChart({ data }: { data: { rating: number; count: number }[] }) {
  const hasData = data.some((d) => d.count > 0);
  return (
    <div>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} margin={{ left: -20, right: 10, top: 16 }}>
          <XAxis dataKey="rating" tickFormatter={(v) => `${v}★`} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--border)", opacity: 0.3 }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((d) => <Cell key={d.rating} fill={colorForRating(d.rating)} />)}
            {hasData && <LabelList dataKey="count" position="top" style={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 500 }} />}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-1 flex items-center justify-center gap-4 text-xs text-ink-500">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#b91c1c]" /> Needs attention</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#d97706]" /> Neutral</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#059669]" /> Delighted</span>
      </div>
    </div>
  );
}
