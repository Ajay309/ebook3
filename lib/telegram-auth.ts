const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;

export async function isChannelMember(userId: number): Promise<boolean> {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_ID}&user_id=${userId}`
  );
  const data = await res.json();
  if (!data.ok) return false;
  const status = data.result?.status as string | undefined;
  if (status === "creator" || status === "administrator" || status === "member") return true;
  if (status === "restricted" && data.result?.is_member) return true;
  return false;
}