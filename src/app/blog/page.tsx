import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Clock } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listPublishedBlogPosts } from "@/actions/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides on getting more Google reviews, QR code review campaigns, review standees, NFC tags, and how AI-assisted review writing works — from AiReview by Febble Spot.",
};

export const revalidate = 3600;

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BlogIndexPage() {
  const posts = await listPublishedBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/"><Logo size={30} wordmarkClassName="text-sm" /></Link>
          <div className="flex items-center gap-2">
            <Link href="/#pricing" className="hidden text-sm font-medium text-ink-500 hover:text-foreground sm:inline-flex">
              <span className="rounded-full px-3 py-1.5">Pricing</span>
            </Link>
            <Link href="/about" className="hidden text-sm font-medium text-ink-500 hover:text-foreground sm:inline-flex">
              <span className="rounded-full px-3 py-1.5">About</span>
            </Link>
            <ThemeToggle />
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/register"><Button size="sm">Get Started Free</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-12 pt-16 text-center sm:pt-24">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">The AiReview Blog</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-500">
          Practical guides on getting more Google reviews, QR code and NFC review campaigns, and how grounded
          AI-assisted review writing actually works.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {posts.length === 0 ? (
          <p className="py-16 text-center text-ink-400">New articles are on the way — check back soon.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full p-6 transition-shadow hover:shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{post.coverEmoji}</span>
                    <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="mt-4 font-heading text-lg font-bold leading-snug text-foreground">{post.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-ink-400">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readingMinutes} min read</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
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
