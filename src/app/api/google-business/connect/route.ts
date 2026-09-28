import { NextResponse } from "next/server";
import { getGoogleConnectUrl } from "@/actions/google-reviews";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const businessId = searchParams.get("businessId");
  if (!businessId) return NextResponse.redirect(`${origin}/dashboard/google-reviews?error=missing_business`);

  const result = await getGoogleConnectUrl(businessId);
  if (!result.ok) {
    return NextResponse.redirect(`${origin}/dashboard/google-reviews?businessId=${businessId}&error=${encodeURIComponent(result.error)}`);
  }
  return NextResponse.redirect(result.data.url);
}
