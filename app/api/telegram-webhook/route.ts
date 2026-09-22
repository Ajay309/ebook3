import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { isChannelMember } from "@/lib/telegram-auth";
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

async function answerCallback(callbackQueryId: string, text?: string, showAlert = false) {
  return callTelegram(
    "answerCallbackQuery",
    JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: showAlert })
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

// Idempotent — safe to call from BOTH the automatic chat_member path and the
// manual button path without ever double-counting the same user.
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

    // Someone opened the bot via the deep link
    if (update.message?.text?.startsWith("/start")) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const [, rawTag] = update.message.text.split(" ");

      if (rawTag) {
        await recordSource(userId, rawTag);
      }

      await sendMessage(
        chatId,
        "Welcome! Grab your free ebook — join our channel first, then tap the button below to get it.\n\nTip: once you join, you may also get it automatically here without even tapping — but the button always works as a backup.",
        {
          inline_keyboard: [
            [{ text: "📢 Join Channel", url: CHANNEL_LINK }],
            [{ text: "✅ Download Ebook", callback_data: "verify_join" }],
          ],
        }
      );
      return NextResponse.json({ ok: true });
    }

    // Automatic delivery — fires the moment Telegram confirms they joined,
    // no button tap needed. Kept as the "no second step" primary path.
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

    // Manual "Download Ebook" button — ALWAYS re-verifies real membership
    // with Telegram's own API before sending anything. Clicking this with
    // no join never produces a file.
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const userId = cb.from.id;
      const firstName = cb.from.first_name ?? "Unknown";
      const username = cb.from.username;

      if (cb.data === "verify_join") {
        const member = await isChannelMember(userId);
        console.log(`[webhook] isChannelMember(${userId}) =`, member);

        if (member) {
          await answerCallback(cb.id, "Verified! Sending your ebook...");
          await sendEbook(chatId);
          await recordJoinOnce(userId, firstName, username); // no-op if chat_member already counted them
        } else {
          await answerCallback(
            cb.id,
            "You haven't joined the channel yet. Please join first!",
            true
          );
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