import React from 'react';
import { Music2, Play, ArrowRight } from 'lucide-react';
import { Kural } from '../types/kural';
import { getYouTubeThumbnail } from '../utils/youtube';

interface IsaiPayanamProps {
  dailyKural: Kural;
  videoKurals: Kural[];
  go: (hash: string) => void;
}

/** A song for today: today's kural if it has one, otherwise one that changes each day. */
export function songOfTheDay(daily: Kural, songs: Kural[]): Kural | null {
  if (daily.media?.youtubeUrl) return daily;
  if (!songs.length) return null;
  return songs[Math.floor(Date.now() / 86400000) % songs.length];
}

/** Home page "இசைப் பயணம்": today's song plus three more, in the site's green and gold. */
export const IsaiPayanam: React.FC<IsaiPayanamProps> = ({ dailyKural, videoKurals, go }) => {
  const song = songOfTheDay(dailyKural, videoKurals);
  const rest = videoKurals.filter(k => k.number !== song?.number);
  const day = Math.floor(Date.now() / 86400000);
  const more = rest.length ? [0, 1, 2].map(i => rest[(day * 7 + i * 31) % rest.length]) : [];
  const thumb = song ? getYouTubeThumbnail(song.media?.youtubeUrl) : null;

  return (
    <section
      aria-labelledby="isai-payanam"
      className="relative overflow-hidden rounded-[18px] p-4 sm:p-6 lg:p-7 text-[#F4EEDF] bg-[radial-gradient(120%_140%_at_100%_0%,rgba(227,184,102,0.18),transparent_55%),linear-gradient(160deg,#1D4234,#14302A)] shadow-[0_12px_32px_rgba(22,57,46,0.25)]"
    >
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Music2 className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 text-[#E3B866]" strokeWidth={1.7} />
          <div className="min-w-0">
            <h2 id="isai-payanam" className="font-tamil-sans text-[21px] sm:text-[28px] font-bold tracking-tight text-[#F3D58E] leading-tight">இசைப் பயணம்</h2>
            <p className="text-[13.5px] text-[#B9CFC2]">குறள்களை இசையில் அனுபவியுங்கள் · {videoKurals.length} பாடல்கள்</p>
          </div>
        </div>
        <button onClick={() => go('#/videos')} className="hidden sm:inline-flex items-center gap-2 text-[15px] font-semibold text-[#F3D58E] hover:text-white cursor-pointer">
          அனைத்துப் பாடல்களும் <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {song && (
        <button
          onClick={() => go(`#/video/${song.number}`)}
          className="mt-4 sm:mt-5 w-full grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 sm:gap-5 items-center text-left rounded-[14px] p-2.5 bg-black/20 border border-[#E3B866]/25 hover:border-[#E3B866]/70 transition-colors cursor-pointer"
        >
          <span className="relative block aspect-video rounded-[10px] overflow-hidden bg-gradient-to-br from-[#2F5E4B] to-[#10261F]">
            {thumb && <img src={thumb} alt="" loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            <span className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#16392E]/75 border-[1.5px] border-[#F3D58E] flex items-center justify-center">
              <Play className="w-5 h-5 ml-0.5 text-[#F3D58E] fill-[#F3D58E]" />
            </span>
          </span>
          <span className="min-w-0 px-1 sm:px-0">
            <span className="block text-[13px] font-semibold text-[#E3B866]">இன்றைய பாடல் · {song.paal}</span>
            <span className="block font-tamil-serif text-[16.5px] sm:text-[19px] font-semibold leading-[1.55] text-[#FBF6EA] my-1">{song.line1}<br />{song.line2}</span>
            <span className="block text-[13.5px] text-[#B9CFC2]">குறள் {song.number} — {song.athikaramTamil}</span>
          </span>
        </button>
      )}

      {more.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {more.map(k => (
            <button
              key={k.number}
              onClick={() => go(`#/video/${k.number}`)}
              className="flex flex-col items-start gap-0.5 text-left rounded-[12px] px-3 py-2.5 bg-black/15 border border-[#E3B866]/20 hover:border-[#E3B866]/60 transition-colors cursor-pointer min-w-0"
            >
              <Play className="w-3.5 h-3.5 text-[#E3B866] fill-[#E3B866]" />
              <span className="text-[13.5px] sm:text-[14.5px] font-bold text-[#FBF6EA] whitespace-nowrap">குறள் {k.number}</span>
              <span className="hidden sm:block text-[12.5px] text-[#B9CFC2] truncate max-w-full">{k.athikaramTamil}</span>
            </button>
          ))}
        </div>
      )}

      <button onClick={() => go('#/videos')} className="sm:hidden mt-3 inline-flex items-center gap-2 text-[15px] font-semibold text-[#F3D58E] cursor-pointer">
        அனைத்துப் பாடல்களும் <ArrowRight className="w-4 h-4" />
      </button>
    </section>
  );
};
