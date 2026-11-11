import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  Menu,
  X,
  Bookmark,
  BookOpen,
  Search,
  Plus,
  Dices,
  Home,
  LayoutGrid,
  Languages,
  PlayCircle,
  Volume2,
  UploadCloud,
  Mail,
  Youtube,
  Instagram,
  Facebook,
} from 'lucide-react';
import { SOCIAL_LINKS } from '../data/site';
import { kuralAudio, KuralVoice } from '../utils/audioPlayer';
import { AUDIO_ENABLED } from '../config';

interface NavbarProps {
  onGoHome: () => void;
  onNavigateSection: (sectionId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onOpenDirectory: () => void;
  onOpenBookmarks: () => void;
  onOpenVideos?: () => void;
  onOpenAddMedia?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  bookmarkCount: number;
  activeNav: string;
  language: 'en' | 'ta';
  onToggleLanguage: () => void;
}

/** Line-art lotus used as the site mark. */
export const LotusMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" className={className} aria-hidden="true">
    <path d="M32 6c-6 7-8 15-8 21s3 12 8 15c5-3 8-9 8-15s-2-14-8-21z" />
    <path d="M24 27c-5-5-11-8-17-8 0 8 4 16 12 20 4 2 9 3 13 3" />
    <path d="M40 27c5-5 11-8 17-8 0 8-4 16-12 20-4 2-9 3-13 3" />
    <path d="M18 17c-2 3-2 7-1 10M46 17c2 3 2 7 1 10" />
    <path d="M4 42c8 2 18 3 28 3s20-1 28-3" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome,
  onNavigateSection,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenDirectory,
  onOpenBookmarks,
  onOpenVideos,
  onOpenAddMedia,
  isDark,
  onToggleTheme,
  bookmarkCount,
  language,
  onToggleLanguage,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<KuralVoice>(kuralAudio.getVoice());
  const menuRef = useRef<HTMLDivElement>(null);
  const isTamil = language === 'ta';

  useEffect(() => {
    const unsub = kuralAudio.subscribe((state) => {
      setCurrentVoice(state.voice);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const go = (fn: () => void) => () => {
    fn();
    setMenuOpen(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchQuery);
    setMobileSearch(false);
  };

  const menuItem =
    'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-[#E9F0EC] hover:bg-white/10 hover:text-[#F2CE86] transition-colors cursor-pointer';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1D4234] text-white shadow-[0_1px_0_rgba(0,0,0,0.25)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 h-[72px] sm:h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <button onClick={onGoHome} className="flex items-center gap-3 sm:gap-4 shrink-0 text-left cursor-pointer group">
          <LotusMark className="w-11 h-9 sm:w-14 sm:h-11 text-[#E3B866] group-hover:text-[#F2CE86] transition-colors" />
          <span className="flex flex-col leading-none">
            <span className="font-tamil-sans text-2xl sm:text-[30px] font-bold text-white tracking-tight">திருக்குறள்</span>
            <span className="text-[13px] sm:text-[15px] text-[#D5E2DB] tracking-[0.08em] mt-1.5">Timeless Wisdom</span>
          </span>
        </button>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 min-w-0">
          <form onSubmit={submit} className="hidden md:block">
            <label className="flex items-center gap-3 w-[300px] lg:w-[386px] h-[50px] px-5 rounded-full bg-white/[0.13] border border-white/10 focus-within:bg-white/20 focus-within:border-[#E3B866]/60 transition-colors">
              <Search className="w-5 h-5 text-white/90 shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search kural, chapter, keyword..."
                aria-label="Search kurals"
                className="w-full bg-transparent text-[15px] text-white placeholder:text-white/75 focus:outline-none"
              />
            </label>
          </form>

          <button
            onClick={() => setMobileSearch((v) => !v)}
            aria-label="Search"
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 cursor-pointer"
          >
            <Search className="w-6 h-6" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="relative p-2 rounded-lg text-white hover:bg-white/10 cursor-pointer"
            >
              {menuOpen ? <X className="w-8 h-8" strokeWidth={1.8} /> : <Menu className="w-8 h-8" strokeWidth={1.8} />}
              {bookmarkCount > 0 && !menuOpen && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#E3B866]" />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+14px)] w-72 py-2 rounded-2xl bg-[#1D4234] border border-white/10 shadow-2xl overflow-hidden">
                <button onClick={go(onGoHome)} className={menuItem}>
                  <Home className="w-4 h-4" /> {isTamil ? 'முகப்பு' : 'Home'}
                </button>
                <button onClick={go(() => onNavigateSection('daily-kural'))} className={menuItem}>
                  <Dices className="w-4 h-4" /> {isTamil ? 'இன்றைய குறள்' : 'Kural of the Day'}
                </button>
                <button onClick={go(onOpenDirectory)} className={menuItem}>
                  <LayoutGrid className="w-4 h-4" /> 133 அதிகாரங்கள்
                </button>
                <button onClick={go(() => onNavigateSection('treasury'))} className={menuItem}>
                  <BookOpen className="w-4 h-4" /> 1330 குறள்கள்
                </button>
                {onOpenVideos && (
                  <button onClick={go(onOpenVideos)} className={menuItem}>
                    <PlayCircle className="w-4 h-4" /> இசையில் திருக்குறள்
                  </button>
                )}
                {onOpenAddMedia && (
                  <button onClick={go(onOpenAddMedia)} className={menuItem}>
                    <UploadCloud className="w-4 h-4 text-[#E3B866]" />
                    <span>{isTamil ? 'காணொளி ஒத்திசைவு & சேர்த்தல்' : 'Video Sync & Add'}</span>
                  </button>
                )}
                <button onClick={go(onOpenBookmarks)} className={menuItem}>
                  <Bookmark className="w-4 h-4" />
                  <span className="flex-1">{isTamil ? 'சேமித்த குறள்கள்' : 'Saved kurals'}</span>
                  <span className="text-xs text-[#E3B866]">{bookmarkCount}</span>
                </button>
                <button onClick={go(() => onNavigateSection('contact'))} className={menuItem}>
                  <Mail className="w-4 h-4" /> {isTamil ? 'தொடர்புக்கு' : 'Contact us'}
                </button>
                <div className="flex items-center gap-1 px-3 py-1.5">
                  {[
                    { href: SOCIAL_LINKS.youtube, label: 'YouTube', Icon: Youtube },
                    { href: SOCIAL_LINKS.instagram, label: 'Instagram', Icon: Instagram },
                    { href: SOCIAL_LINKS.facebook, label: 'Facebook', Icon: Facebook },
                  ].map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="p-2 rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
                <div className="my-2 h-px bg-white/10" />
                <button onClick={go(onToggleLanguage)} className={menuItem}>
                  <Languages className="w-4 h-4" /> {isTamil ? 'English' : 'தமிழ்'}
                </button>
                <button onClick={go(onToggleTheme)} className={menuItem}>
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? (isTamil ? 'பகல் தோற்றம்' : 'Light mode') : isTamil ? 'இரவுத் தோற்றம்' : 'Dark mode'}
                </button>

                {/* Voice Selection */}
                {AUDIO_ENABLED && <div className="mt-2 pt-2.5 px-4 pb-2 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-[#E3B866] font-medium mb-2">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'ஓதும் குரல் (Human Voice)' : 'Recitation Voice'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/25 text-xs">
                    <button
                      onClick={() => kuralAudio.setVoice('Charon')}
                      className={`py-1.5 px-2 rounded-lg text-center font-medium transition-all cursor-pointer ${
                        currentVoice === 'Charon'
                          ? 'bg-[#E3B866] text-[#1D4234] font-bold shadow-xs'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isTamil ? 'ஆண் குரல்' : 'Male Voice'}
                    </button>
                    <button
                      onClick={() => kuralAudio.setVoice('Kore')}
                      className={`py-1.5 px-2 rounded-lg text-center font-medium transition-all cursor-pointer ${
                        currentVoice === 'Kore'
                          ? 'bg-[#E3B866] text-[#1D4234] font-bold shadow-xs'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isTamil ? 'பெண் குரல்' : 'Female Voice'}
                    </button>
                  </div>
                </div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileSearch && (
        <form onSubmit={submit} className="md:hidden px-4 pb-4">
          <label className="flex items-center gap-3 h-12 px-4 rounded-full bg-white/[0.13] border border-white/10">
            <Search className="w-5 h-5 text-white/90" />
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search kural, chapter, keyword..."
              className="w-full bg-transparent text-[15px] text-white placeholder:text-white/75 focus:outline-none"
            />
          </label>
        </form>
      )}
    </header>
  );
};
