"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/rbac";
import { getAIProvider } from "@/lib/ai";
import {
  isSocialConfigured,
  getAuthorizationUrl,
  exchangeCodeForUserToken,
  exchangeForLongLivedToken,
  listPages,
  publishToFacebookPage,
  publishToInstagram,
  type SocialPage,
} from "@/lib/social/meta";
import { saveUserToken, savePageToken, getUserAccessToken, getPageAccessToken } from "@/lib/social/tokens";
import { signState } from "@/lib/social/crypto";
import type { ActionResult } from "./auth";
import type { $Enums, Prisma } from "@prisma/client";

export { isSocialConfigured };

/** Kicks off the OAuth connect flow — the returned URL sends the owner to Facebook's consent screen. */
export async function getSocialConnectUrl(businessId: string): Promise<ActionResult<{ url: string }>> {
  await requireBusinessAccess(businessId);
  if (!isSocialConfigured()) {
    return { ok: false, error: "Social auto-posting isn't configured on this platform yet." };
  }
  const state = signState({ businessId, nonce: randomUUID() });
  return { ok: true, data: { url: getAuthorizationUrl(state) } };
}

async function selectPageInternal(connectionId: string, page: SocialPage) {
  await savePageToken(connectionId, page.accessToken);
  await prisma.socialConnection.update({
    where: { id: connectionId },
    data: {
      status: "CONNECTED",
      facebookPageId: page.id,
      facebookPageName: page.name,
      instagramAccountId: page.instagramAccountId,
      instagramUsername: page.instagramUsername,
    },
  });
}

/** Called by the OAuth callback route after Facebook redirects back with a code. */
export async function completeSocialConnect(businessId: string, code: string): Promise<ActionResult<{ needsPagePick: boolean }>> {
  const { user } = await requireBusinessAccess(businessId);

  const shortLived = await exchangeCodeForUserToken(code);
  const userAccessToken = await exchangeForLongLivedToken(shortLived);

  const connection = await prisma.socialConnection.upsert({
    where: { businessId },
    create: { businessId, connectedById: user.id, status: "PENDING_PAGE" },
    update: { status: "PENDING_PAGE", lastError: null },
  });
  await saveUserToken(connection.id, userAccessToken);

  let pages: SocialPage[];
  try {
    pages = await listPages(userAccessToken);
  } catch (err) {
    await prisma.socialConnection.update({ where: { id: connection.id }, data: { status: "AUTH_ERROR", lastError: (err as Error).message } });
    return { ok: false, error: "Could not read your Facebook Pages. Please try reconnecting." };
  }

  if (pages.length === 0) {
    await prisma.socialConnection.update({
      where: { id: connection.id },
      data: { status: "AUTH_ERROR", lastError: "No Facebook Pages found on this Facebook account." },
    });
    return { ok: false, error: "No Facebook Pages found on that account — you need to manage at least one Page to connect." };
  }

  if (pages.length === 1) {
    await selectPageInternal(connection.id, pages[0]);
    revalidatePath("/dashboard/social");
    return { ok: true, data: { needsPagePick: false } };
  }

  revalidatePath("/dashboard/social");
  return { ok: true, data: { needsPagePick: true } };
}

/** Re-fetches the candidate Pages for a connection that's mid-setup (PENDING_PAGE) — used by the page-picker screen. */
export async function listPendingPages(businessId: string): Promise<ActionResult<SocialPage[]>> {
  await requireBusinessAccess(businessId);
  const connection = await prisma.socialConnection.findUnique({ where: { businessId } });
  if (!connection) return { ok: false, error: "No pending social connection found." };

  const userAccessToken = await getUserAccessToken(connection.id);
  const pages = await listPages(userAccessToken);
  return { ok: true, data: pages };
}

export async function selectSocialPage(businessId: string, pageId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  const connection = await prisma.socialConnection.findUnique({ where: { businessId } });
  if (!connection) return { ok: false, error: "No pending social connection found." };

  const userAccessToken = await getUserAccessToken(connection.id);
  const pages = await listPages(userAccessToken);
  const page = pages.find((p) => p.id === pageId);
  if (!page) return { ok: false, error: "That Page could not be found — it may have been removed." };

  await selectPageInternal(connection.id, page);
  revalidatePath("/dashboard/social");
  return { ok: true, data: undefined };
}

export async function disconnectSocial(businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  await prisma.socialConnection.delete({ where: { businessId } }).catch(() => null);
  revalidatePath("/dashboard/social");
  return { ok: true, data: undefined };
}

export async function setSocialAutoPostEnabled(businessId: string, enabled: boolean): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  await prisma.socialConnection.update({ where: { businessId }, data: { autoPostEnabled: enabled } });
  revalidatePath("/dashboard/social");
  return { ok: true, data: undefined };
}

export type SocialPostView = {
  id: string;
  imageUrl: string;
  caption: string;
  hashtags: string[];
  status: $Enums.SocialPostStatus;
  facebookPostId: string | null;
  instagramPostId: string | null;
  postedAt: Date | null;
  error: string | null;
  createdAt: Date;
  productName: string | null;
};

export type SocialPageData = {
  configured: boolean;
  connection: {
    status: $Enums.SocialConnectionStatus;
    facebookPageName: string | null;
    instagramUsername: string | null;
    autoPostEnabled: boolean;
    lastError: string | null;
  } | null;
  posts: SocialPostView[];
};

function toView(post: { id: string; imageUrl: string; caption: string; hashtags: Prisma.JsonValue; status: $Enums.SocialPostStatus; facebookPostId: string | null; instagramPostId: string | null; postedAt: Date | null; error: string | null; createdAt: Date; product: { name: string } | null }): SocialPostView {
  return {
    id: post.id,
    imageUrl: post.imageUrl,
    caption: post.caption,
    hashtags: Array.isArray(post.hashtags) ? (post.hashtags as string[]) : [],
    status: post.status,
    facebookPostId: post.facebookPostId,
    instagramPostId: post.instagramPostId,
    postedAt: post.postedAt,
    error: post.error,
    createdAt: post.createdAt,
    productName: post.product?.name ?? null,
  };
}

export async function getSocialPageData(businessId: string): Promise<SocialPageData> {
  await requireBusinessAccess(businessId);
  const connection = await prisma.socialConnection.findUnique({
    where: { businessId },
    include: { posts: { orderBy: { createdAt: "desc" }, include: { product: true } } },
  });

  return {
    configured: isSocialConfigured(),
    connection: connection
      ? {
          status: connection.status,
          facebookPageName: connection.facebookPageName,
          instagramUsername: connection.instagramUsername,
          autoPostEnabled: connection.autoPostEnabled,
          lastError: connection.lastError,
        }
      : null,
    posts: connection?.posts.map(toView) ?? [],
  };
}

/** Picks a product to post about: a real menu photo the customer menu already shows, never an invented one. Avoids repeating the last few products posted. */
async function pickProductForPost(businessId: string) {
  const recent = await prisma.socialPost.findMany({
    where: { businessId, productId: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { productId: true },
  });
  const excludeIds = recent.map((r) => r.productId).filter((id): id is string => Boolean(id));

  const fresh = await prisma.product.findMany({
    where: { businessId, isAvailable: true, imageUrl: { not: null }, id: { notIn: excludeIds } },
    take: 20,
  });
  const pool = fresh.length > 0 ? fresh : await prisma.product.findMany({ where: { businessId, isAvailable: true, imageUrl: { not: null } }, take: 20 });
  if (pool.length === 0) return null;

  return pool[Math.floor(Math.random() * pool.length)];
}

function composeCaption(post: { caption: string; hashtags: Prisma.JsonValue }): string {
  const tags = Array.isArray(post.hashtags) ? (post.hashtags as string[]) : [];
  const hashtagLine = tags.length ? `\n\n${tags.map((t) => `#${t}`).join(" ")}` : "";
  return `${post.caption}${hashtagLine}`;
}

/** Publishes a draft to every connected platform (Facebook, and Instagram if linked) — shared by "Post Now" and auto-post. */
async function attemptPublish(postId: string): Promise<void> {
  const post = await prisma.socialPost.findUniqueOrThrow({ where: { id: postId }, include: { socialConnection: true } });
  const connection = post.socialConnection;
  const fullCaption = composeCaption(post);

  let facebookPostId: string | null = null;
  let instagramPostId: string | null = null;
  const errors: string[] = [];

  try {
    const pageAccessToken = await getPageAccessToken(connection.id);

    if (connection.facebookPageId) {
      try {
        facebookPostId = await publishToFacebookPage(pageAccessToken, connection.facebookPageId, post.imageUrl, fullCaption);
      } catch (err) {
        errors.push(`Facebook: ${(err as Error).message}`);
      }
    }

    if (connection.instagramAccountId) {
      try {
        instagramPostId = await publishToInstagram(pageAccessToken, connection.instagramAccountId, post.imageUrl, fullCaption);
      } catch (err) {
        errors.push(`Instagram: ${(err as Error).message}`);
      }
    }
  } catch (err) {
    errors.push((err as Error).message);
  }

  const attemptedCount = [connection.facebookPageId, connection.instagramAccountId].filter(Boolean).length;
  const succeededCount = [facebookPostId, instagramPostId].filter(Boolean).length;
  const status: $Enums.SocialPostStatus = succeededCount === 0 ? "FAILED" : succeededCount < attemptedCount ? "PARTIAL" : "POSTED";

  await prisma.socialPost.update({
    where: { id: postId },
    data: {
      status,
      facebookPostId,
      instagramPostId,
      error: errors.length ? errors.join(" | ") : null,
      postedAt: succeededCount > 0 ? new Date() : null,
    },
  });
}

/** Shared by the owner's "Generate New Post" button and the weekly cron route. */
export async function generatePostForConnection(connectionId: string): Promise<void> {
  const connection = await prisma.socialConnection.findUniqueOrThrow({ where: { id: connectionId } });
  if (connection.status !== "CONNECTED") return;

  try {
    const business = await prisma.business.findUniqueOrThrow({ where: { id: connection.businessId }, include: { category: true } });
    const product = await pickProductForPost(connection.businessId);
    const imageUrl = product?.imageUrl ?? business.coverImageUrl ?? business.logoUrl;
    if (!imageUrl) {
      await prisma.socialConnection.update({
        where: { id: connectionId },
        data: { lastError: "No product photos or cover image available to post yet — add one on the menu or business profile." },
      });
      return;
    }

    const provider = await getAIProvider();
    const generated = await provider.generateSocialCaption({
      businessName: business.name,
      categoryName: business.category.name,
      productName: product?.name ?? business.name,
      productDescription: product?.description ?? business.description,
      isVeg: product?.isVeg ?? null,
    });

    const post = await prisma.socialPost.create({
      data: {
        businessId: connection.businessId,
        socialConnectionId: connection.id,
        productId: product?.id,
        imageUrl,
        caption: generated.caption,
        hashtags: generated.hashtags as unknown as Prisma.InputJsonValue,
        createdById: connection.connectedById,
      },
    });

    if (connection.autoPostEnabled) await attemptPublish(post.id);
    await prisma.socialConnection.update({ where: { id: connectionId }, data: { lastError: null } });
  } catch (err) {
    await prisma.socialConnection.update({ where: { id: connectionId }, data: { lastError: (err as Error).message } });
  }
}

export async function generateSocialPost(businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  const connection = await prisma.socialConnection.findUnique({ where: { businessId } });
  if (!connection || connection.status !== "CONNECTED") return { ok: false, error: "Connect Facebook/Instagram first." };

  await generatePostForConnection(connection.id);
  revalidatePath("/dashboard/social");

  const fresh = await prisma.socialConnection.findUnique({ where: { businessId } });
  if (fresh?.lastError) return { ok: false, error: fresh.lastError };
  return { ok: true, data: undefined };
}

export async function updateSocialCaption(postId: string, businessId: string, caption: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post || post.businessId !== businessId) return { ok: false, error: "Post not found." };

  await prisma.socialPost.update({ where: { id: postId }, data: { caption } });
  revalidatePath("/dashboard/social");
  return { ok: true, data: undefined };
}

export async function regenerateSocialCaption(postId: string, businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  const post = await prisma.socialPost.findUnique({ where: { id: postId }, include: { product: true } });
  if (!post || post.businessId !== businessId) return { ok: false, error: "Post not found." };

  const business = await prisma.business.findUniqueOrThrow({ where: { id: businessId }, include: { category: true } });
  const provider = await getAIProvider();
  const generated = await provider.generateSocialCaption({
    businessName: business.name,
    categoryName: business.category.name,
    productName: post.product?.name ?? business.name,
    productDescription: post.product?.description ?? business.description,
    isVeg: post.product?.isVeg ?? null,
  });

  await prisma.socialPost.update({
    where: { id: postId },
    data: { caption: generated.caption, hashtags: generated.hashtags as unknown as Prisma.InputJsonValue },
  });
  revalidatePath("/dashboard/social");
  return { ok: true, data: undefined };
}

export async function postSocialNow(postId: string, businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post || post.businessId !== businessId) return { ok: false, error: "Post not found." };

  await attemptPublish(postId);
  revalidatePath("/dashboard/social");

  const fresh = await prisma.socialPost.findUniqueOrThrow({ where: { id: postId } });
  if (fresh.status === "FAILED") return { ok: false, error: fresh.error ?? "Could not publish this post." };
  return { ok: true, data: undefined };
}

export async function deleteSocialPost(postId: string, businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post || post.businessId !== businessId) return { ok: false, error: "Post not found." };
  if (post.status === "POSTED" || post.status === "PARTIAL") return { ok: false, error: "Posts already live on a platform can't be deleted here." };

  await prisma.socialPost.delete({ where: { id: postId } });
  revalidatePath("/dashboard/social");
  return { ok: true, data: undefined };
}
