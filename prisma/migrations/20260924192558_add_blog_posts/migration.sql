-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverEmoji" TEXT NOT NULL DEFAULT '✨',
    "category" TEXT NOT NULL DEFAULT 'Guides',
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "readingMinutes" INTEGER NOT NULL DEFAULT 8,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "generatedBy" TEXT NOT NULL DEFAULT 'mock',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");
