import React, { useState, useMemo } from 'react';
import { Play, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, ExternalLink, Search, Youtube } from 'lucide-react';
import { Kural } from '../types/kural';
import { KuralCouplet } from './KuralCouplet';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/youtube';
import { YOUTUBE_CHANNEL_URL } from '../data/kuralMedia';

const isShort = (url?: string) => !!url && /\/shorts\//.test(url);

/* ───────────────────────── Gallery: every kural that has a video ───────────────────────── */

interface VideoGalleryProps {
  kurals: Kural[];
  onOpen: (num: number) => void;
  playlistId?: string;
  isDark: boolean;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ kurals, onOpen, playlistId, isDark }) => {
  const [selectedPaal, setSelectedPaal] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const ink = isDark ? 'text-[#EEE8DC]' : 'text-[#1B2621]';
  const muted = isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]';
  const border = isDark ? 'border-[#2A302C]' : 'border-[#ECEBE5]';

  const paalCounts = useMemo(() => {
    return {
      all: kurals.length,
      aram: kurals.filter(k => k.paal === 'அறத்துப்பால்').length,
      porul: kurals.filter(k => k.paal === 'பொருட்பால்').length,
      kamam: kurals.filter(k => k.paal === 'காமத்துப்பால்').length,
    };
  }, [kurals]);

  const filteredKurals = useMemo(() => {
    return kurals.filter(k => {
      if (selectedPaal !== 'all' && k.paal !== selectedPaal) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const numMatch = k.number.toString().includes(q);
        const l1Match = k.line1.toLowerCase().includes(q);
        const l2Match = k.line2.toLowerCase().includes(q);
        const athikaramMatch = k.athikaramTamil.toLowerCase().includes(q) || k.athikaramEnglish.toLowerCase().includes(q);
        return numMatch || l1Match || l2Match || athikaramMatch;
      }
      return true;
    });
  }, [kurals, selectedPaal, searchQuery]);

  return (
    <>
      {/* Filtering Bar: Paal tabs & Quick search */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Paal filter tabs */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { key: 'all', label: 'அனைத்தும்', count: paalCounts.all },
              { key: 'அறத்துப்பால்', label: 'அறத்துப்பால்', count: paalCounts.aram },
              { key: 'பொருட்பால்', label: 'பொருட்பால்', count: paalCounts.porul },
              { key: 'காமத்துப்பால்', label: 'காமத்துப்பால்', count: paalCounts.kamam },
            ].map(tab => {
              const active = selectedPaal === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedPaal(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-[12.5px] sm:text-[13px] font-medium transition-all cursor-pointer border ${
                    active
                      ? isDark
                        ? 'bg-[#1F3A2F] border-[#7FB39A] text-[#E3EEE6] font-semibold'
                        : 'bg-[#1D5A43] border-[#1D5A43] text-white shadow-xs font-semibold'
                      : isDark
                      ? 'border-[#2A302C] text-[#C9D6CD] hover:border-[#4C5E54] hover:bg-white/5'
                      : 'border-[#E2DFD8] bg-white text-[#4A5550] hover:border-[#1D5A43] hover:text-[#1D5A43]'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="குறள் எண் அல்லது சொல்..."
              className={`w-full pl-9 pr-3 py-1.5 text-[13px] rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-[#1D5A43]/30 ${
                isDark
                  ? 'bg-[#161A17] border-[#2A302C] text-[#EEE8DC] placeholder-[#718278]'
                  : 'bg-white border-[#E2DFD8] text-[#1B2621] placeholder-[#8F9893]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Grid of video cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredKurals.map((k) => {
          const thumb = getYouTubeThumbnail(k.media?.youtubeUrl);
          return (
            <button
              key={k.number}
              onClick={() => onOpen(k.number)}
              className="group text-left cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4234]"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#1D4234]">
                {thumb && (
                  <img
                    src={thumb}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover scale-[1.35] transition-transform duration-300 group-hover:scale-[1.42]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[12px] font-semibold backdrop-blur-sm">
                  குறள் {k.number}
                </span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <Play className="w-5 h-5 text-[#1D4234] fill-current ml-0.5" />
                  </span>
                </span>
                <span className="absolute bottom-2 left-2 right-2 font-tamil-sans text-white text-[13px] font-semibold leading-snug line-clamp-2 drop-shadow">
                  {k.line1}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-1 text-[12px]">
                <p className={`truncate font-medium ${muted}`}>{k.athikaramTamil}</p>
                <span className={`shrink-0 text-[11px] px-1.5 py-0.2 rounded ${isDark ? 'bg-white/5 text-[#A9BDB2]' : 'bg-[#E3EEE6] text-[#1D5A43]'}`}>
                  {k.paal.slice(0, 3)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* External links: Playlist + YouTube Channel */}
      <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-center gap-4 text-center">
        {playlistId && (
          <a
            href={`https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13.5px] font-medium transition-all ${
              isDark
                ? 'border-[#2A302C] text-[#A9BDB2] hover:bg-white/5 hover:text-white'
                : 'border-[#E2DFD8] bg-white text-[#1D5A43] hover:bg-[#F5F8F6] shadow-2xs'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-600" />
            YouTube-ல் முழு Playlist காண <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13.5px] font-medium transition-all ${
            isDark
              ? 'border-[#2A302C] text-[#A9BDB2] hover:bg-white/5 hover:text-white'
              : 'border-[#E2DFD8] bg-white text-[#1D5A43] hover:bg-[#F5F8F6] shadow-2xs'
          }`}
        >
          Creative Corner Tamil சேனல் <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {!filteredKurals.length && (
        <div className="text-center py-12">
          <p className={`text-[15px] ${ink}`}>தேடலுக்குரிய பாடல் காணொளி எதுவும் கிடைக்கவில்லை.</p>
          <button
            onClick={() => { setSelectedPaal('all'); setSearchQuery(''); }}
            className="mt-2 text-sm text-[#1D5A43] dark:text-[#7FB39A] underline cursor-pointer"
          >
            அனைத்து 50 பாடல்களையும் காட்டுக
          </button>
        </div>
      )}
    </>
  );
};

/* ───────────────────────── One video with its meaning ───────────────────────── */

interface VideoDetailProps {
  kural: Kural;
  prev?: Kural;
  next?: Kural;
  onGo: (num: number) => void;
  onOpenDetails: (k: Kural) => void;
  isBookmarked: boolean;
  onToggleBookmark: (num: number) => void;
  isDark: boolean;
}

export const VideoDetail: React.FC<VideoDetailProps> = ({
  kural,
  prev,
  next,
  onGo,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
  isDark,
}) => {
  const url = kural.media?.youtubeUrl;
  const embed = getYouTubeEmbedUrl(url);
  const vertical = isShort(url);
  const ink = isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]';
  const body = isDark ? 'text-[#D2CBBE]' : 'text-[#2E3B35]';
  const muted = isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]';
  const panel = isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white border-[#ECEBE5]';

  const meanings: { label: string; text?: string }[] = [
    { label: 'மு. வரதராசனார் உரை', text: kural.commentaries.muVa },
    { label: 'கலைஞர் உரை', text: kural.commentaries.karunanidhi },
    { label: 'English', text: kural.commentaries.english },
  ];

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-8 lg:items-start">
      {/* Player */}
      <div className="lg:sticky lg:top-24">
        <div
          className={`relative mx-auto rounded-2xl overflow-hidden bg-black shadow-lg ${
            vertical ? 'aspect-[9/16] w-[min(100%,calc(62vh*9/16))] lg:w-[min(100%,calc(72vh*9/16))]' : 'aspect-video w-full'
          }`}
        >
          {embed && (
            <iframe
              key={kural.number}
              className="absolute inset-0 w-full h-full"
              src={`${embed}&autoplay=1`}
              title={kural.media?.youtubeTitle || `குறள் ${kural.number}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </div>

      {/* Meaning */}
      <div className="mt-5 lg:mt-0 min-w-0">
        <div className={`rounded-2xl border p-4 sm:p-6 ${panel}`}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className={`text-[13px] ${muted}`}>
              <span className={`px-2 py-0.5 mr-2 rounded-md text-[12.5px] font-semibold ${isDark ? 'bg-[#1F3A2F] text-[#CFE3D7]' : 'bg-[#E3EEE6] text-[#1D5A43]'}`}>
                குறள் {kural.number}
              </span>
              {kural.athikaramTamil}
            </span>
            <button
              onClick={() => onToggleBookmark(kural.number)}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? 'சேமிப்பிலிருந்து நீக்கு' : 'சேமி'}
              className={`w-9 h-9 inline-flex items-center justify-center rounded-full cursor-pointer ${isDark ? 'text-[#C9D6CD] hover:bg-white/10' : 'text-[#1D5A43] hover:bg-[#1D5A43]/8'}`}
            >
              {isBookmarked ? <BookmarkCheck className="w-[18px] h-[18px] fill-current" /> : <Bookmark className="w-[18px] h-[18px]" />}
            </button>
          </div>

          <KuralCouplet line1={kural.line1} line2={kural.line2} maxPx={24} className={`font-tamil-sans font-bold leading-[1.6] ${ink}`} />
          {kural.transliteration && <p className={`mt-1 text-[12.5px] italic ${muted}`}>{kural.transliteration}</p>}

          <div className="mt-4 space-y-4">
            {meanings.filter((m) => m.text).map((m) => (
              <div key={m.label}>
                <h3 className={`text-[12.5px] font-semibold mb-1 ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`}>{m.label}</h3>
                <p className={`font-tamil-sans text-[15px] leading-[1.75] ${body}`}>{m.text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onOpenDetails(kural)}
            className={`mt-4 inline-flex items-center gap-0.5 text-[13.5px] font-medium cursor-pointer hover:underline ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`}
          >
            அனைத்து உரைகள் <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Previous / next video */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[prev, next].map((k, i) =>
            k ? (
              <button
                key={k.number}
                onClick={() => onGo(k.number)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-3 cursor-pointer transition-colors ${i === 1 ? 'justify-end text-right' : ''} ${panel} hover:border-[#C9D6CD]`}
              >
                {i === 0 && <ChevronLeft className={`w-5 h-5 shrink-0 ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`} />}
                <span className="min-w-0">
                  <span className={`block text-[12px] ${muted}`}>{i === 0 ? 'முந்தைய' : 'அடுத்த'} பாடல்</span>
                  <span className={`block font-tamil-sans text-[14px] font-semibold truncate ${ink}`}>குறள் {k.number}</span>
                </span>
                {i === 1 && <ChevronRight className={`w-5 h-5 shrink-0 ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`} />}
              </button>
            ) : (
              <span key={i} />
            )
          )}
        </div>
      </div>
    </div>
  );
};
