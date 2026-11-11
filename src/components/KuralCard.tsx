import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Youtube, 
  Image as ImageIcon, 
  Bookmark, 
  Volume2, 
  Copy, 
  Check, 
  Edit3, 
  Layers,
  Loader2
} from 'lucide-react';
import { Kural } from '../types/kural';
import { KuralCouplet } from './KuralCouplet';
import { kuralAudio } from '../utils/audioPlayer';

interface KuralCardProps {
  kural: Kural;
  isBookmarked: boolean;
  onToggleBookmark: (num: number) => void;
  onOpenVideo: (kural: Kural) => void;
  onOpenImage: (kural: Kural) => void;
  onEditMedia: (kural: Kural) => void;
  isDark: boolean;
  defaultCommentator?: 'muVa' | 'karunanidhi' | 'solomon' | 'parimelazhagar' | 'all' | 'english';
}

type CommentatorKey = 'muVa' | 'karunanidhi' | 'solomon' | 'parimelazhagar' | 'english' | 'all';

export const KuralCard: React.FC<KuralCardProps> = ({
  kural,
  isBookmarked,
  onToggleBookmark,
  onOpenVideo,
  onOpenImage,
  onEditMedia,
  isDark,
  defaultCommentator = 'muVa',
}) => {
  const [selectedCommentator, setSelectedCommentator] = useState<CommentatorKey>(defaultCommentator);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  useEffect(() => {
    const unsubscribe = kuralAudio.subscribe((state) => {
      const isThisKural = state.kuralNumber === kural.number;
      setIsPlayingAudio(isThisKural && state.isPlaying);
      setIsLoadingAudio(isThisKural && state.isLoading);
    });
    return unsubscribe;
  }, [kural.number]);

  const handleCopy = () => {
    let commentaryText = '';
    if (selectedCommentator === 'muVa') commentaryText = `மு.வ: ${kural.commentaries.muVa}`;
    else if (selectedCommentator === 'karunanidhi') commentaryText = `கலைஞர்: ${kural.commentaries.karunanidhi}`;
    else if (selectedCommentator === 'solomon') commentaryText = `பாப்பையா: ${kural.commentaries.solomon}`;
    else if (selectedCommentator === 'parimelazhagar') commentaryText = `பரிமேலழகர்: ${kural.commentaries.parimelazhagar}`;
    else if (selectedCommentator === 'english') commentaryText = `English: ${kural.commentaries.english || ''}`;
    else {
      commentaryText = `மு.வ: ${kural.commentaries.muVa}\nகலைஞர்: ${kural.commentaries.karunanidhi}\nபாப்பையா: ${kural.commentaries.solomon}\nபரிமேலழகர்: ${kural.commentaries.parimelazhagar}`;
    }

    const textToCopy = `திருக்குறள் ${kural.number} (${kural.athikaramTamil})\n\n${kural.line1}\n${kural.line2}\n\n${commentaryText}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    kuralAudio.playKural(kural.number, kural.line1, kural.line2);
  };

  const hasVideo = !!kural.media?.youtubeUrl;
  const hasImage = !!kural.media?.imageUrl;

  return (
    <article
      className={`relative rounded-xl border transition-all duration-150 p-5 sm:p-6 ${
        isDark
          ? 'bg-[#1C1A17] border-[#302B24] text-[#EDE7DE] hover:border-[#4A4237]'
          : 'bg-white border-[#E6DFD3] text-[#24211D] hover:border-[#CFC3B0] shadow-2xs'
      }`}
    >
      {/* Top Header: Kural Number, Chapter and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-md bg-[#1D5A43] text-white font-bold tabular-nums text-xs">
            குறள் {kural.number}
          </span>
          <span className="font-semibold text-[#8C2D19] dark:text-[#E8A578]">
            {kural.athikaramTamil}
          </span>
          <span className="text-stone-400 hidden sm:inline" aria-hidden="true">·</span>
          <span className={`hidden sm:inline ${isDark ? 'text-[#9E9485]' : 'text-[#706657]'}`}>
            {kural.athikaramEnglish}
          </span>
          <span className="text-stone-400 hidden md:inline" aria-hidden="true">/</span>
          <span className={`hidden md:inline ${isDark ? 'text-[#877E71]' : 'text-[#857B6C]'}`}>
            {kural.paal}
          </span>
        </div>

        {/* Action Controls & Media Buttons (Hidden by default, shown as clean click triggers) */}
        <div className="flex items-center gap-1.5">
          {/* Video Button */}
          {hasVideo && (
            <button
              onClick={() => onOpenVideo(kural)}
              title="காணொளி விளக்கம் பார்க்க (Watch Video)"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-2xs transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>காணொளி</span>
            </button>
          )}

          {/* Image Button (No image shown by default; click to view) */}
          {hasImage && (
            <button
              onClick={() => onOpenImage(kural)}
              title="விளக்கப் படம் பார்க்க"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/40 transition-colors"
            >
              <ImageIcon className="w-3 h-3" />
              <span>படம்</span>
            </button>
          )}

          {/* Speech Recitation */}
          <button
            onClick={handleSpeech}
            title={isPlayingAudio ? "நிறுத்து (Stop Audio)" : "குறள் ஓசை கேட்க (Play Audio)"}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isPlayingAudio
                ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-400/40'
                : isLoadingAudio
                ? 'bg-stone-500/20 border-stone-400 text-stone-500 animate-pulse'
                : isDark
                ? 'border-[#383228] text-[#A89E8F] hover:bg-[#2A251E] hover:text-[#E5A93C]'
                : 'border-[#E5DDD0] text-[#6A6051] hover:bg-[#F2ECE1] hover:text-[#1D5A43]'
            }`}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
            )}
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(kural.number)}
            title={isBookmarked ? 'குறிப்பை நீக்குக' : 'குறிப்பில் சேர்க்க'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked
                ? 'bg-[#1D5A43]/15 border-[#1D5A43] text-[#1D5A43]'
                : isDark
                ? 'border-[#383228] text-[#A89E8F] hover:bg-[#2A251E]'
                : 'border-[#E5DDD0] text-[#6A6051] hover:bg-[#F2ECE1]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

        </div>
      </div>

      {/* Couplet Lines: High-legibility classical typography */}
      <div className="mb-4">
        <KuralCouplet
          line1={kural.line1}
          line2={kural.line2}
          maxPx={24}
          className="font-tamil-serif font-bold leading-relaxed text-[#1C1917] dark:text-[#F3EEE6]"
        />
        {kural.transliteration && (
          <p className={`text-xs italic mt-1 ${isDark ? 'text-[#8E8475]' : 'text-[#7C7262]'}`}>
            {kural.transliteration}
          </p>
        )}
      </div>

      {/* Commentators Switcher Bar */}
      <div className="pt-2">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1D5A43] shrink-0">
            <span>உரையாசிரியர்:</span>
          </div>

          <div className={`flex items-center gap-1 p-0.5 rounded-lg border text-xs max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isDark ? 'bg-[#221F1B] border-[#383127]' : 'bg-[#F5EFE4] border-[#E2D9CB]'
          }`}>
            <button
              onClick={() => setSelectedCommentator('muVa')}
              className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedCommentator === 'muVa'
                  ? 'bg-[#1D5A43] text-white shadow-2xs'
                  : isDark ? 'text-[#B5AC9E] hover:text-white' : 'text-[#5C5345] hover:text-black'
              }`}
            >
              மு.வ
            </button>

            <button
              onClick={() => setSelectedCommentator('karunanidhi')}
              className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedCommentator === 'karunanidhi'
                  ? 'bg-[#1D5A43] text-white shadow-2xs'
                  : isDark ? 'text-[#B5AC9E] hover:text-white' : 'text-[#5C5345] hover:text-black'
              }`}
            >
              கலைஞர்
            </button>

            <button
              onClick={() => setSelectedCommentator('solomon')}
              className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedCommentator === 'solomon'
                  ? 'bg-[#1D5A43] text-white shadow-2xs'
                  : isDark ? 'text-[#B5AC9E] hover:text-white' : 'text-[#5C5345] hover:text-black'
              }`}
            >
              பாப்பையா
            </button>

            <button
              onClick={() => setSelectedCommentator('parimelazhagar')}
              className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedCommentator === 'parimelazhagar'
                  ? 'bg-[#1D5A43] text-white shadow-2xs'
                  : isDark ? 'text-[#B5AC9E] hover:text-white' : 'text-[#5C5345] hover:text-black'
              }`}
            >
              பரிமேலழகர்
            </button>

            <button
              onClick={() => setSelectedCommentator('english')}
              className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedCommentator === 'english'
                  ? 'bg-[#1D5A43] text-white shadow-2xs'
                  : isDark ? 'text-[#B5AC9E] hover:text-white' : 'text-[#5C5345] hover:text-black'
              }`}
            >
              English
            </button>

            <button
              onClick={() => setSelectedCommentator(selectedCommentator === 'all' ? 'muVa' : 'all')}
              title="நால்வர் உரைகளையும் ஒரே பார்வையில் ஒப்பிடுக"
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedCommentator === 'all'
                  ? 'bg-[#1D5A43] text-white shadow-2xs font-semibold'
                  : isDark ? 'text-[#B5AC9E] hover:text-white' : 'text-[#5C5345] hover:text-black'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">அனைத்தும்</span>
            </button>
          </div>
        </div>

        {/* Commentaries Content Box */}
        <div className={`p-3.5 rounded-xl border transition-colors ${
          isDark ? 'bg-[#201D19] border-[#312B23]' : 'bg-[#FBF8F3] border-[#ECE4D6]'
        }`}>
          {/* Mu. Varadarajan */}
          {(selectedCommentator === 'muVa' || selectedCommentator === 'all') && (
            <div className={selectedCommentator === 'all' ? 'mb-3 pb-3 border-b border-[#ECE4D6] dark:border-[#312B23]' : ''}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#8C2D19] dark:text-[#E8A578]">
                  மு. வரதராசனார் விளக்கம்:
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#2C2721] dark:text-[#DFD7CC]">
                {kural.commentaries.muVa}
              </p>
            </div>
          )}

          {/* Kalaignar Karunanidhi */}
          {(selectedCommentator === 'karunanidhi' || selectedCommentator === 'all') && (
            <div className={selectedCommentator === 'all' ? 'mb-3 pb-3 border-b border-[#ECE4D6] dark:border-[#312B23]' : ''}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#8C2D19] dark:text-[#E8A578]">
                  கலைஞர் உரை:
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#2C2721] dark:text-[#DFD7CC]">
                {kural.commentaries.karunanidhi}
              </p>
            </div>
          )}

          {/* Solomon Pappaiah */}
          {(selectedCommentator === 'solomon' || selectedCommentator === 'all') && (
            <div className={selectedCommentator === 'all' ? 'mb-3 pb-3 border-b border-[#ECE4D6] dark:border-[#312B23]' : ''}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#8C2D19] dark:text-[#E8A578]">
                  சாலமன் பாப்பையா உரை:
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#2C2721] dark:text-[#DFD7CC]">
                {kural.commentaries.solomon}
              </p>
            </div>
          )}

          {/* Parimelazhagar */}
          {(selectedCommentator === 'parimelazhagar' || selectedCommentator === 'all') && (
            <div className={selectedCommentator === 'all' ? 'mb-3 pb-3 border-b border-[#ECE4D6] dark:border-[#312B23]' : ''}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#8C2D19] dark:text-[#E8A578]">
                  பரிமேலழகர் உரை:
                </span>
              </div>
              <p className="text-sm leading-relaxed font-tamil-serif text-[#2C2721] dark:text-[#DFD7CC]">
                {kural.commentaries.parimelazhagar}
              </p>
            </div>
          )}

          {/* English */}
          {(selectedCommentator === 'english' || selectedCommentator === 'all') && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#8C2D19] dark:text-[#E8A578]">
                  English Translation:
                </span>
              </div>
              <p className="text-sm font-medium italic text-[#2C2721] dark:text-[#DFD7CC]">
                "{kural.commentaries.english || 'Righteous couplet from Thirukkural.'}"
              </p>
              {kural.commentaries.englishExplanation && (
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {kural.commentaries.englishExplanation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
