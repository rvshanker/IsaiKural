import React, { useMemo, useState } from 'react';
import { Search, X, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';
import { ATHIKARAMS } from '../data/chapters';
import { matchChapters } from '../utils/search';

interface HomeSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  isDark: boolean;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({ searchQuery, onSearchChange, onSearchSubmit, isDark }) => {
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const chapters = useMemo(() => matchChapters(ATHIKARAMS, searchQuery, 5), [searchQuery]);
  const open = focused && !dismissed && chapters.length > 0;

  const openChapter = (n: number) => {
    setDismissed(true);
    window.location.hash = `#/adhikaram/${n}`;
  };

  return (
    <form
      id="search-box"
      onSubmit={(e) => {
        e.preventDefault();
        setDismissed(true);
        onSearchSubmit(searchQuery);
      }}
      className="w-full relative"
    >
      <label
        className={`flex items-center gap-3 h-[58px] pl-5 pr-1.5 rounded-full border transition-shadow focus-within:shadow-[0_0_0_4px_rgba(227,184,102,0.35)] ${
          isDark
            ? 'bg-[#1E2A24] border-[#3C5246] text-[#EEE8DC] shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
            : 'bg-[#FFFDF6] border-[#D8C68F] text-[#1F2A25] shadow-[0_10px_28px_rgba(29,66,52,0.12)]'
        }`}
      >
        <Search className={`w-[22px] h-[22px] shrink-0 ${isDark ? 'text-[#E3B866]' : 'text-[#1D4234]'}`} strokeWidth={2} />
        <input
          type="search"
          enterKeyHint="search"
          value={searchQuery}
          onChange={(e) => {
            setDismissed(false);
            onSearchChange(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => e.key === 'Escape' && setDismissed(true)}
          placeholder="குறள் எண், அதிகாரம் அல்லது சொல்லைத் தேடுங்கள்…"
          aria-label="குறள் எண், அதிகாரம் அல்லது சொல்லைத் தேடுங்கள் · Search by kural number, chapter or word"
          className={`w-full min-w-0 bg-transparent text-[16px] font-tamil-sans focus:outline-none [&::-webkit-search-cancel-button]:hidden ${isDark ? 'placeholder:text-[#9FB0A6]' : 'placeholder:text-[#7C7F6E]'}`}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="அழிக்க"
            className="p-1 rounded-full text-[#8A8F8B] hover:text-[#1F2A25] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          type="submit"
          aria-label="தேடு"
          className="w-[46px] h-[46px] shrink-0 rounded-full flex items-center justify-center bg-gradient-to-br from-[#F0CC7E] to-[#C9962F] text-[#16392E] shadow-[0_4px_12px_rgba(201,150,47,0.4)] hover:brightness-105 active:scale-95 transition cursor-pointer"
        >
          <ArrowRight className="w-[22px] h-[22px]" strokeWidth={2.4} />
        </button>
      </label>

      {/* Adhikaram suggestions while typing */}
      {open && (
        <div
          role="listbox"
          aria-label="அதிகாரங்கள்"
          className={`absolute left-0 right-0 top-[64px] z-30 rounded-2xl border overflow-hidden shadow-lg ${
            isDark ? 'bg-[#1B1F1C] border-[#2F3833]' : 'bg-white border-[#E4E4DE]'
          }`}
        >
          <p className={`px-4 pt-2.5 pb-1 text-[12px] font-semibold ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>
            அதிகாரங்கள் · Chapters
          </p>
          {chapters.map((c) => (
            <button
              key={c.number}
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => openChapter(c.number)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-[#1D5A43]/5'
              }`}
            >
              <BookOpen className={`w-4.5 h-4.5 shrink-0 ${isDark ? 'text-[#AFC3B8]' : 'text-[#1D5A43]'}`} />
              <span className="min-w-0 flex-1">
                <span className={`block font-tamil-sans text-[15px] font-semibold truncate ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>
                  {c.number}. {c.name}
                </span>
                <span className={`block text-[12.5px] truncate ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>
                  {c.nameEn} · குறள் {c.startKural}–{c.endKural}
                </span>
              </span>
              <ChevronRight className="w-4 h-4 shrink-0 text-[#8A8F8B]" />
            </button>
          ))}
        </div>
      )}
    </form>
  );
};
