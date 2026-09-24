import { LogoMark } from "@/components/brand/logo-mark";

export function PublicFooter() {
  return (
    <p className="flex items-center justify-center gap-1.5 py-6 text-center text-xs text-ink-400">
      <LogoMark size={14} /> Powered by <span className="font-medium text-ink-500">Febble Spot</span> · Spot AI Review
    </p>
  );
}
