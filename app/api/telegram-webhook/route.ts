import { NextRequest, NextResponse } from "next/server";
import { isChannelMember } from "@/lib/telegram-auth";
import fs from "fs";
import path from "path";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_LINK = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_LINK!;
const EBOOK_PATH = path.join(process.cwd(), "private-files", "ebook.pdf");
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId: number, text: string, replyMarkup?: object) {
  await fetch(`${TG_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup }),
  });
}

async function answerCallback(callbackQueryId: string, text?: string, showAlert = false) {
  await fetch(`${TG_API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: showAlert }),
  });
}

async function sendEbook(chatId: number) {
  const fileBuffer = fs.readFileSync(EBOOK_PATH);
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("caption", "Here's your free ebook 🎉");
  form.append("document", new Blob([fileBuffer]), "ebook.pdf");

  await fetch(`${TG_API}/sendDocument`, { method: "POST", body: form });
}

export async function POST(req: NextRequest) {
  const update = await req.json();

  // User opened the bot (via the deep link, or just searched it directly)
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

  // User tapped a button
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message.chat.id;
    const userId = cb.from.id;

    if (cb.data === "verify_join") {
      const member = await isChannelMember(userId);

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
}
