import "server-only";

// Meta's Graph API covers Facebook Pages and, through a Page's linked Instagram Business
// account, Instagram too — one OAuth connection to a Page brings both. Publishing with
// pages_manage_posts and instagram_content_publish requires Meta's App Review approval
// once the app moves out of development mode; that approval is a manual step only the
// developer can do on Meta's side — nothing in this codebase can skip it.
const GRAPH_API_VERSION = "v21.0";
const GRAPH_API = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
const OAUTH_DIALOG = `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth`;

const SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
].join(",");

export function isSocialConfigured() {
  return Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && process.env.SOCIAL_TOKEN_ENCRYPTION_KEY);
}

function redirectUri() {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/social/callback`;
}

/** Builds the URL to send the business owner to for Facebook's consent screen. `state` round-trips the businessId + a CSRF token. */
export function getAuthorizationUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID ?? "",
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES,
    state,
  });
  return `${OAUTH_DIALOG}?${params.toString()}`;
}

async function graphGet(path: string, params: Record<string, string>) {
  const url = `${GRAPH_API}/${path}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Facebook API request failed (${res.status}) for ${path}: ${await res.text().catch(() => "")}`);
  return res.json();
}

async function graphPost(path: string, body: Record<string, string>) {
  const res = await fetch(`${GRAPH_API}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Facebook API request failed (${res.status}) for ${path}: ${await res.text().catch(() => "")}`);
  return res.json();
}

/** Exchanges the OAuth `code` for a short-lived user access token. */
export async function exchangeCodeForUserToken(code: string): Promise<string> {
  const data = await graphGet("oauth/access_token", {
    client_id: process.env.FACEBOOK_APP_ID ?? "",
    client_secret: process.env.FACEBOOK_APP_SECRET ?? "",
    redirect_uri: redirectUri(),
    code,
  });
  return data.access_token as string;
}

/** Trades a short-lived user token for a long-lived one (~60 days) that Page tokens derived from it inherit. */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<string> {
  const data = await graphGet("oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: process.env.FACEBOOK_APP_ID ?? "",
    client_secret: process.env.FACEBOOK_APP_SECRET ?? "",
    fb_exchange_token: shortLivedToken,
  });
  return data.access_token as string;
}

export interface SocialPage {
  id: string;
  name: string;
  accessToken: string;
  instagramAccountId: string | null;
  instagramUsername: string | null;
}

/** Lists the Facebook Pages this user manages, each with its own (effectively non-expiring) Page access token and linked Instagram Business account, if any. */
export async function listPages(userAccessToken: string): Promise<SocialPage[]> {
  const data = await graphGet("me/accounts", {
    access_token: userAccessToken,
    fields: "id,name,access_token,instagram_business_account{id,username}",
  });
  return (data.data ?? []).map(
    (p: { id: string; name: string; access_token: string; instagram_business_account?: { id: string; username?: string } }) => ({
      id: p.id,
      name: p.name,
      accessToken: p.access_token,
      instagramAccountId: p.instagram_business_account?.id ?? null,
      instagramUsername: p.instagram_business_account?.username ?? null,
    })
  );
}

/** Posts a photo with a caption to a Facebook Page's timeline. Returns the new post's id. */
export async function publishToFacebookPage(pageAccessToken: string, pageId: string, imageUrl: string, caption: string): Promise<string> {
  const data = await graphPost(`${pageId}/photos`, { url: imageUrl, caption, access_token: pageAccessToken });
  return (data.post_id as string) ?? (data.id as string);
}

/** Instagram publishing is two calls: create a media container, then publish it. Returns the new media's id. */
export async function publishToInstagram(pageAccessToken: string, igUserId: string, imageUrl: string, caption: string): Promise<string> {
  const container = await graphPost(`${igUserId}/media`, { image_url: imageUrl, caption, access_token: pageAccessToken });
  const published = await graphPost(`${igUserId}/media_publish`, { creation_id: container.id as string, access_token: pageAccessToken });
  return published.id as string;
}
