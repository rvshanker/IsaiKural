import React, { useState, useMemo, useEffect, useRef, Suspense, lazy } from 'react';
const KuralMap = lazy(() => import('./components/KuralMap'));
import { Navbar } from './components/Navbar';
import { HeroKuralOfTheDay } from './components/HeroKuralOfTheDay';
import { HomeSearchBar } from './components/HomeSearchBar';
import { KuralListItem } from './components/KuralListItem';
import { VideoGallery, VideoDetail } from './components/VideoPages';
import { MUSIC_PLAYLIST_ID } from './data/kuralMedia';
import { AthikaramCatalog } from './components/AthikaramCatalog';
import { KuralCard } from './components/KuralCard';
import { KuralDetailModal } from './components/KuralDetailModal';
import { SiteFooter } from './components/SiteFooter';
import { MediaModal } from './components/MediaModal';
import { VideoModal } from './components/VideoModal';
import { ImageModal } from './components/ImageModal';
import { ALL_KURALS, getKuralByNumber } from './data/kurals';
import { ATHIKARAMS } from './data/chapters';
import { CAN_EDIT_MEDIA } from './config';
import { kuralMatchesSearch } from './utils/search';
import { Kural, Paal, KuralMedia } from './types/kural';
import { 
  loadUserMedia, 
  saveUserMedia, 
  deleteUserMedia, 
  loadBookmarks, 
  toggleBookmark, 
  UserMediaMap 
} from './utils/storage';
import { 
  BookOpen, 
  Compass, 
  Search, 
  X, 
  Bookmark, 
  Plus, 
  Layers,
  ArrowUp,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Music2,
  RotateCcw,
  Network
} from 'lucide-react';

// ── Simple page routing with the URL hash, so the phone's Back button works ──
type Route =
  | { page: 'home' }
  | { page: 'chapter'; n: number }
  | { page: 'search'; q: string }
  | { page: 'saved' }
  | { page: 'videos' }
  | { page: 'video'; n: number }
  | { page: 'kurals'; paal: Paal | 'all' }
  | { page: 'map'; n?: number };

const PAAL_KEYS: Paal[] = ['அறத்துப்பால்', 'பொருட்பால்', 'காமத்துப்பால்'];

function parseHash(): Route {
  const parts = decodeURIComponent(window.location.hash.replace(/^#\/?/, '')).split('/');
  const [head, arg] = parts;
  if (head === 'adhikaram') {
    const n = parseInt(arg, 10);
    if (n >= 1 && n <= 133) return { page: 'chapter', n };
  }
  if (head === 'search' && arg) return { page: 'search', q: parts.slice(1).join('/') };
  if (head === 'saved') return { page: 'saved' };
  if (head === 'videos') return { page: 'videos' };
  if (head === 'video') {
    const n = parseInt(arg, 10);
    if (n >= 1 && n <= 1330) return { page: 'video', n };
  }
  if (head === 'map') {
    const n = parseInt(arg, 10);
    return { page: 'map', n: n >= 1 && n <= 1330 ? n : undefined };
  }
  if (head === 'kurals') return { page: 'kurals', paal: PAAL_KEYS.includes(arg as Paal) ? (arg as Paal) : 'all' };
  return { page: 'home' };
}

function go(hash: string) {
  if (window.location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else window.location.hash = hash;
}

export default function App() {
  // Theme state (system preference default, persistent)
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Active navigation indicator
  const [activeNav, setActiveNav] = useState<string>('home');

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePaal, setActivePaal] = useState<Paal | 'all'>('all');
  const [activeAthikaram, setActiveAthikaram] = useState<number | 'all'>('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'image' | 'bookmarked'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(20);

  // Storage states
  const [userMedia, setUserMedia] = useState<UserMediaMap>(loadUserMedia);
  const [bookmarks, setBookmarks] = useState<number[]>(loadBookmarks);

  // Language state
  const [language, setLanguage] = useState<'en' | 'ta'>(() => {
    return (localStorage.getItem('thirukkural_lang') as 'en' | 'ta') || 'ta';
  });

  const handleToggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'ta' : 'en';
      localStorage.setItem('thirukkural_lang', next);
      return next;
    });
  };

  // Modals state
  const [selectedDetailKural, setSelectedDetailKural] = useState<Kural | null>(null);
  const [videoModalKural, setVideoModalKural] = useState<Kural | null>(null);
  const [imageModalKural, setImageModalKural] = useState<Kural | null>(null);
  const [editingKural, setEditingKural] = useState<Kural | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Random / Daily Kural state (Daily deterministic kural by date, can be shuffled)
  const [dailyKuralNumber, setDailyKuralNumber] = useState<number>(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return (dayOfYear % 1330) + 1;
  });

  // Only the daily kural and search are open by default; other sections collapse
  const [catalogOpen, setCatalogOpen] = useState<boolean>(false);
  const [route, setRoute] = useState<Route>(parseHash);
  const routeRef = useRef<Route>(route);
  const homeScrollY = useRef(0);
  const [lastChapter, setLastChapter] = useState<number | 'all'>('all');
  const [musicOpen, setMusicOpen] = useState<boolean>(false);
  const [selectedIyalFilter, setSelectedIyalFilter] = useState<string>('all');

  // Ref for smooth scrolling to Treasury section
  const treasuryRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Provide all 1,330 authentic kurals with user custom media
  const allAvailableKurals = useMemo(() => {
    return ALL_KURALS.map(k => {
      const custom = userMedia[k.number];
      return custom ? { ...k, media: { ...k.media, ...custom } } : k;
    });
  }, [userMedia]);

  // Daily kural object
  const currentDailyKural = useMemo(() => {
    const found = allAvailableKurals.find(k => k.number === dailyKuralNumber);
    return found || allAvailableKurals[0];
  }, [allAvailableKurals, dailyKuralNumber]);

  // Active Athikaram metadata
  const selectedAthikaramData = useMemo(() => {
    if (activeAthikaram === 'all') return null;
    return ATHIKARAMS.find(a => a.number === activeAthikaram);
  }, [activeAthikaram]);

  // Active Paal Iyals for sub-group tabs
  const activePaalIyals = useMemo(() => {
    if (route.page !== 'kurals' || route.paal === 'all') return [];
    const paal = route.paal;
    const chapters = ATHIKARAMS.filter(a => a.paal === paal);
    const map = new Map<string, number>();
    for (const ch of chapters) {
      map.set(ch.iyal, (map.get(ch.iyal) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [route]);

  // Filter kurals based on search and active filters
  const filteredKurals = useMemo(() => {
    return allAvailableKurals.filter(kural => {
      // Paal filter
      if (activePaal !== 'all' && kural.paal !== activePaal) {
        return false;
      }

      // Iyal sub-group filter (when viewing a paal on kurals page)
      if (route.page === 'kurals' && route.paal !== 'all' && selectedIyalFilter !== 'all') {
        if (kural.iyalTamil !== selectedIyalFilter) {
          return false;
        }
      }

      // Athikaram filter
      if (activeAthikaram !== 'all' && kural.athikaramNumber !== activeAthikaram) {
        return false;
      }

      // Media filter
      if (mediaFilter === 'video' && !kural.media?.youtubeUrl) {
        return false;
      }
      if (mediaFilter === 'image' && !kural.media?.imageUrl) {
        return false;
      }
      if (mediaFilter === 'bookmarked' && !bookmarks.includes(kural.number)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        return kuralMatchesSearch(kural, searchQuery);
      }

      return true;
    });
  }, [allAvailableKurals, activePaal, activeAthikaram, mediaFilter, searchQuery, bookmarks]);

  // Follow the URL: each list page sets its own filters
  useEffect(() => {
    const onHash = () => {
      const next = parseHash();
      if (routeRef.current.page === 'home') homeScrollY.current = window.scrollY;
      routeRef.current = next;
      setRoute(next);
      if (next.page === 'chapter') setLastChapter(next.n);
      // Back on the home page returns to where you were; other pages start at the top
      const y = next.page === 'home' ? homeScrollY.current : 0;
      setTimeout(() => window.scrollTo({ top: y }), 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    setVisibleCount(20);
    setActiveAthikaram(route.page === 'chapter' ? route.n : 'all');
    setActivePaal(
      route.page === 'chapter'
        ? ATHIKARAMS.find(a => a.number === route.n)?.paal ?? 'all'
        : route.page === 'kurals'
        ? route.paal
        : 'all'
    );
    setMediaFilter(route.page === 'saved' ? 'bookmarked' : route.page === 'videos' ? 'video' : 'all');
    setSearchQuery(route.page === 'search' ? route.q : '');
    setSelectedIyalFilter('all');
  }, [route]);

  // Kurals that have a video, in order
  const videoKurals = useMemo(
    () => allAvailableKurals.filter(k => !!k.media?.youtubeUrl).sort((a, b) => a.number - b.number),
    [allAvailableKurals]
  );

  // Paginated visible kurals
  const visibleKurals = useMemo(() => {
    return filteredKurals.slice(0, visibleCount);
  }, [filteredKurals, visibleCount]);

  // Navigation helpers
  const scrollToTreasury = () => go('#/kurals');

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    if (id === 'treasury') return go('#/kurals');
    // The contact footer is on every page — scroll to it where we are
    if (id === 'contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (route.page !== 'home') go('#/');
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (id === 'athikaram-table') setCatalogOpen(true);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
  };

  // Handlers
  const handleSearchSubmit = (q: string) => {
    if (q.trim()) go(`#/search/${encodeURIComponent(q.trim())}`);
  };

  const handleFeelingLucky = () => {
    const randomNum = Math.floor(Math.random() * 1330) + 1;
    setDailyKuralNumber(randomNum);
    setActiveAthikaram('all');
    setActivePaal('all');
    setSearchQuery('');
    showToast(`குறள் ${randomNum} தேர்ந்தெடுக்கப்பட்டது`);
    scrollToSection('daily-kural');
  };

  const handleShuffleDailyKural = () => {
    const randomNum = Math.floor(Math.random() * 1330) + 1;
    setDailyKuralNumber(randomNum);
    showToast(`குறள் ${randomNum} காட்டப்படுகிறது`);
  };

  const handleStepDailyKural = (delta: number) => {
    setDailyKuralNumber(prev => ((prev - 1 + delta + 1330) % 1330) + 1);
  };

  const handleSelectAthikaram = (athNum: number) => {
    go(`#/adhikaram/${athNum}`);
  };

  const handleResetFilters = () => go('#/kurals');

  const handleToggleBookmark = (num: number) => {
    const updated = toggleBookmark(num);
    setBookmarks(updated);
    showToast(updated.includes(num) ? `குறள் ${num} சேமிக்கப்பட்டது` : `குறள் ${num} நீக்கப்பட்டது`);
  };

  // Media editor (only available when running locally — see src/config.ts).
  // Drafts are saved in this browser; use the editor's Export button to copy
  // them into src/data/kuralMedia.ts so every visitor sees them.
  const handleSaveMedia = (kuralNumber: number, media: KuralMedia) => {
    setUserMedia(saveUserMedia(kuralNumber, media));
    showToast(`குறள் ${kuralNumber} — வரைவு சேமிக்கப்பட்டது (kuralMedia.ts-இல் சேர்க்கவும்)`);
  };

  const handleDeleteMedia = (kuralNumber: number) => {
    setUserMedia(deleteUserMedia(kuralNumber));
    showToast(`குறள் ${kuralNumber} — வரைவு நீக்கப்பட்டது`);
  };

  const openMediaEditor = (k: Kural | null) => {
    setEditingKural(k);
    setIsMediaModalOpen(true);
  };
  const editMediaHandler = CAN_EDIT_MEDIA ? openMediaEditor : undefined;

  // Apply dark mode class to html document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen flex flex-col overflow-x-clip transition-colors duration-200 ${
      isDark ? 'bg-[#101311] text-stone-100' : 'bg-[#F7F6F2] text-stone-900'
    }`}>
      {/* 1) TOP MENU (Google-Style Navigation with Dark Teal Background) */}
      {route.page !== 'map' && <Navbar
        onGoHome={() => scrollToSection('home')}
        onNavigateSection={scrollToSection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onOpenDirectory={() => scrollToSection('athikaram-table')}
        onOpenBookmarks={() => go('#/saved')}
        onOpenVideos={() => go('#/videos')}
        onOpenMap={() => go('#/map')}
        onOpenAddMedia={CAN_EDIT_MEDIA ? () => openMediaEditor(ALL_KURALS[0]) : undefined}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        bookmarkCount={bookmarks.length}
        activeNav={activeNav}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />}

      {route.page === 'home' ? (
      <>
      {/* HERO: photograph with the Random Kural of the Day card */}
      <div id="home">
        <HeroKuralOfTheDay
          kural={currentDailyKural}
          onPrev={() => handleStepDailyKural(-1)}
          onNext={() => handleStepDailyKural(1)}
          onShuffle={handleShuffleDailyKural}
          onOpenDetails={(k) => setSelectedDetailKural(k)}
          onOpenVideo={(k) => go(`#/video/${k.number}`)}
          isDark={isDark}
        />
      </div>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-8 lg:px-[38px] pt-5 pb-6 space-y-4">
        {/* SEARCH */}
        <div className="px-0 lg:px-[68px] pb-1">
          <HomeSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            isDark={isDark}
          />
        </div>

        {/* 133 அதிகாரங்களின் அட்டவணை */}
        <AthikaramCatalog
          onSelectAthikaram={handleSelectAthikaram}
          activeAthikaram={lastChapter}
          isDark={isDark}
          isOpen={catalogOpen}
          onToggle={() => setCatalogOpen(v => !v)}
        />

        {/* இசையில் திருக்குறள் — opens the videos page */}
        <button
          onClick={() => go('#/videos')}
          className={`w-full flex items-center justify-between gap-3 rounded-[14px] border px-4 sm:px-6 lg:px-7 py-4 text-left cursor-pointer transition-colors ${
            isDark ? 'bg-[#161A17] border-[#2A302C] hover:border-[#4C5E54]' : 'bg-white/70 border-[#ECEBE5] hover:border-[#C9D6CD]'
          }`}
        >
          <span className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Music2 className={`w-9 h-9 shrink-0 ${isDark ? 'text-[#7FB39A]' : 'text-[#1D5A43]'}`} strokeWidth={1.8} />
            <span className="min-w-0">
              <span className={`block font-tamil-sans text-[19px] sm:text-[28px] font-bold tracking-tight ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>
                இசையில் திருக்குறள்
              </span>
              <span className={`block text-[13px] ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>{videoKurals.length} பாடல்கள் · பொருளுடன்</span>
            </span>
          </span>
          <ChevronRight className={`w-6 h-6 shrink-0 ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`} />
        </button>

        {/* குறள் வரைபடம் — Kurals laid out by meaning */}
        <button
          onClick={() => go('#/map')}
          className={`w-full flex items-center justify-between gap-3 rounded-[14px] border px-4 sm:px-6 lg:px-7 py-4 text-left cursor-pointer transition-colors ${
            isDark ? 'bg-[#161A17] border-[#2A302C] hover:border-[#4C5E54]' : 'bg-white/70 border-[#ECEBE5] hover:border-[#C9D6CD]'
          }`}
        >
          <span className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Network className={`w-9 h-9 shrink-0 ${isDark ? 'text-[#7FB39A]' : 'text-[#1D5A43]'}`} strokeWidth={1.8} />
            <span className="min-w-0">
              <span className={`block font-tamil-sans text-[19px] sm:text-[28px] font-bold tracking-tight ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>
                குறள் வரைபடம்
              </span>
              <span className={`block text-[13px] ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>பொருள் ஒத்த குறள்கள் அருகருகே · Kurals mapped by meaning</span>
            </span>
          </span>
          <ChevronRight className={`w-6 h-6 shrink-0 ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`} />
        </button>

        {/* All kurals live on their own page */}
        <button
          onClick={() => go('#/kurals')}
          className={`w-full flex items-center justify-between gap-3 rounded-[14px] border px-4 sm:px-6 lg:px-7 py-4 text-left cursor-pointer transition-colors ${
            isDark ? 'bg-[#161A17] border-[#2A302C] hover:border-[#4C5E54]' : 'bg-white/70 border-[#ECEBE5] hover:border-[#C9D6CD]'
          }`}
        >
          <span className="flex items-center gap-3 sm:gap-4 min-w-0">
            <BookOpen className={`w-9 h-9 shrink-0 ${isDark ? 'text-[#7FB39A]' : 'text-[#1D5A43]'}`} strokeWidth={1.8} />
            <span className={`font-tamil-sans text-[19px] sm:text-[28px] font-bold tracking-tight ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>
              <span className="font-heading font-normal mr-2 sm:mr-3">1330</span>குறள்கள்
            </span>
          </span>
          <ChevronRight className={`w-6 h-6 shrink-0 ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`} />
        </button>
      </main>
      </>
      ) : route.page === 'map' ? (
      <div className="flex-1" />
      ) : route.page === 'videos' || route.page === 'video' ? (
      /* ───────────── VIDEO PAGES: gallery, and one video with its meaning ───────────── */
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 pt-4 pb-10">
        <button
          onClick={() => (window.history.length > 1 ? window.history.back() : go(route.page === 'video' ? '#/videos' : '#/'))}
          className={`inline-flex items-center gap-1 -ml-2 px-2 py-1.5 rounded-full text-[14px] cursor-pointer ${
            isDark ? 'text-[#A9BDB2] hover:bg-white/5' : 'text-[#1D5A43] hover:bg-[#1D5A43]/5'
          }`}
        >
          <ChevronLeft className="w-5 h-5" /> திரும்ப
        </button>

        {route.page === 'videos' ? (
          <>
            <div className="mt-2 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className={`font-tamil-sans text-[22px] sm:text-[28px] font-bold ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>இசையில் திருக்குறள்</h1>
                <p className={`text-[13.5px] mt-0.5 ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>{videoKurals.length} பாடல்கள் · ஒன்றைத் தொட்டால் பாடலும் பொருளும்</p>
              </div>
              {CAN_EDIT_MEDIA && <div className="flex items-center gap-2">
                <button
                  onClick={() => openMediaEditor(null)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                    isDark 
                      ? 'bg-[#1D5A43] hover:bg-[#256C51] text-white' 
                      : 'bg-[#1D5A43] hover:bg-[#164433] text-white'
                  }`}
                  title="YouTube இணைப்பு சேர்க்க அல்லது உள்ளூர் தரவை ஒத்திசைக்க"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>காணொளி சேர்க்க</span>
                </button>
              </div>}
            </div>
            <VideoGallery kurals={videoKurals} onOpen={n => go(`#/video/${n}`)} playlistId={MUSIC_PLAYLIST_ID} isDark={isDark} />
          </>
        ) : (() => {
          const i = videoKurals.findIndex(k => k.number === route.n);
          const kural = i >= 0 ? videoKurals[i] : getKuralByNumber(route.n);
          return (
            <div className="mt-3">
              <VideoDetail
                kural={kural}
                prev={i > 0 ? videoKurals[i - 1] : undefined}
                next={i >= 0 && i < videoKurals.length - 1 ? videoKurals[i + 1] : undefined}
                onGo={n => go(`#/video/${n}`)}
                onOpenDetails={k => setSelectedDetailKural(k)}
                isBookmarked={bookmarks.includes(kural.number)}
                onToggleBookmark={handleToggleBookmark}
                isDark={isDark}
              />
            </div>
          );
        })()}
      </main>
      ) : (
      /* ───────────── LIST PAGE: a chapter, search results, saved or all kurals ───────────── */
      <main className="flex-1 w-full max-w-[860px] mx-auto px-4 sm:px-6 pt-4 pb-10">
        <button
          onClick={() => (window.history.length > 1 ? window.history.back() : go('#/'))}
          className={`inline-flex items-center gap-1 -ml-2 px-2 py-1.5 rounded-full text-[14px] cursor-pointer ${
            isDark ? 'text-[#A9BDB2] hover:bg-white/5' : 'text-[#1D5A43] hover:bg-[#1D5A43]/5'
          }`}
        >
          <ChevronLeft className="w-5 h-5" /> திரும்ப
        </button>

        {/* Title */}
        {(() => {
          const title =
            route.page === 'chapter' && selectedAthikaramData
              ? `${selectedAthikaramData.number}. ${selectedAthikaramData.name}`
              : route.page === 'search'
              ? 'தேடல் முடிவுகள்'
              : route.page === 'saved'
              ? 'சேமித்த குறள்கள்'
              : route.page === 'kurals' && route.paal !== 'all'
              ? route.paal
              : 'அனைத்து குறள்கள்';
          const sub =
            route.page === 'chapter' && selectedAthikaramData
              ? `${selectedAthikaramData.nameEn} · ${selectedAthikaramData.paal} · குறள் ${selectedAthikaramData.startKural}–${selectedAthikaramData.endKural}`
              : `${filteredKurals.length} குறள்கள்`;
          return (
            <div className="mt-2 mb-4">
              <h1 className={`font-tamil-sans text-[22px] sm:text-[28px] font-bold leading-snug ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>{title}</h1>
              <p className={`text-[13.5px] mt-0.5 ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>{sub}</p>
            </div>
          );
        })()}

        {/* Search page: editable search box */}
        {route.page === 'search' && (
          <div className="mb-4">
            <HomeSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearchSubmit={handleSearchSubmit} isDark={isDark} />
          </div>
        )}

        {/* Browsing pages: one swipeable row of filters */}
        {(route.page === 'kurals' || route.page === 'saved') && (
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-2 mb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {([
              { hash: '#/kurals', label: 'அனைத்தும்', on: route.page === 'kurals' && route.paal === 'all' },
              ...PAAL_KEYS.map(p => ({ hash: `#/kurals/${p}`, label: p, on: route.page === 'kurals' && route.paal === p })),
              { hash: '#/videos', label: 'காணொளி', on: false },
              { hash: '#/saved', label: `சேமித்தவை (${bookmarks.length})`, on: route.page === 'saved' },
            ]).map(chip => (
              <button
                key={chip.hash}
                onClick={() => go(chip.hash)}
                className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full border text-[13.5px] transition-colors cursor-pointer ${
                  chip.on
                    ? 'bg-[#1D4234] border-[#1D4234] text-white'
                    : isDark
                    ? 'border-[#2F3833] text-[#D9CFB8] hover:bg-white/5'
                    : 'border-[#DCE3DE] bg-white text-[#2E3B35] hover:border-[#1D5A43]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Sub-group (Iyal) tabs for the selected Paal: e.g. பாயிரவியல் – 4 | இல்லறவியல் – 20 | துறவறவியல் – 13 | ஊழியல் – 1 */}
        {route.page === 'kurals' && route.paal !== 'all' && activePaalIyals.length > 0 && (
          <div className="mb-4">
            <div className={`text-[13px] font-tamil-sans font-bold mb-1.5 ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>
              {route.paal} – {ATHIKARAMS.filter(a => a.paal === route.paal).length} அதிகாரங்கள்
            </div>
            <div className="flex flex-wrap gap-1.5 pb-1">
              <button
                onClick={() => setSelectedIyalFilter('all')}
                className={`shrink-0 px-3 py-1.5 rounded-lg sm:rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  selectedIyalFilter === 'all'
                    ? 'bg-[#1D4234] border-[#1D4234] text-white shadow-xs font-semibold'
                    : isDark
                    ? 'border-[#2F3833] text-[#D9CFB8] hover:bg-white/5'
                    : 'border-[#DCE3DE] bg-white text-[#2E3B35] hover:border-[#1D5A43]'
                }`}
              >
                அனைத்தும் – {ATHIKARAMS.filter(a => a.paal === route.paal).length}
              </button>
              {activePaalIyals.map(iyal => (
                <button
                  key={iyal.name}
                  onClick={() => setSelectedIyalFilter(iyal.name)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg sm:rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    selectedIyalFilter === iyal.name
                      ? 'bg-[#1D4234] border-[#1D4234] text-white shadow-xs font-semibold'
                      : isDark
                      ? 'border-[#2F3833] text-[#D9CFB8] hover:bg-white/5'
                      : 'border-[#DCE3DE] bg-white text-[#2E3B35] hover:border-[#1D5A43]'
                  }`}
                >
                  {iyal.name} – {iyal.count}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* The kurals */}
        {filteredKurals.length > 0 ? (
          <div className={`-mx-4 sm:mx-0 sm:rounded-[14px] border-y sm:border px-4 sm:px-6 ${isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white border-[#ECEBE5]'}`}>
            {visibleKurals.map(kural => (
              <KuralListItem
                key={kural.number}
                kural={kural}
                showChapter={route.page !== 'chapter'}
                isBookmarked={bookmarks.includes(kural.number)}
                onToggleBookmark={handleToggleBookmark}
                onOpenVideo={k => go(`#/video/${k.number}`)}
                onOpenDetails={k => setSelectedDetailKural(k)}
                onEditMedia={editMediaHandler}
                isDark={isDark}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-14 px-4 rounded-[14px] border border-dashed ${isDark ? 'border-[#2F3833]' : 'border-[#DCE3DE]'}`}>
            <p className={`font-tamil-sans text-[16px] font-semibold ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>
              {route.page === 'saved' ? 'இன்னும் எந்தக் குறளும் சேமிக்கப்படவில்லை' : 'குறள்கள் எதுவும் கிடைக்கவில்லை'}
            </p>
            <p className={`text-[13.5px] mt-1 ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>
              {route.page === 'saved' ? 'ஒரு குறளின் 🔖 குறியைத் தொட்டு சேமிக்கலாம்.' : 'வேறு சொல்லையோ குறள் எண்ணையோ தேடுங்கள்.'}
            </p>
          </div>
        )}

        {/* Load more */}
        {visibleKurals.length < filteredKurals.length && (
          <div className="text-center mt-6">
            <button
              onClick={() => setVisibleCount(prev => prev + 20)}
              className={`px-6 py-2.5 rounded-full text-[14px] font-medium border cursor-pointer ${
                isDark ? 'border-[#2F3833] text-[#D9CFB8] hover:bg-white/5' : 'border-[#DCE3DE] bg-white text-[#1D5A43] hover:border-[#1D5A43]'
              }`}
            >
              மேலும் 20 குறள்கள் ({visibleKurals.length} / {filteredKurals.length})
            </button>
          </div>
        )}

        {/* Chapter page: previous / next chapter */}
        {route.page === 'chapter' && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[route.n - 1, route.n + 1].map((n, i) => {
              const ath = ATHIKARAMS.find(a => a.number === n);
              if (!ath) return <span key={i} />;
              return (
                <button
                  key={n}
                  onClick={() => go(`#/adhikaram/${n}`)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 cursor-pointer transition-colors ${i === 1 ? 'justify-end text-right' : ''} ${
                    isDark ? 'border-[#2A302C] bg-[#161A17] hover:border-[#4C5E54]' : 'border-[#ECEBE5] bg-white hover:border-[#C9D6CD]'
                  }`}
                >
                  {i === 0 && <ChevronLeft className={`w-5 h-5 shrink-0 ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`} />}
                  <span className="min-w-0">
                    <span className={`block text-[12px] ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>{i === 0 ? 'முந்தைய' : 'அடுத்த'} அதிகாரம்</span>
                    <span className={`block font-tamil-sans text-[14.5px] font-semibold truncate ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>
                      {ath.number}. {ath.name}
                    </span>
                  </span>
                  {i === 1 && <ChevronRight className={`w-5 h-5 shrink-0 ${isDark ? 'text-[#A9BDB2]' : 'text-[#1D5A43]'}`} />}
                </button>
              );
            })}
          </div>
        )}
      </main>
      )}


      {/* Follow us + contact (every page) */}
      <SiteFooter isDark={isDark} />

      {/* குறள் வரைபடம் — full-screen map of Kurals by meaning */}
      {route.page === 'map' && (
        <Suspense fallback={<div className="fixed inset-0 z-40 bg-[#0B0F0D]" />}>
          <KuralMap
            initialKural={route.n}
            focus={route}
            onExit={() => go('#/')}
            onSelectKural={(n) => window.history.replaceState(null, '', n ? `#/map/${n}` : '#/map')}
            onOpenDetail={(k) => setSelectedDetailKural(k)}
            onOpenVideo={(k) => setVideoModalKural(k)}
          />
        </Suspense>
      )}

      {/* Detail / Commentary Modal */}
      <KuralDetailModal
        kural={selectedDetailKural}
        onClose={() => setSelectedDetailKural(null)}
        isBookmarked={selectedDetailKural ? bookmarks.includes(selectedDetailKural.number) : false}
        onToggleBookmark={handleToggleBookmark}
        onOpenVideo={(k) => setVideoModalKural(k)}
        onOpenImage={(k) => setImageModalKural(k)}
        onEditMedia={editMediaHandler}
        onOpenKural={(k) => setSelectedDetailKural(k)}
        onShowOnMap={(n) => {
          setSelectedDetailKural(null);
          go(`#/map/${n}`);
        }}
        isDark={isDark}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={!!videoModalKural}
        kural={videoModalKural}
        onClose={() => setVideoModalKural(null)}
        isDark={isDark}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={!!imageModalKural}
        kural={imageModalKural}
        onClose={() => setImageModalKural(null)}
        isDark={isDark}
      />

      {/* Media editor — only when running locally */}
      {CAN_EDIT_MEDIA && <MediaModal
        isOpen={isMediaModalOpen}
        initialKuralNumber={editingKural ? editingKural.number : 1}
        initialMedia={editingKural?.media}
        onClose={() => setIsMediaModalOpen(false)}
        onSave={handleSaveMedia}
        onDelete={handleDeleteMedia}
        onSyncComplete={(updated) => {
          setUserMedia(updated);
          showToast('வரைவுகள் உள்ளீடு செய்யப்பட்டன');
        }}
        isDark={isDark}
      />}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold shadow-xl animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
