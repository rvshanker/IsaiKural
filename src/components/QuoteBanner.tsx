import React from 'react';
import { ArrowRight } from 'lucide-react';

interface QuoteBannerProps {
  onReadAll: () => void;
}

export const QuoteBanner: React.FC<QuoteBannerProps> = ({ onReadAll }) => {
  return (
    <section className="relative overflow-hidden bg-[#0D2620] text-stone-100 py-12 sm:py-16">
      {/* Subtle Botanical / Leaves Watermark Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-between">
        <svg className="w-96 h-96 -ml-20 text-[#67B59F]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M20 180 C40 120 90 80 170 30 C120 70 80 110 50 170 Z" />
          <path d="M50 140 C80 110 110 90 140 80" />
          <path d="M30 160 C60 130 90 110 120 100" />
          <path d="M70 120 C100 90 130 70 160 50" />
        </svg>
        <svg className="w-96 h-96 -mr-20 text-[#67B59F] rotate-180" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M20 180 C40 120 90 80 170 30 C120 70 80 110 50 170 Z" />
          <path d="M50 140 C80 110 110 90 140 80" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left">
        {/* Quote & Attribution */}
        <div className="max-w-2xl">
          <blockquote className="font-serif italic text-2xl sm:text-3xl text-[#F2ECE1] font-light leading-relaxed">
            “The world is sustained by those who live by virtue.”
          </blockquote>
          <p className="font-serif text-sm text-[#B8C8BF] mt-2 tracking-wide font-normal">
            — Thirukkural (பண்புடையார்ப் பட்டுண்டு உலகம்)
          </p>
        </div>

        {/* Read All Button */}
        <div className="shrink-0">
          <button
            onClick={onReadAll}
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-full bg-[#E5A93C] hover:bg-[#D6962A] active:scale-98 text-[#161106] font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
          >
            <span>Read All 1330 Kurals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
