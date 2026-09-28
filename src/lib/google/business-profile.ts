import "server-only";

// Google splits "Business Profile" across a few API hosts. Reviews specifically still live under
// the older My Business API (v4) — there is no newer replacement for review read/reply as of this
// writing. Access to all of these requires Google to approve a Business Profile API access request
// for the OAuth client below; that approval is a manual step only the business/developer can do —
// nothing in this codebase can skip it.
const OAUTH_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const ACCOUNTS_API = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFO_API = "https://mybusinessbusinessinformation.googleapis.com/v1";
const REVIEWS_API = "https://mybusiness.googleapis.com/v4";

const SCOPE = "https://www.googleapis.com/auth/business.manage";

export function isGoogleBusinessConfigured() {
  return Boolean(process.env.GOOGLE_BUSINESS_CLIENT_ID && process.env.GOOGLE_BUSINESS_CLIENT_SECRET);
}

function redirectUri() {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/google-business/callback`;
}

/** Builds the URL to send the business owner to for Google's consent screen. `state` round-trips the businessId + a CSRF token. */
export function getAuthorizationUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_BUSINESS_CLIENT_ID ?? "",
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // forces a refresh_token every time, not just on first-ever authorization
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_BUSINESS_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status}): ${await res.text().catch(() => "")}`);
  const data = await res.json();
  if (!data.refresh_token) {
    throw new Error("Google did not return a refresh token — the owner may need to revoke prior access at myaccount.google.com/permissions and reconnect.");
  }
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: Date.now() + data.expires_in * 1000 };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number }> {
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_BUSINESS_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed (${res.status}): ${await res.text().catch(() => "")}`);
  const data = await res.json();
  return { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
}

async function googleGet(url: string, accessToken: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Google API request failed (${res.status}) for ${url}: ${await res.text().catch(() => "")}`);
  return res.json();
}

export interface GoogleAccount {
  name: string; // "accounts/106..."
  accountName: string;
}

export async function listAccounts(accessToken: string): Promise<GoogleAccount[]> {
  const data = await googleGet(`${ACCOUNTS_API}/accounts`, accessToken);
  return (data.accounts ?? []).map((a: { name: string; accountName?: string }) => ({ name: a.name, accountName: a.accountName ?? a.name }));
}

export interface GoogleLocation {
  name: string; // "accounts/106.../locations/456..."
  title: string;
}

export async function listLocations(accessToken: string, accountName: string): Promise<GoogleLocation[]> {
  const params = new URLSearchParams({ readMask: "name,title" });
  const data = await googleGet(`${BUSINESS_INFO_API}/${accountName}/locations?${params.toString()}`, accessToken);
  return (data.locations ?? []).map((l: { name: string; title?: string }) => ({ name: l.name, title: l.title ?? l.name }));
}

const STAR_RATING_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

export interface GoogleFetchedReview {
  reviewName: string; // full resource name — stable external id
  reviewerName: string;
  reviewerPhotoUrl?: string;
  starRating: number;
  comment: string | null;
  createTime: string;
  updateTime: string;
  hasReply: boolean;
}

/** locationName is the full "accounts/.../locations/..." resource name — reviews live under the v4 host, not the location's own account host. */
export async function listReviews(accessToken: string, locationName: string): Promise<GoogleFetchedReview[]> {
  const data = await googleGet(`${REVIEWS_API}/${locationName}/reviews`, accessToken);
  return (data.reviews ?? []).map(
    (r: {
      name: string;
      reviewer?: { displayName?: string; profilePhotoUrl?: string };
      starRating?: string;
      comment?: string;
      createTime: string;
      updateTime: string;
      reviewReply?: unknown;
    }) => ({
      reviewName: r.name,
      reviewerName: r.reviewer?.displayName ?? "A Google user",
      reviewerPhotoUrl: r.reviewer?.profilePhotoUrl,
      starRating: STAR_RATING_MAP[r.starRating ?? ""] ?? 0,
      comment: r.comment ?? null,
      createTime: r.createTime,
      updateTime: r.updateTime,
      hasReply: Boolean(r.reviewReply),
    })
  );
}

/** reviewName is the review's own full resource name (…/reviews/{reviewId}), not the location's. */
export async function postReviewReply(accessToken: string, reviewName: string, comment: string): Promise<void> {
  const res = await fetch(`${REVIEWS_API}/${reviewName}/reply`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  if (!res.ok) throw new Error(`Posting the reply to Google failed (${res.status}): ${await res.text().catch(() => "")}`);
}
