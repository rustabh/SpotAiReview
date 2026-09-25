import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Sparkles, ShieldCheck, BarChart3 } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Sparkles, text: "AI drafts grounded only in what the customer actually said" },
  { icon: BarChart3, text: "Full funnel analytics from scan to Google click" },
  { icon: ShieldCheck, text: "Every business owner's data is fully isolated" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/25 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-brand-500/15 blur-[100px]" />

        <Link href="/" className="relative z-10">
          <Logo size={32} wordmarkClassName="text-base text-white" variant="light" />
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight">
            Turn Real Experiences Into Better Reviews.
          </h2>
          <p className="mt-3 text-ink-300">
            The AI never invents a customer&apos;s experience — it only helps them put their own words on the page.
          </p>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((h) => (
              <li key={h.text} className="flex items-start gap-3 text-sm text-ink-200">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <h.icon size={13} />
                </span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-ink-400">Part of the Febble Spot ecosystem</p>
      </div>

      <div className="flex items-center justify-center bg-ink-50 px-4 py-12 dark:bg-ink-900">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <Logo size={30} wordmarkClassName="text-sm" />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
