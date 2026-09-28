import type { GoogleLocationDetails } from "./business-profile";

export type GmbAuditCheckStatus = "pass" | "warn" | "fail";

export interface GmbAuditCheck {
  id: string;
  label: string;
  status: GmbAuditCheckStatus;
  detail: string;
  recommendation: string | null; // null once it's already passing
  weight: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number | null;
  repliedCount: number;
  hasReviewInLast30Days: boolean;
}

/**
 * Every check is derived from data Google itself surfaces (profile completeness) or from our own
 * synced review data (engagement signals) — nothing here is invented. Weights sum to 100; a "warn"
 * counts as half credit, "fail" as none.
 */
export function computeGmbAuditChecklist(details: GoogleLocationDetails, stats: ReviewStats): GmbAuditCheck[] {
  const replyRate = stats.totalReviews > 0 ? stats.repliedCount / stats.totalReviews : 0;

  const checks: GmbAuditCheck[] = [
    {
      id: "description",
      label: "Business description",
      weight: 20,
      ...(!details.description
        ? { status: "fail", detail: "No description set.", recommendation: "Add a business description (150+ characters) that describes what you offer — Google uses it to match your profile to relevant searches." }
        : details.description.length < 100
          ? { status: "warn", detail: `Only ${details.description.length} characters.`, recommendation: "Expand your description to at least 150 characters, covering what makes your business worth choosing." }
          : { status: "pass", detail: `${details.description.length} characters.`, recommendation: null }),
    },
    {
      id: "website",
      label: "Website link",
      weight: 10,
      ...(details.websiteUri
        ? { status: "pass" as const, detail: details.websiteUri, recommendation: null }
        : { status: "fail" as const, detail: "No website set.", recommendation: "Add your website URL — profiles with a website convert and rank better in local search." }),
    },
    {
      id: "phone",
      label: "Phone number",
      weight: 10,
      ...(details.phone
        ? { status: "pass" as const, detail: details.phone, recommendation: null }
        : { status: "fail" as const, detail: "No phone number set.", recommendation: "Add a phone number — Google treats an unreachable business as lower quality." }),
    },
    {
      id: "hours",
      label: "Business hours",
      weight: 10,
      ...(details.hasRegularHours
        ? { status: "pass" as const, detail: "Hours are set.", recommendation: null }
        : { status: "fail" as const, detail: "No regular hours set.", recommendation: "Add your business hours — Google deprioritizes profiles with missing hours, and customers skip past \"hours unknown\" listings." }),
    },
    {
      id: "address",
      label: "Complete address",
      weight: 10,
      ...(details.hasCompleteAddress
        ? { status: "pass" as const, detail: "Address looks complete.", recommendation: null }
        : { status: "warn" as const, detail: "Address is missing some fields.", recommendation: "Fill in every address field (street, city, postal code) — an incomplete address hurts your appearance in \"near me\" searches." }),
    },
    {
      id: "categories",
      label: "Business categories",
      weight: 5,
      ...(details.additionalCategoryCount >= 2
        ? { status: "pass" as const, detail: `${details.additionalCategoryCount} additional categories.`, recommendation: null }
        : details.additionalCategoryCount === 1
          ? { status: "warn" as const, detail: "1 additional category.", recommendation: "Add 1-2 more relevant categories — extra categories help you show up for more search terms." }
          : { status: "warn" as const, detail: "No additional categories.", recommendation: "Add a few relevant additional categories alongside your primary one — this is one of the easiest ranking wins available." }),
    },
    {
      id: "reviewCount",
      label: "Review volume",
      weight: 10,
      ...(stats.totalReviews >= 10
        ? { status: "pass" as const, detail: `${stats.totalReviews} reviews.`, recommendation: null }
        : stats.totalReviews >= 3
          ? { status: "warn" as const, detail: `${stats.totalReviews} reviews.`, recommendation: "Ask more happy customers for a Google review — review count is one of the strongest local ranking signals." }
          : { status: "fail" as const, detail: `${stats.totalReviews} review${stats.totalReviews === 1 ? "" : "s"}.`, recommendation: "You have very few reviews. Make asking for a Google review part of every checkout or visit — this matters more than almost anything else here." }),
    },
    {
      id: "rating",
      label: "Average rating",
      weight: 10,
      ...(stats.averageRating === null
        ? { status: "fail" as const, detail: "No reviews yet.", recommendation: "Once you have reviews, keep an eye on your average — it directly affects how often Google surfaces you over competitors." }
        : stats.averageRating >= 4.2
          ? { status: "pass" as const, detail: `${stats.averageRating.toFixed(1)} average.`, recommendation: null }
          : stats.averageRating >= 3.5
            ? { status: "warn" as const, detail: `${stats.averageRating.toFixed(1)} average.`, recommendation: "Your rating is decent but has room to grow — address recurring complaints and keep replying to reviews." }
            : { status: "fail" as const, detail: `${stats.averageRating.toFixed(1)} average.`, recommendation: "Your rating is hurting your ranking. Look for a pattern in recent low-rated reviews and fix the underlying issue directly." }),
    },
    {
      id: "replyRate",
      label: "Review reply rate",
      weight: 10,
      ...(stats.totalReviews === 0
        ? { status: "warn" as const, detail: "No reviews to reply to yet.", recommendation: null }
        : replyRate >= 0.8
          ? { status: "pass" as const, detail: `${Math.round(replyRate * 100)}% replied to.`, recommendation: null }
          : replyRate >= 0.4
            ? { status: "warn" as const, detail: `${Math.round(replyRate * 100)}% replied to.`, recommendation: "Reply to more of your reviews from the Google Reviews tab — Google's algorithm favors profiles that actively engage with customers." }
            : { status: "fail" as const, detail: `${Math.round(replyRate * 100)}% replied to.`, recommendation: "Most of your reviews have no reply. Turn on auto-post or approve the AI drafts waiting in your Google Reviews tab." }),
    },
    {
      id: "recency",
      label: "Recent review activity",
      weight: 5,
      ...(stats.hasReviewInLast30Days
        ? { status: "pass" as const, detail: "At least one review in the last 30 days.", recommendation: null }
        : { status: "fail" as const, detail: "No reviews in the last 30 days.", recommendation: "Review recency matters as much as total count — ask your most recent customers for a review this week." }),
    },
  ];

  return checks;
}

export function scoreChecklist(checks: GmbAuditCheck[]): number {
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce((sum, c) => sum + c.weight * (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0), 0);
  return Math.round((earned / totalWeight) * 100);
}
