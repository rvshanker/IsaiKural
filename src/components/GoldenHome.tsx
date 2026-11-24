import React, { useEffect, useState } from 'react';
import { Search, ArrowRight, Music2, BookOpen, Library, Puzzle, Network, Lightbulb, Menu, X, ChevronLeft, ChevronRight, Shuffle, Play, Home as HomeIcon } from 'lucide-react';
import { Kural } from '../types/kural';
import { getYouTubeThumbnail } from '../utils/youtube';
import './GoldenHome.css';

interface GoldenHomeProps {
  dailyKural: Kural;
  firstKural: Kural;
  videoKurals: Kural[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onStepDaily: (delta: number) => void;
  onShuffleDaily: () => void;
  onOpenDetail: (k: Kural) => void;
  go: (hash: string) => void;
  /** 133-chapter table and anything else that sits under the page sections */
  children?: React.ReactNode;
  /** Shown above everything else (e.g. the reminder card in the iPhone app) */
  top?: React.ReactNode;
}

const MENU: { label: string; hash: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'முகப்பு', hash: '#/', Icon: HomeIcon },
  { label: 'குறள்கள்', hash: '#/kurals', Icon: BookOpen },
  { label: 'பாடல்கள்', hash: '#/videos', Icon: Music2 },
  { label: 'கற்போம்', hash: '#/learn', Icon: Puzzle },
  { label: 'வரைபடம்', hash: '#/map', Icon: Network },
];

const QUICK: { label: string; sub: string; hash: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { label: 'இசைப் பாடல்கள்', sub: 'Songs', hash: '#/videos', Icon: Music2 },
  { label: 'மூன்று பால்கள்', sub: '1330 kurals', hash: '#/kurals', Icon: Library },
  { label: 'கற்போம் · விளையாடுவோம்', sub: 'Game & quiz', hash: '#/learn', Icon: Puzzle },
  { label: 'குறள் வரைபடம்', sub: 'Kural map', hash: '#/map', Icon: Network },
  { label: 'சுவையான உண்மைகள்', sub: 'Facts', hash: '#/facts', Icon: Lightbulb },
];

/** A song for today: today's kural if it has one, otherwise one that changes each day. */
function songOfTheDay(daily: Kural, songs: Kural[]): Kural | null {
  if (daily.media?.youtubeUrl) return daily;
  if (!songs.length) return null;
  const day = Math.floor(Date.now() / 86400000);
  return songs[day % songs.length];
}

export const GoldenHome: React.FC<GoldenHomeProps> = ({
  dailyKural, firstKural, videoKurals, searchQuery, onSearchChange, onSearchSubmit,
  onStepDaily, onShuffleDaily, onOpenDetail, go, children, top,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 30);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => { document.body.style.overflow = menuOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [menuOpen]);

  const song = songOfTheDay(dailyKural, videoKurals);
  const more = videoKurals.filter(k => k.number !== song?.number);
  const day = Math.floor(Date.now() / 86400000);
  const next3 = more.length ? [0, 1, 2].map(i => more[(day * 7 + i * 31) % more.length]) : [];
  const submit = (e: React.FormEvent) => { e.preventDefault(); onSearchSubmit(searchQuery); };
  const nav = (hash: string) => { setMenuOpen(false); go(hash); if (hash === '#/') window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="gh">
      <header className={'gh-top' + (solid ? ' solid' : '')}>
        <div className="gh-wrap gh-top-in">
          <a className="gh-brand" href="#/" onClick={(e) => { e.preventDefault(); nav('#/'); }}>
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 5c2.6 3.2 3.6 6.6 2.8 10.2M16 5c-2.6 3.2-3.6 6.6-2.8 10.2M16 15.5c3-4.3 7-6 11-5.4-.8 5.6-5 9.4-11 9.4s-10.2-3.8-11-9.4c4-.6 8 1.1 11 5.4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 24h22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <span>இசையில் திருக்குறள்<small>isaikural.com</small></span>
          </a>
          <nav className="gh-nav" aria-label="முதன்மை">
            {MENU.map(({ label, hash, Icon }) => (
              <a key={hash} href={hash} className={hash === '#/' ? 'on' : ''} onClick={(e) => { e.preventDefault(); nav(hash); }}>
                <Icon className="gh-ni" />{label}
              </a>
            ))}
          </nav>
          <div className="gh-tools">
            <a className="gh-icon" href="#/search" aria-label="தேடல்" onClick={(e) => { e.preventDefault(); document.getElementById('gh-q')?.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Search /></a>
            <button className="gh-icon gh-burger" aria-label="மெனு" onClick={() => setMenuOpen(true)}><Menu /></button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="gh-sheet" role="dialog" aria-modal="true" aria-label="மெனு">
          <button className="gh-icon gh-close" aria-label="மூடு" onClick={() => setMenuOpen(false)}><X /></button>
          {[...MENU, { label: 'சுவையான உண்மைகள்', hash: '#/facts', Icon: Lightbulb }, { label: 'சேமித்தவை', hash: '#/saved', Icon: BookOpen }, { label: 'கருத்து தெரிவிக்க', hash: '#/feedback', Icon: Music2 }].map(({ label, hash }) => (
            <a key={hash} href={hash} onClick={(e) => { e.preventDefault(); nav(hash); }}>{label}</a>
          ))}
        </div>
      )}

      {/* HERO */}
      <section className="gh-hero" id="home">
        <div className="gh-hero-bg" aria-hidden="true" />
        <div className="gh-hero-shade" aria-hidden="true" />
        <div className="gh-embers" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.9) % 7}s`, animationDuration: `${7 + (i % 5)}s` }} />)}</div>
        <div className="gh-wrap gh-hero-in">
          <h1><span>1330 குறள்கள்.</span><span>ஓர் இசைப் பயணம்.</span></h1>
          <p>வள்ளுவரின் காலம் கடந்த சிந்தனைகள், இசையிலும் காட்சியிலும் புதிய அனுபவமாக.</p>
          <form className="gh-search" role="search" onSubmit={submit}>
            <Search className="gh-si" aria-hidden="true" />
            <input id="gh-q" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="குறள் எண், அதிகாரம் அல்லது சொல்லைத் தேடுங்கள்…" aria-label="குறள்களைத் தேடுங்கள்" enterKeyHint="search" />
            <button type="submit" aria-label="தேடு"><ArrowRight /></button>
          </form>
          <div className="gh-cta">
            <a href="#/kurals" onClick={(e) => { e.preventDefault(); go('#/kurals'); }}>குறள்களைப் படிக்க <ArrowRight /></a>
            <a href="#/videos" onClick={(e) => { e.preventDefault(); go('#/videos'); }}>பாடல்களைக் கேட்க <ArrowRight /></a>
          </div>
        </div>
      </section>

      <main className="gh-wrap gh-main">
        {top}
        {/* Two ways in: listen, read */}
        <div className="gh-panels">
          <section className="gh-panel" aria-labelledby="gh-music">
            <div className="gh-ph">
              <Music2 className="gh-phi" strokeWidth={1.6} />
              <div><h2 id="gh-music">இசைப் பயணம்</h2><p>குறள்களை இசையில் அனுபவியுங்கள் · {videoKurals.length} பாடல்கள்</p></div>
            </div>
            {song && (
              <button className="gh-song" onClick={() => go(`#/video/${song.number}`)}>
                <span className="gh-thumb">
                  {getYouTubeThumbnail(song.media?.youtubeUrl) && <img src={getYouTubeThumbnail(song.media?.youtubeUrl)!} alt="" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
                  <span className="gh-play"><Play /></span>
                </span>
                <span className="gh-song-t">
                  <small>இன்றைய பாடல் · {song.paal}</small>
                  <b>{song.line1}<br />{song.line2}</b>
                  <em>குறள் {song.number} — {song.athikaramTamil}</em>
                </span>
              </button>
            )}
            <div className="gh-mini">
              {next3.map(k => (
                <button key={k.number} onClick={() => go(`#/video/${k.number}`)}>
                  <Play className="gh-mp" /><span>குறள் {k.number}</span><em>{k.athikaramTamil}</em>
                </button>
              ))}
            </div>
            <a className="gh-more" href="#/videos" onClick={(e) => { e.preventDefault(); go('#/videos'); }}>அனைத்துப் பாடல்களும் <ArrowRight /></a>
          </section>

          <section className="gh-panel" aria-labelledby="gh-read">
            <div className="gh-ph">
              <BookOpen className="gh-phi" strokeWidth={1.6} />
              <div><h2 id="gh-read">திருக்குறள் வாசிப்பு</h2><p>1330 குறள்கள், நான்கு உரைகளுடன்</p></div>
            </div>
            <div className="gh-leaf">
              <small>குறள் {firstKural.number} · {firstKural.athikaramTamil}</small>
              <b>{firstKural.line1}<br />{firstKural.line2}</b>
              <p>{firstKural.commentaries.muVa}</p>
              {firstKural.commentaries.englishExplanation && <p className="en">{firstKural.commentaries.englishExplanation}</p>}
              <div className="gh-leaf-row">
                <button onClick={() => onOpenDetail(firstKural)}>நான்கு உரைகள்</button>
                <a href="#/adhikaram/1" onClick={(e) => { e.preventDefault(); go('#/adhikaram/1'); }}>படிக்கத் தொடங்குங்கள் <ArrowRight /></a>
              </div>
            </div>
          </section>
        </div>

        {/* Quick links */}
        <nav className="gh-quick" aria-label="பகுதிகள்">
          {QUICK.map(({ label, sub, hash, Icon }) => (
            <a key={hash} href={hash} onClick={(e) => { e.preventDefault(); go(hash); }}>
              <Icon className="gh-qi" strokeWidth={1.5} />
              <b>{label}</b><small>{sub}</small>
            </a>
          ))}
        </nav>

        {/* Today's kural, by lamplight */}
        <section className="gh-today" aria-labelledby="gh-today-h">
          <div className="gh-today-text">
            <h2 id="gh-today-h"><span className="gh-sun" aria-hidden="true" />இன்றைய குறள்</h2>
            <b className="gh-tk">{dailyKural.line1}<br />{dailyKural.line2}</b>
            <p>{dailyKural.commentaries.muVa}</p>
            {dailyKural.commentaries.englishExplanation && <p className="en">{dailyKural.commentaries.englishExplanation}</p>}
            <div className="gh-today-row">
              <span className="gh-ref">குறள் {dailyKural.number} · {dailyKural.athikaramTamil}</span>
              <span className="gh-steps">
                <button aria-label="முந்தைய குறள்" onClick={() => onStepDaily(-1)}><ChevronLeft /></button>
                <button aria-label="வேறு குறள்" onClick={onShuffleDaily}><Shuffle /></button>
                <button aria-label="அடுத்த குறள்" onClick={() => onStepDaily(1)}><ChevronRight /></button>
              </span>
              <button className="gh-pill" onClick={() => onOpenDetail(dailyKural)}>மேலும் அறிய <ArrowRight /></button>
              {dailyKural.media?.youtubeUrl && <button className="gh-pill gold" onClick={() => go(`#/video/${dailyKural.number}`)}><Play /> பாடல்</button>}
            </div>
          </div>
          <div className="gh-lamp" aria-hidden="true">
            <div className="gh-glow" />
            <div className="gh-flame"><i /></div>
            <svg viewBox="0 0 160 120"><defs><linearGradient id="ghb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E9B865"/><stop offset="1" stopColor="#7A4B16"/></linearGradient></defs>
              <path d="M18 26c10 16 34 24 62 24s52-8 62-24c-6 22-30 34-62 34S24 48 18 26z" fill="url(#ghb)"/>
              <path d="M74 60h12l4 26H70z" fill="url(#ghb)"/><ellipse cx="80" cy="96" rx="34" ry="8" fill="url(#ghb)"/><ellipse cx="80" cy="104" rx="44" ry="9" fill="#5A350F"/>
              <path d="M138 22l12-6-4 12z" fill="#E9B865"/></svg>
          </div>
        </section>

        {children && <div className="gh-cat">{children}</div>}
      </main>
    </div>
  );
};
