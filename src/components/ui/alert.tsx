import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type Tone = "error" | "success" | "info";

const styles: Record<Tone, { wrap: string; icon: typeof Info }> = {
  error: { wrap: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
  success: { wrap: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  info: { wrap: "bg-brand-50 text-brand-700 border-brand-200", icon: Info },
};

export function Alert({ tone = "info", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  const { wrap, icon: Icon } = styles[tone];
  return (
    <div className={cn("flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm", wrap, className)}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
