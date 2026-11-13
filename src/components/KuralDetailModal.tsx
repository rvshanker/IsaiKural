import React, { useState, useEffect } from 'react';
import { X, Volume2, Play, Image as ImageIcon, Bookmark, Share2, Edit3, Loader2, Network, PlayCircle } from 'lucide-react';
import { getKuralByNumber } from '../data/kurals';
import { useMapData, topicColor, similarReason } from '../utils/kuralMapData';
import { Kural } from '../types/kural';
import { KuralCouplet } from './KuralCouplet';
import { kuralAudio } from '../utils/audioPlayer';
import { AUDIO_ENABLED } from '../config';

interface KuralDetailModalProps {
  kural: Kural | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (num: number) => void;
  onOpenVideo: (kural: Kural) => void;
  onOpenImage: (kural: Kural) => void;
  onEditMedia?: (kural: Kural) => void;
  /** open another Kural in this window (from the similar Kurals list) */
  onOpenKural?: (kural: Kural) => void;
  /** show this Kural on the Kural map */
  onShowOnMap?: (num: number) => void;
  isDark: boolean;
}

export const KuralDetailModal: React.FC<KuralDetailModalProps> = ({
  kural,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onOpenVideo,
  onOpenImage,
  onEditMedia,
  onOpenKural,
  onShowOnMap,
  isDark,
}) => {
  const { data: mapData } = useMapData(!!kural);
  const [selectedCommentator, setSelectedCommentator] = useState<
    'muVa' | 'karunanidhi' | 'solomon' | 'parimelazhagar' | 'english' | 'all'
  >('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentVoice, setCurrentVoice] = useState(kuralAudio.getVoice());

  useEffect(() => {
    if (!kural) return;
    const unsubscribe = kuralAudio.subscribe((state) => {
      const isThisKural = state.kuralNumber === kural.number;
      setIsPlayingAudio(isThisKural && state.isPlaying);
      setIsLoadingAudio(isThisKural && state.isLoading);
      setCurrentVoice(state.voice);
    });
    return unsubscribe;
  }, [kural?.number]);

  if (!kural) return null;

  const handlePlayAudio = () => {
    kuralAudio.playKural(kural.number, kural.line1, kural.line2);
  };

  const hasVideo = !!kural.media?.youtubeUrl;
  const hasImage = !!kural.media?.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-[#181512] border-[#312A21] text-stone-100' : 'bg-white border-[#E8E2D5] text-stone-900'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#E5A93C] text-[#1B1408] font-bold">
              குறள் {kural.number}
            </span>
            <span className="font-semibold text-[#8C2D19] dark:text-[#E5A93C]">
              {kural.athikaramTamil} ({kural.athikaramEnglish})
            </span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-500 dark:text-stone-400">
              {kural.paal}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(kural.number)}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
              className={`p-2 rounded-full border transition-colors ${
                isBookmarked 
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-amber-300' 
                  : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Couplet */}
          <div className="space-y-2 p-5 rounded-xl bg-[#F9F7F2] dark:bg-[#201C18] border border-[#ECE5D8] dark:border-[#2E271D]">
            <KuralCouplet
              line1={kural.line1}
              line2={kural.line2}
              maxPx={30}
              className="font-tamil-serif font-bold leading-relaxed text-stone-900 dark:text-stone-50"
            />

            {kural.transliteration && (
              <p className="text-xs sm:text-sm italic text-stone-500 dark:text-stone-400 pt-2">
                {kural.transliteration}
              </p>
            )}

            {/* Media & Audio Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-stone-200/60 dark:border-stone-800">
              {AUDIO_ENABLED && <>
              {/* Listen Audio */}
              <button
                onClick={handlePlayAudio}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/40'
                    : isLoadingAudio
                    ? 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-300 animate-pulse'
                    : 'bg-[#1D5A43] text-white border-[#1D5A43] hover:bg-[#164835]'
                }`}
              >
                {isLoadingAudio ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                )}
                <span>
                  {isPlayingAudio
                    ? 'ஒலிக்கிறது (Stop)'
                    : isLoadingAudio
                    ? 'ஏற்றுகிறது...'
                    : 'இயற்கைக் குரல் கேட்க'}
                </span>
              </button>

              {/* Voice Choice */}
              <div className="inline-flex items-center rounded-full border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 p-0.5 text-[11px]">
                <button
                  onClick={() => {
                    kuralAudio.setVoice('Charon');
                    if (isPlayingAudio) kuralAudio.playKural(kural.number, kural.line1, kural.line2);
                  }}
                  className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    currentVoice === 'Charon'
                      ? 'bg-[#1D5A43] text-white font-medium shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                  title="ஆண் புலவர் குரல் (Dignified Male Voice)"
                >
                  ஆண் குரல்
                </button>
                <button
                  onClick={() => {
                    kuralAudio.setVoice('Kore');
                    if (isPlayingAudio) kuralAudio.playKural(kural.number, kural.line1, kural.line2);
                  }}
                  className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    currentVoice === 'Kore'
                      ? 'bg-[#1D5A43] text-white font-medium shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                  title="பெண் புலவர் குரல் (Melodious Female Voice)"
                >
                  பெண் குரல்
                </button>
              </div>
              </>}

              {/* Video Button */}
              {hasVideo && (
                <button
                  onClick={() => onOpenVideo(kural)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-100 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>காணொளி விளக்கம் (Watch Video)</span>
                </button>
              )}

              {/* Image Button */}
              {hasImage && (
                <button
                  onClick={() => onOpenImage(kural)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 hover:bg-blue-100 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>விளக்கப் படம் (View Image)</span>
                </button>
              )}

              {/* Edit / Attach Media (local editor only) */}
              {onEditMedia && <button
                onClick={() => onEditMedia(kural)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{hasVideo || hasImage ? 'ஊடகம் மாற்று' : 'காணொளி / படம் இணை'}</span>
              </button>}
            </div>
          </div>

          {/* Commentator Switcher Tabs */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                உரையாசிரியர்கள் (Classical Tamil Commentaries)
              </span>
            </div>

            <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-stone-100 dark:bg-[#201C18] border border-stone-200 dark:border-stone-800 text-xs">
              <button
                onClick={() => setSelectedCommentator('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'all'
                    ? 'bg-[#E5A93C] text-[#1B1408] font-semibold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                அனைத்து உரைகளும் (All)
              </button>
              <button
                onClick={() => setSelectedCommentator('muVa')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'muVa'
                    ? 'bg-[#E5A93C] text-[#1B1408] font-semibold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                மு. வரதராசனார்
              </button>
              <button
                onClick={() => setSelectedCommentator('karunanidhi')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'karunanidhi'
                    ? 'bg-[#E5A93C] text-[#1B1408] font-semibold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                மு. கருணாநிதி
              </button>
              <button
                onClick={() => setSelectedCommentator('solomon')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'solomon'
                    ? 'bg-[#E5A93C] text-[#1B1408] font-semibold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                சாலமன் பாப்பையா
              </button>
              <button
                onClick={() => setSelectedCommentator('parimelazhagar')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'parimelazhagar'
                    ? 'bg-[#E5A93C] text-[#1B1408] font-semibold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                பரிமேலழகர்
              </button>
              <button
                onClick={() => setSelectedCommentator('english')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCommentator === 'english'
                    ? 'bg-[#E5A93C] text-[#1B1408] font-semibold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Commentary Cards Display */}
            <div className="mt-4 space-y-3">
              {(selectedCommentator === 'all' || selectedCommentator === 'muVa') && kural.commentaries.muVa && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h5 className="text-xs font-bold text-[#8C2D19] dark:text-[#E5A93C] mb-1">
                    மு. வரதராசனார் உரை:
                  </h5>
                  <p className="text-sm font-tamil-sans text-stone-800 dark:text-stone-200 leading-relaxed">
                    {kural.commentaries.muVa}
                  </p>
                </div>
              )}

              {(selectedCommentator === 'all' || selectedCommentator === 'karunanidhi') && kural.commentaries.karunanidhi && (
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                  <h5 className="text-xs font-bold text-[#8C2D19] dark:text-[#E5A93C] mb-1">
                    கலைஞர் மு. கருணாநிதி உரை:
                  </h5>
                  <p className="text-sm font-tamil-sans text-stone-800 dark:text-stone-200 leading-relaxed">
                    {kural.commentaries.karunanidhi}
                  </p>
                </div>
              )}

              {(selectedCommentator === 'all' || selectedCommentator === 'solomon') && kural.commentaries.solomon && (
                <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <h5 className="text-xs font-bold text-[#8C2D19] dark:text-[#E5A93C] mb-1">
                    சாலமன் பாப்பையா உரை:
                  </h5>
                  <p className="text-sm font-tamil-sans text-stone-800 dark:text-stone-200 leading-relaxed">
                    {kural.commentaries.solomon}
                  </p>
                </div>
              )}

              {(selectedCommentator === 'all' || selectedCommentator === 'parimelazhagar') && kural.commentaries.parimelazhagar && (
                <div className="p-4 rounded-xl bg-stone-500/5 border border-stone-500/20">
                  <h5 className="text-xs font-bold text-[#8C2D19] dark:text-[#E5A93C] mb-1">
                    பரிமேலழகர் உரை (Classical Commentary):
                  </h5>
                  <p className="text-sm font-tamil-sans text-stone-800 dark:text-stone-200 leading-relaxed">
                    {kural.commentaries.parimelazhagar}
                  </p>
                </div>
              )}

              {(selectedCommentator === 'all' || selectedCommentator === 'english') && (
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h5 className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
                    English Translation & Explanation:
                  </h5>
                  <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                    {kural.commentaries.english}
                  </p>
                  {kural.commentaries.englishExplanation && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 italic">
                      {kural.commentaries.englishExplanation}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* இதைப் போன்ற குறள்கள் — Kurals closest in meaning */}
            {mapData && onOpenKural && (
              <div className="mt-6">
                <h4 className="text-sm font-bold mb-2 text-emerald-800 dark:text-emerald-400">இதைப் போன்ற குறள்கள்</h4>
                <div className="space-y-1.5">
                  {mapData.k[kural.number - 1][3].slice(0, 6).map((n) => {
                    const s = getKuralByNumber(n);
                    return (
                      <button
                        key={n}
                        onClick={() => onOpenKural(s)}
                        className={`w-full flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left cursor-pointer transition-colors ${
                          isDark ? 'border-[#312A21] hover:bg-white/5' : 'border-[#EEE8DC] hover:bg-stone-50'
                        }`}
                      >
                        <span className="mt-2 w-2 h-2 rounded-full shrink-0" style={{ background: topicColor(mapData.k[n - 1][2]) }} />
                        <span className="min-w-0">
                          <span className="block font-tamil-sans text-[14.5px] leading-snug">
                            {s.line1}
                            <br />
                            {s.line2}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-stone-500 dark:text-stone-400">
                            <span className="font-semibold text-amber-700 dark:text-amber-400">{n}</span>
                            <span>· {s.athikaramTamil}</span>
                            <span className="text-emerald-700 dark:text-emerald-400">
                              · {similarReason(mapData, kural.number, n, s.athikaramNumber === kural.athikaramNumber)}
                            </span>
                            {s.media?.youtubeUrl && (
                              <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-400">
                                · <PlayCircle className="w-3 h-3" /> பாடல்
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#1C1916]">
          {onShowOnMap ? (
            <button
              onClick={() => onShowOnMap(kural.number)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-700/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-500/10 transition-colors"
            >
              <Network className="w-4 h-4" /> வரைபடத்தில் பார்
            </button>
          ) : <span />}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            மூடுக (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
