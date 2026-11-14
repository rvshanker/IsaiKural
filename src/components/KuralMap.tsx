import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ALL_KURALS, getKuralByNumber } from '../data/kurals';
import { ATHIKARAMS } from '../data/chapters';
import { CHAPTER_POINTS, CIRCLE_R, MAP_IMAGE, MAP_W, MAP_H } from '../data/mapLayout';
import { kuralMatchesSearch } from '../utils/search';
import { PAAL_COLORS } from '../utils/kuralMapData';
import { Kural } from '../types/kural';
import { Home, Maximize2, Minus, PlayCircle, Plus, Search, X } from 'lucide-react';

interface KuralMapProps {
  onExit: () => void;
  onOpenDetail: (k: Kural) => void;
}

/**
 * குறள் வரைபடம்: a picture of Thiruvalluvar covered with 133 numbered circles, one per அதிகாரம்.
 * One simple page: the picture, a search bar under it, and the results under that.
 * Searching lights up the chapters that hold matching Kurals; tapping a circle lists that chapter's Kurals.
 */

const BG = '#0D110F';
const EXAMPLES = ['மழை', 'மலர்', 'நட்பு', 'கல்வி', 'சினம்', 'rain'];

const adh = (a: number) => ATHIKARAMS[a - 1];
const colorOf = (a: number, alpha = 1) => {
  const hex = PAAL_COLORS[adh(a).paal];
  if (alpha === 1) return hex;
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${v >> 16}, ${(v >> 8) & 255}, ${v & 255}, ${alpha})`;
};

// the picture is loaded once and shared
let picture: HTMLImageElement | null = null;
function loadPicture(onLoad: () => void) {
  if (!picture) {
    picture = new Image();
    picture.src = MAP_IMAGE;
  }
  if (picture.complete && picture.naturalWidth) onLoad();
  else picture.addEventListener('load', onLoad, { once: true });
}

type Selection = { kind: 'none' } | { kind: 'search'; q: string } | { kind: 'chapter'; a: number };

export const KuralMap: React.FC<KuralMapProps> = ({ onExit, onOpenDetail }) => {
  const [sel, setSel] = useState<Selection>({ kind: 'none' });
  const [input, setInput] = useState('');
  const [chapterFilter, setChapterFilter] = useState<number | null>(null);
  const [hover, setHover] = useState<{ a: number; x: number; y: number } | null>(null);
  const [boxW, setBoxW] = useState(800);
  const [vh, setVh] = useState(window.innerHeight);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // the picture is 3:2: as wide as the page allows, but no taller than 60% of the screen, so the results start right under it
  const viewW = Math.round(Math.min(boxW, vh * 0.6 * (MAP_W / MAP_H), 1100));
  const viewH = Math.round((viewW * MAP_H) / MAP_W);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => loadPicture(() => setLoaded(true)), []);

  // zoom: z = 1 shows the whole picture; ox/oy move it around when zoomed in
  const [zoom, setZoom] = useState({ z: 1, ox: 0, oy: 0 });
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const clampZoom = useCallback(
    (z: number, ox: number, oy: number) => {
      z = Math.min(6, Math.max(1, z));
      ox = Math.min(0, Math.max(viewW - viewW * z, ox));
      oy = Math.min(0, Math.max(viewH - viewH * z, oy));
      return { z, ox, oy };
    },
    [viewW, viewH]
  );
  const zoomAt = useCallback(
    (px: number, py: number, factor: number) => {
      const c = zoomRef.current;
      const z = Math.min(6, Math.max(1, c.z * factor));
      const f = z / c.z;
      setZoom(clampZoom(z, px - (px - c.ox) * f, py - (py - c.oy) * f));
    },
    [clampZoom]
  );
  useEffect(() => setZoom({ z: 1, ox: 0, oy: 0 }), [viewW]);
  // scrolling over the picture zooms it in and out (trackpad pinch too)
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0012)));
    };
    cv.addEventListener('wheel', onWheel, { passive: false });
    return () => cv.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      const pad = el ? parseFloat(getComputedStyle(el).paddingLeft) * 2 : 24;
      setBoxW((el?.clientWidth ?? window.innerWidth) - pad);
      setVh(window.innerHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', measure);
      document.body.style.overflow = prev;
    };
  }, []);

  const hits = useMemo(() => (sel.kind === 'search' ? ALL_KURALS.filter((kr) => kuralMatchesSearch(kr, sel.q)) : null), [sel]);

  const counts = useMemo(() => {
    const m = new Map<number, number>();
    hits?.forEach((kr) => m.set(kr.athikaramNumber, (m.get(kr.athikaramNumber) ?? 0) + 1));
    return m;
  }, [hits]);

  const ringed = sel.kind === 'chapter' ? sel.a : chapterFilter;

  // ── drawing ──
  const k = (viewW / MAP_W) * zoom.z;
  const t = useCallback((x: number, y: number): [number, number] => [x * k + zoom.ox, y * k + zoom.oy], [k, zoom]);
  const r = CIRCLE_R * k;

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== viewW * dpr || cv.height !== viewH * dpr) {
      cv.width = viewW * dpr;
      cv.height = viewH * dpr;
    }
    const g = cv.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = BG;
    g.fillRect(0, 0, viewW, viewH);
    if (picture && loaded) g.drawImage(picture, zoom.ox, zoom.oy, MAP_W * k, MAP_H * k);

    const active = sel.kind !== 'none';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    CHAPTER_POINTS.forEach(([x, y], i) => {
      const a = i + 1;
      const [sx, sy] = t(x, y);
      const lit = !active || (sel.kind === 'search' ? counts.has(a) : sel.a === a);
      g.fillStyle = lit ? colorOf(a, 0.97) : 'rgba(30, 32, 30, 0.88)';
      g.beginPath();
      g.arc(sx, sy, r, 0, Math.PI * 2);
      g.fill();
      if (a === ringed || hover?.a === a) {
        g.strokeStyle = '#fff';
        g.lineWidth = a === ringed ? 2.5 : 1.5;
        g.beginPath();
        g.arc(sx, sy, r + 2.5, 0, Math.PI * 2);
        g.stroke();
      }
      // the chapter number fits inside even on a phone; names are shown below the picture
      g.fillStyle = lit ? '#0D110F' : 'rgba(255,255,255,0.45)';
      g.font = `700 ${Math.max(7, Math.min(18, r * 0.72))}px Inter, sans-serif`;
      g.fillText(String(a), sx, sy + 0.5);
      // how many matching Kurals this chapter holds
      const c = counts.get(a);
      if (c && lit) {
        const br = Math.max(6.5, Math.min(11, r * 0.5));
        const bx = sx + r * 0.78;
        const by = sy - r * 0.78;
        g.fillStyle = '#F2C66D';
        g.beginPath();
        g.arc(bx, by, br, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#1B1A16';
        g.font = `800 ${br * 1.15}px Inter, sans-serif`;
        g.fillText(String(c), bx, by + 0.5);
      }
    });
  }, [viewW, viewH, t, k, r, sel, counts, ringed, hover, zoom, loaded]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ── touch / mouse on the picture ──
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(0);
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const local = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, local(e));
    moved.current = 0;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), z: zoomRef.current.z };
      (e.target as Element).setPointerCapture(e.pointerId);
    } else if (zoomRef.current.z > 1) {
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = local(e);
    const prev = pointers.current.get(e.pointerId);
    if (!prev) {
      if (e.pointerType === 'mouse') {
        const a = chapterAt(e.clientX, e.clientY);
        setHover(a ? { a, x: p.x, y: p.y } : null);
      }
      return;
    }
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const target = pinch.current.z * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.d);
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, target / zoomRef.current.z);
      moved.current += 10;
      return;
    }
    const dx = p.x - prev.x;
    const dy = p.y - prev.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    if (zoomRef.current.z > 1) {
      const c = zoomRef.current;
      setZoom(clampZoom(c.z, c.ox + dx, c.oy + dy));
      setHover(null);
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (moved.current < 8 && pointers.current.size === 0 && e.type === 'pointerup') {
      const a = chapterAt(e.clientX, e.clientY);
      if (a) openChapter(a);
    }
  };

  const chapterAt = (clientX: number, clientY: number): number | null => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    // a little extra reach for fingers
    let best: number | null = null;
    let bd = (r + 4) ** 2;
    CHAPTER_POINTS.forEach(([x, y], i) => {
      const [sx, sy] = t(x, y);
      const d = (sx - px) ** 2 + (sy - py) ** 2;
      if (d < bd) {
        bd = d;
        best = i + 1;
      }
    });
    return best;
  };


  const openChapter = (a: number) => {
    setSel({ kind: 'chapter', a });
    setChapterFilter(null);
    setHover(null);
  };

  const runSearch = (q: string) => {
    setInput(q);
    setChapterFilter(null);
    const s = q.trim();
    if (!s) return setSel({ kind: 'none' });
    if (/^\d+$/.test(s)) {
      const n = parseInt(s, 10);
      if (n >= 1 && n <= 1330) {
        onOpenDetail(getKuralByNumber(n));
        return;
      }
    }
    setSel({ kind: 'search', q: s });
  };

  const typing = useRef(0);
  const onType = (q: string) => {
    setInput(q);
    window.clearTimeout(typing.current);
    // a Kural number opens only on Enter, so typing "12" on the way to "1281" doesn't open Kural 12
    if (/^\d+$/.test(q.trim())) return;
    typing.current = window.setTimeout(() => runSearch(q), 400);
  };

  const clear = () => {
    setInput('');
    setSel({ kind: 'none' });
    setChapterFilter(null);
  };

  // ── results table: Kural | அதிகாரம் ──
  const cols = (showChapter: boolean) => (showChapter ? 'grid-cols-[44px_1fr_34%] sm:grid-cols-[56px_1fr_260px]' : 'grid-cols-[44px_1fr] sm:grid-cols-[56px_1fr]');
  const table = (rows: Kural[], showChapter: boolean) => (
    <div className="mt-3 rounded-2xl border border-white/10 overflow-hidden">
      <div className={`grid ${cols(showChapter)} gap-3 px-4 py-2.5 text-[12.5px] font-semibold text-[#7FB39A] font-tamil-sans bg-white/[0.04]`}>
        <span>எண்</span>
        <span>குறள்</span>
        {showChapter && <span>அதிகாரம்</span>}
      </div>
      {rows.slice(0, 400).map((kural) => (
        <div key={kural.number} className={`grid ${cols(showChapter)} gap-3 px-4 py-3 border-t border-white/[0.06] hover:bg-white/[0.03]`}>
          <button onClick={() => onOpenDetail(kural)} className="text-left text-[13.5px] font-semibold text-[#F2C66D] cursor-pointer">
            {kural.number}
          </button>
          <button onClick={() => onOpenDetail(kural)} className="text-left font-tamil-sans text-[15px] leading-snug text-[#EEE8DC] cursor-pointer hover:text-white">
            {kural.line1}
            <br />
            {kural.line2}
            {kural.media?.youtubeUrl && (
              <span className="ml-1.5 inline-flex items-center gap-0.5 align-middle text-[12px] text-[#F2C66D]">
                <PlayCircle className="w-3.5 h-3.5" /> பாடல்
              </span>
            )}
          </button>
          {showChapter && (
            <button
              onClick={() => setChapterFilter(chapterFilter === kural.athikaramNumber ? null : kural.athikaramNumber)}
              title="இந்த அதிகாரத்தை மட்டும் காட்டு"
              className="flex items-start gap-1.5 text-left text-[13.5px] leading-snug text-[#C9C3B6] font-tamil-sans cursor-pointer hover:text-white"
            >
              <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorOf(kural.athikaramNumber) }} />
              <span>
                {kural.athikaramTamil}
                <span className="block text-[11.5px] text-white/40">அதிகாரம் {kural.athikaramNumber}</span>
              </span>
            </button>
          )}
        </div>
      ))}
      {rows.length > 400 && <p className="px-4 py-2.5 border-t border-white/[0.06] text-[12.5px] text-white/45 font-tamil-sans">முதல் 400 குறள்கள் மட்டும் — சொல்லைக் குறுக்கித் தேடுங்கள்.</p>}
    </div>
  );

  let results: React.ReactNode = null;
  if (sel.kind === 'search' && hits) {
    const chapters = [...counts.entries()].sort((x, y) => y[1] - x[1]);
    const rows = chapterFilter ? hits.filter((h) => h.athikaramNumber === chapterFilter) : hits;
    const pill = (on: boolean) =>
      `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] cursor-pointer font-tamil-sans ${
        on ? 'bg-[#F2C66D] border-[#F2C66D] text-[#1B1A16] font-semibold' : 'bg-white/[0.04] border-white/10 text-[#EEE8DC] hover:bg-white/[0.09]'
      }`;
    results = (
      <>
        <div className="text-[15px] text-[#C9C3B6] font-tamil-sans">
          {hits.length ? (
            <>
              <b className="text-white">“{sel.q}”</b> — {hits.length} குறள்கள், {chapters.length} அதிகாரங்களில்
            </>
          ) : (
            <>“{sel.q}” — பொருத்தம் இல்லை. வேறு சொல்லைத் தேடுங்கள்.</>
          )}
        </div>
        {chapters.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button onClick={() => setChapterFilter(null)} className={pill(chapterFilter === null)}>
              அனைத்தும் <span className="opacity-70">{hits.length}</span>
            </button>
            {chapters.map(([a, c]) => (
              <button key={a} onClick={() => setChapterFilter(chapterFilter === a ? null : a)} className={pill(chapterFilter === a)}>
                {chapterFilter !== a && <span className="w-2 h-2 rounded-full" style={{ background: colorOf(a) }} />}
                {adh(a).name} <span className="opacity-70">{c}</span>
              </button>
            ))}
          </div>
        )}
        {rows.length > 0 && table(rows, true)}
      </>
    );
  } else if (sel.kind === 'chapter') {
    const a = adh(sel.a);
    results = (
      <>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[13px] font-semibold font-tamil-sans" style={{ color: colorOf(sel.a) }}>
              அதிகாரம் {a.number} · {a.paal} · {a.iyal}
            </div>
            <div className="font-tamil-sans text-[24px] font-bold text-[#F4EFE4]">{a.name}</div>
            <div className="text-[13px] text-white/55">{a.nameEn}</div>
          </div>
          <button onClick={clear} aria-label="மூடு" className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        {table(ALL_KURALS.slice(a.startKural - 1, a.endKural), false)}
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto" style={{ background: BG }}>
      <div ref={wrapRef} className="mx-auto w-full max-w-[880px] px-3 sm:px-6 pb-16">
        {/* top: home link, title, colour key */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 pb-2">
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onExit();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#151A17] border border-white/10 px-3 h-10 text-[14px] text-white font-tamil-sans hover:bg-[#1D2420]"
          >
            <Home className="w-4 h-4" /> முகப்பு
          </a>
          <h1 className="font-tamil-sans text-[20px] font-bold text-[#F4EFE4]">குறள் வரைபடம்</h1>
        </div>
        <div className="font-tamil-sans text-[14px] text-[#A9B3AD] flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>ஒவ்வொரு வட்டமும் ஒரு அதிகாரம் — 1 முதல் 133 வரை. உருட்டிப் பெரிதாக்கலாம், இழுத்து நகர்த்தலாம்.</span>
          {(Object.keys(PAAL_COLORS) as (keyof typeof PAAL_COLORS)[]).map((p) => (
            <span key={p} className="inline-flex items-center gap-1.5 text-[13px]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PAAL_COLORS[p] }} /> {p}
            </span>
          ))}
        </div>

        {/* the picture: scroll or pinch to zoom, drag to move, or use the + / − buttons */}
        <div className="relative mt-2 mx-auto rounded-2xl overflow-hidden" style={{ width: viewW, height: viewH }}>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="திருவள்ளுவர் படம் — 133 அதிகாரங்களும் எண்ணிட்ட வட்டங்களாக"
            style={{ width: viewW, height: viewH, cursor: hover ? 'pointer' : zoom.z > 1 ? 'grab' : 'default', touchAction: 'none' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={() => setHover(null)}
          />
          {hover && (
            <div className="pointer-events-none absolute z-10 rounded-lg bg-[#151A17] border border-white/10 px-3 py-1.5 shadow-xl whitespace-nowrap" style={{ left: Math.min(hover.x + 12, viewW - 210), top: Math.min(hover.y + 14, viewH - 56) }}>
              <div className="font-tamil-sans text-[14px] font-bold text-white">
                {hover.a}. {adh(hover.a).name}
              </div>
              <div className="text-[11.5px] text-white/55">
                {adh(hover.a).nameEn}
                {counts.get(hover.a) ? ` · ${counts.get(hover.a)} குறள்கள்` : ''}
              </div>
            </div>
          )}
          <div className="absolute right-2 bottom-2 flex flex-col gap-1.5">
            <button onClick={() => zoomAt(viewW / 2, viewH / 2, 1.5)} aria-label="பெரிதாக்கு" className="w-9 h-9 rounded-xl bg-[#151A17]/90 border border-white/15 text-white flex items-center justify-center cursor-pointer hover:bg-[#1D2420]">
              <Plus className="w-5 h-5" />
            </button>
            <button onClick={() => zoomAt(viewW / 2, viewH / 2, 1 / 1.5)} disabled={zoom.z <= 1} aria-label="சிறிதாக்கு" className="w-9 h-9 rounded-xl bg-[#151A17]/90 border border-white/15 text-white flex items-center justify-center cursor-pointer hover:bg-[#1D2420] disabled:opacity-35 disabled:cursor-default">
              <Minus className="w-5 h-5" />
            </button>
            {zoom.z > 1 && (
              <button onClick={() => setZoom({ z: 1, ox: 0, oy: 0 })} aria-label="முழுப் படம்" className="w-9 h-9 rounded-xl bg-[#151A17]/90 border border-white/15 text-white flex items-center justify-center cursor-pointer hover:bg-[#1D2420]">
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* search, under the picture */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              value={input}
              onChange={(e) => onType(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.clearTimeout(typing.current);
                  runSearch(input);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="ஒரு சொல்லைத் தேடுங்கள் — மழை, rain, மலர், 1281…"
              className="w-full h-14 rounded-2xl bg-[#151A17] border border-white/15 pl-12 pr-11 text-[16px] text-white placeholder:text-white/40 outline-none focus:border-[#7FB39A]"
            />
            {input && (
              <button onClick={clear} aria-label="அழி" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {sel.kind === 'none' && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[13px] text-white/45 font-tamil-sans mr-1">எ.கா.</span>
              {EXAMPLES.map((w) => (
                <button key={w} onClick={() => runSearch(w)} className="rounded-full border border-white/10 bg-[#151A17] px-3 py-1 font-tamil-sans text-[13.5px] text-[#EEE8DC] cursor-pointer hover:bg-[#1D2420]">
                  {w}
                </button>
              ))}
              <span className="text-[13px] text-white/45 font-tamil-sans ml-1">அல்லது படத்தில் ஒரு வட்டத்தைத் தொடுங்கள்.</span>
            </div>
          )}
        </div>

        {/* results, on the same page */}
        <div ref={resultsRef} className="mt-5 scroll-mt-3">
          {results}
        </div>
      </div>
    </div>
  );
};

export default KuralMap;
