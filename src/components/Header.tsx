import React from 'react';
import { BookOpen, Video, Bookmark, Plus, Moon, Sun, Search, X, Compass, Home } from 'lucide-react';
import { Paal } from '../types/kural';

interface HeaderProps {
  onGoHome: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activePaal: Paal | 'all';
  onSelectPaal: (paal: Paal | 'all') => void;
  mediaFilter: 'all' | 'video' | 'image' | 'bookmarked';
  onSelectMediaFilter: (filter: 'all' | 'video' | 'image' | 'bookmarked') => void;
  onOpenAddMedia: () => void;
  onOpenDirectory: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  searchQuery,
  onSearchChange,
  activePaal,
  onSelectPaal,
  mediaFilter,
  onSelectMediaFilter,
  onOpenAddMedia,
  onOpenDirectory,
  isDark,
  onToggleTheme,
  bookmarkCount,
}) => {
  return (
    <header className={`sticky top-0 z-40 w-full transition-colors border-b ${
      isDark 
        ? 'bg-[#181614]/95 border-[#2E2A24] text-[#EFEBE4] backdrop-blur-md' 
        : 'bg-[#FAF7F2]/95 border-[#E5DFD3] text-[#24211D] backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Google-style wordmark + Search bar */}
        <div className="flex items-center gap-4 flex-1">
          {/* Logo (click to go home) */}
          <button
            onClick={onGoHome}
            title="முகப்பு தேடல் பக்கத்திற்குச் செல்க (Home)"
            className="flex items-center gap-2 group shrink-0 cursor-pointer text-left"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
              isDark 
                ? 'bg-[#29241E] border-[#443C32] text-[#D8B168] group-hover:border-[#D8B168]' 
                : 'bg-[#F2ECE1] border-[#DFD5C4] text-[#8C2D19] group-hover:border-[#8C2D19]'
            }`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight font-classical">
              திருக்குறள்
            </span>
          </button>

          {/* Compact Google Results Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="குறள் எண் அல்லது சொல் தேடுக..."
              className={`w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-full border transition-all focus:outline-hidden focus:ring-2 focus:ring-[#9A3412] ${
                isDark 
                  ? 'bg-[#241F1A] border-[#3E362C] text-white placeholder:text-stone-500' 
                  : 'bg-white border-[#D6CDBC] text-[#24211D] placeholder:text-stone-400 shadow-2xs'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto shrink-0 text-xs">
          <button
            onClick={onOpenDirectory}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              isDark
                ? 'border-[#3D352B] bg-[#241F1A] text-[#D8B168] hover:bg-[#2F2922]'
                : 'border-[#E0D7C7] bg-[#F4EFE6] text-[#61584C] hover:bg-[#EDE5D8]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">133 அதிகாரங்கள்</span>
            <span className="sm:hidden">அதிகாரங்கள்</span>
          </button>

          <button
            onClick={() => onSelectMediaFilter('bookmarked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              mediaFilter === 'bookmarked'
                ? 'border-[#9A3412] bg-[#9A3412] text-white'
                : isDark
                ? 'border-[#3D352B] bg-[#241F1A] text-[#B5AC9E] hover:bg-[#2F2922]'
                : 'border-[#E0D7C7] bg-[#F4EFE6] text-[#61584C] hover:bg-[#EDE5D8]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>குறித்தவை ({bookmarkCount})</span>
          </button>

          <button
            onClick={onOpenAddMedia}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9A3412] hover:bg-[#832B0E] text-white font-medium shadow-2xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ஊடகம் சேர்க்க</span>
            <span className="sm:hidden">சேர்க்க</span>
          </button>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className={`p-2 rounded-lg border transition-colors ${
              isDark 
                ? 'border-[#3D352B] bg-[#241F1A] text-[#D8B168] hover:bg-[#2F2922]' 
                : 'border-[#E0D7C7] bg-[#F4EFE6] text-[#61584C] hover:bg-[#EDE5D8]'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Google-style horizontal tabs strip below header in Results View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto text-xs py-1 border-t border-black/5 dark:border-white/5">
        <button
          onClick={() => {
            onSelectPaal('all');
            onSelectMediaFilter('all');
          }}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
            activePaal === 'all' && mediaFilter === 'all'
              ? 'text-[#9A3412] border-b-2 border-[#9A3412] font-semibold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          அனைத்தும்
        </button>

        <button
          onClick={() => {
            onSelectPaal('அறத்துப்பால்');
            onSelectMediaFilter('all');
          }}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
            activePaal === 'அறத்துப்பால்'
              ? 'text-[#9A3412] border-b-2 border-[#9A3412] font-semibold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          அறத்துப்பால்
        </button>

        <button
          onClick={() => {
            onSelectPaal('பொருட்பால்');
            onSelectMediaFilter('all');
          }}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
            activePaal === 'பொருட்பால்'
              ? 'text-[#9A3412] border-b-2 border-[#9A3412] font-semibold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          பொருட்பால்
        </button>

        <button
          onClick={() => {
            onSelectPaal('காமத்துப்பால்');
            onSelectMediaFilter('all');
          }}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
            activePaal === 'காமத்துப்பால்'
              ? 'text-[#9A3412] border-b-2 border-[#9A3412] font-semibold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          காமத்துப்பால்
        </button>

        <span className="text-stone-300 dark:text-stone-700 mx-1">|</span>

        <button
          onClick={() => onSelectMediaFilter('video')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
            mediaFilter === 'video'
              ? 'text-red-600 border-b-2 border-red-600 font-semibold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>காணொளி உள்ளவை</span>
        </button>
      </div>
    </header>
  );
};
