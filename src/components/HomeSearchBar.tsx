import React from 'react';
import { Search, X } from 'lucide-react';

interface HomeSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  isDark: boolean;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({ searchQuery, onSearchChange, onSearchSubmit, isDark }) => (
  <form
    id="search-box"
    onSubmit={(e) => {
      e.preventDefault();
      onSearchSubmit(searchQuery);
    }}
    className="w-full"
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
        onChange={(e) => onSearchChange(e.target.value)}
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
  </form>
);
