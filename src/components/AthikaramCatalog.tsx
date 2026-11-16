import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, Music2 } from 'lucide-react';
import { ALL_KURALS } from '../data/kurals';
import { ATHIKARAMS } from '../data/chapters';
import { Athikaram, Paal } from '../types/kural';

const PAALS: { key: Paal; short: string; en: string; color: string; tint: string; ink: string }[] = [
  { key: 'அறத்துப்பால்', short: 'அறம்', en: 'Virtue', color: '#D9A53C', tint: '#FBF1DC', ink: '#8A5A0E' },
  { key: 'பொருட்பால்', short: 'பொருள்', en: 'Wealth', color: '#4E9A3A', tint: '#E6F2DF', ink: '#2F6A22' },
  { key: 'காமத்துப்பால்', short: 'இன்பம்', en: 'Love', color: '#D24A86', tint: '#FBE3EE', ink: '#A12E63' },
];

/** how many Kurals in each chapter have a song video */
const SONGS_PER_CHAPTER = (() => {
  const m = new Map<number, number>();
  for (const k of ALL_KURALS) if (k.media?.youtubeUrl) m.set(k.athikaramNumber, (m.get(k.athikaramNumber) ?? 0) + 1);
  return m;
})();

/** Chapters of one paal, split into their இயல் (sub-sections) in order. */
function groupByIyal(paal: Paal) {
  const groups: { iyal: string; iyalEn: string; items: Athikaram[] }[] = [];
  for (const a of ATHIKARAMS) {
    if (a.paal !== paal) continue;
    const last = groups[groups.length - 1];
    if (last && last.iyal === a.iyal) last.items.push(a);
    else groups.push({ iyal: a.iyal, iyalEn: a.iyalEn, items: [a] });
  }
  return groups;
}

interface AthikaramCatalogProps {
  onSelectAthikaram: (num: number) => void;
  onOpenVideo?: (kuralNumber: number) => void;
  videoKuralNumbers?: Set<number>;
  activeAthikaram?: number | 'all';
  onClose?: () => void;
  isDark: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export const AthikaramCatalog: React.FC<AthikaramCatalogProps> = ({ onSelectAthikaram, activeAthikaram = 'all', isDark, isOpen, onToggle }) => {
  const [paal, setPaal] = useState<Paal>('அறத்துப்பால்');
  const [selectedIyal, setSelectedIyal] = useState<string>('all');

  // Follow the selected chapter into its paal and iyal (e.g. after picking from search)
  useEffect(() => {
    if (activeAthikaram === 'all') return;
    const a = ATHIKARAMS.find((x) => x.number === activeAthikaram);
    if (a) {
      setPaal(a.paal);
      setSelectedIyal(a.iyal);
    }
  }, [activeAthikaram]);

  const groups = useMemo(() => groupByIyal(paal), [paal]);

  const displayedGroups = useMemo(() => {
    if (selectedIyal === 'all') return groups;
    return groups.filter((g) => g.iyal === selectedIyal);
  }, [groups, selectedIyal]);

  const ink = isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]';
  const muted = isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]';

  const handlePaalChange = (newPaal: Paal) => {
    setPaal(newPaal);
    setSelectedIyal('all');
  };

  return (
    <section
      id="athikaram-table"
      className={`w-full rounded-[14px] border px-4 sm:px-6 lg:px-7 ${isOpen ? 'pt-5 pb-7' : 'py-4'} ${
        isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white/70 border-[#ECEBE5]'
      }`}
    >
      {/* Heading row */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-3 sm:gap-6 text-left cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4234] ${isOpen ? 'mb-4' : ''}`}
      >
        <span className="flex items-center gap-3 sm:gap-4 min-w-0">
          <svg viewBox="0 0 32 28" className={`w-10 h-9 shrink-0 ${isDark ? 'text-[#7FB39A]' : 'text-[#1D5A43]'}`} aria-hidden="true">
            <path d="M2 4.5C6.5 3 11 3.4 15 6v19c-4-2.4-8.5-2.8-13-1.5z" fill="currentColor" />
            <path d="M30 4.5C25.5 3 21 3.4 17 6v19c4-2.4 8.5-2.8 13-1.5z" fill="currentColor" />
            <path d="M1 26c5-1.6 10-1.4 15 .6 5-2 10-2.2 15-.6" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
          <h2 className={`font-tamil-sans text-[19px] sm:text-[28px] font-bold tracking-tight ${ink}`}>
            <span className="font-heading font-normal mr-2 sm:mr-3">133</span><span className="sm:hidden">அதிகாரங்கள்</span><span className="hidden sm:inline">அதிகாரங்களின் அட்டவணை</span>
          </h2>
        </span>
        <span className="flex items-center gap-4 shrink-0">
        <span className={`hidden md:flex items-center gap-2.5 sm:gap-4 text-[13px] sm:text-[14px] whitespace-nowrap ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`}>
          <span>Three sections</span>
          <span aria-hidden="true" className="w-1 h-1 rounded-full bg-current" />
          <span>133 chapters</span>
          <span aria-hidden="true" className="w-1 h-1 rounded-full bg-current" />
          <span>1330 kurals</span>
        </span>
        <ChevronDown className={`w-6 h-6 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`} />
        </span>
      </button>

      {isOpen && (
      <>

      {/* Paal tabs: each in its own colour; short names on phones */}
      <div role="tablist" aria-label="பால்" className={`grid grid-cols-3 gap-1.5 sm:gap-2 p-1 rounded-xl mb-3 ${isDark ? 'bg-white/[0.04]' : 'bg-[#F1EFE9]'}`}>
        {PAALS.map((p) => {
          const list = ATHIKARAMS.filter((a) => a.paal === p.key);
          const on = paal === p.key;
          return (
            <button
              key={p.key}
              role="tab"
              aria-selected={on}
              onClick={() => handlePaalChange(p.key)}
              className={`rounded-lg px-1 py-2 text-center transition-all cursor-pointer ${on ? (isDark ? 'bg-[#232A25] shadow-sm' : 'bg-white shadow-sm') : 'opacity-75 hover:opacity-100'}`}
              style={on ? { boxShadow: `inset 0 -3px 0 ${p.color}` } : undefined}
            >
              <span className={`flex items-center justify-center gap-1.5 font-tamil-sans text-[15px] sm:text-[19px] font-bold leading-tight ${ink}`}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="sm:hidden">{p.short}</span>
                <span className="hidden sm:inline">{p.key}</span>
              </span>
              <span className={`block text-[11.5px] sm:text-[13px] mt-0.5 ${muted}`}>
                {p.en} · {list.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* இயல் tabs: one row that scrolls sideways on phones */}
      <div role="tablist" aria-label="இயல் தாவல்கள்" className="-mx-4 px-4 sm:mx-0 sm:px-0 flex sm:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto [scrollbar-width:none] pb-1 mb-4">
        {[{ iyal: 'all', label: 'அனைத்தும்', n: ATHIKARAMS.filter((a) => a.paal === paal).length }, ...groups.map((g) => ({ iyal: g.iyal, label: g.iyal, n: g.items.length }))].map((t) => {
          const on = selectedIyal === t.iyal;
          return (
            <button
              key={t.iyal}
              role="tab"
              aria-selected={on}
              onClick={() => setSelectedIyal(t.iyal)}
              className={`shrink-0 inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full text-[13px] sm:text-[13.5px] font-tamil-sans font-medium transition-all cursor-pointer border whitespace-nowrap ${
                on
                  ? isDark
                    ? 'bg-[#1F3A2F] border-[#7FB39A] text-[#E3EEE6]'
                    : 'bg-[#1D5A43] border-[#1D5A43] text-white'
                  : isDark
                  ? 'border-[#2A302C] text-[#C9D6CD] hover:border-[#4C5E54]'
                  : 'border-[#E2DFD8] bg-white text-[#4A5550] hover:border-[#1D5A43]'
              }`}
            >
              {t.label}
              <span className={`min-w-[22px] rounded-full px-1.5 text-[11.5px] font-semibold ${on ? 'bg-white/20' : isDark ? 'bg-white/10' : 'bg-[#F1EFE9]'}`}>{t.n}</span>
            </button>
          );
        })}
      </div>

      {/* இயல் groups within the selected paal */}
      <div className="space-y-5" role="tabpanel">
        {displayedGroups.map((g) => {
          const first = g.items[0];
          const last = g.items[g.items.length - 1];
          return (
            <div key={g.iyal}>
              <div className="flex items-baseline justify-between gap-2 mb-2 px-0.5">
                <h3 className={`font-tamil-sans text-[16px] font-bold ${ink}`}>
                  {g.iyal} <span className={`font-sans font-normal text-[12.5px] ${muted}`}>{g.iyalEn}</span>
                </h3>
                <span className={`shrink-0 text-[12px] ${muted}`}>
                  குறள் {first.startKural}–{last.endKural}
                </span>
              </div>

              {/* phones: one card with rows; bigger screens: a grid of small cards */}
              <div
                className={`overflow-hidden rounded-xl border divide-y sm:overflow-visible sm:rounded-none sm:border-0 sm:divide-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-3 ${
                  isDark ? 'border-[#2B322E] divide-[#2B322E] bg-[#1C211E] sm:bg-transparent' : 'border-[#E8E6E0] divide-[#EFEDE7] bg-white sm:bg-transparent'
                }`}
              >
                {g.items.map((ath) => {
                  const p = PAALS.find((x) => x.key === ath.paal)!;
                  const selected = activeAthikaram === ath.number;
                  const songs = SONGS_PER_CHAPTER.get(ath.number) ?? 0;
                  return (
                    <button
                      key={ath.number}
                      onClick={() => onSelectAthikaram(ath.number)}
                      title={`${ath.number}. ${ath.name} (${ath.nameEn}) — குறள் ${ath.startKural}–${ath.endKural}`}
                      className={`group w-full flex items-center gap-3 text-left px-3 py-2.5 transition-colors cursor-pointer sm:rounded-xl sm:border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4234] ${
                        isDark
                          ? `${selected ? 'bg-[#222B25] sm:border-[#7FB39A]' : 'sm:bg-[#1C211E] sm:border-[#2B322E] hover:bg-white/[0.03]'}`
                          : selected
                          ? 'bg-[#F1F6F2] sm:border-[#1D5A43]'
                          : 'sm:bg-white sm:border-[#E8E6E0] hover:bg-[#FAF9F5] sm:hover:border-[#B5C9BD]'
                      }`}
                    >
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-[13.5px] font-bold shrink-0"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : p.tint, color: isDark ? p.color : p.ink }}
                      >
                        {ath.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className={`block font-tamil-sans text-[15.5px] font-bold leading-tight truncate ${isDark ? 'text-[#EEE8DC]' : 'text-[#1B2621]'}`}>{ath.name}</span>
                        <span className={`block text-[12px] leading-normal mt-0.5 truncate ${muted}`}>{ath.nameEn}</span>
                      </div>
                      {songs > 0 && (
                        <span title={`${songs} பாடல்`} className="shrink-0 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold bg-[#E5A93C]/15 text-[#B27A14]">
                          <Music2 className="w-3 h-3" />
                          {songs}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${isDark ? 'text-[#7FB39A]' : 'text-[#1D5A43]'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}
    </section>
  );
};
