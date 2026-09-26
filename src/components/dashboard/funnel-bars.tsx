import { percentage } from "@/lib/utils";

const STEPS: { key: keyof Funnel; label: string }[] = [
  { key: "scans", label: "Scans" },
  { key: "started", label: "Started" },
  { key: "completed", label: "Completed" },
  { key: "aiGenerated", label: "AI Generated" },
  { key: "copied", label: "Copied" },
  { key: "googleClicks", label: "Google Click" },
];

type Funnel = {
  scans: number;
  started: number;
  completed: number;
  aiGenerated: number;
  copied: number;
  googleClicks: number;
};

export function FunnelBars({ funnel }: { funnel: Funnel }) {
  const max = Math.max(funnel.scans, 1);
  return (
    <div className="space-y-3">
      {STEPS.map((step, i) => {
        const value = funnel[step.key];
        const width = Math.max(percentage(value, max), value > 0 ? 3 : 0);
        const prevValue = i > 0 ? funnel[STEPS[i - 1].key] : null;
        const dropOff = prevValue !== null && prevValue > 0 ? 100 - percentage(value, prevValue) : null;
        return (
          <div key={step.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-ink-600 dark:text-ink-300">{step.label}</span>
              <span className="text-ink-400">
                {value} · {percentage(value, max)}%
                {dropOff !== null && dropOff > 0 && <span className="ml-1.5 text-amber-600 dark:text-amber-500">↓{dropOff}% drop</span>}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
              <div
                className="h-full rounded-full bg-brand-600 transition-[width] duration-700 ease-out"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
