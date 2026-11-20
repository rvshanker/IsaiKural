import React, { useMemo, useState } from 'react';
import { Search, X, BookOpen, ChevronRight } from 'lucide-react';
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
        className={`flex items-center gap-4 h-[50px] px-5 sm:px-6 rounded-full border transition-shadow focus-within:shadow-[0_0_0_3px_rgba(29,66,52,0.15)] ${
          isDark
            ? 'bg-[#1B1F1C] border-[#2F3833] text-[#EEE8DC]'
            : 'bg-white border-[#E4E4DE] text-[#1F2A25] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
        }`}
      >
        <Search className={`w-6 h-6 shrink-0 ${isDark ? 'text-[#AFC3B8]' : 'text-[#16392E]'}`} strokeWidth={2} />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => {
            setDismissed(false);
            onSearchChange(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => e.key === 'Escape' && setDismissed(true)}
          placeholder="Search by kural number, chapter name, or keyword..."
          aria-label="Search by kural number, chapter name, or keyword"
          className="w-full bg-transparent text-[16px] placeholder:text-[#8A8F8B] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
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
      </label>

      {/* Adhikaram suggestions while typing */}
      {open && (
        <div
          role="listbox"
          aria-label="அதிகாரங்கள்"
          className={`absolute left-0 right-0 top-[56px] z-30 rounded-2xl border overflow-hidden shadow-lg ${
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
