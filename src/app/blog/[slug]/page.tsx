import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBlogPostBySlug, listRelatedBlogPosts } from "@/actions/blog";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords as string[],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.metaTitle,
      description: post.metaDescription,
      publishedTime: post.publishedAt.toISOString(),
    },
    twitter: {
      card: "summary",
      title: post.metaTitle,
      description: post.metaDescription,
    },
  };
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await listRelatedBlogPosts(slug, 3);
  const html = await marked.parse(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Febble Spot" },
    publisher: { "@type": "Organization", name: "AiReview by Febble Spot" },
    keywords: (post.keywords as string[]).join(", "),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/"><Logo size={30} wordmarkClassName="text-sm" /></Link>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/register"><Button size="sm">Get Started Free</Button></Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-14">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-foreground">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-3xl">{post.coverEmoji}</span>
          <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">{post.category}</span>
        </div>
        <h1 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-ink-400">
          <span>{formatDate(post.publishedAt)}</span>
          <span className="flex items-center gap-1"><Clock size={13} /> {post.readingMinutes} min read</span>
        </div>

        <div
          className="prose prose-slate mt-10 max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline dark:prose-invert"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <Card className="mt-14 bg-ink-900 p-8 text-center">
          <h2 className="font-heading text-xl font-bold text-white">Ready to collect your own five-star reviews?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-300">
            Set up a QR code review campaign in under five minutes — free to start.
          </p>
          <Link href="/register" className="mt-5 inline-block">
            <Button size="lg" className="shadow-glow">Get Started Free</Button>
          </Link>
        </Card>

        {related.length > 0 && (
          <div className="mt-16">
            <h3 className="font-heading text-lg font-bold text-foreground">Related articles</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`}>
                  <Card className="h-full p-4 transition-shadow hover:shadow-soft">
                    <span className="text-xl">{r.coverEmoji}</span>
                    <p className="mt-2 text-sm font-semibold leading-snug text-foreground">{r.title}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Logo size={24} wordmarkClassName="text-xs" tagline={false} />
          <p className="flex items-center gap-1.5 text-xs text-ink-400"><ShieldCheck size={13} /> Powered by Febble Spot</p>
        </div>
      </footer>
    </div>
  );
}
