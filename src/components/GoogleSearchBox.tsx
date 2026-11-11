import React, { useState } from 'react';
import { Search, X, Shuffle, Sparkles } from 'lucide-react';

interface GoogleSearchBoxProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onFeelingLucky: () => void;
  isDark: boolean;
  totalResultsCount?: number;
}

const POPULAR_TOPICS = [
  { label: 'அன்பு (Love)', query: 'அன்பு' },
  { label: 'கல்வி (Learning)', query: 'கல்வி' },
  { label: 'நட்பு (Friendship)', query: 'நட்பு' },
  { label: 'ஒழுக்கம் (Virtue)', query: 'ஒழுக்கம்' },
  { label: 'காலமறிதல் (Timing)', query: 'காலமறிதல்' },
  { label: 'செய்ந்நன்றி (Gratitude)', query: 'செய்ந்நன்றி' },
  { label: 'உழவு (Agriculture)', query: 'உழவு' },
  { label: 'அதிகாரம் 1', query: '1' },
];

export const GoogleSearchBox: React.FC<GoogleSearchBoxProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onFeelingLucky,
  isDark,
  totalResultsCount,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(localQuery);
  };

  const handleTopicClick = (topicQuery: string) => {
    setLocalQuery(topicQuery);
    onSearchChange(topicQuery);
    onSearchSubmit(topicQuery);
  };

  const handleClear = () => {
    setLocalQuery('');
    onSearchChange('');
  };

  return (
    <section id="search-box" className="w-full max-w-3xl mx-auto text-center px-4 py-8">
      {/* Google-Style Classical Emblem & Title */}
      <div className="mb-6 select-none">
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1F1B16] dark:text-[#FAF7F2] drop-shadow-2xs">
          திருக்குறள்
        </h1>
        <p className="text-xs sm:text-sm mt-2 text-stone-500 dark:text-stone-400 font-sans tracking-wide">
          உலகப் பொதுமறை · 1330 குறட்பாக்கள் · 4 செந்தமிழ் உரைகள்
        </p>
      </div>

      {/* Google Search Bar Form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className={`relative flex items-center w-full rounded-full border transition-all duration-200 shadow-xs hover:shadow-md focus-within:shadow-md ${
          isDark 
            ? 'bg-[#221E19] border-[#3F372C] focus-within:border-[#9A3412]' 
            : 'bg-white border-[#DDD4C4] focus-within:border-[#9A3412]'
        }`}>
          <div className="pl-4 sm:pl-5 text-stone-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              onSearchChange(e.target.value);
            }}
            placeholder="குறள் எண் (1-1330) அல்லது சொல் தேடுக... (எ.கா: 1, கல்வி, அன்பு, நட்பு)"
            className="w-full py-3.5 sm:py-4 px-3 sm:px-4 text-sm sm:text-base rounded-full bg-transparent focus:outline-hidden text-[#1F1B16] dark:text-[#EDE7DE] placeholder:text-stone-400"
          />

          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="pr-4 sm:pr-5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
              title="அழிக்க"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action Buttons (Google-style) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            type="submit"
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-2xs ${
              isDark 
                ? 'bg-[#241F1A] border-[#3B3329] text-[#EDE7DE] hover:border-[#D4A373] hover:bg-[#2C2620]' 
                : 'bg-[#F4EFE6] border-[#DFD6C7] text-[#332D24] hover:border-[#9A3412] hover:bg-[#EDE5D8]'
            }`}
          >
            திருக்குறள் தேடுக
          </button>

          <button
            type="button"
            onClick={onFeelingLucky}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isDark 
                ? 'bg-[#241F1A] border-[#3B3329] text-[#EDE7DE] hover:border-[#D4A373] hover:bg-[#2C2620]' 
                : 'bg-[#F4EFE6] border-[#DFD6C7] text-[#332D24] hover:border-[#9A3412] hover:bg-[#EDE5D8]'
            }`}
          >
            <Shuffle className="w-4 h-4 text-[#9A3412]" />
            <span>நான் அதிர்ஷ்டசாலி (ஏதேனும் ஒரு குறள்)</span>
          </button>
        </div>
      </form>

      {/* Popular Topic Pills (Google-style fast shortcuts) */}
      <div className="mt-6 text-xs text-stone-500 dark:text-stone-400">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="font-medium mr-1 text-stone-600 dark:text-stone-300">விரைவுத் தலைப்புகள்:</span>
          {POPULAR_TOPICS.map((topic) => (
            <button
              key={topic.query}
              onClick={() => handleTopicClick(topic.query)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs transition-colors cursor-pointer ${
                isDark
                  ? 'border-[#332B22] bg-[#1E1914] text-[#D8B168] hover:border-[#9A3412]'
                  : 'border-stone-200 bg-stone-50 text-[#8C2D19] hover:bg-stone-100 hover:border-[#9A3412]'
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {searchQuery && totalResultsCount !== undefined && (
        <div className="mt-4 text-xs text-stone-500 dark:text-stone-400">
          "{searchQuery}" தேடலுக்கு <strong>{totalResultsCount}</strong> குறள்கள் கண்டறியப்பட்டுள்ளன
        </div>
      )}
    </section>
  );
};
