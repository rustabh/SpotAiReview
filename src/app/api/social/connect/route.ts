import { NextResponse } from "next/server";
import { getSocialConnectUrl } from "@/actions/social";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const businessId = searchParams.get("businessId");
  if (!businessId) return NextResponse.redirect(`${origin}/dashboard/social?error=missing_business`);

  const result = await getSocialConnectUrl(businessId);
  if (!result.ok) {
    return NextResponse.redirect(`${origin}/dashboard/social?businessId=${businessId}&error=${encodeURIComponent(result.error)}`);
  }
  return NextResponse.redirect(result.data.url);
}
