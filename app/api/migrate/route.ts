import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.STATS_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const keys = await redis.keys("counted:*");
  let migrated = 0;

  for (const k of keys) {
    const raw = await redis.get(k);
    
    // Sirf "1" wale purane entries fix karo
    if (raw === "1" || raw === 1) {
      const userId = k.replace("counted:", "");
      const source = (await redis.get<string>(`source:${userId}`)) ?? "direct";
      
      await redis.set(k, JSON.stringify({
        userId: parseInt(userId),
        firstName: "Unknown",
        username: null,
        source,
        joinedAt: new Date().toISOString(),
      }));
      migrated++;
    }
  }

  return NextResponse.json({ migrated, total: keys.length });
}