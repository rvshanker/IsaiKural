import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, Play, Video } from 'lucide-react';
import { ATHIKARAMS } from '../data/chapters';
import { Athikaram, Paal } from '../types/kural';

const PAALS: { key: Paal; en: string }[] = [
  { key: 'அறத்துப்பால்', en: 'Virtue' },
  { key: 'பொருட்பால்', en: 'Wealth' },
  { key: 'காமத்துப்பால்', en: 'Love' },
];

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

/**
 * Soft tint + ink pairs for the chapter number badges, cycling as in the design
 * (sage, sage, sage, clay, sage, blue, blue, rose, amber, violet …).
 */
const TINTS = [
  { badge: '#E3EEE6', ink: '#1F5B41', card: '#FBFCFA' }, // sage
  { badge: '#E3EEE6', ink: '#1F5B41', card: '#FBFCFA' },
  { badge: '#E3EEE6', ink: '#1F5B41', card: '#FBFCFA' },
  { badge: '#F8E4DC', ink: '#B24A2C', card: '#FFFBF9' }, // clay
  { badge: '#E3EEE6', ink: '#1F5B41', card: '#FBFCFA' },
  { badge: '#E2EAF6', ink: '#2F5A93', card: '#FAFBFE' }, // blue
  { badge: '#E2EAF6', ink: '#2F5A93', card: '#FAFBFE' },
  { badge: '#F8E1E4', ink: '#A33349', card: '#FFFAFB' }, // rose
  { badge: '#FBEBD7', ink: '#B0621C', card: '#FFFCF8' }, // amber
  { badge: '#EDE5F5', ink: '#6B3F95', card: '#FCFAFE' }, // violet
  { badge: '#EDE5F5', ink: '#6B3F95', card: '#FCFAFE' },
  { badge: '#F4E3EE', ink: '#8C356C', card: '#FEFAFC' }, // plum
];

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

      {/* Paal tabs */}
      <div role="tablist" aria-label="பால்" className={`grid grid-cols-3 border-b mb-4 ${isDark ? 'border-[#2A302C]' : 'border-[#E6E6E0]'}`}>
        {PAALS.map((p) => {
          const list = ATHIKARAMS.filter((a) => a.paal === p.key);
          const on = paal === p.key;
          return (
            <button
              key={p.key}
              role="tab"
              aria-selected={on}
              onClick={() => handlePaalChange(p.key)}
              className={`relative -mb-px px-1 sm:px-4 pt-2 pb-3 text-center border-b-[3px] transition-colors cursor-pointer ${
                on
                  ? isDark ? 'border-[#7FB39A]' : 'border-[#1D5A43]'
                  : 'border-transparent hover:border-current/20 opacity-70 hover:opacity-100'
              }`}
            >
              <span className={`block font-tamil-sans text-[13.5px] sm:text-[19px] font-bold leading-tight ${ink}`}>{p.key}</span>
              <span className={`block text-[12px] sm:text-[13.5px] mt-0.5 ${muted}`}>
                {p.en} <span className="hidden sm:inline">· அதிகாரம் {list[0].number}–{list[list.length - 1].number}</span> · {list.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub group header & tabs (இயல் தாவல்கள்: எ.கா: பாயிரவியல் – 4 | இல்லறவியல் – 20 | துறவறவியல் – 13 | ஊழியல் – 1) */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-2 mb-2.5 px-0.5">
          <div className={`font-tamil-sans font-bold text-[14.5px] sm:text-[16.5px] ${ink}`}>
            {paal} – {ATHIKARAMS.filter((a) => a.paal === paal).length} அதிகாரங்கள்
          </div>
          {selectedIyal !== 'all' && (
            <button
              onClick={() => setSelectedIyal('all')}
              className={`text-[12px] sm:text-[13px] font-medium underline underline-offset-4 cursor-pointer ${
                isDark ? 'text-[#7FB39A] hover:text-white' : 'text-[#1D5A43] hover:underline'
              }`}
            >
              அனைத்து இயல்களும் காட்டுக
            </button>
          )}
        </div>

        {/* Sub-group tabs */}
        <div
          role="tablist"
          aria-label="இயல் தாவல்கள்"
          className="flex flex-wrap gap-1.5 sm:gap-2 pb-1"
        >
          <button
            role="tab"
            aria-selected={selectedIyal === 'all'}
            onClick={() => setSelectedIyal('all')}
            className={`shrink-0 px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-full text-[12px] sm:text-[13.5px] font-medium transition-all cursor-pointer border ${
              selectedIyal === 'all'
                ? isDark
                  ? 'bg-[#1F3A2F] border-[#7FB39A] text-[#E3EEE6]'
                  : 'bg-[#1D5A43] border-[#1D5A43] text-white shadow-xs font-semibold'
                : isDark
                ? 'border-[#2A302C] text-[#C9D6CD] hover:border-[#4C5E54] hover:bg-white/5'
                : 'border-[#E2DFD8] bg-white text-[#4A5550] hover:border-[#1D5A43] hover:text-[#1D5A43]'
            }`}
          >
            அனைத்தும் – {ATHIKARAMS.filter((a) => a.paal === paal).length}
          </button>
          {groups.map((g) => {
            const isSelected = selectedIyal === g.iyal;
            return (
              <button
                key={g.iyal}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedIyal(g.iyal)}
                className={`shrink-0 px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-full text-[12px] sm:text-[13.5px] font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? isDark
                      ? 'bg-[#1F3A2F] border-[#7FB39A] text-[#E3EEE6]'
                      : 'bg-[#1D5A43] border-[#1D5A43] text-white shadow-xs font-semibold'
                    : isDark
                    ? 'border-[#2A302C] text-[#C9D6CD] hover:border-[#4C5E54] hover:bg-white/5'
                    : 'border-[#E2DFD8] bg-white text-[#4A5550] hover:border-[#1D5A43] hover:text-[#1D5A43]'
                }`}
              >
                {g.iyal} – {g.items.length}
              </button>
            );
          })}
        </div>
      </div>

      {/* இயல் groups within the selected paal */}
      <div className="space-y-5" role="tabpanel">
        {displayedGroups.map((g) => {
          const first = g.items[0];
          const last = g.items[g.items.length - 1];
          return (
            <div key={g.iyal}>
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mb-2.5">
                <h3 className={`font-tamil-sans text-[15.5px] font-bold ${ink}`}>{g.iyal}</h3>
                <span className={`text-[12px] sm:text-[12.5px] ${muted}`}>
                  {g.iyalEn} · அதிகாரம் {first.number}{g.items.length > 1 ? `–${last.number}` : ''} · குறள் {first.startKural}–{last.endKural}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                {g.items.map((ath) => {
                  const t = TINTS[(ath.number - 1) % TINTS.length];
                  const selected = activeAthikaram === ath.number;
                  return (
                    <button
                      key={ath.number}
                      onClick={() => onSelectAthikaram(ath.number)}
                      title={`${ath.number}. ${ath.name} (${ath.nameEn}) — குறள் ${ath.startKural}–${ath.endKural}`}
                      className={`group flex items-center justify-between gap-3 text-left rounded-xl border px-3 py-2.5 transition-all cursor-pointer active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4234] ${
                        isDark
                          ? `bg-[#1C211E] ${selected ? 'border-[#7FB39A] bg-[#222B25] shadow-xs' : 'border-[#2B322E] hover:border-[#4C5E54] hover:bg-white/[0.03]'}`
                          : selected
                          ? 'bg-[#F1F6F2] border-[#1D5A43] shadow-xs ring-1 ring-[#1D5A43]/20'
                          : 'bg-white border-[#E8E6E0] hover:border-[#B5C9BD] hover:shadow-xs shadow-2xs'
                      }`}
                    >
                      {/* Left: Badge number */}
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : t.badge, color: isDark ? '#D9CFB8' : t.ink }}
                      >
                        {ath.number}
                      </span>

                      {/* Middle: Chapter Name (Line 1) and English + Kural Range (Line 2) */}
                      <div className="min-w-0 flex-1">
                        <span className={`block font-tamil-sans text-[14.5px] font-bold leading-tight truncate ${isDark ? 'text-[#EEE8DC]' : 'text-[#1B2621]'}`}>
                          {ath.name}
                        </span>
                        <div className={`flex items-center gap-1.5 text-[11.5px] leading-normal mt-0.5 truncate ${muted}`}>
                          <span className="truncate">{ath.nameEn}</span>
                          <span aria-hidden="true" className="opacity-40 shrink-0">·</span>
                          <span className="shrink-0 font-medium">குறள் {ath.startKural}–{ath.endKural}</span>
                        </div>
                      </div>

                      {/* Right: Navigation chevron */}
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
