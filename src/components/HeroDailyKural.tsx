import React from 'react';
import { Sparkles, Play, Volume2, BookOpen, Video, Share2, Bookmark, Loader2 } from 'lucide-react';
import { Kural } from '../types/kural';
import { kuralAudio } from '../utils/audioPlayer';

interface HeroDailyKuralProps {
  kural: Kural;
  onOpenVideo: (kural: Kural) => void;
  onSelectKural: (num: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: (num: number) => void;
  isDark: boolean;
}

export const HeroDailyKural: React.FC<HeroDailyKuralProps> = ({
  kural,
  onOpenVideo,
  onSelectKural,
  isBookmarked,
  onToggleBookmark,
  isDark,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = kuralAudio.subscribe((state) => {
      const isThis = state.kuralNumber === kural.number;
      setIsPlayingAudio(isThis && state.isPlaying);
      setIsLoadingAudio(isThis && state.isLoading);
    });
    return unsubscribe;
  }, [kural.number]);

  const handleSpeech = () => {
    kuralAudio.playKural(kural.number, kural.line1, kural.line2);
  };

  return (
    <section 
      id="daily-kural"
      className={`relative rounded-3xl border overflow-hidden transition-colors mb-10 ${
        isDark
          ? 'bg-gradient-to-br from-[#241F1A] via-[#1C1814] to-[#161310] border-[#3B342A] text-[#EDE7DE]'
          : 'bg-gradient-to-br from-[#FDFBF7] via-[#F7F2E9] to-[#EFE7D8] border-[#E3DACB] text-[#24211D] shadow-sm'
      }`}
    >
      {/* Decorative Traditional Border Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#9A3412] via-[#D97706] to-[#9A3412]" />

      <div className="p-6 sm:p-10 lg:p-12">
        {/* Curatorial Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#9A3412]/10 text-[#9A3412] border border-[#9A3412]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>இன்றைய திருக்குறள் · Kural of the Day</span>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              குறள் எண் {kural.number}
            </span>
          </div>

          <div className="text-xs text-stone-500 flex items-center gap-2">
            <span>{kural.paal}</span>
            <span aria-hidden="true">·</span>
            <span>அதிகாரம் {kural.athikaramNumber}: {kural.athikaramTamil}</span>
          </div>
        </div>

        {/* Couplet Typography */}
        <div className="max-w-4xl mb-8">
          <blockquote className="space-y-2">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-tamil-serif font-bold tracking-tight leading-relaxed text-[#1F1B16] dark:text-[#FAF7F2]">
              {kural.line1}
            </p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-tamil-serif font-bold tracking-tight leading-relaxed text-[#1F1B16] dark:text-[#FAF7F2]">
              {kural.line2}
            </p>
          </blockquote>
          {kural.transliteration && (
            <p className="mt-3 text-sm italic opacity-75 font-sans">
              "{kural.transliteration}"
            </p>
          )}
        </div>

        {/* Highlighted Explanations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Dr. Mu. Varadarajan */}
          <div className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-[#1C1814]/70 border-[#332C23]' : 'bg-white/80 border-[#E8DFC0]'
          }`}>
            <div className="text-xs font-bold text-[#8C2D19] dark:text-[#E8A578] mb-1">
              மு. வரதராசனார் விளக்கம்
            </div>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90 line-clamp-3">
              {kural.commentaries.muVa}
            </p>
          </div>

          {/* Kalaignar Karunanidhi */}
          <div className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-[#1C1814]/70 border-[#332C23]' : 'bg-white/80 border-[#E8DFC0]'
          }`}>
            <div className="text-xs font-bold text-[#8C2D19] dark:text-[#E8A578] mb-1">
              கலைஞர் உரை
            </div>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90 line-clamp-3">
              {kural.commentaries.karunanidhi}
            </p>
          </div>

          {/* Solomon Pappaiah */}
          <div className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-[#1C1814]/70 border-[#332C23]' : 'bg-white/80 border-[#E8DFC0]'
          }`}>
            <div className="text-xs font-bold text-[#8C2D19] dark:text-[#E8A578] mb-1">
              சாலமன் பாப்பையா உரை
            </div>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90 line-clamp-3">
              {kural.commentaries.solomon}
            </p>
          </div>
        </div>

        {/* Operational / Interaction Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeech}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'border-[#1D5A43] bg-[#1D5A43] text-white shadow-sm ring-2 ring-[#1D5A43]/30'
                  : isLoadingAudio
                  ? 'border-[#D97706] bg-[#D97706]/10 text-[#D97706]'
                  : isDark 
                  ? 'border-[#3F362A] bg-[#29221B] text-[#D8B168] hover:bg-[#332B22]' 
                  : 'border-[#DFCDB6] bg-white text-[#8C2D19] hover:bg-[#FDF9F2] shadow-2xs'
              }`}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#D97706]" />
              ) : (
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse text-white' : ''}`} />
              )}
              <span>{isPlayingAudio ? 'நிறுத்துக' : isLoadingAudio ? 'குரல் தயாராகிறது...' : 'குறள் ஓசை கேட்க'}</span>
            </button>

            {kural.media?.youtubeUrl && (
              <button
                onClick={() => onOpenVideo(kural)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>காணொளி விளக்கம் (Watch Video)</span>
              </button>
            )}

            <button
              onClick={() => onToggleBookmark(kural.number)}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked 
                  ? 'bg-[#9A3412] text-white border-[#9A3412]' 
                  : isDark ? 'border-[#3F362A] bg-[#29221B] text-[#C0B4A2]' : 'border-[#DFCDB6] bg-white text-[#6A6051]'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Quick stats & Curatorial ribbon */}
          <div className="text-xs opacity-75 flex items-center gap-2">
            <span>133 அதிகாரங்கள்</span>
            <span aria-hidden="true">·</span>
            <span>1330 குறட்பாக்கள்</span>
            <span aria-hidden="true">·</span>
            <span>4 செந்தமிழ் உரைகள்</span>
          </div>
        </div>
      </div>
    </section>
  );
};
