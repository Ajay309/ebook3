import { NextRequest, NextResponse } from "next/server";
import { isChannelMember } from "@/lib/telegram-auth";
import { redis } from "@/lib/redis";
import fs from "fs";
import path from "path";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_LINK = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_LINK!;
const EBOOK_PATH = path.join(process.cwd(), "private-files", "ebook.pdf");
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const KNOWN_SOURCES = ["metaig", "metafb", "metaad", "organic"];
const SOURCE_TTL_SECONDS = 3600;

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
  form.append("caption", "Here's your free ebook 🎉");
  form.append("document", new Blob([fileBuffer]), "ebook.pdf");

  return callTelegram("sendDocument", form, false);
}

async function recordSource(userId: number, rawTag: string) {
  const tag = KNOWN_SOURCES.includes(rawTag) ? rawTag : "direct";
  await redis.set(`source:${userId}`, tag, { ex: SOURCE_TTL_SECONDS });
}

async function recordJoin(userId: number) {
  // Duplicate count rokne ke liye — ek user sirf ek baar count ho
  const alreadyCounted = await redis.get(`joined:${userId}`);
  if (alreadyCounted) {
    console.log(`[recordJoin] userId ${userId} already counted, skipping`);
    return;
  }

  const tag = (await redis.get<string>(`source:${userId}`)) ?? "direct";
  await redis.incr("stats:total");
  await redis.incr(`stats:source:${tag}`);

  // Permanent flag — dobara count na ho
  await redis.set(`joined:${userId}`, "1");
  console.log(`[recordJoin] userId ${userId} counted with source: ${tag}`);
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    console.log("[webhook] update received:", JSON.stringify(update));

    // ✅ Actual channel join event — bot admin hone pe milta hai
    if (update.my_chat_member) {
      const member = update.my_chat_member;
      const newStatus = member.new_chat_member?.status;
      const oldStatus = member.old_chat_member?.status;
      const userId = member.from.id;

      const joinedNow =
        (newStatus === "member" || newStatus === "administrator") &&
        (oldStatus === "left" || oldStatus === "kicked");

      if (joinedNow) {
        console.log(`[webhook] user ${userId} actually joined the channel`);
        await recordJoin(userId);
      }

      return NextResponse.json({ ok: true });
    }

    // /start command handle
    if (update.message?.text?.startsWith("/start")) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const [, rawTag] = update.message.text.split(" ");

      if (rawTag) {
        await recordSource(userId, rawTag);
      }

      await sendMessage(
        chatId,
        "Welcome! Grab your free ebook — join our channel first, then tap the button below to confirm.",
        {
          inline_keyboard: [
            [{ text: "📢 Join Channel", url: CHANNEL_LINK }],
            [{ text: "✅ I've Joined - Get Ebook", callback_data: "verify_join" }],
          ],
        }
      );
      return NextResponse.json({ ok: true });
    }

    // Button tap — sirf ebook delivery, counting nahi
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const userId = cb.from.id;

      if (cb.data === "verify_join") {
        const member = await isChannelMember(userId);
        console.log(`[webhook] isChannelMember(${userId}) =`, member);

        if (member) {
          await answerCallback(cb.id, "Verified! Sending your ebook...");
          await sendEbook(chatId);
          // ❌ recordJoin() hata diya — counting my_chat_member se hoti hai ab
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