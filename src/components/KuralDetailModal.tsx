import React, { useState, useEffect } from 'react';
import { X, Volume2, Play, Image as ImageIcon, Bookmark, Share2, Edit3, Loader2, Network, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getKuralByNumber } from '../data/kurals';
import { useMapData, PAAL_COLORS } from '../utils/kuralMapData';
import { Kural } from '../types/kural';
import { KuralCouplet } from './KuralCouplet';
import { kuralAudio } from '../utils/audioPlayer';
import { AUDIO_ENABLED } from '../config';
import { shareKural } from '../utils/native';

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
  /** step to the previous / next Kural without closing the window */
  onNavigate?: (kural: Kural) => void;
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
  onNavigate,
  isDark,
}) => {
  const { data: mapData } = useMapData(!!kural && !!onOpenKural);
  const [selectedCommentator, setSelectedCommentator] = useState<
    'muVa' | 'karunanidhi' | 'solomon' | 'parimelazhagar' | 'english' | 'all'
  >('all');
  const [shareNote, setShareNote] = useState("");
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

  const bodyRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [kural?.number]);
  useEffect(() => {
    if (!kural) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [!!kural]);

  if (!kural) return null;

  const prevKural = kural.number > 1 ? getKuralByNumber(kural.number - 1) : null;
  const nextKural = kural.number < 1330 ? getKuralByNumber(kural.number + 1) : null;

  const handlePlayAudio = () => {
    kuralAudio.playKural(kural.number, kural.line1, kural.line2);
  };

  const hasVideo = !!kural.media?.youtubeUrl;
  const hasImage = !!kural.media?.imageUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog" className={`relative w-full max-w-3xl h-[94dvh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-[#181512] border-[#312A21] text-stone-100' : 'bg-white border-[#E8E2D5] text-stone-900'
        }`}
      >
        {/* Top Header: number and chapter on the left, bookmark and close on the right */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-[linear-gradient(160deg,#1D4234,#16392E)] text-[#F4EEDF]">
          <div className="min-w-0 flex flex-col sm:flex-row items-start gap-1 sm:gap-2.5">
            <span className="shrink-0 mt-0.5 px-2.5 py-1 rounded-full bg-[#E3B866] text-[#16392E] text-[13px] font-bold whitespace-nowrap">
              குறள் {kural.number}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="font-tamil-sans text-[16px] font-bold text-[#F3D58E] leading-snug line-clamp-2">
                {kural.athikaramNumber}. {kural.athikaramTamil}
              </div>
              <div className="text-[12px] text-[#B9CFC2] truncate">
                {kural.athikaramEnglish} · {kural.paal}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={async () => {
                const r = await shareKural(kural);
                if (r === 'copied') {
                  setShareNote('நகலெடுக்கப்பட்டது');
                  setTimeout(() => setShareNote(''), 1800);
                }
              }}
              title="பகிர் · Share"
              aria-label="பகிர் · Share"
              className="relative p-2 rounded-full border border-white/20 text-[#E8F0EB] hover:bg-white/10 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {shareNote && (
                <span className="absolute top-full mt-1 right-0 whitespace-nowrap px-2 py-1 rounded-md bg-stone-900 text-white text-[11.5px]">{shareNote}</span>
              )}
            </button>
            <button
              onClick={() => onToggleBookmark(kural.number)}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
              aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
              className={`p-2 rounded-full border transition-colors ${
                isBookmarked
                  ? 'bg-[#E3B866] text-[#16392E] border-[#E3B866]'
                  : 'border-white/20 text-[#E8F0EB] hover:bg-white/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              aria-label="மூடுக"
              className="p-2 rounded-full text-[#E8F0EB] hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Main Couplet */}
          <div className="space-y-2 px-4 py-4 sm:p-6 rounded-2xl bg-[#FBF5E6] dark:bg-[#1E2A24] border border-[#E9D9AE] dark:border-[#3C5246] border-l-4 border-l-[#C9962F]">
            <KuralCouplet
              line1={kural.line1}
              line2={kural.line2}
              maxPx={30}
              minPx={21}
              className="font-tamil-serif font-bold leading-[1.55] text-[#16392E] dark:text-[#F4EEDF]"
            />

            {kural.transliteration && (
              <p className="text-xs sm:text-sm italic text-stone-500 dark:text-stone-400 pt-2">
                {kural.transliteration}
              </p>
            )}

            {/* Media & Audio Action Bar (only when there is something to show) */}
            {(AUDIO_ENABLED || hasVideo || hasImage || onEditMedia) && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E9D9AE]/80 dark:border-[#3C5246]">
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold bg-[#1D4234] text-[#F3D58E] hover:bg-[#245240] transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>இசையில் கேளுங்கள்</span>
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
            )}
          </div>

          {/* Commentator Switcher Tabs: one scrolling row of short names */}
          <div>
            <h3 className="mb-2 font-tamil-sans text-[17px] font-bold text-[#16392E] dark:text-[#F3D58E]">உரைகள் <span className="text-[13px] font-semibold text-stone-500 dark:text-stone-400">· Commentaries</span></h3>
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-1.5 overflow-x-auto [scrollbar-width:none] pb-1">
              {(
                [
                  ['all', 'அனைத்தும்'],
                  ['muVa', 'மு.வ.'],
                  ['karunanidhi', 'கலைஞர்'],
                  ['solomon', 'சாலமன் பாப்பையா'],
                  ['parimelazhagar', 'பரிமேலழகர்'],
                  ['english', 'English'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCommentator(key)}
                  className={`shrink-0 px-4 py-2 rounded-full text-[14px] font-tamil-sans border transition-colors whitespace-nowrap ${
                    selectedCommentator === key
                      ? 'bg-[#1D4234] border-[#1D4234] text-[#F3D58E] font-semibold dark:bg-[#E3B866] dark:border-[#E3B866] dark:text-[#16392E]'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Commentary Cards Display */}
            <div className="mt-4 space-y-3">
              {(selectedCommentator === 'all' || selectedCommentator === 'muVa') && kural.commentaries.muVa && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B1F1C] border border-[#E7E2D4] dark:border-[#2F3833] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <h5 className="font-tamil-sans text-[13px] font-bold text-[#9A6B12] dark:text-[#E3B866] mb-1.5">
                    மு. வரதராசனார்
                  </h5>
                  <p className="text-[16px] font-tamil-sans text-[#22302A] dark:text-stone-200 leading-[1.8]">
                    {kural.commentaries.muVa}
                  </p>
                </div>
              )}

              {(selectedCommentator === 'all' || selectedCommentator === 'karunanidhi') && kural.commentaries.karunanidhi && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B1F1C] border border-[#E7E2D4] dark:border-[#2F3833] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <h5 className="font-tamil-sans text-[13px] font-bold text-[#9A6B12] dark:text-[#E3B866] mb-1.5">
                    கலைஞர் மு. கருணாநிதி
                  </h5>
                  <p className="text-[16px] font-tamil-sans text-[#22302A] dark:text-stone-200 leading-[1.8]">
                    {kural.commentaries.karunanidhi}
                  </p>
                </div>
              )}

              {(selectedCommentator === 'all' || selectedCommentator === 'solomon') && kural.commentaries.solomon && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B1F1C] border border-[#E7E2D4] dark:border-[#2F3833] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <h5 className="font-tamil-sans text-[13px] font-bold text-[#9A6B12] dark:text-[#E3B866] mb-1.5">
                    சாலமன் பாப்பையா
                  </h5>
                  <p className="text-[16px] font-tamil-sans text-[#22302A] dark:text-stone-200 leading-[1.8]">
                    {kural.commentaries.solomon}
                  </p>
                </div>
              )}

              {(selectedCommentator === 'all' || selectedCommentator === 'parimelazhagar') && kural.commentaries.parimelazhagar && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B1F1C] border border-[#E7E2D4] dark:border-[#2F3833] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <h5 className="font-tamil-sans text-[13px] font-bold text-[#9A6B12] dark:text-[#E3B866] mb-1.5">
                    பரிமேலழகர் · பழைய உரை
                  </h5>
                  <p className="text-[16px] font-tamil-sans text-[#22302A] dark:text-stone-200 leading-[1.8]">
                    {kural.commentaries.parimelazhagar}
                  </p>
                </div>
              )}

              {(selectedCommentator === 'all' || selectedCommentator === 'english') && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B1F1C] border border-[#E7E2D4] dark:border-[#2F3833] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <h5 className="text-[13px] font-bold text-[#9A6B12] dark:text-[#E3B866] mb-1.5">
                    English
                  </h5>
                  <p className="text-[16px] font-heading text-[#22302A] dark:text-stone-200 leading-[1.7]">
                    {kural.commentaries.english}
                  </p>
                  {kural.commentaries.englishExplanation && (
                    <p className="text-[14px] text-stone-600 dark:text-stone-400 mt-2 italic leading-relaxed">
                      {kural.commentaries.englishExplanation}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* இதைப் போன்ற குறள்கள் — Kurals closest in meaning */}
            {mapData && onOpenKural && (
              <div className="mt-6">
                <h3 className="mb-2 font-tamil-sans text-[17px] font-bold text-[#16392E] dark:text-[#F3D58E]">இதைப் போன்ற குறள்கள்</h3>
                <div className="space-y-1.5">
                  {mapData.k[kural.number - 1].slice(0, 6).map((n) => {
                    const s = getKuralByNumber(n);
                    return (
                      <button
                        key={n}
                        onClick={() => onOpenKural(s)}
                        className={`w-full flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left cursor-pointer transition-colors ${
                          isDark ? 'border-[#312A21] hover:bg-white/5' : 'border-[#EEE8DC] hover:bg-stone-50'
                        }`}
                      >
                        <span className="mt-2 w-2 h-2 rounded-full shrink-0" style={{ background: PAAL_COLORS[s.paal] }} />
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
                              · {s.athikaramNumber === kural.athikaramNumber ? 'இதே அதிகாரம்' : 'வேறு அதிகாரம் · ஒத்த பொருள்'}
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

        {/* Modal Footer: previous / next Kural; the close button only on bigger screens (phones have ✕ at the top) */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-2.5 sm:py-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-[#1C1916]">
          {onNavigate ? (
            <div className="flex items-center gap-2 w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none [&>button]:justify-center">
              <button
                onClick={() => prevKural && onNavigate(prevKural)}
                disabled={!prevKural}
                className="inline-flex items-center gap-1 pl-2.5 pr-3.5 py-2 rounded-full border border-[#1D4234]/25 dark:border-stone-700 text-[#16392E] dark:text-stone-100 text-[14px] font-semibold disabled:opacity-35 hover:bg-[#1D4234]/5 dark:hover:bg-stone-800"
              >
                <ChevronLeft className="w-4 h-4" /> {prevKural ? `குறள் ${prevKural.number}` : ''}
              </button>
              <button
                onClick={() => nextKural && onNavigate(nextKural)}
                disabled={!nextKural}
                className="inline-flex items-center gap-1 pl-3.5 pr-2.5 py-2 rounded-full border border-[#1D4234]/25 dark:border-stone-700 text-[#16392E] dark:text-stone-100 text-[14px] font-semibold disabled:opacity-35 hover:bg-[#1D4234]/5 dark:hover:bg-stone-800"
              >
                {nextKural ? `குறள் ${nextKural.number}` : ''} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : onShowOnMap ? (
            <button
              onClick={() => onShowOnMap(kural.number)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-700/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-500/10 transition-colors"
            >
              <Network className="w-4 h-4" /> வரைபடத்தில் பார்
            </button>
          ) : <span />}
          <button
            onClick={onClose}
            className="hidden sm:inline-flex px-5 py-2 rounded-full bg-[#1D4234] text-[#F3D58E] text-[13px] font-semibold hover:bg-[#245240] transition-colors"
          >
            மூடுக (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
