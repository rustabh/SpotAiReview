import { NextResponse } from "next/server";
import { completeGoogleConnect } from "@/actions/google-reviews";
import { verifyState } from "@/lib/google/crypto";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(`${origin}/dashboard/google-reviews?error=${encodeURIComponent(oauthError)}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${origin}/dashboard/google-reviews?error=${encodeURIComponent("Google didn't return an authorization code.")}`);
  }

  let businessId: string;
  try {
    ({ businessId } = verifyState<{ businessId: string }>(state));
  } catch {
    return NextResponse.redirect(`${origin}/dashboard/google-reviews?error=${encodeURIComponent("This connection link has expired or is invalid — please try again.")}`);
  }

  const result = await completeGoogleConnect(businessId, code);
  if (!result.ok) {
    return NextResponse.redirect(`${origin}/dashboard/google-reviews?businessId=${businessId}&error=${encodeURIComponent(result.error)}`);
  }
  if (result.data.needsLocationPick) {
    return NextResponse.redirect(`${origin}/dashboard/google-reviews/select-location?businessId=${businessId}`);
  }
  return NextResponse.redirect(`${origin}/dashboard/google-reviews?businessId=${businessId}&connected=1`);
}
