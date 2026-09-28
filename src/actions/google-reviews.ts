"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/rbac";
import { getAIProvider } from "@/lib/ai";
import {
  isGoogleBusinessConfigured,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  listAccounts,
  listLocations,
  listReviews,
  postReviewReply,
  type GoogleAccount,
  type GoogleLocation,
} from "@/lib/google/business-profile";
import { saveTokens, getValidAccessToken } from "@/lib/google/tokens";
import { signState } from "@/lib/google/crypto";
import type { ActionResult } from "./auth";
import type { $Enums } from "@prisma/client";

export { isGoogleBusinessConfigured };

/** Kicks off the OAuth connect flow — the returned URL sends the owner to Google's consent screen. */
export async function getGoogleConnectUrl(businessId: string): Promise<ActionResult<{ url: string }>> {
  await requireBusinessAccess(businessId);
  if (!isGoogleBusinessConfigured()) {
    return { ok: false, error: "Google Business Profile isn't configured on this platform yet." };
  }
  const state = signState({ businessId, nonce: randomUUID() });
  return { ok: true, data: { url: getAuthorizationUrl(state) } };
}

/** Called by the OAuth callback route after Google redirects back with a code. */
export async function completeGoogleConnect(businessId: string, code: string): Promise<ActionResult<{ needsLocationPick: boolean }>> {
  const { user } = await requireBusinessAccess(businessId);

  const tokens = await exchangeCodeForTokens(code);

  const connection = await prisma.googleBusinessConnection.upsert({
    where: { businessId },
    create: { businessId, connectedById: user.id, status: "PENDING_LOCATION" },
    update: { status: "PENDING_LOCATION", lastError: null },
  });
  await saveTokens(connection.id, tokens);

  let accounts: GoogleAccount[];
  try {
    accounts = await listAccounts(tokens.accessToken);
  } catch (err) {
    await prisma.googleBusinessConnection.update({ where: { id: connection.id }, data: { status: "AUTH_ERROR", lastError: (err as Error).message } });
    return { ok: false, error: "Could not read your Google Business accounts. Please try reconnecting." };
  }

  const allLocations: (GoogleLocation & { accountName: string })[] = [];
  for (const account of accounts) {
    try {
      const locations = await listLocations(tokens.accessToken, account.name);
      allLocations.push(...locations.map((l) => ({ ...l, accountName: account.name })));
    } catch {
      // one account failing to list locations shouldn't block the others
    }
  }

  if (allLocations.length === 0) {
    await prisma.googleBusinessConnection.update({
      where: { id: connection.id },
      data: { status: "AUTH_ERROR", lastError: "No Google Business locations found on this Google account." },
    });
    return { ok: false, error: "No Google Business Profile locations found on that Google account." };
  }

  if (allLocations.length === 1) {
    const loc = allLocations[0];
    await prisma.googleBusinessConnection.update({
      where: { id: connection.id },
      data: { status: "CONNECTED", googleAccountName: loc.accountName, googleLocationName: loc.name, locationTitle: loc.title },
    });
    revalidatePath("/dashboard/google-reviews");
    return { ok: true, data: { needsLocationPick: false } };
  }

  revalidatePath("/dashboard/google-reviews");
  return { ok: true, data: { needsLocationPick: true } };
}

/** Re-fetches the candidate locations for a connection that's mid-setup (PENDING_LOCATION) — used by the location-picker screen. */
export async function listPendingLocations(businessId: string): Promise<ActionResult<(GoogleLocation & { accountName: string })[]>> {
  await requireBusinessAccess(businessId);
  const connection = await prisma.googleBusinessConnection.findUnique({ where: { businessId } });
  if (!connection) return { ok: false, error: "No pending Google connection found." };

  const accessToken = await getValidAccessToken(connection.id);
  const accounts = await listAccounts(accessToken);
  const allLocations: (GoogleLocation & { accountName: string })[] = [];
  for (const account of accounts) {
    const locations = await listLocations(accessToken, account.name);
    allLocations.push(...locations.map((l) => ({ ...l, accountName: account.name })));
  }
  return { ok: true, data: allLocations };
}

export async function selectGoogleLocation(businessId: string, accountName: string, locationName: string, locationTitle: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  await prisma.googleBusinessConnection.update({
    where: { businessId },
    data: { status: "CONNECTED", googleAccountName: accountName, googleLocationName: locationName, locationTitle },
  });
  revalidatePath("/dashboard/google-reviews");
  return { ok: true, data: undefined };
}

export async function disconnectGoogleBusiness(businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  await prisma.googleBusinessConnection.delete({ where: { businessId } }).catch(() => null);
  revalidatePath("/dashboard/google-reviews");
  return { ok: true, data: undefined };
}

export async function setAutoReplyEnabled(businessId: string, enabled: boolean): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  await prisma.googleBusinessConnection.update({ where: { businessId }, data: { autoReplyEnabled: enabled } });
  revalidatePath("/dashboard/google-reviews");
  return { ok: true, data: undefined };
}

export type GoogleReviewView = {
  id: string;
  reviewerName: string;
  reviewerPhotoUrl: string | null;
  starRating: number;
  comment: string | null;
  reviewCreatedAt: Date;
  replyStatus: $Enums.GoogleReplyStatus;
  draftReply: string | null;
  postedReply: string | null;
  replyError: string | null;
};

export type GoogleReviewsPageData = {
  configured: boolean;
  connection: {
    status: $Enums.GoogleConnectionStatus;
    locationTitle: string | null;
    autoReplyEnabled: boolean;
    lastSyncAt: Date | null;
    lastError: string | null;
  } | null;
  reviews: GoogleReviewView[];
};

export async function getGoogleReviewsPageData(businessId: string): Promise<GoogleReviewsPageData> {
  await requireBusinessAccess(businessId);
  const connection = await prisma.googleBusinessConnection.findUnique({
    where: { businessId },
    include: { reviews: { orderBy: { reviewCreatedAt: "desc" } } },
  });

  return {
    configured: isGoogleBusinessConfigured(),
    connection: connection
      ? {
          status: connection.status,
          locationTitle: connection.locationTitle,
          autoReplyEnabled: connection.autoReplyEnabled,
          lastSyncAt: connection.lastSyncAt,
          lastError: connection.lastError,
        }
      : null,
    reviews:
      connection?.reviews.map((r) => ({
        id: r.id,
        reviewerName: r.reviewerName,
        reviewerPhotoUrl: r.reviewerPhotoUrl,
        starRating: r.starRating,
        comment: r.comment,
        reviewCreatedAt: r.reviewCreatedAt,
        replyStatus: r.replyStatus,
        draftReply: r.draftReply,
        postedReply: r.postedReply,
        replyError: r.replyError,
      })) ?? [],
  };
}

/** Shared by the owner's "Sync now" button and the cron route — fetches new reviews and drafts (or auto-posts) AI replies. */
export async function syncConnection(connectionId: string): Promise<void> {
  const connection = await prisma.googleBusinessConnection.findUniqueOrThrow({
    where: { id: connectionId },
    include: { business: { include: { category: true } } },
  });
  if (connection.status !== "CONNECTED" || !connection.googleLocationName) return;

  try {
    const accessToken = await getValidAccessToken(connection.id);
    const fetched = await listReviews(accessToken, connection.googleLocationName);
    const provider = await getAIProvider();

    for (const r of fetched) {
      const existing = await prisma.googleReview.findUnique({ where: { googleReviewName: r.reviewName } });
      if (existing) {
        await prisma.googleReview.update({
          where: { id: existing.id },
          data: { reviewUpdatedAt: new Date(r.updateTime), comment: r.comment },
        });
        continue;
      }

      const created = await prisma.googleReview.create({
        data: {
          businessId: connection.businessId,
          googleBusinessConnectionId: connection.id,
          googleReviewName: r.reviewName,
          reviewerName: r.reviewerName,
          reviewerPhotoUrl: r.reviewerPhotoUrl,
          starRating: r.starRating,
          comment: r.comment,
          reviewCreatedAt: new Date(r.createTime),
          reviewUpdatedAt: new Date(r.updateTime),
        },
      });

      if (r.hasReply) continue; // already replied to directly on Google — leave it alone

      const draft = await provider.generateReviewReply({
        businessName: connection.business.name,
        categoryName: connection.business.category.name,
        businessDescription: connection.business.description,
        reviewerName: r.reviewerName,
        starRating: r.starRating,
        reviewComment: r.comment,
      });

      if (connection.autoReplyEnabled) {
        try {
          await postReviewReply(accessToken, r.reviewName, draft.content);
          await prisma.googleReview.update({
            where: { id: created.id },
            data: { replyStatus: "POSTED", postedReply: draft.content, repliedAt: new Date() },
          });
        } catch (err) {
          await prisma.googleReview.update({
            where: { id: created.id },
            data: { replyStatus: "FAILED", draftReply: draft.content, replyError: (err as Error).message },
          });
        }
      } else {
        await prisma.googleReview.update({ where: { id: created.id }, data: { replyStatus: "DRAFTED", draftReply: draft.content } });
      }
    }

    await prisma.googleBusinessConnection.update({ where: { id: connection.id }, data: { lastSyncAt: new Date(), lastError: null } });
  } catch (err) {
    await prisma.googleBusinessConnection.update({ where: { id: connection.id }, data: { lastError: (err as Error).message } });
  }
}

export async function syncGoogleReviewsNow(businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  const connection = await prisma.googleBusinessConnection.findUnique({ where: { businessId } });
  if (!connection) return { ok: false, error: "Not connected to a Google Business Profile." };

  await syncConnection(connection.id);
  revalidatePath("/dashboard/google-reviews");
  return { ok: true, data: undefined };
}

export async function updateDraftReply(reviewId: string, businessId: string, text: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  const review = await prisma.googleReview.findUnique({ where: { id: reviewId } });
  if (!review || review.businessId !== businessId) return { ok: false, error: "Review not found." };

  await prisma.googleReview.update({ where: { id: reviewId }, data: { draftReply: text, replyStatus: "DRAFTED" } });
  revalidatePath("/dashboard/google-reviews");
  return { ok: true, data: undefined };
}

export async function regenerateDraftReply(reviewId: string, businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  const review = await prisma.googleReview.findUnique({ where: { id: reviewId } });
  if (!review || review.businessId !== businessId) return { ok: false, error: "Review not found." };

  const business = await prisma.business.findUniqueOrThrow({ where: { id: businessId }, include: { category: true } });
  const provider = await getAIProvider();
  const draft = await provider.generateReviewReply({
    businessName: business.name,
    categoryName: business.category.name,
    businessDescription: business.description,
    reviewerName: review.reviewerName,
    starRating: review.starRating,
    reviewComment: review.comment,
  });

  await prisma.googleReview.update({ where: { id: reviewId }, data: { draftReply: draft.content, replyStatus: "DRAFTED" } });
  revalidatePath("/dashboard/google-reviews");
  return { ok: true, data: undefined };
}

export async function postReplyToGoogle(reviewId: string, businessId: string): Promise<ActionResult> {
  await requireBusinessAccess(businessId);
  const review = await prisma.googleReview.findUnique({ where: { id: reviewId } });
  if (!review || review.businessId !== businessId) return { ok: false, error: "Review not found." };
  if (!review.draftReply?.trim()) return { ok: false, error: "Write or generate a reply before posting." };

  const connection = await prisma.googleBusinessConnection.findUnique({ where: { businessId } });
  if (!connection) return { ok: false, error: "Not connected to a Google Business Profile." };

  try {
    const accessToken = await getValidAccessToken(connection.id);
    await postReviewReply(accessToken, review.googleReviewName, review.draftReply);
    await prisma.googleReview.update({
      where: { id: reviewId },
      data: { replyStatus: "POSTED", postedReply: review.draftReply, repliedAt: new Date(), replyError: null },
    });
    revalidatePath("/dashboard/google-reviews");
    return { ok: true, data: undefined };
  } catch (err) {
    await prisma.googleReview.update({ where: { id: reviewId }, data: { replyStatus: "FAILED", replyError: (err as Error).message } });
    return { ok: false, error: "Could not post the reply to Google. Please try again." };
  }
}
