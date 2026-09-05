const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!;

export default function EbookLandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0D12] text-[#ECEEF0] font-[family-name:var(--font-body)]">
      <div className="mx-auto max-w-[1100px] px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-12 items-center">
          {/* Text column */}
          <div className="max-w-[520px]">
            <p className="text-[#8992A0] text-sm mb-5">Free ebook</p>

            <h1 className="font-[family-name:var(--font-display)] text-[2.5rem] sm:text-[3rem] leading-[1.1] font-medium text-[#ECEEF0] mb-6">
              The playbook serious traders keep on their phone.
            </h1>

            <p className="text-[#8992A0] text-[1.0625rem] leading-relaxed mb-10 max-w-[440px]">
              A practical guide to reading price action, sizing positions,
              and managing risk — written for retail traders navigating the
              NSE and BSE. Free for everyone in our Telegram channel.
            </p>

            {/* Fixed the missing <a tag here */}
            <a
              href={`https://t.me/${BOT_USERNAME}?start=web`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#C9A227] hover:bg-[#D9B23C] text-[#0A0D12] font-medium text-[1.0625rem] px-7 py-3.5 rounded-md transition-colors"
            >
              Get the ebook on Telegram
            </a>

            <p className="text-[#5B6472] text-sm mt-5 leading-relaxed max-w-[400px]">
              Opens Telegram — join the channel, confirm, and the bot sends
              the file straight to your chat.
            </p>
          </div>

          {/* Artwork column */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-[260px] sm:w-[300px] rotate-[-2deg]">
              <svg
                viewBox="0 0 300 400"
                className="w-full h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
              >
                <defs>
                  <linearGradient id="coverGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#161C25" />
                    <stop offset="100%" stopColor="#0D1118" />
                  </linearGradient>
                  <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3FB876" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3FB876" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <rect width="300" height="400" rx="6" fill="url(#coverGrad)" />
                <rect
                  x="10"
                  y="10"
                  width="280"
                  height="380"
                  rx="3"
                  fill="none"
                  stroke="#C9A227"
                  strokeOpacity="0.4"
                  strokeWidth="1"
                />

                <text
                  x="34"
                  y="90"
                  fill="#ECEEF0"
                  fontFamily="var(--font-display)"
                  fontSize="28"
                  fontWeight="500"
                >
                  The Trader's
                </text>
                <text
                  x="34"
                  y="126"
                  fill="#ECEEF0"
                  fontFamily="var(--font-display)"
                  fontSize="28"
                  fontWeight="500"
                >
                  Playbook
                </text>
                <text x="34" y="152" fill="#5B6472" fontFamily="var(--font-body)" fontSize="12">
                  A guide to reading the market
                </text>

                <path
                  d="M 30 300 L 80 280 L 120 310 L 160 250 L 200 265 L 240 200 L 270 210"
                  fill="none"
                  stroke="#3FB876"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  className="[stroke-dasharray:1] [stroke-dashoffset:1] animate-[draw_1.4s_ease-out_0.3s_forwards] motion-reduce:[stroke-dashoffset:0]"
                />
                <path
                  d="M 30 300 L 80 280 L 120 310 L 160 250 L 200 265 L 240 200 L 270 210 L 270 360 L 30 360 Z"
                  fill="url(#lineFill)"
                />
                <circle cx="270" cy="210" r="3.5" fill="#3FB876" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </main>
  );
}