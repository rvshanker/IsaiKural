import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Shuffle, 
  Bookmark, 
  Copy, 
  Check, 
  BookOpen, 
  Layers,
  Square,
  Play
} from 'lucide-react';
import { Kural } from '../types/kural';
import { kuralAudio } from '../utils/audioPlayer';

interface DailyKuralCardProps {
  kural: Kural;
  onShuffleRandom: () => void;
  onOpenDetails: (kural: Kural) => void;
  isBookmarked: boolean;
  onToggleBookmark: (num: number) => void;
  isDark: boolean;
}

export const DailyKuralCard: React.FC<DailyKuralCardProps> = ({
  kural,
  onShuffleRandom,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
  isDark,
}) => {
  const [selectedCommentator, setSelectedCommentator] = useState<'muVa' | 'karunanidhi' | 'solomon' | 'parimelazhagar' | 'english'>('muVa');
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

  const handleToggleAudio = () => {
    kuralAudio.playKural(kural.number, kural.line1, kural.line2);
  };

  const handleCopy = () => {
    const commentary =
      selectedCommentator === 'muVa'
        ? `மு.வ: ${kural.commentaries.muVa}`
        : selectedCommentator === 'karunanidhi'
        ? `கலைஞர்: ${kural.commentaries.karunanidhi}`
        : selectedCommentator === 'solomon'
        ? `சாலமன் பாப்பையா: ${kural.commentaries.solomon}`
        : selectedCommentator === 'parimelazhagar'
        ? `பரிமேலழகர்: ${kural.commentaries.parimelazhagar}`
        : `English: ${kural.commentaries.english || ''}`;

    const text = `திருக்குறள் ${kural.number} (${kural.athikaramTamil})\n\n${kural.line1}\n${kural.line2}\n\n${commentary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get current active commentary
  const getActiveCommentaryText = () => {
    switch (selectedCommentator) {
      case 'karunanidhi':
        return kural.commentaries.karunanidhi;
      case 'solomon':
        return kural.commentaries.solomon;
      case 'parimelazhagar':
        return kural.commentaries.parimelazhagar;
      case 'english':
        return kural.commentaries.english || 'No English commentary available.';
      case 'muVa':
      default:
        return kural.commentaries.muVa;
    }
  };

  return (
    <section 
      id="daily-kural"
      className={`w-full max-w-4xl mx-auto rounded-3xl border transition-all duration-200 overflow-hidden ${
        isDark
          ? 'bg-[#1C1814] border-[#362E25] text-[#EDE7DE] shadow-xl'
          : 'bg-white border-[#E6DFC5] text-[#24211D] shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Banner Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#D97706] via-[#B45309] to-[#9A3412]" />

      <div className="p-6 sm:p-8 md:p-10">
        {/* Curatorial Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[#9A3412]/10 text-[#9A3412] dark:text-[#E8A578] border border-[#9A3412]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>இன்றைய திருக்குறள் · Daily Kural</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              குறள் {kural.number}
            </span>
          </div>

          {/* Paal & Athikaram Meta */}
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold text-stone-700 dark:text-stone-300">{kural.paal}</span>
            <span>·</span>
            <span>அதிகாரம் {kural.athikaramNumber}: <strong className="font-medium text-stone-800 dark:text-stone-200">{kural.athikaramTamil}</strong> ({kural.athikaramEnglish})</span>
          </div>
        </div>

        {/* Couplet Typography */}
        <div className="my-6 py-4 px-5 rounded-2xl bg-stone-50/70 dark:bg-[#25201A]/80 border border-stone-200/70 dark:border-[#382F24]">
          <blockquote className="space-y-2">
            <p className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-relaxed text-[#1F1B16] dark:text-[#FAF7F2]">
              {kural.line1}
            </p>
            <p className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-relaxed text-[#1F1B16] dark:text-[#FAF7F2]">
              {kural.line2}
            </p>
          </blockquote>

          {kural.transliteration && (
            <p className="mt-3 text-xs sm:text-sm text-stone-500 dark:text-stone-400 italic">
              "{kural.transliteration}"
            </p>
          )}
        </div>

        {/* Commentary Selector & Commentary Display */}
        <div className="mt-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <Layers className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>உரை விளக்கம்:</span>
            </div>

            {/* Commentary Tabs */}
            <div className={`flex flex-wrap items-center gap-1 p-1 rounded-xl text-xs ${
              isDark ? 'bg-[#25201A] border border-[#3A3126]' : 'bg-stone-100 border border-stone-200'
            }`}>
              <button
                onClick={() => setSelectedCommentator('muVa')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'muVa'
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                மு.வ உரை
              </button>
              <button
                onClick={() => setSelectedCommentator('karunanidhi')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'karunanidhi'
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                கலைஞர் உரை
              </button>
              <button
                onClick={() => setSelectedCommentator('solomon')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'solomon'
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                சாலமன் பாப்பையா
              </button>
              <button
                onClick={() => setSelectedCommentator('parimelazhagar')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'parimelazhagar'
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                பரிமேலழகர்
              </button>
              <button
                onClick={() => setSelectedCommentator('english')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'english'
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-[#221D17] border-[#362D22]' : 'bg-[#FBF9F5] border-[#ECE4D5]'
          }`}>
            <p className="text-sm sm:text-base leading-relaxed text-stone-800 dark:text-stone-200">
              {getActiveCommentaryText()}
            </p>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Recitation Button */}
            <button
              onClick={handleToggleAudio}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                isPlayingAudio
                  ? 'bg-[#9A3412] text-white animate-pulse'
                  : isDark
                  ? 'bg-[#2A231C] border border-[#44382B] text-amber-300 hover:bg-[#342C23]'
                  : 'bg-amber-50 border border-amber-200 text-[#9A3412] hover:bg-amber-100'
              }`}
              title="குறள் ஓசை கேட்க"
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>ஓசை நிறுத்த</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{isLoadingAudio ? 'ஒலிப்பதற்குக் காத்திருக்கிறது...' : 'குறள் ஓசை கேட்க'}</span>
                </>
              )}
            </button>

            {/* Random Kural / Shuffle Button */}
            <button
              onClick={onShuffleRandom}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                isDark
                  ? 'border-[#3D3328] bg-[#221D17] text-stone-200 hover:bg-[#2C241D] hover:text-white'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
              }`}
              title="மற்றொரு குறளைக் காட்டுக"
            >
              <Shuffle className="w-4 h-4 text-[#9A3412]" />
              <span>வேறு குறள் (Random)</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isDark
                  ? 'border-[#3D3328] bg-[#221D17] text-stone-300 hover:bg-[#2C241D]'
                  : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
              title="குறளை நகலெடு"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'நகலெடுக்கப்பட்டது!' : 'நகலெடு'}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => onToggleBookmark(kural.number)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-[#9A3412] text-white border-[#9A3412]'
                  : isDark
                  ? 'border-[#3D3328] bg-[#221D17] text-stone-300 hover:bg-[#2C241D]'
                  : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
              title={isBookmarked ? 'சேமிப்பிலிருந்து நீக்கு' : 'குறித்திடு'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Full Modal Explanation Trigger */}
          <button
            onClick={() => onOpenDetails(kural)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#9A3412] dark:text-[#E8A578] hover:underline cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>முழு விளக்கம் & 4 உரைகள் →</span>
          </button>
        </div>
      </div>
    </section>
  );
};
