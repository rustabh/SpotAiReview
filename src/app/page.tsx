import Link from "next/link";
import {
  ArrowRight,
  QrCode,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Star,
  MessageSquareText,
  Languages,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { LogoMark } from "@/components/brand/logo-mark";

const CATEGORIES = [
  "Restaurants", "Salons", "Clinics", "Hotels", "Retail", "Agencies",
  "Real Estate", "Gyms", "Coaching", "Auto Service",
];

const STEPS = [
  { title: "Scan or tap", description: "Customer scans a QR or taps an NFC card on a receipt, table, or standee.", icon: QrCode },
  { title: "Share their experience", description: "A quick, mobile-first flow — rating, a few tags, a couple of sentences.", icon: MessageSquareText },
  { title: "AI drafts, they edit", description: "Three grounded review drafts appear, using only what the customer said.", icon: Sparkles },
  { title: "They post it themselves", description: "Copy the review and open Google — the customer stays in full control.", icon: CheckCircle2 },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo size={30} wordmarkClassName="text-sm" />
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid-fade pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" style={{ backgroundSize: "22px 22px" }} />
        <div className="pointer-events-none absolute left-1/2 top-[-140px] -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-500/15 blur-[100px]" />

        <div className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
          <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
            <Sparkles size={13} /> Part of the Febble Spot ecosystem
          </span>
          <h1 className="animate-fade-up mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground text-balance sm:text-6xl" style={{ animationDelay: "60ms" }}>
            Turn Real Experiences Into <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">Better Reviews.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg text-ink-500 text-balance" style={{ animationDelay: "120ms" }}>
            Collect genuine customer feedback and help every customer turn their own experience into a natural,
            well-written review — for any kind of business, in their own language.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "180ms" }}>
            <Link href="/register">
              <Button size="lg" className="w-full shadow-glow sm:w-auto">
                Start collecting feedback <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">I already have an account</Button>
            </Link>
          </div>
          <p className="animate-fade-up mt-4 text-xs text-ink-400" style={{ animationDelay: "220ms" }}>No credit card needed · Free plan available</p>
        </div>

        {/* Product preview card */}
        <div className="mx-auto max-w-4xl px-6 pb-24">
          <Card className="animate-fade-up overflow-hidden shadow-soft" style={{ animationDelay: "260ms" }}>
            <div className="flex items-center gap-2 border-b border-border bg-ink-50 px-4 py-3 dark:bg-ink-900">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 truncate rounded-md bg-surface px-3 py-1 text-xs text-ink-400">spot.febblespot.com/r/reception-qr</span>
            </div>
            <div className="grid gap-0 sm:grid-cols-2">
              <div className="flex flex-col items-center justify-center gap-3 border-b border-border p-8 sm:border-b-0 sm:border-r">
                <LogoMark size={40} />
                <p className="text-sm font-medium text-foreground">How was your experience?</p>
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={22} className="fill-amber-400" />)}
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {["Service", "Staff", "Value"].map((c) => (
                    <span key={c} className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">{c}</span>
                  ))}
                </div>
              </div>
              <div className="p-8">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-600"><Sparkles size={13} /> AI-assisted draft</p>
                <p className="text-sm leading-relaxed text-ink-600">
                  &ldquo;The staff was really helpful and the service was quick. Great value for what we got — would
                  definitely come back again.&rdquo;
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-medium text-ink-500 dark:bg-ink-800">Copy Review</span>
                  <span className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white">Open Google</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Category strip */}
      <section className="border-y border-border bg-ink-50/60 py-8 dark:bg-ink-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-ink-400">Built for every kind of business</p>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c) => (
              <span key={c} className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-600">{c}</span>
            ))}
            <span className="rounded-full border border-dashed border-border px-3.5 py-1.5 text-sm font-medium text-ink-400">+ more</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">From a scan to a review, in under a minute</h2>
          <p className="mt-3 text-ink-500">One QR code powers the whole flow — no app to download, no account to create.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-sm font-bold text-white shadow-soft">
                {i + 1}
              </div>
              <step.icon className="mt-4 text-brand-600" size={20} />
              <h3 className="mt-3 font-heading font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-border bg-ink-50/60 py-24 dark:bg-ink-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Everything a business needs, nothing a customer notices</h2>
            <p className="mt-3 text-ink-500">Powerful for the business owner. Effortless for the customer.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: QrCode, title: "QR & NFC Campaigns", desc: "Unlimited campaigns per business — reception, billing counter, table, packaging, business card." },
              { icon: Sparkles, title: "Grounded AI, Never Fabricated", desc: "The AI only rewords what the customer actually said. No invented facts, no fake reviews." },
              { icon: BarChart3, title: "Full Funnel Analytics", desc: "Scans, completions, AI drafts, copies, Google clicks — the whole journey, in one dashboard." },
              { icon: Languages, title: "11 Indian Languages", desc: "English, Hindi, Hinglish, Marathi, Tamil, Telugu and more — customers write in their own words." },
              { icon: Building2, title: "Multi-Business, One Account", desc: "Run a restaurant, a cafe and a catering business? Manage all of them from one login." },
              { icon: ShieldCheck, title: "Private Feedback, Always Honest", desc: "Low ratings never get hidden — customers can send private feedback straight to the business." },
            ].map((f) => (
              <Card key={f.title} className="p-6 transition-shadow hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
                  <f.icon size={19} />
                </div>
                <h3 className="mt-4 font-heading font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Card className="relative overflow-hidden bg-ink-900 p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brand-500/20 blur-[80px]" />
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to turn feedback into reviews?</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-300">Set up your first business and QR campaign in under five minutes — completely free to start.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full shadow-glow sm:w-auto">Get Started Free <ArrowRight size={16} /></Button>
            </Link>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Logo size={24} wordmarkClassName="text-xs" tagline={false} />
          <p className="flex items-center gap-1.5 text-xs text-ink-400"><ShieldCheck size={13} /> Powered by Febble Spot</p>
        </div>
      </footer>
    </div>
  );
}
