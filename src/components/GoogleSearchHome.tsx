import React, { useState } from 'react';
import { Search, X, Sparkles, BookOpen, Bookmark, Plus, Moon, Sun, Shuffle, Video } from 'lucide-react';

interface GoogleSearchHomeProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onFeelingLucky: () => void;
  onOpenDailyKural: () => void;
  onOpenDirectory: () => void;
  onOpenBookmarks: () => void;
  onOpenAddMedia: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  bookmarkCount: number;
}

const POPULAR_TOPICS = [
  { label: 'அன்பு', query: 'அன்பு' },
  { label: 'கல்வி', query: 'கல்வி' },
  { label: 'நட்பு', query: 'நட்பு' },
  { label: 'ஒழுக்கம்', query: 'ஒழுக்கம்' },
  { label: 'காலமறிதல்', query: 'காலமறிதல்' },
  { label: 'செய்ந்நன்றி', query: 'செய்ந்நன்றி' },
  { label: 'உழவு', query: 'உழவு' },
  { label: 'அதிகாரம் 1', query: '1' },
];

export const GoogleSearchHome: React.FC<GoogleSearchHomeProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onFeelingLucky,
  onOpenDailyKural,
  onOpenDirectory,
  onOpenBookmarks,
  onOpenAddMedia,
  isDark,
  onToggleTheme,
  bookmarkCount,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(localQuery);
  };

  const handleTopicClick = (topic: string) => {
    setLocalQuery(topic);
    onSearchSubmit(topic);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors ${
      isDark ? 'bg-[#151310] text-[#EDE7DE]' : 'bg-[#FAF7F2] text-[#24211D]'
    }`}>
      {/* Top Header Strip */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#9A3412] tracking-wider uppercase font-sans">
            தமிழ் மறைக் களஞ்சியம்
          </span>
        </div>

        <nav className="flex items-center gap-4 text-xs font-medium">
          <button
            onClick={onOpenDirectory}
            className={`hover:text-[#9A3412] transition-colors ${
              isDark ? 'text-[#B5AC9E]' : 'text-[#61584C]'
            }`}
          >
            133 அதிகாரங்கள்
          </button>

          <button
            onClick={onOpenBookmarks}
            className={`hover:text-[#9A3412] transition-colors flex items-center gap-1 ${
              isDark ? 'text-[#B5AC9E]' : 'text-[#61584C]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>குறித்தவை ({bookmarkCount})</span>
          </button>

          <button
            onClick={onOpenAddMedia}
            className={`hover:text-[#9A3412] transition-colors flex items-center gap-1 ${
              isDark ? 'text-[#B5AC9E]' : 'text-[#61584C]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ஊடகம் சேர்க்க</span>
          </button>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark 
                ? 'border-[#3D352B] bg-[#241F1A] text-[#D8B168] hover:bg-[#2F2922]' 
                : 'border-[#E0D7C7] bg-[#F4EFE6] text-[#61584C] hover:bg-[#EDE5D8]'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>
      </header>

      {/* Main Centered Google Search Hero Area */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center -mt-12 text-center">
        {/* Google-Style Classical Logo */}
        <div className="mb-8 select-none">
          <h1 className="text-5xl sm:text-7xl font-bold font-classical tracking-tight text-[#1F1B16] dark:text-[#FAF7F2] drop-shadow-2xs">
            திருக்குறள்
          </h1>
          <p className="text-xs sm:text-sm mt-3 tracking-wide text-stone-500 font-sans">
            உலகப் பொதுமறை · 1330 குறட்பாக்கள் · 4 செந்தமிழ் உரைகள்
          </p>
        </div>

        {/* Google Search Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className={`relative flex items-center w-full rounded-full border transition-all shadow-xs hover:shadow-md focus-within:shadow-md ${
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
              autoFocus
              className="w-full py-3.5 sm:py-4 px-3 sm:px-4 text-sm sm:text-base rounded-full bg-transparent focus:outline-hidden text-[#1F1B16] dark:text-[#EDE7DE] placeholder:text-stone-400"
            />

            {localQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery('');
                  onSearchChange('');
                }}
                className="pr-4 sm:pr-5 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Action Buttons (Google-style) */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-all ${
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
              className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-[#241F1A] border-[#3B3329] text-[#EDE7DE] hover:border-[#D4A373] hover:bg-[#2C2620]' 
                  : 'bg-[#F4EFE6] border-[#DFD6C7] text-[#332D24] hover:border-[#9A3412] hover:bg-[#EDE5D8]'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>நான் அதிர்ஷ்டசாலி (ஏதேனும் ஒரு குறள்)</span>
            </button>
          </div>
        </form>

        {/* Quick Topics & Daily Kural (Google-style language/shortcut links) */}
        <div className="mt-8 text-xs text-stone-500">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
            <span>விரைவுத் தலைப்புகள்:</span>
            {POPULAR_TOPICS.map((topic, i) => (
              <React.Fragment key={topic.query}>
                <button
                  onClick={() => handleTopicClick(topic.query)}
                  className="text-[#9A3412] hover:underline font-medium"
                >
                  {topic.label}
                </button>
                {i < POPULAR_TOPICS.length - 1 && <span className="opacity-40">·</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-3">
            <button
              onClick={onOpenDailyKural}
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-[#9A3412] hover:underline py-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>இன்றைய குறள் படிக்க</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Strip (Google-style) */}
      <footer className={`w-full border-t text-xs transition-colors py-4 px-6 ${
        isDark ? 'border-[#26211C] bg-[#14120F] text-[#8C8375]' : 'border-[#EAE1D2] bg-[#F4EFE6] text-[#6E6455]'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            திருவள்ளுவர் அருளிய திருக்குறள் · தமிழ் செம்மொழிப் பெட்டகம்
          </div>
          <div className="flex items-center gap-4">
            <span>மு.வ உரை</span>
            <span aria-hidden="true">·</span>
            <span>கலைஞர் உரை</span>
            <span aria-hidden="true">·</span>
            <span>சாலமன் பாப்பையா</span>
            <span aria-hidden="true">·</span>
            <span>பரிமேலழகர்</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
