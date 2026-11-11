import React from 'react';
import { KuralCouplet } from './KuralCouplet';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Kural } from '../types/kural';
import { HERO_IMAGE } from '../assets/heroImage';

interface HeroKuralOfTheDayProps {
  kural: Kural;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onOpenDetails: (kural: Kural) => void;
  isDark: boolean;
}

/** Open-book glyph in the mockup's filled green style. */
const BookGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 28" className={className} aria-hidden="true">
    <path d="M2 4.5C6.5 3 11 3.4 15 6v19c-4-2.4-8.5-2.8-13-1.5z" fill="currentColor" />
    <path d="M30 4.5C25.5 3 21 3.4 17 6v19c4-2.4 8.5-2.8 13-1.5z" fill="currentColor" />
    <path d="M5 9c2.5-.6 5-.4 7 .6M5 13c2.5-.6 5-.4 7 .6M20 9.6c2-1 4.5-1.2 7-.6M20 13.6c2-1 4.5-1.2 7-.6" stroke="#fff" strokeWidth="1.1" fill="none" opacity=".85" />
    <path d="M1 26c5-1.6 10-1.4 15 .6 5-2 10-2.2 15-.6" stroke="currentColor" strokeWidth="1.6" fill="none" />
  </svg>
);

export const HeroKuralOfTheDay: React.FC<HeroKuralOfTheDayProps> = ({
  kural,
  onPrev,
  onNext,
  onShuffle,
  onOpenDetails,
  isDark,
}) => {
  const iconBtn = `p-2 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4234] ${
    isDark ? 'text-[#E9E3D6] hover:bg-white/10' : 'text-[#1D4234] hover:bg-[#1D4234]/8'
  }`;

  return (
    <section id="daily-kural" className="relative w-full overflow-hidden">
      {/* Photograph — statue on the left; the card sits to its right on wider screens */}
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 w-full h-full object-cover select-none"
        style={{ objectPosition: '0% 15%' }}
        draggable={false}
      />
      {/* Soft scrim only on small screens where the card covers the photo */}
      <div className="absolute inset-0 bg-black/25 md:bg-transparent" />

      <div className="relative max-w-[1440px] mx-auto px-3 sm:px-8 pt-6 pb-8 sm:pt-9 sm:pb-8 md:min-h-[max(420px,26vw)] flex justify-center md:pl-[42%] md:pr-6 lg:pr-10 xl:pr-16">
        <div
          className={`w-full max-w-[720px] self-center rounded-[18px] px-4 sm:px-10 pt-5 sm:pt-6 pb-3 sm:pb-4 text-center shadow-[0_18px_50px_-18px_rgba(20,40,30,0.45)] backdrop-blur-sm ${
            isDark ? 'bg-[#16211C]/92 text-[#EEE8DC]' : 'bg-[#FBFAF6]/95 text-[#16392E]'
          }`}
        >
          {/* Title row */}
          <div className="flex items-center justify-center gap-4 sm:gap-5">
            <span className={`hidden sm:block h-px w-14 ${isDark ? 'bg-[#EEE8DC]/50' : 'bg-[#16392E]/60'}`} />
            <BookGlyph className={`w-8 h-7 ${isDark ? 'text-[#7FB39A]' : 'text-[#1D5A43]'}`} />
            <h2 className="font-heading text-[19px] sm:text-[21px] tracking-[0.01em]">Random Kural of the Day</h2>
            <span className={`hidden sm:block h-px w-14 ${isDark ? 'bg-[#EEE8DC]/50' : 'bg-[#16392E]/60'}`} />
          </div>

          {/* Couplet — line 1 (4 words) and line 2 (3 words), each kept on its own row */}
          <button
            onClick={() => onOpenDetails(kural)}
            title="முழு விளக்கம் & உரைகள்"
            className="block w-full mt-5 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-[#1D4234]"
          >
            <KuralCouplet
              line1={kural.line1}
              line2={kural.line2}
              maxPx={28}
              align="center"
              className="font-tamil-sans font-bold leading-[1.6]"
            />
          </button>

          <div className={`mt-3 text-[15px] ${isDark ? 'text-[#C9C2B3]' : 'text-[#4E5E56]'}`}>
            — குறள் {kural.number} —
          </div>

          <p
            className={`font-tamil-sans mt-3 text-[15px] sm:text-[17px] leading-[1.75] max-w-[520px] mx-auto line-clamp-3 ${
              isDark ? 'text-[#DCD5C7]' : 'text-[#2E3B35]'
            }`}
          >
            {kural.commentaries.muVa}
          </p>

          {/* Controls */}
          <div className="mt-3 flex items-center justify-between">
            <button onClick={onPrev} aria-label="முந்தைய குறள்" className={iconBtn}>
              <ChevronLeft className="w-6 h-6" strokeWidth={1.8} />
            </button>
            <button onClick={onShuffle} aria-label="வேறு குறள்" title="வேறு குறள்" className={iconBtn}>
              <RefreshCw className="w-7 h-7" strokeWidth={2} />
            </button>
            <button onClick={onNext} aria-label="அடுத்த குறள்" className={iconBtn}>
              <ChevronRight className="w-6 h-6" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
