import React from 'react';
import { BookOpen, Sparkles, Lightbulb, Heart } from 'lucide-react';

interface StatsStripProps {
  onSelectKurals: () => void;
  onSelectSections: () => void;
  isDark: boolean;
}

export const StatsStrip: React.FC<StatsStripProps> = ({
  onSelectKurals,
  onSelectSections,
  isDark,
}) => {
  return (
    <section className={`border-b transition-colors ${
      isDark ? 'bg-[#181512] border-[#2A241C]' : 'bg-[#F7F4EE] border-[#E8E2D5]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 lg:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/60 dark:divide-stone-800">
          {/* 1. 1330 Kurals */}
          <div 
            onClick={onSelectKurals}
            className="flex items-center gap-4 cursor-pointer pt-4 sm:pt-0 sm:px-4 first:pt-0 first:px-0 group"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
              isDark ? 'bg-[#29231B] text-[#E5A93C]' : 'bg-[#EAE4D7] text-[#7A4B1A]'
            }`}>
              <BookOpen className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#9A3412] dark:group-hover:text-[#E5A93C] transition-colors">
                1330 Kurals
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Short verses, deep meanings
              </p>
            </div>
          </div>

          {/* 2. 3 Sections */}
          <div 
            onClick={onSelectSections}
            className="flex items-center gap-4 cursor-pointer pt-4 sm:pt-0 sm:px-4 group"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
              isDark ? 'bg-[#29231B] text-[#E5A93C]' : 'bg-[#EAE4D7] text-[#7A4B1A]'
            }`}>
              {/* Lotus 3 Petals Icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C10.5 4.5 8 8 8 11.5c0 2.5 1.8 4.5 4 4.5s4-2 4-4.5C16 8 13.5 4.5 12 2zm-4.5 6C6 9.5 4 12 4 14.5 4 17 6 19 8.5 19c1.6 0 3-.8 3.8-2C10.8 16.3 9 14.2 8.5 12 8.1 10.6 7.8 9.3 7.5 8zm9 0c-.3 1.3-.6 2.6-1 4-.5 2.2-2.3 4.3-3.8 5 1 .9 2.2 1.5 3.8 1.5 2.5 0 4.5-2 4.5-4.5 0-2.5-2-5-3.5-6.5zM12 20c-3 0-5.5 1-8 2h16c-2.5-1-5-2-8-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#9A3412] dark:group-hover:text-[#E5A93C] transition-colors">
                3 Sections
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Aram · Porul · Inbam
              </p>
            </div>
          </div>

          {/* 3. Simple Meanings */}
          <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#29231B] text-[#E5A93C]' : 'bg-[#EAE4D7] text-[#7A4B1A]'
            }`}>
              <Lightbulb className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                Simple Meanings
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Easy to understand, always relevant
              </p>
            </div>
          </div>

          {/* 4. For Everyone */}
          <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#29231B] text-[#E5A93C]' : 'bg-[#EAE4D7] text-[#7A4B1A]'
            }`}>
              <Heart className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                For Everyone
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Guidance for daily life
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
