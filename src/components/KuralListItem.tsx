import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Play, ChevronRight, Volume2, Square, Loader2, Video, Edit3 } from 'lucide-react';
import { Kural } from '../types/kural';
import { KuralCouplet } from './KuralCouplet';
import { kuralAudio } from '../utils/audioPlayer';
import { AUDIO_ENABLED } from '../config';

interface KuralListItemProps {
  kural: Kural;
  showChapter: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (num: number) => void;
  onOpenVideo: (k: Kural) => void;
  onOpenDetails: (k: Kural) => void;
  onEditMedia?: (k: Kural) => void;
  isDark: boolean;
}

/**
 * Compact kural row for list pages: number, the two lines, one short
 * explanation (Mu. Va.), and three small actions. All other commentaries
 * live in the detail sheet so the list stays short on phones.
 */
export const KuralListItem: React.FC<KuralListItemProps> = ({
  kural,
  showChapter,
  isBookmarked,
  onToggleBookmark,
  onOpenVideo,
  onOpenDetails,
  onEditMedia,
  isDark,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  useEffect(() => {
    const unsubscribe = kuralAudio.subscribe((state) => {
      const isThis = state.kuralNumber === kural.number;
      setIsPlayingAudio(isThis && state.isPlaying);
      setIsLoadingAudio(isThis && state.isLoading);
    });
    return unsubscribe;
  }, [kural.number]);

  const handlePlayAudio = () => {
    kuralAudio.playKural(kural.number, kural.line1, kural.line2);
  };

  const muted = isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]';
  const iconBtn = `inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors cursor-pointer ${
    isDark ? 'text-[#C9D6CD] hover:bg-white/10' : 'text-[#1D5A43] hover:bg-[#1D5A43]/8'
  }`;

  return (
    <article className={`py-3.5 sm:py-5 border-b last:border-b-0 ${isDark ? 'border-[#2A302C]' : 'border-[#ECEBE6]'}`}>
      {/* Number (+ video badge + chapter when the list mixes chapters) */}
      <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
        <span className={`shrink-0 px-2 py-0.5 rounded-md text-[12.5px] font-semibold ${isDark ? 'bg-[#1F3A2F] text-[#CFE3D7]' : 'bg-[#E3EEE6] text-[#1D5A43]'}`}>
          {kural.number}
        </span>
        {kural.media?.youtubeUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenVideo(kural);
            }}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
            title="இக்குறளுக்குரிய இசைப் பாடல் காணொளியைக் காண்க (Watch Video)"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>காணொளி</span>
          </button>
        )}
        {showChapter && <span className={`text-[13px] truncate ${muted}`}>{kural.athikaramTamil}</span>}
      </div>

      {/* Couplet — tap to open all commentaries */}
      <button onClick={() => onOpenDetails(kural)} className="block w-full text-left cursor-pointer">
        <KuralCouplet
          line1={kural.line1}
          line2={kural.line2}
          maxPx={22}
          className={`font-tamil-sans font-bold leading-[1.6] ${isDark ? 'text-[#EEE8DC]' : 'text-[#1B2621]'}`}
        />
        <p className={`font-tamil-sans mt-1.5 text-[13.5px] sm:text-[14.5px] leading-[1.65] line-clamp-2 ${isDark ? 'text-[#A9B3AD]' : 'text-[#5B6660]'}`}>
          {kural.commentaries.muVa}
        </p>
      </button>

      {/* Actions */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        {/* Audio recitation button */}
        {AUDIO_ENABLED && <button
          onClick={handlePlayAudio}
          className={`${iconBtn} ${isPlayingAudio ? '!text-amber-500' : ''}`}
          aria-label={isPlayingAudio ? 'நிறுத்துக' : 'குறள் ஓசை கேட்க'}
          title={isPlayingAudio ? 'நிறுத்துக (Stop Audio)' : 'குரல் வழியே கேட்க (Play Natural Voice)'}
        >
          {isLoadingAudio ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          ) : isPlayingAudio ? (
            <Square className="w-4 h-4 fill-current text-amber-500" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>}

        {/* Video button when available */}
        {kural.media?.youtubeUrl && (
          <button
            onClick={() => onOpenVideo(kural)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-200/80 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900 transition-colors cursor-pointer shadow-2xs"
            aria-label="காணொளி"
            title="இக்குறளுக்குரிய காணொளியைக் காண்க (Watch Video)"
          >
            <Play className="w-3 h-3 fill-current text-red-600 dark:text-red-400" />
            <span>காணொளி</span>
          </button>
        )}

        {/* Bookmark */}
        <button
          onClick={() => onToggleBookmark(kural.number)}
          className={iconBtn}
          aria-label={isBookmarked ? 'சேமிப்பிலிருந்து நீக்கு' : 'சேமி'}
          aria-pressed={isBookmarked}
          title={isBookmarked ? 'சேமிப்பிலிருந்து நீக்கு' : 'சேமித்திடு'}
        >
          {isBookmarked ? <BookmarkCheck className="w-[18px] h-[18px] fill-current" /> : <Bookmark className="w-[18px] h-[18px]" />}
        </button>

        {/* Edit / Add Media button */}
        {onEditMedia && (
          <button
            onClick={() => onEditMedia(kural)}
            className={`${iconBtn} text-stone-400 hover:text-stone-700 dark:hover:text-stone-200`}
            aria-label="காணொளி இணைப்பு சேர்க்க / மாற்ற"
            title={kural.media?.youtubeUrl ? 'காணொளி இணைப்பை மாற்ற (Edit Video Link)' : 'காணொளி இணைப்பு சேர்க்க (Add Video Link)'}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => onOpenDetails(kural)}
          className={`ml-auto inline-flex items-center gap-0.5 text-[13px] font-medium px-2 py-1.5 rounded-full cursor-pointer ${
            isDark ? 'text-[#A9BDB2] hover:bg-white/5' : 'text-[#1D5A43] hover:bg-[#1D5A43]/5'
          }`}
        >
          அனைத்து உரைகள் <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
