"use server";

import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { slugify } from "@/lib/utils";
import { BLOG_SEED_POSTS } from "@/lib/blog-seed-content";

export async function listPublishedBlogPosts() {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: true,
      coverEmoji: true,
      readingMinutes: true,
      publishedAt: true,
    },
  });
}

export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
}

export async function listRelatedBlogPosts(excludeSlug: string, take = 3) {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED", slug: { not: excludeSlug } },
    orderBy: { publishedAt: "desc" },
    take,
    select: { title: true, slug: true, excerpt: true, coverEmoji: true, category: true },
  });
}

/** Rotating topics used once the hand-curated seed pool has been fully published. */
const LIVE_TOPIC_ROTATION = [
  "How local restaurants can turn table QR codes into a steady stream of Google reviews",
  "A salon and spa owner's guide to collecting more 5-star Google reviews",
  "Why clinics and healthcare practices should never ignore negative patient feedback",
  "Setting up your first Google Business Profile review strategy from scratch",
  "How hotels can use NFC room key cards to boost guest review rates",
  "The psychology of why customers don't leave reviews (and how to fix it)",
  "Google review response templates for local businesses (with examples)",
  "How multi-location businesses can manage reviews across every branch",
];

/**
 * Publishes up to `count` new blog posts. Draws first from the hand-curated
 * seed pool (guaranteed high quality, works with zero AI provider keys),
 * then falls back to live AI generation via the configured provider once
 * the pool is exhausted. Designed to be called once a day by a scheduled
 * cron job so the blog keeps growing automatically.
 */
export async function runDailyBlogGeneration(count = 4) {
  const existingSlugs = new Set((await prisma.blogPost.findMany({ select: { slug: true } })).map((p) => p.slug));
  const unpublishedSeeds = BLOG_SEED_POSTS.filter((p) => !existingSlugs.has(p.slug));

  const created: string[] = [];
  const provider = await getAIProvider();

  for (let i = 0; i < count; i++) {
    if (unpublishedSeeds.length > 0) {
      const seed = unpublishedSeeds.shift()!;
      await prisma.blogPost.create({
        data: {
          title: seed.title,
          slug: seed.slug,
          excerpt: seed.excerpt,
          content: seed.content,
          category: seed.category,
          coverEmoji: seed.coverEmoji,
          keywords: seed.keywords,
          metaTitle: seed.metaTitle,
          metaDescription: seed.metaDescription,
          readingMinutes: seed.readingMinutes,
          status: "PUBLISHED",
          generatedBy: "curated",
        },
      });
      created.push(seed.slug);
      continue;
    }

    const topic = LIVE_TOPIC_ROTATION[Math.floor(Math.random() * LIVE_TOPIC_ROTATION.length)];
    try {
      const article = await provider.generateBlogArticle(topic);
      let slug = slugify(article.title);
      if (existingSlugs.has(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      existingSlugs.add(slug);

      await prisma.blogPost.create({
        data: {
          title: article.title,
          slug,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category,
          keywords: article.keywords,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          readingMinutes: article.readingMinutes,
          status: "PUBLISHED",
          generatedBy: provider.name.toLowerCase(),
        },
      });
      created.push(slug);
    } catch {
      // A transient AI provider failure shouldn't fail the whole cron run.
      continue;
    }
  }

  return { created };
}
