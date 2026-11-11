import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Volume2, Loader2, Sparkles } from 'lucide-react';
import { Kural } from '../types/kural';
import { kuralAudio } from '../utils/audioPlayer';

interface FeaturedKuralSectionProps {
  kurals: Kural[];
  onOpenKural: (kural: Kural) => void;
  isDark: boolean;
}

export const FeaturedKuralSection: React.FC<FeaturedKuralSectionProps> = ({
  kurals,
  onOpenKural,
  isDark,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Safety fallback
  const featuredList = kurals.length > 0 ? kurals : [];
  const currentKural = featuredList[currentIndex] || featuredList[0];

  useEffect(() => {
    if (!currentKural) return;
    const unsubscribe = kuralAudio.subscribe((state) => {
      const isThisKural = state.kuralNumber === currentKural.number;
      setIsPlayingAudio(isThisKural && state.isPlaying);
      setIsLoadingAudio(isThisKural && state.isLoading);
    });
    return unsubscribe;
  }, [currentKural?.number]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : featuredList.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < featuredList.length - 1 ? prev + 1 : 0));
  };

  const handlePlayAudio = () => {
    if (!currentKural) return;
    kuralAudio.playKural(currentKural.number, currentKural.line1, currentKural.line2);
  };

  if (!currentKural) return null;

  return (
    <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className={`rounded-2xl border transition-colors overflow-hidden shadow-xs ${
        isDark ? 'bg-[#1A1714] border-[#312B22]' : 'bg-white border-[#E8E2D5]'
      }`}>
        <div className="p-6 sm:p-8 lg:p-10">
          {/* Top Bar: Eyebrow + Section Tag + Audio + Prev/Next Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-200/70 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5A93C]/15 text-[#9A3412] dark:text-[#E5A93C] text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Kural {currentKural.number}</span>
              </span>

              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                {currentKural.athikaramTamil} ({currentKural.athikaramEnglish}) · {currentKural.paal}
              </span>
            </div>

            {/* Audio & Prev/Next Arrows */}
            <div className="flex items-center gap-2">
              {/* Listen to Featured Kural */}
              <button
                onClick={handlePlayAudio}
                title={isPlayingAudio ? "Stop Audio" : "Play Recitation Audio"}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/40'
                    : isLoadingAudio
                    ? 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 animate-pulse'
                    : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {isLoadingAudio ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                )}
                <span>{isPlayingAudio ? 'ஒலிக்கிறது' : 'கேட்க (Audio)'}</span>
              </button>

              <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1" />

              <button
                onClick={handlePrev}
                aria-label="Previous featured kural"
                className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-400 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next featured kural"
                className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-400 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Couplet & Meaning Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
            {/* Left: Sacred Couplet Verses & Translation */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <p className="font-tamil-serif text-2xl sm:text-3xl lg:text-3xl font-bold text-stone-900 dark:text-stone-50 leading-relaxed tracking-wide">
                  {currentKural.line1}
                </p>
                <p className="font-tamil-serif text-2xl sm:text-3xl lg:text-3xl font-bold text-stone-900 dark:text-stone-50 leading-relaxed tracking-wide">
                  {currentKural.line2}
                </p>
              </div>

              {currentKural.transliteration && (
                <p className="text-xs sm:text-sm italic text-stone-600 dark:text-stone-400 font-serif pt-1">
                  {currentKural.transliteration}
                </p>
              )}

              {currentKural.commentaries.english && (
                <p className="text-sm text-stone-700 dark:text-stone-300 pt-3 border-t border-stone-100 dark:border-stone-800/80 leading-relaxed">
                  "{currentKural.commentaries.english}"
                </p>
              )}
            </div>

            {/* Right: Tamil Meaning & Exploration Action */}
            <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-200/70 dark:border-stone-800 pt-5 lg:pt-0 lg:pl-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9A3412] dark:text-[#E5A93C] mb-2">
                  மு. வரதராசனார் விளக்கம் (Meaning)
                </h4>
                <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 font-tamil-sans">
                  {currentKural.commentaries.muVa || currentKural.commentaries.karunanidhi}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => onOpenKural(currentKural)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-150 group cursor-pointer"
                >
                  <span>Read Full Explanation & All Commentaries</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
