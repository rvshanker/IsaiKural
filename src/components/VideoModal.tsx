import React from 'react';
import { X, Youtube, BookOpen } from 'lucide-react';
import { Kural } from '../types/kural';
import { getYouTubeEmbedUrl } from '../utils/youtube';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  kural: Kural | null;
  isDark: boolean;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  kural,
  isDark,
}) => {
  if (!isOpen || !kural || !kural.media?.youtubeUrl) return null;

  const embedUrl = getYouTubeEmbedUrl(kural.media.youtubeUrl);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-md max-h-[94vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark 
            ? 'bg-[#181614] border-[#38322A] text-[#EDE8DF]' 
            : 'bg-[#FFFDF9] border-[#E5DFD3] text-[#24211D]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className={`p-3.5 sm:p-4 flex items-center justify-between border-b shrink-0 ${
          isDark ? 'border-[#2E2821] bg-[#211D18]' : 'border-[#ECE4D6] bg-[#F7F2E9]'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Youtube className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#9A3412]">
                <span>குறள் {kural.number}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{kural.athikaramTamil}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold border border-red-200 dark:border-red-900/50">
                  9:16
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold truncate">
                {kural.media.youtubeTitle || `திருக்குறள் ${kural.number} காணொளி`}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full shrink-0 transition-colors ${
              isDark 
                ? 'text-[#A89F91] hover:bg-[#2F2922] hover:text-white' 
                : 'text-[#6C6356] hover:bg-[#EAE2D3] hover:text-black'
            }`}
            aria-label="Close video player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content: 9:16 Video Player & Couplet Info */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* 9:16 Video Player Frame */}
          <div className="w-full flex justify-center bg-black/95 p-2 rounded-xl border border-black/20">
            <div className="aspect-[9/16] w-full max-w-[320px] max-h-[58vh] bg-black rounded-lg overflow-hidden relative shadow-lg">
              {embedUrl ? (
                <iframe
                  src={`${embedUrl}&autoplay=1`}
                  title={kural.media.youtubeTitle || `Thirukkural ${kural.number}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6 text-center text-xs">
                  <p>காணொளியை ஏற்ற இயலவில்லை. செல்லுபடியாகும் 9:16 YouTube Shorts முகவரியை சரிபார்க்கவும்.</p>
                </div>
              )}
            </div>
          </div>

          {/* Couplet and Meaning strip */}
          <div className={`p-3.5 rounded-xl border ${
            isDark ? 'bg-[#221D17] border-[#362F25]' : 'bg-[#FAF6F0] border-[#E9E1D3]'
          }`}>
            <div className="text-[11px] uppercase tracking-widest text-[#9A3412] font-semibold mb-1">
              திருக்குறள் வரிகள்
            </div>
            <p className="text-base sm:text-lg font-bold font-tamil-serif leading-relaxed text-[#9A3412] dark:text-[#E0A96D]">
              {kural.line1}
            </p>
            <p className="text-base sm:text-lg font-bold font-tamil-serif leading-relaxed text-[#9A3412] dark:text-[#E0A96D]">
              {kural.line2}
            </p>
          </div>

          {/* Commentary Preview */}
          <div className="space-y-2 text-xs">
            <div className={`p-3 rounded-lg border ${
              isDark ? 'border-[#302B24] bg-[#1E1B17]' : 'border-[#EAE3D6] bg-white'
            }`}>
              <span className="font-semibold text-[#8C2D19] dark:text-[#E8A578] block mb-1">
                மு. வரதராசனார் உரை:
              </span>
              <p className="leading-relaxed opacity-90">
                {kural.commentaries.muVa}
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${
              isDark ? 'border-[#302B24] bg-[#1E1B17]' : 'border-[#EAE3D6] bg-white'
            }`}>
              <span className="font-semibold text-[#8C2D19] dark:text-[#E8A578] block mb-1">
                கலைஞர் உரை:
              </span>
              <p className="leading-relaxed opacity-90">
                {kural.commentaries.karunanidhi}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
