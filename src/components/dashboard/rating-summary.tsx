import { cn } from "@/lib/utils";
import { RATING_OPTIONS } from "@/lib/ratings";
import { Card } from "@/components/ui/card";
import { ThumbsUp } from "lucide-react";
import type { RatingSummary as RatingSummaryData } from "@/actions/table-session";
import type { $Enums } from "@prisma/client";

const BAR_TONE: Record<$Enums.RatingSentiment, string> = {
  MOST_RECOMMENDED: "bg-emerald-500",
  WOULD_RECOMMEND: "bg-brand-500",
  OKAY: "bg-amber-400",
  COULD_BE_BETTER: "bg-red-500",
};

function pct(count: number, total: number) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

export function RatingSummary({ summary }: { summary: RatingSummaryData }) {
  if (summary.overallTotal === 0 && summary.items.length === 0) return null;

  return (
    <Card className="mb-5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ThumbsUp size={16} className="text-brand-600" />
        <p className="text-sm font-semibold text-foreground">Customer ratings</p>
      </div>

      {summary.overallTotal > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Overall visit · {summary.overallTotal} rated</p>
          {RATING_OPTIONS.map((opt) => {
            const count = summary.overallCounts[opt.value];
            return (
              <div key={opt.value} className="flex items-center gap-2 text-xs">
                <span className="w-32 shrink-0 text-ink-500">{opt.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <div className={cn("h-full rounded-full", BAR_TONE[opt.value])} style={{ width: `${pct(count, summary.overallTotal)}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right text-ink-500">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {summary.items.length > 0 && (
        <div className={cn("space-y-3", summary.overallTotal > 0 && "mt-4 border-t border-border pt-3")}>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">By item</p>
          <ul className="space-y-2.5">
            {summary.items.slice(0, 8).map((item) => (
              <li key={item.productName}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.productName}</span>
                  <span className="text-xs text-ink-400">
                    {item.total} rating{item.total === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  {RATING_OPTIONS.map((opt) => {
                    const count = item.counts[opt.value];
                    if (count === 0) return null;
                    return <div key={opt.value} className={BAR_TONE[opt.value]} style={{ width: `${pct(count, item.total)}%` }} />;
                  })}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
