"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!;

// Only letters/digits allowed — Telegram's start param rejects anything else
function getSourceTag(searchParams: URLSearchParams): string {
  const fbclid = searchParams.get("fbclid");
  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");

  if (fbclid || utmMedium === "paid") {
    if (utmSource === "ig") return "metaig";
    if (utmSource === "fb") return "metafb";
    return "metaad";
  }
  return "organic";
}

function EbookLandingPageInner() {
  const searchParams = useSearchParams();
  const sourceTag = getSourceTag(searchParams);

  return (
    <main className="relative min-h-screen bg-[#030406] text-[#ECEEF0] font-[family-name:var(--font-body)] overflow-hidden flex items-center justify-center selection:bg-[#D4AF37] selection:text-black">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[60vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/15 via-transparent to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-[10%] left-[-20%] w-[150%] h-[15vh] bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent -rotate-12 blur-2xl pointer-events-none z-0"></div>
      <div className="absolute top-[60%] right-[-20%] w-[150%] h-[20vh] bg-gradient-to-r from-transparent via-[#FFFFFF]/5 to-transparent rotate-12 blur-3xl pointer-events-none z-0"></div>
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)'
        }}
      ></div>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex justify-between px-[5%] opacity-30">
        <div className="w-[1px] h-[30vh] mt-auto bg-gradient-to-t from-[#D4AF37]/40 to-transparent"></div>
        <div className="w-[2px] h-[45vh] mt-auto bg-gradient-to-t from-[#3FB876]/20 to-transparent ml-20"></div>
        <div className="w-[1px] h-[60vh] mt-auto bg-gradient-to-t from-white/10 to-transparent mr-40"></div>
        <div className="w-[2px] h-[25vh] mt-auto bg-gradient-to-t from-[#ff4d4d]/20 to-transparent"></div>
        <div className="w-[1px] h-[50vh] mt-auto bg-gradient-to-t from-[#D4AF37]/30 to-transparent mr-10"></div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#030406_120%)] pointer-events-none z-0"></div>

      <div className="relative w-full max-w-[1250px] mx-auto px-4 sm:px-6 py-12 lg:py-16 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <div className="max-w-[580px] relative z-20 mx-auto lg:mx-0 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="h-[2px] w-10 bg-gradient-to-r from-[#D4AF37] to-transparent"></div>
              <span className="text-[#D4AF37] text-[0.7rem] font-bold tracking-[0.3em] uppercase">
                Free Ebook • Volume I
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] leading-[1.1] sm:leading-[1.05] font-light text-white mb-6 tracking-tight">
              Mindset <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF4D0] via-[#D4AF37] to-[#AA8529]">Master</span> Karein.<br />
              <span className="italic text-[#8992A0]">Confident</span> Trader Banein.
            </h1>

            <p className="text-[#A1ABB9] text-[1rem] sm:text-[1.1rem] leading-relaxed mb-8 font-light lg:border-l-2 lg:border-[#D4AF37]/50 lg:pl-5 bg-gradient-to-r from-[#D4AF37]/5 via-[#D4AF37]/5 to-transparent lg:to-transparent py-2 backdrop-blur-sm rounded-lg lg:rounded-l-none lg:rounded-r-lg">
              Real trading experience, discipline, aur psychology par aadharit yeh book aapko ek aam trader se <strong className="text-white font-medium">consistent market participant</strong> banne mein madad karegi.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center lg:items-start justify-center lg:justify-start">
              <a
                href={`https://t.me/${BOT_USERNAME}?start=${sourceTag}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => window.fbq?.("track", "Lead")}
                className="group w-full sm:w-auto relative inline-flex items-center justify-center bg-gradient-to-r from-[#D4AF37] via-[#F9F1CC] to-[#D4AF37] text-black font-semibold text-[1.1rem] px-8 py-3.5 rounded-md transition-all hover:brightness-110 shadow-[0_0_30px_rgba(212,175,55,0.25)] border border-[#FFF4D0]/50"
              >
                <span className="mr-3">Get Ebook on Telegram</span>
                <svg className="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          <div className="relative w-full flex flex-col items-center lg:items-end z-20 mt-4 lg:mt-0">
            
            <div className="relative w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[457px] mb-8 lg:mb-6">
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37] z-20"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37] z-20"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37] z-20"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37] z-20"></div>

              <div className="absolute -left-2 sm:-left-5 top-4 sm:top-6 bg-[#121418]/90 backdrop-blur-md border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-sm shadow-2xl z-30 flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-xs sm:text-sm leading-tight">100%</p>
                  <p className="text-[#8992A0] text-[0.55rem] sm:text-[0.6rem] font-semibold uppercase tracking-wider">Free PDF</p>
                </div>
              </div>

              <div className="relative bg-[#ffffff] rounded-md p-1.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] border border-white/10">
                <img
                  src="/ChatGPT Image Sep 12, 2026, 01_55_00 PM.png"
                  alt="The Trader's Ebook Cover"
                  className="w-full h-auto object-cover rounded"
                />
              </div>
            </div>

            <div className="w-full max-w-[480px] flex items-center gap-3 mb-4 justify-center lg:justify-start">
              <span className="text-[#D4AF37] text-[0.6rem] sm:text-[0.65rem] font-bold tracking-[0.2em] uppercase text-center lg:text-left">
                What you will get in this ebook
              </span>
              <div className="hidden sm:block h-[1px] flex-1 bg-gradient-to-r from-[#D4AF37]/40 to-transparent"></div>
            </div>

            <div className="w-full max-w-[480px] grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <div className="bg-[#0A0C0F]/80 backdrop-blur-sm border border-white/5 p-3 rounded-lg flex items-start gap-3 hover:border-[#D4AF37]/30 transition-colors">
                <div className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center border border-[#D4AF37]/20">
                  <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-[0.85rem] font-semibold mb-0.5 leading-tight">A Trader's Journey — From Beginner to Pro</h3>
                </div>
              </div>

              <div className="bg-[#0A0C0F]/80 backdrop-blur-sm border border-white/5 p-3 rounded-lg flex items-start gap-3 hover:border-[#D4AF37]/30 transition-colors">
                <div className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center border border-[#D4AF37]/20">
                  <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-[0.85rem] font-semibold mb-0.5 leading-tight">Creating Your Own Trading Setup</h3>
                </div>
              </div>

              <div className="bg-[#0A0C0F]/80 backdrop-blur-sm border border-white/5 p-3 rounded-lg flex items-start gap-3 hover:border-[#D4AF37]/30 transition-colors">
                <div className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center border border-[#D4AF37]/20">
                  <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-[0.85rem] font-semibold mb-0.5 leading-tight">How Much Money Can You Expect?</h3>
                </div>
              </div>

              <div className="bg-[#0A0C0F]/80 backdrop-blur-sm border border-white/5 p-3 rounded-lg flex items-start gap-3 hover:border-[#D4AF37]/30 transition-colors">
                <div className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center border border-[#D4AF37]/20">
                  <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-[0.85rem] font-semibold mb-0.5 leading-tight">Time Frame to Become Profitable</h3>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}

export default function EbookLandingPage() {
  return (
    <Suspense fallback={null}>
      <EbookLandingPageInner />
    </Suspense>
  );
}