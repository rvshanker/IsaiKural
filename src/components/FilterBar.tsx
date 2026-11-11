import React from 'react';
import { Search, Video, Image as ImageIcon, Bookmark, Filter, BookOpen, Layers, X } from 'lucide-react';
import { Paal, Athikaram } from '../types/kural';
import { ATHIKARAMS } from '../data/chapters';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activePaal: Paal | 'all';
  onSelectPaal: (p: Paal | 'all') => void;
  activeAthikaram: number | 'all';
  onSelectAthikaram: (num: number | 'all') => void;
  mediaFilter: 'all' | 'video' | 'image' | 'bookmarked';
  onSelectMediaFilter: (f: 'all' | 'video' | 'image' | 'bookmarked') => void;
  totalResults: number;
  isDark: boolean;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activePaal,
  onSelectPaal,
  activeAthikaram,
  onSelectAthikaram,
  mediaFilter,
  onSelectMediaFilter,
  totalResults,
  isDark,
  onClearFilters,
}) => {
  const filteredAthikarams = activePaal === 'all'
    ? ATHIKARAMS
    : ATHIKARAMS.filter(a => a.paal === activePaal);

  const hasActiveFilters = searchQuery !== '' || activePaal !== 'all' || activeAthikaram !== 'all' || mediaFilter !== 'all';

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 mb-8 transition-colors ${
      isDark ? 'bg-[#1E1B17] border-[#332E27]' : 'bg-white border-[#E6DFD3] shadow-xs'
    }`}>
      {/* Top row: Search and Athikaram picker */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        {/* Search Field */}
        <div className="md:col-span-7 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="குறள் எண் (1-1330), தமிழ் சொல் (எ.கா: அன்பு, கல்வி, நட்பு), அல்லது ஆங்கிலத்தில்..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#9A3412] transition-colors ${
              isDark 
                ? 'bg-[#29241E] border-[#443C32] text-white placeholder:text-stone-500' 
                : 'bg-[#FAF7F2] border-[#D9CFBE] text-[#24211D] placeholder:text-stone-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Athikaram Selector (133 Chapters) */}
        <div className="md:col-span-5">
          <select
            value={activeAthikaram}
            onChange={(e) => {
              const val = e.target.value;
              onSelectAthikaram(val === 'all' ? 'all' : parseInt(val));
            }}
            className={`w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#9A3412] transition-colors ${
              isDark 
                ? 'bg-[#29241E] border-[#443C32] text-[#EDE7DE]' 
                : 'bg-[#FAF7F2] border-[#D9CFBE] text-[#24211D]'
            }`}
          >
            <option value="all">அனைத்து அதிகாரங்களும் (All 133 Chapters)</option>
            {filteredAthikarams.map((athikaram) => (
              <option key={athikaram.number} value={athikaram.number}>
                {athikaram.number}. {athikaram.name} ({athikaram.nameEn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom row: Paal filters + Media filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/5 dark:border-white/5">
        {/* Paal Segmented Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-stone-500 mr-1 hidden sm:inline">பால்:</span>
          
          <button
            onClick={() => onSelectPaal('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePaal === 'all'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : isDark ? 'bg-[#26211C] text-[#B0A799] hover:text-white' : 'bg-[#F2ECE1] text-[#61584C] hover:text-black'
            }`}
          >
            அனைத்துப் பாலும்
          </button>

          <button
            onClick={() => onSelectPaal('அறத்துப்பால்')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePaal === 'அறத்துப்பால்'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : isDark ? 'bg-[#26211C] text-[#B0A799] hover:text-white' : 'bg-[#F2ECE1] text-[#61584C] hover:text-black'
            }`}
          >
            அறத்துப்பால் (Virtue)
          </button>

          <button
            onClick={() => onSelectPaal('பொருட்பால்')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePaal === 'பொருட்பால்'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : isDark ? 'bg-[#26211C] text-[#B0A799] hover:text-white' : 'bg-[#F2ECE1] text-[#61584C] hover:text-black'
            }`}
          >
            பொருட்பால் (Wealth)
          </button>

          <button
            onClick={() => onSelectPaal('காமத்துப்பால்')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePaal === 'காமத்துப்பால்'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : isDark ? 'bg-[#26211C] text-[#B0A799] hover:text-white' : 'bg-[#F2ECE1] text-[#61584C] hover:text-black'
            }`}
          >
            காமத்துப்பால் (Love)
          </button>
        </div>

        {/* Media Filter Segmented Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectMediaFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mediaFilter === 'all'
                ? 'border border-[#9A3412] text-[#9A3412] bg-[#9A3412]/10 font-semibold'
                : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            அனைத்தும்
          </button>

          <button
            onClick={() => onSelectMediaFilter('video')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mediaFilter === 'video'
                ? 'border border-red-600 text-red-600 bg-red-600/10 font-semibold'
                : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-red-600" />
            <span>காணொளிகள்</span>
          </button>

          <button
            onClick={() => onSelectMediaFilter('image')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mediaFilter === 'image'
                ? 'border border-blue-600 text-blue-600 bg-blue-600/10 font-semibold'
                : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>படங்கள்</span>
          </button>

          <button
            onClick={() => onSelectMediaFilter('bookmarked')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mediaFilter === 'bookmarked'
                ? 'border border-amber-600 text-amber-600 bg-amber-600/10 font-semibold'
                : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
            <span>குறித்தவை</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-stone-500 hover:text-[#9A3412] underline ml-2 whitespace-nowrap"
            >
              மீட்டமை
            </button>
          )}
        </div>
      </div>

      {/* Results counter strip */}
      <div className="mt-3 pt-2 text-xs text-stone-500 flex items-center justify-between">
        <div>
          <span>காட்டப்படும் குறள்கள்: </span>
          <strong className="text-stone-800 dark:text-stone-200 tabular-nums">{totalResults}</strong>
        </div>
        {activeAthikaram !== 'all' && (
          <div className="text-[#9A3412] font-medium">
            அதிகாரம் {activeAthikaram} தேர்ந்தெடுக்கப்பட்டுள்ளது
          </div>
        )}
      </div>
    </div>
  );
};
