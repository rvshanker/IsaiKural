import React from 'react';
import { ArrowRight, Compass, ShieldCheck, Coins, HeartHandshake } from 'lucide-react';
import { Paal } from '../types/kural';

interface ExploreSectionsProps {
  onSelectSection: (paal: Paal) => void;
  onViewAll: () => void;
  isDark: boolean;
}

export const ExploreSections: React.FC<ExploreSectionsProps> = ({
  onSelectSection,
  onViewAll,
  isDark,
}) => {
  const sections: {
    number: string;
    paal: Paal;
    title: string;
    tamilName: string;
    subtitle: string;
    count: string;
    accent: string;
    borderAccent: string;
    icon: React.ReactNode;
  }[] = [
    {
      number: '01',
      paal: 'அறத்துப்பால்',
      title: 'Aram (Virtue)',
      tamilName: 'அறத்துப்பால்',
      subtitle: 'Ethics, moral duty, ascetic life & domestic righteousness',
      count: '380 Kurals (Chapters 1–38)',
      accent: 'from-amber-950/40 via-amber-900/10 to-transparent',
      borderAccent: 'group-hover:border-amber-500/50',
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
    },
    {
      number: '02',
      paal: 'பொருட்பால்',
      title: 'Porul (Wealth)',
      tamilName: 'பொருட்பால்',
      subtitle: 'Statecraft, leadership, governance, economy & society',
      count: '700 Kurals (Chapters 39–108)',
      accent: 'from-emerald-950/40 via-emerald-900/10 to-transparent',
      borderAccent: 'group-hover:border-emerald-500/50',
      icon: <Coins className="w-6 h-6 text-emerald-500" />,
    },
    {
      number: '03',
      paal: 'காமத்துப்பால்',
      title: 'Inbam (Love)',
      tamilName: 'காமத்துப்பால்',
      subtitle: 'Pure love, courtship, psychological nuance & conjugal union',
      count: '250 Kurals (Chapters 109–133)',
      accent: 'from-rose-950/40 via-rose-900/10 to-transparent',
      borderAccent: 'group-hover:border-rose-500/50',
      icon: <HeartHandshake className="w-6 h-6 text-rose-500" />,
    },
  ];

  return (
    <section id="sections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header: Title + View All link */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Explore by Section (முப்பால்)
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            The three grand pillars of human existence: Virtue, Material Purpose, and Love
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 hover:text-[#9A3412] dark:hover:text-[#E5A93C] transition-colors group cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 3 Section Cards - Pure Typographic & Gradient Architecture (No stock photo banners) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {sections.map((section) => (
          <div
            key={section.number}
            onClick={() => onSelectSection(section.paal)}
            className={`group relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-200 border ${
              isDark 
                ? 'bg-[#181512] border-[#312B22] hover:bg-[#201C17]' 
                : 'bg-white border-[#E8E2D5] hover:bg-[#FAF8F5] shadow-xs hover:shadow-md'
            } ${section.borderAccent}`}
          >
            {/* Top Row: Index number & Thematic Icon */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold tracking-widest text-stone-400 dark:text-stone-500 uppercase">
                PART {section.number}
              </span>
              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-[#231F1A] border border-stone-200/60 dark:border-stone-800">
                {section.icon}
              </div>
            </div>

            {/* Middle: Titles */}
            <div className="my-4">
              <h3 className="font-tamil-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#9A3412] dark:group-hover:text-[#E5A93C] transition-colors">
                {section.tamilName}
              </h3>
              <p className="font-serif text-sm font-semibold text-stone-700 dark:text-stone-300 mt-0.5">
                {section.title}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-light">
                {section.subtitle}
              </p>
            </div>

            {/* Bottom: Count badge & Arrow */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800/80">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                {section.count}
              </span>

              <div className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-[#E5A93C] group-hover:text-[#191307] flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
