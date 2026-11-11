import React from 'react';
import { Sparkles, Compass, BookOpen } from 'lucide-react';

interface ThiruvalluvarSunriseBannerProps {
  onExploreChapters: () => void;
  onExploreTreasury: () => void;
  isDark: boolean;
}

export const ThiruvalluvarSunriseBanner: React.FC<ThiruvalluvarSunriseBannerProps> = ({
  onExploreChapters,
  onExploreTreasury,
  isDark,
}) => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-[#164E50]/40 my-6 transition-all duration-300">
      {/* Background SVG Sunrise Panorama: Thiruvalluvar Statue & Kanyakumari Memorial at Dawn */}
      <div className="relative w-full h-[220px] sm:h-[260px] md:h-[300px] overflow-hidden bg-gradient-to-b from-[#132A38] via-[#2A4150] to-[#5C4538]">
        <svg 
          viewBox="0 0 1200 400" 
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" 
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            {/* Sky Dawn Gradient */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0B2735" />
              <stop offset="35%" stopColor="#1E3E4B" />
              <stop offset="65%" stopColor="#5E4343" />
              <stop offset="85%" stopColor="#A85D38" />
              <stop offset="100%" stopColor="#F49D4A" />
            </linearGradient>

            {/* Rising Sun Radial */}
            <radialGradient id="sunGlow" cx="62%" cy="75%" r="60%">
              <stop offset="0%" stopColor="#FFF2A1" stopOpacity="1" />
              <stop offset="25%" stopColor="#FFA642" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#E65824" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1E3E4B" stopOpacity="0" />
            </radialGradient>

            {/* Ocean Water Gradient */}
            <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9C5230" />
              <stop offset="20%" stopColor="#5E382A" />
              <stop offset="60%" stopColor="#1F2F3B" />
              <stop offset="100%" stopColor="#0F1F28" />
            </linearGradient>

            {/* Statue & Rock Silhouette Gradient */}
            <linearGradient id="statueRock" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#141E26" />
              <stop offset="100%" stopColor="#0A1014" />
            </linearGradient>

            {/* Distant Pavilion Gradient */}
            <linearGradient id="pavilionRock" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#25323D" />
              <stop offset="100%" stopColor="#101920" />
            </linearGradient>
          </defs>

          {/* Sky Backdrop */}
          <rect width="1200" height="400" fill="url(#skyGrad)" />

          {/* Atmospheric Sun & Rays */}
          <circle cx="740" cy="275" r="230" fill="url(#sunGlow)" />
          <circle cx="740" cy="275" r="42" fill="#FFF6BA" />

          {/* Distant Horizon clouds / mountains */}
          <path d="M0,275 Q200,270 400,275 T800,275 T1200,275 L1200,285 L0,285 Z" fill="#6A423B" opacity="0.5" />
          <path d="M0,278 Q300,274 600,278 T1200,278 L1200,285 L0,285 Z" fill="#884C32" opacity="0.6" />

          {/* Ocean Water */}
          <rect y="280" width="1200" height="120" fill="url(#seaGrad)" />

          {/* Golden Sunrise Ocean Water Reflections */}
          <ellipse cx="740" cy="285" rx="140" ry="4" fill="#FFC966" opacity="0.8" />
          <ellipse cx="740" cy="292" rx="180" ry="5" fill="#FFA54A" opacity="0.6" />
          <ellipse cx="740" cy="302" rx="220" ry="7" fill="#E67332" opacity="0.5" />
          <ellipse cx="740" cy="318" rx="260" ry="10" fill="#C45326" opacity="0.35" />
          <ellipse cx="740" cy="340" rx="300" ry="14" fill="#8A341E" opacity="0.25" />

          {/* Water ripples */}
          <path d="M500,295 Q560,293 620,295 M680,298 Q750,296 820,298 M580,312 Q660,309 740,312 M790,315 Q870,312 950,315 M640,335 Q740,331 840,335" stroke="#FFE799" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />

          {/* Distant Right: Vivekananda Rock Memorial & Pavilion (Kanyakumari) */}
          {/* Rock Base */}
          <path d="M920,310 Q950,275 1010,270 Q1060,268 1110,285 Q1140,295 1160,315 L920,315 Z" fill="url(#pavilionRock)" />
          {/* Memorial Dome & Pavilion */}
          <rect x="1000" y="245" width="46" height="26" rx="2" fill="#1C2730" />
          {/* Pillars */}
          <line x1="1005" y1="252" x2="1005" y2="271" stroke="#324552" strokeWidth="2" />
          <line x1="1015" y1="252" x2="1015" y2="271" stroke="#324552" strokeWidth="2" />
          <line x1="1025" y1="252" x2="1025" y2="271" stroke="#324552" strokeWidth="2" />
          <line x1="1035" y1="252" x2="1035" y2="271" stroke="#324552" strokeWidth="2" />
          <line x1="1041" y1="252" x2="1041" y2="271" stroke="#324552" strokeWidth="2" />
          {/* Mandapam tiered roof and Kalasam finial */}
          <path d="M994,247 L1023,222 L1052,247 Z" fill="#2B3A44" />
          <path d="M1006,233 L1023,215 L1040,233 Z" fill="#3D4E5B" />
          <line x1="1023" y1="215" x2="1023" y2="204" stroke="#E6A65D" strokeWidth="2.5" />
          <circle cx="1023" cy="203" r="2.5" fill="#FFC966" />
          {/* Smaller stupa next to main pavilion */}
          <rect x="1062" y="258" width="18" height="15" fill="#1C2730" />
          <path d="M1058,258 L1071,244 L1084,258 Z" fill="#2B3A44" />
          <line x1="1071" y1="244" x2="1071" y2="238" stroke="#E6A65D" strokeWidth="1.5" />

          {/* Left Foreground: The Majestic 133-ft Thiruvalluvar Statue at Kanyakumari */}
          {/* Natural Rocky Islet Foundation */}
          <path d="M60,380 Q100,310 180,300 Q260,295 330,315 Q380,335 410,380 L60,380 Z" fill="url(#statueRock)" />

          {/* 38-ft Stone Pedestal (Symbolizing 38 Chapters of Aram / Virtue) */}
          <polygon points="175,305 315,305 325,245 165,245" fill="#131C24" />
          {/* Pedestal Cornice & tiers */}
          <rect x="160" y="240" width="170" height="7" rx="1.5" fill="#263542" />
          <rect x="170" y="247" width="150" height="3" fill="#0C1318" />
          <rect x="172" y="275" width="146" height="2" fill="#263542" opacity="0.6" />
          <rect x="155" y="302" width="180" height="5" fill="#0C1318" />

          {/* 95-ft Thiruvalluvar Statue Body (Symbolizing 95 Chapters of Porul & Inbam) */}
          {/* Feet and dhoti base */}
          <path d="M195,240 Q245,236 295,240 L290,215 Q245,212 200,215 Z" fill="#152028" />
          
          {/* Flowing Angavastram / Classical Tamil Sage Robe */}
          <path d="M190,218 Q182,165 200,125 Q235,115 282,123 Q300,155 296,218 Q250,225 190,218 Z" fill="#10171E" />
          {/* Folds of the robe reflecting morning sun edge */}
          <path d="M210,135 Q225,175 220,230" stroke="#E6A65D" strokeWidth="2.5" strokeOpacity="0.75" fill="none" />
          <path d="M245,130 Q255,170 250,235" stroke="#FFA642" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
          <path d="M280,135 Q288,165 292,205" stroke="#FFC966" strokeWidth="2" strokeOpacity="0.85" fill="none" />

          {/* Right Arm: Raised upright in teaching mudra holding palm leaf scroll (Olai Chuvadi) */}
          {/* Shoulder & Upraised Forearm */}
          <path d="M280,128 Q305,115 310,88 Q305,72 296,72 Q290,82 284,105 Z" fill="#16222B" />
          {/* Hand with 3 fingers raised (representing Aram, Porul, Inbam) */}
          <circle cx="304" cy="74" r="5" fill="#16222B" />
          <line x1="304" y1="74" x2="315" y2="60" stroke="#FFC966" strokeWidth="3" strokeLinecap="round" />
          <line x1="307" y1="74" x2="320" y2="64" stroke="#FFC966" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="309" y1="75" x2="321" y2="70" stroke="#FFA642" strokeWidth="2" strokeLinecap="round" />
          {/* Edge illumination on raised hand */}
          <path d="M302,88 Q312,85 316,70" stroke="#FFF2A1" strokeWidth="2" fill="none" />

          {/* Left Arm: Resting near hip grasping the scroll */}
          <path d="M192,130 Q175,160 185,185 Q195,185 200,170 Z" fill="#101820" />
          {/* Palm leaf scroll (Olai Chuvadi) */}
          <rect x="178" y="170" width="8" height="28" rx="2" transform="rotate(22 182 184)" fill="#E8D2A0" />

          {/* Chest & Shoulders */}
          <path d="M210,125 Q245,120 280,125 L272,98 Q245,96 218,98 Z" fill="#16222B" />
          {/* Golden edge highlight on right side of torso facing the sunrise */}
          <path d="M280,125 L272,98" stroke="#FFE28A" strokeWidth="2.5" />

          {/* Head & Classical Tamil Sage Beard */}
          {/* Neck */}
          <rect x="235" y="85" width="20" height="15" fill="#131C24" />
          {/* Face Profile / Contour */}
          <ellipse cx="245" cy="75" rx="14" ry="16" fill="#131C24" />
          {/* Beard flowing downward */}
          <path d="M236,78 Q245,108 254,78 Z" fill="#0D141A" />
          {/* Top-knot Hairbun (Kondai) */}
          <ellipse cx="242" cy="56" rx="8" ry="7" fill="#0D141A" />
          {/* Golden sunrise rim lighting on the head and bun */}
          <path d="M246,51 Q254,60 256,76" stroke="#FFF2A1" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Flying Sea birds greeting the dawn */}
          <path d="M680,160 Q690,152 700,160 Q710,152 720,160" stroke="#FCE2B8" strokeWidth="1.8" fill="none" opacity="0.8" />
          <path d="M730,140 Q738,134 746,140 Q754,134 762,140" stroke="#FCE2B8" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M780,175 Q787,170 794,175 Q801,170 808,175" stroke="#FCE2B8" strokeWidth="1.4" fill="none" opacity="0.6" />
        </svg>

        {/* Content Overlay on Panorama */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-5 sm:p-7 md:p-8 text-white">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E6A65D]/20 text-[#F3C583] border border-[#E6A65D]/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#F3C583]" />
                <span>கன்னியாகுமரி திருவள்ளுவர் திருக்கோலம் · 133 அடி சிலை</span>
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">
              திருக்குறள் · உலகப் பொதுமறை
            </h2>

            <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl line-clamp-2 drop-shadow-sm font-light leading-relaxed">
              "எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள் மெய்ப்பொருள் காண்ப தறிவு" — 133 அதிகாரங்கள், 1330 அருங்குறள்கள்.
            </p>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={onExploreChapters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E6A65D] hover:bg-[#F3C583] text-[#0A2E30] text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>133 அதிகாரங்களின் அட்டவணை</span>
              </button>

              <button
                onClick={onExploreTreasury}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md text-xs font-medium transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>1330 குறள்களைக் காண்க</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
