import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncConnection } from "@/actions/google-reviews";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await prisma.googleBusinessConnection.findMany({ where: { status: "CONNECTED" } });
  let synced = 0;
  for (const connection of connections) {
    await syncConnection(connection.id);
    synced++;
  }

  return NextResponse.json({ ok: true, synced });
}
