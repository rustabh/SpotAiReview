"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981"];

export function RatingChart({ data }: { data: { rating: number; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <XAxis dataKey="rating" tickFormatter={(v) => `${v}★`} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => <Cell key={d.rating} fill={COLORS[i] ?? "#2563eb"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
