import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ALL_KURALS, getKuralByNumber } from '../data/kurals';
import { ATHIKARAMS } from '../data/chapters';
import { kuralMatchesSearch } from '../utils/search';
import { getYouTubeThumbnail } from '../utils/youtube';
import { useMapData, PAAL_COLORS } from '../utils/kuralMapData';
import { Kural } from '../types/kural';
import { ArrowLeft, BookOpen, ChevronLeft, Minus, PlayCircle, Plus, Search, X } from 'lucide-react';

interface KuralMapProps {
  initialKural?: number;
  /** a new object each time the page is asked to show a Kural (e.g. from "see on the map") */
  focus?: { n?: number };
  onExit: () => void;
  onSelectKural: (n: number | null) => void;
  onOpenDetail: (k: Kural) => void;
  onOpenVideo: (k: Kural) => void;
}

/**
 * குறள் வரைபடம்: the 133 அதிகாரங்கள் as circles, placed so that chapters with similar meaning sit together.
 * Two parts only: a panel (search, results, the chosen Kural or அதிகாரம்) and the map.
 */

// What the panel is showing; earlier views are kept so "back" works
type View = { kind: 'home' } | { kind: 'search'; q: string } | { kind: 'adhikaram'; a: number } | { kind: 'kural'; n: number };

const BG = '#0D110F';
const PANEL = '#131815';
const R = 27; // circle radius in map units (the map is 1000 × 1000)
const EXAMPLES = ['மலர்', 'நட்பு', 'மழை', 'கல்வி', 'சினம்', 'கண்'];

const adh = (a: number) => ATHIKARAMS[a - 1];
const colorOf = (a: number, alpha = 1) => {
  const hex = PAAL_COLORS[adh(a).paal];
  if (alpha === 1) return hex;
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${v >> 16}, ${(v >> 8) & 255}, ${v & 255}, ${alpha})`;
};

/** Similar Kurals grouped by the அதிகாரம் they belong to; own chapter first, then the chapters with the most matches */
function connectionsFor(sims: number[], own: number) {
  const groups = new Map<number, number[]>();
  for (const n of sims) {
    const a = getKuralByNumber(n).athikaramNumber;
    if (!groups.has(a)) groups.set(a, []);
    groups.get(a)!.push(n);
  }
  return [...groups.entries()]
    .map(([a, list]) => ({ a, list, own: a === own }))
    .sort((x, y) => Number(y.own) - Number(x.own) || y.list.length - x.list.length);
}

export const KuralMap: React.FC<KuralMapProps> = ({ initialKural, focus, onExit, onSelectKural, onOpenDetail, onOpenVideo }) => {
  const { data, error } = useMapData();
  const [views, setViews] = useState<View[]>(() => [{ kind: 'home' }, ...(initialKural ? [{ kind: 'kural', n: initialKural } as View] : [])]);
  const [input, setInput] = useState('');
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [hover, setHover] = useState<{ a: number; x: number; y: number } | null>(null);
  const [sheetFull, setSheetFull] = useState(false);

  const view = views[views.length - 1];
  const isWide = size.w >= 1024;
  const PANEL_W = 420;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const cam = useRef({ x: 0, y: 0, k: 1 });
  const fitK = useRef(1);
  const raf = useRef(0);
  const anim = useRef(0);

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = prev;
    };
  }, []);

  // The map's area on screen: right of the panel on big screens, above the panel on phones
  const mapBox = useCallback(() => {
    if (size.w >= 1024) return { x: PANEL_W, y: 0, w: size.w - PANEL_W, h: size.h };
    const panelH = sheetFull ? size.h * 0.86 : size.h * 0.46;
    return { x: 0, y: 0, w: size.w, h: size.h - panelH };
  }, [size, sheetFull]);

  // ── what the current view lights up on the map ──
  const searchHits = useMemo(() => {
    if (view.kind !== 'search') return null;
    return ALL_KURALS.filter((k) => kuralMatchesSearch(k, view.q));
  }, [view]);

  const focusInfo = useMemo(() => {
    // lit: chapters shown bright; badge: number shown on a chapter; links: lines from one chapter to others
    const lit = new Set<number>();
    const badge = new Map<number, number>();
    let center: number | null = null;
    const links: { to: number; w: number }[] = [];
    if (!data) return { lit, badge, center, links, active: false };
    if (view.kind === 'search' && searchHits) {
      for (const k of searchHits) {
        lit.add(k.athikaramNumber);
        badge.set(k.athikaramNumber, (badge.get(k.athikaramNumber) ?? 0) + 1);
      }
    } else if (view.kind === 'adhikaram') {
      center = view.a;
      lit.add(view.a);
      data.a[view.a - 1][2].forEach((to, i) => {
        links.push({ to, w: 6 - i });
        lit.add(to);
      });
    } else if (view.kind === 'kural') {
      const own = getKuralByNumber(view.n).athikaramNumber;
      center = own;
      lit.add(own);
      for (const g of connectionsFor(data.k[view.n - 1], own)) {
        lit.add(g.a);
        badge.set(g.a, g.list.length);
        if (!g.own) links.push({ to: g.a, w: g.list.length });
      }
    }
    return { lit, badge, center, links, active: view.kind !== 'home' };
  }, [data, view, searchHits]);

  // ── camera ──
  const requestDraw = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => drawRef.current());
  }, []);

  const animateTo = useCallback((to: { x: number; y: number; k: number }) => {
    const from = { ...cam.current };
    const t0 = performance.now();
    cancelAnimationFrame(anim.current);
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 600);
      const e = 1 - Math.pow(1 - p, 3);
      cam.current = { k: from.k + (to.k - from.k) * e, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
      drawRef.current();
      if (p < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }, []);

  const bounds = (chapters: number[] | null) => {
    const pts = chapters && chapters.length ? chapters.map((a) => data!.a[a - 1]) : data!.a;
    const m = chapters && chapters.length ? R * 2.2 : R * 1.5;
    return {
      x0: Math.min(...pts.map((p) => p[0])) - m,
      x1: Math.max(...pts.map((p) => p[0])) + m,
      y0: Math.min(...pts.map((p) => p[1])) - m,
      y1: Math.max(...pts.map((p) => p[1])) + m,
    };
  };

  /** Fit a set of chapters (or the whole map) into the map area */
  const fitTo = useCallback(
    (chapters: number[] | null, animate = true) => {
      if (!data) return;
      const box = mapBox();
      const whole = bounds(null);
      fitK.current = Math.min((box.w - 40) / (whole.x1 - whole.x0), (box.h - 40) / (whole.y1 - whole.y0));
      const { x0, x1, y0, y1 } = bounds(chapters);
      const k = Math.min((box.w - 40) / (x1 - x0), (box.h - 40) / (y1 - y0), fitK.current * 3.2);
      const to = { k, x: box.x + box.w / 2 - ((x0 + x1) / 2) * k, y: box.y + box.h / 2 - ((y0 + y1) / 2) * k };
      if (animate) animateTo(to);
      else cam.current = to;
      requestDraw();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, mapBox, animateTo, requestDraw]
  );

  // Re-frame the map whenever the view changes (or the screen / panel size changes)
  const first = useRef(true);
  useEffect(() => {
    if (!data) return;
    const animate = !first.current;
    first.current = false;
    fitTo(view.kind === 'home' ? null : focusInfo.lit.size ? [...focusInfo.lit] : null, animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, view, size, sheetFull]);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [view]);

  // ── moving between views ──
  const push = useCallback(
    (v: View) => {
      setViews((vs) => {
        // a new search replaces earlier searches rather than piling up
        const base = v.kind === 'search' ? vs.filter((x) => x.kind === 'home') : vs;
        return [...base, v].slice(-30);
      });
      onSelectKural(v.kind === 'kural' ? v.n : null);
      setHover(null);
    },
    [onSelectKural]
  );

  const back = () => {
    const next = views.length > 1 ? views.slice(0, -1) : views;
    const top = next[next.length - 1];
    setViews(next);
    onSelectKural(top.kind === 'kural' ? top.n : null);
    if (top.kind === 'search') setInput(top.q);
    if (top.kind === 'home') setInput('');
  };

  const goHome = () => {
    setViews([{ kind: 'home' }]);
    setInput('');
    onSelectKural(null);
  };

  const runSearch = (q: string, collapse = true) => {
    setInput(q);
    if (collapse) setSheetFull(false);
    const t = q.trim();
    if (!t) return goHome();
    if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10);
      if (n >= 1 && n <= 1330) return push({ kind: 'kural', n });
    }
    push({ kind: 'search', q: t });
  };

  // Typing searches after a short pause
  const typing = useRef(0);
  const onType = (q: string) => {
    setInput(q);
    window.clearTimeout(typing.current);
    typing.current = window.setTimeout(() => runSearch(q, false), 400);
  };

  const viewRef = useRef<View>(view);
  viewRef.current = view;
  useEffect(() => {
    const v = viewRef.current;
    if (focus?.n && !(v.kind === 'kural' && v.n === focus.n)) push({ kind: 'kural', n: focus.n });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  // ── drawing ──
  const toScreen = (x: number, y: number) => ({ x: x * cam.current.k + cam.current.x, y: y * cam.current.k + cam.current.y });

  const drawRef = useRef<() => void>(() => {});
  drawRef.current = () => {
    const cv = canvasRef.current;
    if (!cv || !data) return;
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== size.w * dpr || cv.height !== size.h * dpr) {
      cv.width = size.w * dpr;
      cv.height = size.h * dpr;
    }
    const g = cv.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = BG;
    g.fillRect(0, 0, size.w, size.h);

    const { lit, badge, center, links, active } = focusInfo;
    const rr = R * cam.current.k * 0.94;
    const font = (w: number, px: number, tamil = true) => `${w} ${px}px ${tamil ? '"Noto Sans Tamil", "Mukta Malar", ' : ''}Inter, sans-serif`;

    // lines from the chosen chapter to its connected chapters
    if (center) {
      const a = toScreen(data.a[center - 1][0], data.a[center - 1][1]);
      for (const l of links) {
        const b = toScreen(data.a[l.to - 1][0], data.a[l.to - 1][1]);
        g.strokeStyle = colorOf(l.to, 0.6);
        g.lineWidth = Math.min(7, 1.5 + l.w * 1.1);
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
      }
    }

    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (let i = 0; i < 133; i++) {
      const a = i + 1;
      const p = toScreen(data.a[i][0], data.a[i][1]);
      if (p.x < -rr || p.y < -rr || p.x > size.w + rr || p.y > size.h + rr) continue;
      const on = !active || lit.has(a);
      g.fillStyle = colorOf(a, on ? (active ? 0.95 : 0.8) : 0.13);
      g.beginPath();
      g.arc(p.x, p.y, rr, 0, Math.PI * 2);
      g.fill();
      if (a === center || hover?.a === a) {
        g.strokeStyle = '#fff';
        g.lineWidth = a === center ? 3 : 1.5;
        g.beginPath();
        g.arc(p.x, p.y, rr + 3, 0, Math.PI * 2);
        g.stroke();
      }

      // inside the circle: the chapter number, and its name when there is room
      g.fillStyle = on ? '#0D110F' : 'rgba(255,255,255,0.35)';
      if (rr >= 32) {
        const name = adh(a).name;
        let fs = Math.min(15, rr * 0.34);
        g.font = font(700, fs);
        while (g.measureText(name).width > rr * 1.8 && fs > 8) {
          fs -= 0.5;
          g.font = font(700, fs);
        }
        g.fillText(name, p.x, p.y + fs * 0.45);
        g.font = font(700, Math.max(9, fs * 0.8), false);
        g.fillText(String(a), p.x, p.y - fs * 0.85);
      } else if (rr >= 8) {
        g.font = font(700, Math.max(8, Math.min(13, rr * 0.6)), false);
        g.fillText(String(a), p.x, p.y + 0.5);
      }

      // how many matching or connected Kurals this chapter holds
      const b = badge.get(a);
      if (b && on) {
        const br = Math.max(8, Math.min(12, rr * 0.36));
        const bx = p.x + rr * 0.74;
        const by = p.y - rr * 0.74;
        g.fillStyle = '#F2C66D';
        g.beginPath();
        g.arc(bx, by, br, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#1B1A16';
        g.font = font(800, br * 1.1, false);
        g.fillText(String(b), bx, by + 0.5);
      }
    }

  };

  useEffect(() => {
    requestDraw();
  }, [requestDraw, focusInfo, size, data, hover]);

  // ── pointer: drag to move, pinch / wheel to zoom, tap a circle to open the chapter ──
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(0);
  const pinch = useRef<{ d: number; k: number } | null>(null);

  const zoomAt = (sx: number, sy: number, factor: number) => {
    const c = cam.current;
    const k = Math.min(fitK.current * 8, Math.max(fitK.current * 0.6, c.k * factor));
    const f = k / c.k;
    cam.current = { k, x: sx - (sx - c.x) * f, y: sy - (sy - c.y) * f };
    requestDraw();
  };

  const chapterAt = (sx: number, sy: number) => {
    if (!data) return null;
    const rr = R * cam.current.k;
    for (let i = 0; i < 133; i++) {
      const p = toScreen(data.a[i][0], data.a[i][1]);
      if ((p.x - sx) ** 2 + (p.y - sy) ** 2 <= rr * rr) return i + 1;
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = 0;
    cancelAnimationFrame(anim.current);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), k: cam.current.k };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) {
      if (e.pointerType === 'mouse') {
        const a = chapterAt(e.clientX, e.clientY);
        setHover((h) => (a ? { a, x: e.clientX, y: e.clientY } : h ? null : h));
      }
      return;
    }
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const target = pinch.current.k * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.d);
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, target / cam.current.k);
      moved.current += 10;
      return;
    }
    moved.current += Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y);
    cam.current = { ...cam.current, x: cam.current.x + cur.x - prev.x, y: cam.current.y + cur.y - prev.y };
    requestDraw();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (moved.current < 8 && pointers.current.size === 0) {
      const a = chapterAt(e.clientX, e.clientY);
      if (a) push({ kind: 'adhikaram', a });
    }
  };

  const zoomButton = (f: number) => {
    const b = mapBox();
    zoomAt(b.x + b.w / 2, b.y + b.h / 2, f);
  };

  // ── panel pieces ──
  const KuralRow = ({ n, showChapter = true }: { n: number; showChapter?: boolean }) => {
    const s = getKuralByNumber(n);
    return (
      <button onClick={() => push({ kind: 'kural', n })} className="w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.06] cursor-pointer">
        <span className="shrink-0 mt-0.5 min-w-[40px] rounded-md bg-white/[0.07] px-1.5 py-0.5 text-center text-[12px] font-semibold text-[#F2C66D]">{n}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-tamil-sans text-[15px] leading-snug text-[#EEE8DC]">
            {s.line1}
            <br />
            {s.line2}
          </span>
          {(showChapter || s.media?.youtubeUrl) && (
            <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] text-[#8E9C94]">
              {showChapter && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: colorOf(s.athikaramNumber) }} />
                  {s.athikaramTamil}
                </span>
              )}
              {s.media?.youtubeUrl && (
                <span className="inline-flex items-center gap-0.5 text-[#F2C66D]">
                  <PlayCircle className="w-3 h-3" /> பாடல்
                </span>
              )}
            </span>
          )}
        </span>
      </button>
    );
  };

  const ChapterChip = ({ a, count }: { a: number; count?: number }) => (
    <button onClick={() => push({ kind: 'adhikaram', a })} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] pl-2 pr-3 py-1 text-[13px] text-[#EEE8DC] cursor-pointer hover:bg-white/[0.09]">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: colorOf(a) }} />
      <span className="font-tamil-sans">{adh(a).name}</span>
      {count !== undefined && <span className="text-[#F2C66D] font-semibold">{count}</span>}
    </button>
  );

  const heading = (text: string) => <div className="px-3 pt-5 pb-1.5 text-[12.5px] font-semibold tracking-wide text-[#7FB39A] font-tamil-sans">{text}</div>;

  let body: React.ReactNode = null;

  if (view.kind === 'home') {
    body = (
      <div className="px-3 pb-6">
        <p className="px-3 pt-1 font-tamil-sans text-[15px] leading-relaxed text-[#C9C3B6]">
          ஒவ்வொரு வட்டமும் ஒரு அதிகாரம் — மொத்தம் 133. பொருள் ஒத்த அதிகாரங்கள் அருகருகே இருக்கும்.
        </p>
        <div className="px-3 pt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-[#C9C3B6]">
          {(Object.keys(PAAL_COLORS) as (keyof typeof PAAL_COLORS)[]).map((p) => (
            <span key={p} className="inline-flex items-center gap-1.5 font-tamil-sans">
              <span className="w-3 h-3 rounded-full" style={{ background: PAAL_COLORS[p] }} /> {p}
            </span>
          ))}
        </div>
        {heading('ஒரு சொல்லைத் தேடிப் பாருங்கள்')}
        <div className="px-3 flex flex-wrap gap-2">
          {EXAMPLES.map((w) => (
            <button key={w} onClick={() => runSearch(w)} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-tamil-sans text-[14px] text-[#EEE8DC] cursor-pointer hover:bg-white/[0.09]">
              {w}
            </button>
          ))}
        </div>
        <p className="px-3 pt-4 text-[13px] text-white/45 font-tamil-sans">அல்லது வரைபடத்தில் ஒரு வட்டத்தைத் தொடுங்கள்.</p>
      </div>
    );
  } else if (view.kind === 'search' && searchHits) {
    const chapters = [...focusInfo.badge.entries()].sort((x, y) => y[1] - x[1]);
    body = (
      <div className="px-2 pb-6">
        <div className="px-3 pt-1 text-[14px] text-[#C9C3B6] font-tamil-sans">
          {searchHits.length ? (
            <>
              <b className="text-white">“{view.q}”</b> — {searchHits.length} குறள்கள், {chapters.length} அதிகாரங்களில்
            </>
          ) : (
            <>“{view.q}” — பொருத்தம் இல்லை. வேறு சொல்லைத் தேடுங்கள்.</>
          )}
        </div>
        {chapters.length > 1 && (
          <div className="px-3 pt-3 flex flex-wrap gap-1.5">
            {chapters.slice(0, 12).map(([a, c]) => (
              <ChapterChip key={a} a={a} count={c} />
            ))}
            {chapters.length > 12 && <span className="self-center text-[12px] text-white/45">+{chapters.length - 12}</span>}
          </div>
        )}
        {searchHits.length > 0 && heading('குறள்கள்')}
        {searchHits.slice(0, 300).map((k) => (
          <KuralRow key={k.number} n={k.number} />
        ))}
        {searchHits.length > 300 && <p className="px-3 py-2 text-[12px] text-white/45 font-tamil-sans">முதல் 300 குறள்கள் மட்டும் — சொல்லைக் குறுக்கித் தேடுங்கள்.</p>}
      </div>
    );
  } else if (view.kind === 'adhikaram' && data) {
    const a = adh(view.a);
    body = (
      <div className="px-2 pb-6">
        <div className="px-3 pt-1">
          <div className="text-[13px] font-semibold font-tamil-sans" style={{ color: colorOf(view.a) }}>
            அதிகாரம் {a.number} · {a.paal} · {a.iyal}
          </div>
          <div className="font-tamil-sans text-[24px] font-bold text-[#F4EFE4]">{a.name}</div>
          <div className="text-[13px] text-white/55">{a.nameEn}</div>
        </div>
        {heading('பொருள் ஒத்த அதிகாரங்கள்')}
        <div className="px-3 flex flex-wrap gap-1.5">
          {data.a[view.a - 1][2].map((x) => (
            <ChapterChip key={x} a={x} />
          ))}
        </div>
        {heading('இந்த அதிகாரத்தின் குறள்கள்')}
        {Array.from({ length: 10 }, (_, i) => a.startKural + i).map((n) => (
          <KuralRow key={n} n={n} showChapter={false} />
        ))}
      </div>
    );
  } else if (view.kind === 'kural' && data) {
    const k = getKuralByNumber(view.n);
    const hasSong = !!(k.media?.youtubeUrl && getYouTubeThumbnail(k.media.youtubeUrl));
    const groups = connectionsFor(data.k[view.n - 1], k.athikaramNumber);
    const others = groups.filter((g) => !g.own);
    body = (
      <div className="px-2 pb-6">
        <div className="px-3 pt-1">
          <button onClick={() => push({ kind: 'adhikaram', a: k.athikaramNumber })} className="text-[13px] font-semibold font-tamil-sans cursor-pointer hover:underline" style={{ color: colorOf(k.athikaramNumber) }}>
            குறள் {k.number} · {k.athikaramTamil}
          </button>
          <p className="mt-2 font-tamil-sans text-[20px] leading-relaxed font-bold text-[#F4EFE4]">
            {k.line1}
            <br />
            {k.line2}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[#DCD6C8]">{k.commentaries.karunanidhi}</p>
          {k.commentaries.englishExplanation && <p className="mt-2 text-[14px] leading-relaxed text-[#A9B6AF]">{k.commentaries.englishExplanation}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {hasSong && (
              <button onClick={() => onOpenVideo(k)} className="inline-flex items-center gap-2 rounded-xl bg-[#F2C66D] text-[#1B1A16] px-3.5 py-2 text-sm font-semibold cursor-pointer hover:brightness-105">
                <PlayCircle className="w-4 h-4" /> இசையில் கேளுங்கள்
              </button>
            )}
            <button onClick={() => onOpenDetail(k)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 text-white px-3.5 py-2 text-sm cursor-pointer hover:bg-white/10">
              <BookOpen className="w-4 h-4" /> அனைத்து உரைகளும்
            </button>
          </div>
        </div>

        <div className="mx-3 mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="font-tamil-sans text-[15px] text-[#EEE8DC]">
            இக்குறள் <b className="text-[#F2C66D]">{others.length}</b> பிற அதிகாரங்களோடு பொருளால் இணைகிறது
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {others.map((g) => (
              <ChapterChip key={g.a} a={g.a} count={g.list.length} />
            ))}
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.a}>
            <button onClick={() => push({ kind: 'adhikaram', a: g.a })} className="w-full flex items-center gap-2 px-3 pt-5 pb-1.5 text-left cursor-pointer group">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: colorOf(g.a) }} />
              <span className="font-tamil-sans text-[14px] font-bold text-[#EEE8DC] group-hover:underline">{g.own ? 'இதே அதிகாரத்தில்' : adh(g.a).name}</span>
              <span className="text-[12px] text-white/45 font-tamil-sans">
                {g.own ? adh(g.a).name : `அதிகாரம் ${g.a}`} · {g.list.length}
              </span>
            </button>
            {g.list.map((n) => (
              <KuralRow key={n} n={n} showChapter={false} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const panel = (
    <>
      <div className="px-4 pt-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          {views.length > 1 ? (
            <button onClick={back} aria-label="பின்செல்" className="shrink-0 w-10 h-10 rounded-xl border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-white/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={onExit} aria-label="முகப்பு" className="shrink-0 w-10 h-10 rounded-xl border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              value={input}
              onChange={(e) => onType(e.target.value)}
              onFocus={() => !isWide && setSheetFull(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.clearTimeout(typing.current);
                  runSearch(input);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="சொல் அல்லது குறள் எண் (எ.கா. மலர்)"
              className="w-full h-10 rounded-xl bg-[#0D110F] border border-white/10 pl-9 pr-9 text-[15px] text-white placeholder:text-white/40 outline-none focus:border-[#7FB39A]"
            />
            {input && (
              <button onClick={goHome} aria-label="அழி" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {view.kind === 'home' && <div className="pt-3 px-1 font-tamil-sans text-[19px] font-bold text-[#F4EFE4]">குறள் வரைபடம்</div>}
      </div>
      <div ref={panelRef} className="flex-1 overflow-y-auto">
        {body}
      </div>
    </>
  );

  const box = mapBox();

  return (
    <div className="fixed inset-0 z-40 select-none" style={{ background: BG }}>
      <canvas
        ref={canvasRef}
        style={{ width: size.w, height: size.h, touchAction: 'none', cursor: hover ? 'pointer' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setHover(null)}
        onWheel={(e) => zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015))}
      />

      {!data && (
        <div className="absolute flex items-center justify-center text-[#A9BDB2] font-tamil-sans" style={{ left: box.x, top: box.y, width: box.w, height: box.h }}>
          {error ? 'வரைபடத்தை ஏற்ற முடியவில்லை' : 'ஏற்றப்படுகிறது…'}
        </div>
      )}

      {/* panel: left side on big screens, bottom part on phones */}
      {isWide ? (
        <aside className="absolute left-0 top-0 bottom-0 flex flex-col border-r border-white/10" style={{ width: PANEL_W, background: PANEL }}>
          {panel}
        </aside>
      ) : (
        <aside
          className="absolute left-0 right-0 bottom-0 flex flex-col rounded-t-2xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.45)] transition-[height] duration-300"
          style={{ height: sheetFull ? '86vh' : '46vh', background: PANEL }}
        >
          <button onClick={() => setSheetFull((v) => !v)} aria-label={sheetFull ? 'சுருக்கு' : 'விரி'} className="w-full flex justify-center pt-2 pb-0.5 cursor-pointer">
            <span className="w-12 h-1.5 rounded-full bg-white/30" />
          </button>
          {panel}
        </aside>
      )}

      {/* zoom buttons */}
      {data && box.h > 160 && (
        <div className="absolute flex flex-col gap-1.5" style={{ right: 12, top: box.y + box.h - 100 }}>
          <button onClick={() => zoomButton(1.5)} aria-label="பெரிதாக்கு" className="w-10 h-10 rounded-xl bg-[#151A17] border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-[#1D2420]">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={() => zoomButton(1 / 1.5)} aria-label="சிறிதாக்கு" className="w-10 h-10 rounded-xl bg-[#151A17] border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-[#1D2420]">
            <Minus className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* chapter name on hover (mouse) */}
      {hover && (
        <div className="pointer-events-none absolute z-10 rounded-lg bg-[#151A17] border border-white/10 px-3 py-1.5 shadow-xl" style={{ left: Math.min(hover.x + 14, size.w - 240), top: hover.y + 14 }}>
          <div className="font-tamil-sans text-[14px] font-bold text-white">
            {hover.a}. {adh(hover.a).name}
          </div>
          <div className="text-[11.5px] text-white/55">
            {adh(hover.a).nameEn}
            {focusInfo.badge.get(hover.a) ? ` · ${focusInfo.badge.get(hover.a)} குறள்கள்` : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default KuralMap;
