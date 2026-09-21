import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const SOURCES = ["metaig", "metafb", "metaad", "organic", "direct"];

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.STATS_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const total = (await redis.get<number>("stats:total")) ?? 0;

  const bySource: Record<string, number> = {};
  for (const source of SOURCES) {
    bySource[source] = (await redis.get<number>(`stats:source:${source}`)) ?? 0;
  }

  // Joined users list
  const keys = await redis.keys("counted:*");
  const joinedUsers = [];

  for (const k of keys) {
    const raw = await redis.get<string>(k);
    if (raw) {
      try {
        joinedUsers.push(JSON.parse(raw));
      } catch {
        // Purane "1" format wale entries skip karo
      }
    }
  }

  // Date ke hisaab se sort karo — latest pehle
  joinedUsers.sort(
    (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
  );

  return NextResponse.json({ total, bySource, joinedUsers });
}