import React from 'react';
import { ChevronDown, Music2, ExternalLink } from 'lucide-react';

interface MusicPlaylistProps {
  playlistId: string;
  isOpen: boolean;
  onToggle: () => void;
  isDark: boolean;
}

/** Collapsed-by-default section that plays the whole Thirukkural music playlist. */
export const MusicPlaylist: React.FC<MusicPlaylistProps> = ({ playlistId, isOpen, onToggle, isDark }) => {
  const ink = isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]';
  const accent = isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]';

  return (
    <section
      id="music"
      className={`w-full rounded-[14px] border px-4 sm:px-6 lg:px-7 ${isOpen ? 'pt-4 pb-6' : 'py-4'} ${
        isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white/70 border-[#ECEBE5]'
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-3 text-left cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4234] ${isOpen ? 'mb-4' : ''}`}
      >
        <span className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Music2 className={`w-9 h-9 shrink-0 ${accent}`} strokeWidth={1.8} />
          <span className={`font-tamil-sans text-[19px] sm:text-[28px] font-bold tracking-tight ${ink}`}>இசையில் திருக்குறள்</span>
        </span>
        <ChevronDown className={`w-6 h-6 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} ${accent}`} />
      </button>

      {/* The player is only created when opened, so the page stays fast */}
      {isOpen && (
        <>
          <div className="relative w-full max-w-[960px] mx-auto aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&rel=0`}
              title="இசையில் திருக்குறள் — YouTube playlist"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div className="max-w-[960px] mx-auto mt-3 flex justify-end">
            <a
              href={`https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-[13.5px] hover:underline ${accent}`}
            >
              YouTube-ல் அனைத்துப் பாடல்களையும் காண்க <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </>
      )}
    </section>
  );
};
