import { NextRequest, NextResponse } from "next/server";
import { isChannelMember } from "@/lib/telegram-auth";
import fs from "fs";
import path from "path";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_LINK = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_LINK!;
const EBOOK_PATH = path.join(process.cwd(), "private-files", "ebook.pdf");
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Every Telegram API call now logs its actual response — this is what was
// missing before: failures were being silently swallowed.
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

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    console.log("[webhook] update received:", JSON.stringify(update));

    if (update.message?.text?.startsWith("/start")) {
      const chatId = update.message.chat.id;
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
    return NextResponse.json({ ok: true }); // still 200 so Telegram doesn't retry-spam
  }
}