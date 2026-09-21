import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import fs from "fs";
import path from "path";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_LINK = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_LINK!;
const EBOOK_PATH = path.join(process.cwd(), "private-files", "ebook.pdf");
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const KNOWN_SOURCES = ["metaig", "metafb", "metaad", "organic"];
const SOURCE_TTL_SECONDS = 3600;
const JOINED_STATUSES = ["member", "administrator", "creator"];
const LEFT_STATUSES = ["left", "kicked"];

async function callTelegram(method: string, body: BodyInit, isJson = true) {
  const res = await fetch(`${TG_API}/${method}`, {
    method: "POST",
    headers: isJson ? { "Content-Type": "application/json" } : undefined,
    body,
  });
  const data = await res.json();
  if (!data.ok) {
    console.error(`[telegram:${method}] FAILED:`, JSON.stringify(data));
  } else {
    console.log(`[telegram:${method}] ok`);
  }
  return data;
}

async function sendMessage(chatId: number, text: string, replyMarkup?: object) {
  return callTelegram(
    "sendMessage",
    JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup })
  );
}

async function sendEbook(chatId: number) {
  if (!fs.existsSync(EBOOK_PATH)) {
    console.error(`[sendEbook] ebook.pdf NOT FOUND at ${EBOOK_PATH}`);
    return;
  }
  const fileBuffer = fs.readFileSync(EBOOK_PATH);
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("caption", "Thanks for joining! Here's your free ebook 🎉");
  form.append("document", new Blob([fileBuffer]), "ebook.pdf");

  return callTelegram("sendDocument", form, false);
}

async function recordSource(userId: number, rawTag: string) {
  const tag = KNOWN_SOURCES.includes(rawTag) ? rawTag : "direct";
  await redis.set(`source:${userId}`, tag, { ex: SOURCE_TTL_SECONDS });
}

async function recordJoinOnce(
  userId: number,
  firstName: string,
  username?: string
): Promise<boolean> {
  const alreadyCounted = await redis.get(`counted:${userId}`);
  if (alreadyCounted) return false;

  const tag = (await redis.get<string>(`source:${userId}`)) ?? "direct";
  await redis.incr("stats:total");
  await redis.incr(`stats:source:${tag}`);

  // User ka pura data save karo
  await redis.set(
    `counted:${userId}`,
    JSON.stringify({
      userId,
      firstName,
      username: username ?? null,
      source: tag,
      joinedAt: new Date().toISOString(),
    })
  );

  console.log(`[recordJoin] userId ${userId} | name: ${firstName} | source: ${tag}`);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    console.log("[webhook] update received:", JSON.stringify(update));

    if (update.message?.text?.startsWith("/start")) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const [, rawTag] = update.message.text.split(" ");

      if (rawTag) {
        await recordSource(userId, rawTag);
      }

      await sendMessage(
        chatId,
        "Welcome! Tap below to join our channel — your free ebook will be sent automatically the moment you join. No extra steps.",
        {
          inline_keyboard: [[{ text: "📢 Join Channel", url: CHANNEL_LINK }]],
        }
      );
      return NextResponse.json({ ok: true });
    }

    if (update.chat_member) {
      const { old_chat_member, new_chat_member } = update.chat_member;
      const userId = new_chat_member.user.id;
      const firstName = new_chat_member.user.first_name ?? "Unknown";
      const username = new_chat_member.user.username;

      const justJoined =
        LEFT_STATUSES.includes(old_chat_member.status) &&
        JOINED_STATUSES.includes(new_chat_member.status);

      if (justJoined) {
        console.log(`[webhook] chat_member: user ${userId} (${firstName}) just joined`);
        const isNewJoin = await recordJoinOnce(userId, firstName, username);

        if (isNewJoin) {
          await sendEbook(userId);
        }
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook] CRASHED:", err);
    return NextResponse.json({ ok: true });
  }
}