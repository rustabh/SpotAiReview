import { NextResponse } from "next/server";
import { completeSocialConnect } from "@/actions/social";
import { verifyState } from "@/lib/social/crypto";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error_message") ?? searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(`${origin}/dashboard/social?error=${encodeURIComponent(oauthError)}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${origin}/dashboard/social?error=${encodeURIComponent("Facebook didn't return an authorization code.")}`);
  }

  let businessId: string;
  try {
    ({ businessId } = verifyState<{ businessId: string }>(state));
  } catch {
    return NextResponse.redirect(`${origin}/dashboard/social?error=${encodeURIComponent("This connection link has expired or is invalid — please try again.")}`);
  }

  const result = await completeSocialConnect(businessId, code);
  if (!result.ok) {
    return NextResponse.redirect(`${origin}/dashboard/social?businessId=${businessId}&error=${encodeURIComponent(result.error)}`);
  }
  if (result.data.needsPagePick) {
    return NextResponse.redirect(`${origin}/dashboard/social/select-page?businessId=${businessId}`);
  }
  return NextResponse.redirect(`${origin}/dashboard/social?businessId=${businessId}&connected=1`);
}
