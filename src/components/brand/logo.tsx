import { LogoMark } from "./logo-mark";
import { cn } from "@/lib/utils";

export function Logo({
  size = 32,
  wordmarkClassName,
  tagline = true,
  className,
}: {
  size?: number;
  wordmarkClassName?: string;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <div className="leading-tight">
        <p className={cn("font-heading font-semibold tracking-tight text-foreground", wordmarkClassName)}>
          Spot AI Review
        </p>
        {tagline && <p className="text-[11px] font-medium text-ink-400">by Febble Spot</p>}
      </div>
    </div>
  );
}
