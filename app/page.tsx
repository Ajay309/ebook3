const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!;

export default function EbookLandingPage() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        <p className="text-[#7d8590] text-sm mb-3">Free download</p>
        <h1 className="text-3xl font-semibold leading-tight mb-3">
          Get your copy of the ebook
        </h1>
        <p className="text-[#9198a1] mb-8 leading-relaxed">
          Tap below to open Telegram — join the channel and confirm, and the
          bot sends you the ebook right there in the chat.
        </p>

        <a
          href={`https://t.me/${BOT_USERNAME}?start=web`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full bg-[#2ea6ff] hover:bg-[#4db5ff] text-[#0d1117] font-medium px-5 py-3 rounded-lg transition-colors"
        >
          Get the Ebook on Telegram
        </a>
      </div>
    </main>
  );
}
