"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Heart,
  Target,
  Users,
  Lock,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Never fabricated",
    desc: "Our AI only rewords what a customer actually told us. It never invents details, praise, or facts that weren't given.",
  },
  {
    icon: Users,
    title: "The customer stays in control",
    desc: "Every draft is editable. The customer decides what to say and chooses, themselves, whether to post it.",
  },
  {
    icon: Lock,
    title: "Honesty over optics",
    desc: "A bad rating is never hidden. Unhappy customers are routed to private feedback the business can actually act on.",
  },
  {
    icon: Globe2,
    title: "Built for every business",
    desc: "One platform for restaurants, clinics, salons, hotels, agencies, and more — no category-specific tooling required.",
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={container}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo size={30} wordmarkClassName="text-sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden text-sm font-medium text-ink-500 hover:text-foreground sm:inline-flex">
              <span className="rounded-full px-3 py-1.5">Home</span>
            </Link>
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
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center sm:pt-28"
        >
          <motion.span variants={item} className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
            <Sparkles size={13} /> About Us
          </motion.span>
          <motion.h1 variants={item} className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground text-balance sm:text-5xl">
            We help real experiences become <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">honest reviews.</span>
          </motion.h1>
          <motion.p variants={item} className="mx-auto mt-5 max-w-2xl text-lg text-ink-500 text-balance">
            Spot AI Review is built by Febble Spot to solve a problem every business owner knows too well —
            happy customers rarely take the time to write a review, and the ones who do often don&apos;t know what to say.
          </motion.p>
        </motion.div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <motion.div variants={item}>
            <Card className="p-8 sm:p-10">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
                <Target size={20} />
              </div>
              <h2 className="mt-5 font-heading text-2xl font-bold tracking-tight text-foreground">Our story</h2>
              <p className="mt-3 leading-relaxed text-ink-600">
                Febble Spot started by working closely with small and mid-sized businesses — restaurants, clinics,
                salons, hotels — and noticed the same pattern everywhere. Customers were happy. They said so, out loud,
                in person. But almost none of that turned into an actual review on Google. The ones who tried often
                stared at a blank text box, unsure what to write, and gave up.
              </p>
              <p className="mt-3 leading-relaxed text-ink-600">
                At the same time, we saw a growing wave of AI tools that generate reviews outright — fabricated,
                generic, and dishonest. That&apos;s not the problem we wanted to solve. So we built Spot AI Review
                around a simple rule: the AI can only help someone say what they already told us, better. It can
                never say something they didn&apos;t.
              </p>
              <p className="mt-3 leading-relaxed text-ink-600">
                Today, Spot AI Review turns a single QR code or NFC tap into a complete feedback and review journey —
                for any kind of business, in the customer&apos;s own language — while giving owners full visibility
                into every scan, draft, and click along the way.
              </p>
            </Card>
          </motion.div>
        </Reveal>
      </section>

      {/* Mission */}
      <section className="border-y border-border bg-ink-50/60 py-16 dark:bg-ink-900/40">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <motion.div variants={item} className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
                <Heart size={20} />
              </div>
            </motion.div>
            <motion.h2 variants={item} className="mt-5 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Our mission
            </motion.h2>
            <motion.p variants={item} className="mt-3 text-lg leading-relaxed text-ink-600">
              Make it effortless for genuinely happy customers to say so — and impossible for a review to say
              something that never actually happened.
            </motion.p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <motion.h2 variants={item} className="font-heading text-3xl font-bold tracking-tight text-foreground">What we believe</motion.h2>
          <motion.p variants={item} className="mt-3 text-ink-500">The principles behind every product decision we make.</motion.p>
        </Reveal>
        <Reveal className="mt-14 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => (
            <motion.div key={v.title} variants={item} whileHover={{ y: -4 }}>
              <Card className="h-full p-6 transition-shadow hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
                  <v.icon size={19} />
                </div>
                <h3 className="mt-4 font-heading font-semibold text-foreground">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{v.desc}</p>
              </Card>
            </motion.div>
          ))}
        </Reveal>
      </section>

      {/* Febble Spot ecosystem */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <Reveal>
          <motion.div variants={item}>
            <Card className="p-8 text-center sm:p-10">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
                <Sparkles size={13} /> Part of the Febble Spot ecosystem
              </p>
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-600">
                Spot AI Review is one product in the Febble Spot family, built to give local and growing businesses
                the same quality of tooling that only large chains could usually afford.
              </p>
            </Card>
          </motion.div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-ink-900 p-10 text-center sm:p-16">
              <motion.div
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-[80px]"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              />
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to see it in action?</h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-300">Set up your first business and QR campaign in under five minutes — completely free to start.</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full shadow-glow sm:w-auto">Get Started Free <ArrowRight size={16} /></Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </Reveal>
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
