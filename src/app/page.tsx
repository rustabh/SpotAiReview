import Link from "next/link";
import { ArrowRight, QrCode, Sparkles, ShieldCheck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">S</div>
          <div>
            <p className="text-sm font-semibold leading-none text-foreground">Spot AI Review</p>
            <p className="text-[11px] text-ink-400 leading-none mt-0.5">by Febble Spot</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-20 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          <Sparkles size={12} /> Part of the Febble Spot ecosystem
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl text-balance">
          Turn Real Experiences Into Better Reviews.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-500 text-balance">
          Collect genuine customer feedback and help every customer turn their own experience into a natural,
          well-written review — for any kind of business.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/register">
            <Button size="lg">
              Start collecting feedback <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">I already have an account</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-3">
        <Card className="p-6">
          <QrCode className="text-brand-600" size={22} />
          <h3 className="mt-3 font-semibold">Scan &amp; Share</h3>
          <p className="mt-1.5 text-sm text-ink-500">
            One QR or NFC tap per campaign — reception, billing counter, table, packaging, business card.
          </p>
        </Card>
        <Card className="p-6">
          <Sparkles className="text-brand-600" size={22} />
          <h3 className="mt-3 font-semibold">AI-Assisted, Never Fabricated</h3>
          <p className="mt-1.5 text-sm text-ink-500">
            The AI only rewords what the customer actually said — no invented facts, no fake reviews.
          </p>
        </Card>
        <Card className="p-6">
          <BarChart3 className="text-brand-600" size={22} />
          <h3 className="mt-3 font-semibold">Full Funnel Analytics</h3>
          <p className="mt-1.5 text-sm text-ink-500">
            Scans, completions, AI drafts, copies and Google clicks — all in one clean dashboard.
          </p>
        </Card>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-ink-400">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} /> Powered by Febble Spot — Spot AI Review</span>
      </footer>
    </div>
  );
}
