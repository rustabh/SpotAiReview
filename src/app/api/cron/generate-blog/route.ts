import { NextResponse } from "next/server";
import { runDailyBlogGeneration } from "@/actions/blog";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDailyBlogGeneration(4);
  return NextResponse.json({ ok: true, published: result.created });
}
