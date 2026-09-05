# Ebook via Telegram bot — fully inside Telegram, no website download step

## How it works now
1. Website has ONE button → opens your bot's chat (`t.me/YourBot?start=web`)
2. Bot replies with a welcome message + 2 buttons: "Join Channel" and
   "I've Joined - Get Ebook"
3. User taps Join Channel (joins, still inside Telegram)
4. User taps "I've Joined" → bot checks membership right then and, if
   verified, sends the ebook file directly in the same chat

No Redis, no polling, no signed download tokens, no website revisit.

## 1. BotFather setup
1. Same bot token as before (`TELEGRAM_BOT_TOKEN`).
2. Bot must still be an **admin** of your channel (for `getChatMember`).
3. No `/setdomain` needed — there's no Login Widget in this version.

## 2. Register the webhook (one-time, after deploying)
```bash
curl -F "url=https://yourdomain.com/api/telegram-webhook" \
  https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```
Check it any time with:
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

## 3. Files
```
app/page.tsx                        → simple bridge page, one button
app/api/telegram-webhook/route.ts   → ALL the logic: /start message + button taps
lib/telegram-auth.ts                → isChannelMember() check
private-files/ebook.pdf             → your actual ebook (not in /public)
```

## 4. Env vars (fewer than before)
```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=...
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=...      (no @)
NEXT_PUBLIC_TELEGRAM_CHANNEL_LINK=...
```
Set these in Vercel's dashboard too (Settings → Environment Variables),
not just `.env.local`.

## 5. Testing note
Like before, the webhook needs a public HTTPS URL — test on your actual
Vercel deployment (or a temporary ngrok tunnel registered as the webhook
URL), not on localhost.

## 6. If you still want Landing Page View tracking (Meta Pixel)
Since the download itself now happens inside Telegram, add the Meta Pixel
to `app/page.tsx` (the bridge page) so ad performance is still measurable —
the pixel just won't see the actual "joined/downloaded" event, only that
someone reached the bridge page and clicked through.
