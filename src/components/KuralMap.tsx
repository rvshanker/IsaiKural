import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ALL_KURALS, getKuralByNumber } from '../data/kurals';
import { kuralMatchesSearch, normalizeForSearch } from '../utils/search';
import { getYouTubeThumbnail } from '../utils/youtube';
import { useMapData, topicColor, similarReason } from '../utils/kuralMapData';
import { Kural, Paal } from '../types/kural';
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Dices,
  List,
  Map as MapIcon,
  Minus,
  PlayCircle,
  Plus,
  Search,
  Tag,
  Tags,
  X,
} from 'lucide-react';

interface KuralMapProps {
  initialKural?: number;
  /** a new object each time the page is asked to show a Kural (e.g. from "see on the map") */
  focus?: { n?: number };
  onExit: () => void;
  onSelectKural: (n: number | null) => void;
  onOpenDetail: (k: Kural) => void;
  onOpenVideo: (k: Kural) => void;
}

const PAALS: { key: Paal; label: string }[] = [
  { key: 'அறத்துப்பால்', label: 'அறம்' },
  { key: 'பொருட்பால்', label: 'பொருள்' },
  { key: 'காமத்துப்பால்', label: 'இன்பம்' },
];

const BG = '#0B0F0D';
const PANEL = '#121714';
const HINT_KEY = 'kural_map_hint_seen';

type Cam = { x: number; y: number; k: number };

export const KuralMap: React.FC<KuralMapProps> = ({ initialKural, focus, onExit, onSelectKural, onOpenDetail, onOpenVideo }) => {
  const { data, error } = useMapData();
  const [selected, setSelected] = useState<number | null>(initialKural ?? null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [paals, setPaals] = useState<Set<Paal>>(new Set(PAALS.map((p) => p.key)));
  const [videoOnly, setVideoOnly] = useState(false);
  const [topic, setTopic] = useState<number | null>(null);
  const [listView, setListView] = useState(false);
  const [sheetFull, setSheetFull] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [hover, setHover] = useState<{ n: number; x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [showHint, setShowHint] = useState(() => {
    try {
      return !initialKural && !localStorage.getItem(HINT_KEY);
    } catch {
      return !initialKural;
    }
  });

  // Kurals visited in this session, for the back / forward arrows
  const [hist, setHist] = useState<{ list: number[]; i: number }>({ list: initialKural ? [initialKural] : [], i: initialKural ? 0 : -1 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cam = useRef<Cam>({ x: 0, y: 0, k: 1 });
  const fitK = useRef(1);
  const raf = useRef(0);
  const anim = useRef(0);

  const isWide = size.w >= 1024;
  const panelOpen = selected !== null || topic !== null;

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // The map takes over the screen: no page scrolling underneath
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      /* private browsing: the hint simply shows again next time */
    }
  };

  // ── filters and search ──
  const searchMatches = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    return new Set(ALL_KURALS.filter((k) => kuralMatchesSearch(k, q)).map((k) => k.number));
  }, [query]);

  const visible = useMemo(() => {
    const v = new Uint8Array(1331);
    for (const k of ALL_KURALS) {
      if (!paals.has(k.paal)) continue;
      if (videoOnly && !k.media?.youtubeUrl) continue;
      v[k.number] = 1;
    }
    return v;
  }, [paals, videoOnly]);

  const visibleCount = useMemo(() => visible.reduce((a, b) => a + b, 0), [visible]);

  // Topics, biggest first; each with how many of its Kurals pass the filters
  const topics = useMemo(() => {
    if (!data) return [];
    const counts = new Array(data.labels.length).fill(0);
    data.k.forEach((p, i) => {
      if (visible[i + 1]) counts[p[2]]++;
    });
    return data.labels.map((l, i) => ({ ...l, i, count: counts[i] })).sort((a, b) => b.n - a.n);
  }, [data, visible]);

  // Label rank by size: only the biggest topics show when zoomed out
  const labelRank = useMemo(() => {
    const r = new Map<number, number>();
    if (!data) return r;
    data.labels
      .map((l, i) => i)
      .sort((a, b) => data.labels[b].core - data.labels[a].core)
      .forEach((i, rank) => r.set(i, rank));
    return r;
  }, [data]);

  const topicMatches = useMemo(() => {
    const q = normalizeForSearch(query);
    if (!q) return [];
    const qs = q.replace(/்/g, '');
    return topics.filter((t) => normalizeForSearch(`${t.ta} ${t.en}`).replace(/்/g, '').includes(qs)).slice(0, 4);
  }, [topics, query]);

  const results = useMemo(() => {
    if (!searchMatches) return [];
    return ALL_KURALS.filter((k) => searchMatches.has(k.number) && visible[k.number]).slice(0, 30);
  }, [searchMatches, visible]);

  const topicKurals = useMemo(() => {
    if (!data || topic === null) return [];
    return data.k.map((p, i) => (p[2] === topic && visible[i + 1] ? i + 1 : 0)).filter(Boolean);
  }, [data, topic, visible]);

  const similar = useMemo(() => (data && selected ? data.k[selected - 1][3] : []), [data, selected]);

  // ── camera ──
  const viewCenter = useCallback(() => {
    if (size.w >= 1024) {
      const l = 380;
      const r = selected ? 320 : 0;
      return { cx: l + (size.w - l - r) / 2, cy: size.h / 2 };
    }
    return { cx: size.w / 2, cy: size.h * 0.34 };
  }, [size, selected]);

  const toScreen = (x: number, y: number) => ({ x: x * cam.current.k + cam.current.x, y: y * cam.current.k + cam.current.y });

  const requestDraw = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => drawRef.current());
  }, []);

  const flyTo = useCallback(
    (wx: number, wy: number, k: number) => {
      const { cx, cy } = viewCenter();
      const from = { ...cam.current };
      const to = { k, x: cx - wx * k, y: cy - wy * k };
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
    },
    [viewCenter]
  );

  const fitted = useRef(false);
  useEffect(() => {
    if (!data) return;
    const k = Math.min(size.w / 1060, (size.h - (size.w >= 1024 ? 40 : 190)) / 1060);
    fitK.current = k;
    if (!fitted.current) {
      fitted.current = true;
      cam.current = { k, x: size.w / 2 - 500 * k, y: (size.w >= 1024 ? size.h / 2 : size.h / 2 + 60) - 500 * k };
      if (selected) {
        const [x, y] = data.k[selected - 1];
        const { cx, cy } = viewCenter();
        cam.current = { k: k * 2.4, x: cx - x * k * 2.4, y: cy - y * k * 2.4 };
      }
    }
    requestDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, size]);

  const showKural = useCallback(
    (n: number | null, opts: { fly?: boolean; fromHistory?: boolean } = {}) => {
      const { fly = true, fromHistory = false } = opts;
      setSelected(n);
      onSelectKural(n);
      setSearchOpen(false);
      setHover(null);
      setListView(false);
      setSheetFull(false);
      if (n && !fromHistory) {
        setHist((h) => {
          const list = [...h.list.slice(0, h.i + 1), n].slice(-50);
          return { list, i: list.length - 1 };
        });
      }
      if (n && data && fly) {
        const [x, y] = data.k[n - 1];
        setTimeout(() => flyTo(x, y, Math.max(cam.current.k, fitK.current * 2.4)), 0);
      }
    },
    [data, flyTo, onSelectKural]
  );

  // asked from outside (e.g. "see on the map" in a Kural's window) to show a Kural
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  useEffect(() => {
    if (focus?.n && data && focus.n !== selectedRef.current) {
      setTopic(null);
      showKural(focus.n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  const goHistory = (d: number) => {
    const i = hist.i + d;
    if (i < 0 || i >= hist.list.length) return;
    setHist({ ...hist, i });
    showKural(hist.list[i], { fromHistory: true });
  };

  const pickTopic = (i: number | null) => {
    setTopic(i);
    setQuery('');
    setSearchOpen(false);
    setListView(false);
    setSheetFull(false);
    if (selected) {
      setSelected(null);
      onSelectKural(null);
    }
    if (i !== null && data) {
      const l = data.labels[i];
      setTimeout(() => flyTo(l.x, l.y, fitK.current * 2.6), 0);
    }
  };

  const surprise = () => {
    const pool = ALL_KURALS.filter((k) => visible[k.number]);
    const k = pool[Math.floor(Math.random() * pool.length)];
    dismissHint();
    setTopic(null);
    showKural(k.number);
  };

  // ── drawing ──
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

    const zoom = cam.current.k / fitK.current;
    const r = Math.max(2.8, Math.min(7.5, 2.8 * Math.sqrt(zoom)));
    const simSet = new Set(similar);
    const focus = selected !== null || searchMatches !== null || topic !== null;
    const isLit = (n: number, c: number) => {
      if (selected !== null) return n === selected || simSet.has(n);
      if (searchMatches) return searchMatches.has(n);
      if (topic !== null) return c === topic;
      return true;
    };

    if (selected) {
      const a = toScreen(data.k[selected - 1][0], data.k[selected - 1][1]);
      g.lineWidth = 1.2;
      for (const s of similar) {
        if (!visible[s]) continue;
        const b = toScreen(data.k[s - 1][0], data.k[s - 1][1]);
        g.strokeStyle = topicColor(data.k[s - 1][2], 0.45);
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
      }
    }

    for (const pass of [0, 1]) {
      for (let i = 0; i < data.k.length; i++) {
        const n = i + 1;
        if (!visible[n]) continue;
        const [x, y, c] = data.k[i];
        const lit = !focus || isLit(n, c);
        if (!focus && pass === 1) continue;
        if (focus && (pass === 1) !== lit) continue;
        const p = toScreen(x, y);
        if (p.x < -10 || p.y < -10 || p.x > size.w + 10 || p.y > size.h + 10) continue;
        const rr = focus && lit ? r * 1.35 : r;
        g.fillStyle = topicColor(c, focus && !lit ? 0.13 : 0.9);
        g.beginPath();
        g.arc(p.x, p.y, rr, 0, Math.PI * 2);
        g.fill();
        if ((!focus || lit) && zoom > 1.6 && getKuralByNumber(n).media?.youtubeUrl) {
          g.strokeStyle = 'rgba(227,184,102,0.95)';
          g.lineWidth = 1.4;
          g.beginPath();
          g.arc(p.x, p.y, rr + 2.2, 0, Math.PI * 2);
          g.stroke();
        }
      }
    }

    // topic names: the biggest topics when zoomed out, more as you zoom in
    if (showLabels) {
      const maxRank = zoom < 1.35 ? 12 : zoom < 2.2 ? 24 : 99;
      const boxes: [number, number, number, number][] = [];
      const order = data.labels.map((_, i) => i).sort((a, b) => (labelRank.get(a) ?? 0) - (labelRank.get(b) ?? 0));
      for (const i of order) {
        if ((labelRank.get(i) ?? 0) >= maxRank && i !== topic) continue;
        const l = data.labels[i];
        const c0 = toScreen(l.x, l.y);
        const p = { x: c0.x, y: c0.y - 10 - r * 2 };
        if (p.x < 0 || p.y < 0 || p.x > size.w || p.y > size.h) continue;
        const fs = Math.round((size.w < 600 ? 0.85 : 1) * Math.min(21, Math.max(13, 11 + Math.sqrt(l.core) * 0.95)) * Math.min(1.2, Math.max(1, Math.sqrt(zoom) * 0.8)));
        g.font = `700 ${fs}px "Noto Sans Tamil", "Mukta Malar", sans-serif`;
        const w = g.measureText(l.ta).width;
        const showEn = zoom > 1.7;
        const box: [number, number, number, number] = [p.x - w / 2 - 6, p.y - fs, p.x + w / 2 + 6, p.y + (showEn ? 16 : 5)];
        if (boxes.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
        boxes.push(box);
        const dim = selected !== null || searchMatches !== null || (topic !== null && topic !== i);
        g.textAlign = 'center';
        g.lineWidth = 4;
        g.strokeStyle = 'rgba(11,15,13,0.85)';
        g.strokeText(l.ta, p.x, p.y);
        g.fillStyle = dim ? 'rgba(244,239,228,0.38)' : '#F4EFE4';
        g.fillText(l.ta, p.x, p.y);
        if (showEn) {
          g.font = `500 11px Inter, sans-serif`;
          g.strokeText(l.en, p.x, p.y + 14);
          g.fillStyle = dim ? 'rgba(244,239,228,0.25)' : 'rgba(244,239,228,0.7)';
          g.fillText(l.en, p.x, p.y + 14);
        }
      }
    }

    if (selected) {
      const [x, y, c] = data.k[selected - 1];
      const p = toScreen(x, y);
      g.fillStyle = topicColor(c, 1);
      g.beginPath();
      g.arc(p.x, p.y, r * 2, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#fff';
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(p.x, p.y, r * 2 + 3.5, 0, Math.PI * 2);
      g.stroke();
    }
  };

  useEffect(() => {
    requestDraw();
  }, [requestDraw, selected, searchMatches, visible, topic, showLabels, size, data]);

  // ── pointer: drag to pan, pinch / wheel to zoom, tap to pick ──
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(0);
  const pinch = useRef<{ d: number; k: number } | null>(null);

  const zoomAt = (sx: number, sy: number, factor: number) => {
    const c = cam.current;
    const k = Math.min(fitK.current * 14, Math.max(fitK.current * 0.6, c.k * factor));
    const f = k / c.k;
    cam.current = { k, x: sx - (sx - c.x) * f, y: sy - (sy - c.y) * f };
    requestDraw();
  };

  const nearest = (sx: number, sy: number, reach: number) => {
    if (!data) return null;
    let best: number | null = null;
    let bd = reach * reach;
    for (let i = 0; i < data.k.length; i++) {
      if (!visible[i + 1]) continue;
      const p = toScreen(data.k[i][0], data.k[i][1]);
      const d = (p.x - sx) ** 2 + (p.y - sy) ** 2;
      if (d < bd) {
        bd = d;
        best = i + 1;
      }
    }
    return best;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = 0;
    cancelAnimationFrame(anim.current);
    if (showHint) dismissHint();
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), k: cam.current.k };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) {
      if (e.pointerType === 'mouse') {
        const n = nearest(e.clientX, e.clientY, 12);
        setHover(n ? { n, x: e.clientX, y: e.clientY } : null);
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
    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    cam.current = { ...cam.current, x: cam.current.x + dx, y: cam.current.y + dy };
    setHover(null);
    requestDraw();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (moved.current < 8 && pointers.current.size === 0) {
      // fingers are bigger than a mouse pointer, so a tap reaches further
      const n = nearest(e.clientX, e.clientY, e.pointerType === 'touch' ? 24 : 12);
      if (n) showKural(n);
      else if (selected) showKural(null, { fly: false });
    }
  };

  const zoomButton = (f: number) => {
    const { cx, cy } = viewCenter();
    zoomAt(cx, cy, f);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'l' || e.key === 'L') setShowLabels((v) => !v);
      if (e.key === 'Escape') showKural(null, { fly: false });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showKural]);

  const togglePaal = (p: Paal) =>
    setPaals((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next.size ? next : new Set(PAALS.map((x) => x.key));
    });

  const kural = selected ? getKuralByNumber(selected) : null;
  const kTopicIdx = data && selected ? data.k[selected - 1][2] : null;

  // ── pieces of the panels ──
  const KuralRow: React.FC<{ n: number; reason?: string }> = ({ n, reason }) => {
    const s = getKuralByNumber(n);
    return (
      <button onClick={() => showKural(n)} className="w-full flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left hover:bg-white/[0.06] cursor-pointer">
        <span className="mt-2 w-2 h-2 rounded-full shrink-0" style={{ background: data ? topicColor(data.k[n - 1][2]) : '#888' }} />
        <span className="min-w-0 flex-1">
          <span className="block font-tamil-sans text-[14.5px] leading-snug text-[#EEE8DC]">
            {s.line1}
            <br />
            {s.line2}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-[#8E9C94]">
            <span className="text-[#E3B866]">{n}</span>
            <span>· {s.athikaramTamil}</span>
            {reason && <span className="text-[#7FB39A]">· {reason}</span>}
            {s.media?.youtubeUrl && (
              <span className="inline-flex items-center gap-0.5 text-[#E3B866]">
                · <PlayCircle className="w-3 h-3" /> பாடல்
              </span>
            )}
          </span>
        </span>
      </button>
    );
  };

  const thumb = kural?.media?.youtubeUrl ? getYouTubeThumbnail(kural.media.youtubeUrl) : null;

  const detail = kural && (
    <div className="p-5">
      <div className="flex items-center justify-between gap-2 -mt-1 mb-3">
        <div className="flex items-center gap-1">
          <button onClick={() => goHistory(-1)} disabled={hist.i <= 0} aria-label="முந்தைய குறள்" className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 disabled:opacity-25 cursor-pointer disabled:cursor-default">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => goHistory(1)} disabled={hist.i >= hist.list.length - 1} aria-label="அடுத்த குறள்" className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 disabled:opacity-25 cursor-pointer disabled:cursor-default">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button onClick={() => showKural(null, { fly: false })} aria-label="மூடு" className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {thumb && (
        <button onClick={() => onOpenVideo(kural)} className="relative block w-full aspect-video rounded-xl overflow-hidden mb-4 cursor-pointer group">
          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
          <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E3B866] text-[#1B1A16] px-4 py-2 text-sm font-semibold">
              <PlayCircle className="w-5 h-5" /> இசையில் கேளுங்கள்
            </span>
          </span>
        </button>
      )}

      <div className="text-[#E3B866] text-sm font-semibold">குறள் {kural.number}</div>
      <a href={`#/adhikaram/${kural.athikaramNumber}`} className="block text-[13px] text-[#A9BDB2] hover:text-white">
        {kural.athikaramNumber}. {kural.athikaramTamil} · {kural.athikaramEnglish}
      </a>
      <p className="mt-3 font-tamil-sans text-[19px] leading-relaxed font-bold text-[#F4EFE4]">
        {kural.line1}
        <br />
        {kural.line2}
      </p>
      {kTopicIdx !== null && data && (
        <button
          onClick={() => pickTopic(kTopicIdx)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs cursor-pointer"
          style={{ background: topicColor(kTopicIdx, 0.18), color: topicColor(kTopicIdx) }}
        >
          <Tag className="w-3 h-3" /> {data.labels[kTopicIdx].ta} · {data.labels[kTopicIdx].en}
        </button>
      )}
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed">
        <p className="text-[#DCD6C8]">
          <span className="block text-[11px] uppercase tracking-wider text-[#7FB39A] mb-0.5">கலைஞர் உரை</span>
          {kural.commentaries.karunanidhi}
        </p>
        {kural.commentaries.englishExplanation && (
          <p className="text-[#B9C4BE] text-[14px]">
            <span className="block text-[11px] uppercase tracking-wider text-[#7FB39A] mb-0.5">English</span>
            {kural.commentaries.englishExplanation}
          </p>
        )}
      </div>
      <button onClick={() => onOpenDetail(kural)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 text-white px-3.5 py-2 text-sm cursor-pointer hover:bg-white/10">
        <BookOpen className="w-4 h-4" /> அனைத்து உரைகளும்
      </button>
    </div>
  );

  const similarList = data && kural && (
    <div className="p-3">
      <div className="px-2.5 pt-1 pb-1.5 text-[12px] font-semibold text-[#7FB39A]">இதைப் போன்ற குறள்கள்</div>
      {similar
        .filter((n) => visible[n])
        .map((n) => (
          <KuralRow key={n} n={n} reason={similarReason(data, kural.number, n, getKuralByNumber(n).athikaramNumber === kural.athikaramNumber)} />
        ))}
    </div>
  );

  const topicPanel = data && topic !== null && !kural && (
    <div className="p-3">
      <div className="flex items-start justify-between gap-2 px-2.5 pt-2 pb-2">
        <div>
          <div className="font-tamil-sans text-[20px] font-bold" style={{ color: topicColor(topic) }}>
            {data.labels[topic].ta}
          </div>
          <div className="text-[12.5px] text-white/55">
            {data.labels[topic].en} · {topicKurals.length} குறள்கள்
          </div>
        </div>
        <button onClick={() => pickTopic(null)} aria-label="மூடு" className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>
      {topicKurals.map((n) => (
        <KuralRow key={n} n={n} />
      ))}
    </div>
  );

  const topicCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {topics
        .filter((t) => t.count > 0)
        .map((t) => (
          <button
            key={t.i}
            onClick={() => pickTopic(t.i)}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left hover:bg-white/[0.07] cursor-pointer"
          >
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: topicColor(t.i) }} />
            <span className="min-w-0 flex-1">
              <span className="block font-tamil-sans text-[16px] font-bold text-[#F4EFE4]">{t.ta}</span>
              <span className="block text-[12px] text-white/50">{t.en}</span>
            </span>
            <span className="text-[13px] text-[#E3B866]">{t.count}</span>
          </button>
        ))}
    </div>
  );

  const sidePanel = kural ? detail : topicPanel;

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
        <div className="absolute inset-0 flex items-center justify-center text-[#A9BDB2] font-tamil-sans">
          {error ? 'வரைபடத்தை ஏற்ற முடியவில்லை' : 'குறள் வரைபடம் ஏற்றப்படுகிறது…'}
        </div>
      )}

      {/* side panels on big screens */}
      {isWide && sidePanel && (
        <aside className="absolute left-0 top-0 bottom-0 w-[380px] overflow-y-auto border-r border-white/10 pt-[150px]" style={{ background: PANEL }}>
          {sidePanel}
        </aside>
      )}
      {isWide && kural && (
        <aside className="absolute right-0 top-0 bottom-0 w-[320px] overflow-y-auto border-l border-white/10" style={{ background: PANEL }}>
          {similarList}
        </aside>
      )}

      {/* top-left: back, search, surprise, view switch, filters, topics */}
      <div className="absolute top-3 left-3 right-3 lg:right-auto lg:w-[356px] space-y-2 z-10">
        <div className="flex gap-2">
          <button onClick={onExit} aria-label="முகப்பு" className="shrink-0 w-11 h-11 rounded-xl bg-[#151A17] border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-[#1D2420]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
                setTopic(null);
                dismissHint();
                if (selected) showKural(null, { fly: false });
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) showKural(results[0].number);
              }}
              placeholder="குறள், சொல், தலைப்பு, எண்…"
              className="w-full h-11 rounded-xl bg-[#151A17] border border-white/10 pl-9 pr-9 text-[15px] text-white placeholder:text-white/40 outline-none focus:border-[#7FB39A]"
            />
            {query && (
              <button onClick={() => { setQuery(''); setSearchOpen(false); }} aria-label="அழி" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
            {searchOpen && query.trim() && (topicMatches.length > 0 || results.length > 0) && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] max-h-[60vh] overflow-y-auto rounded-xl bg-[#151A17] border border-white/10 shadow-2xl py-1 z-20">
                {topicMatches.map((t) => (
                  <button key={`t${t.i}`} onClick={() => pickTopic(t.i)} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.06] cursor-pointer">
                    <Tags className="w-4 h-4 shrink-0" style={{ color: topicColor(t.i) }} />
                    <span className="font-tamil-sans text-[14px] text-white">{t.ta}</span>
                    <span className="text-xs text-white/50 truncate">{t.en} · {t.count}</span>
                  </button>
                ))}
                {results.map((k) => (
                  <button key={k.number} onClick={() => showKural(k.number)} className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-white/[0.06] cursor-pointer">
                    <span className="shrink-0 mt-0.5 rounded bg-white/10 px-1.5 text-[11px] text-[#E3B866] font-semibold">{k.number}</span>
                    <span className="min-w-0">
                      <span className="block font-tamil-sans text-[14px] text-[#EEE8DC] truncate">{k.line1}</span>
                      <span className="block text-[11.5px] text-white/45 truncate">{k.athikaramTamil}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={surprise} aria-label="ஏதேனும் ஒரு குறள்" title="ஏதேனும் ஒரு குறள்" className="shrink-0 w-11 h-11 rounded-xl bg-[#151A17] border border-white/10 text-[#E3B866] flex items-center justify-center cursor-pointer hover:bg-[#1D2420]">
            <Dices className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-full border border-white/10 bg-[#151A17] p-0.5 mr-1">
            <button onClick={() => setListView(false)} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] cursor-pointer ${!listView ? 'bg-white/15 text-white' : 'text-white/55'}`}>
              <MapIcon className="w-3.5 h-3.5" /> வரைபடம்
            </button>
            <button onClick={() => { setListView(true); dismissHint(); }} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] cursor-pointer ${listView ? 'bg-white/15 text-white' : 'text-white/55'}`}>
              <List className="w-3.5 h-3.5" /> தலைப்புகள்
            </button>
          </div>
          {PAALS.map((p) => (
            <button
              key={p.key}
              onClick={() => togglePaal(p.key)}
              className={`rounded-full px-2.5 py-0.5 text-[13px] font-tamil-sans border cursor-pointer ${
                paals.has(p.key) ? 'bg-[#1D4234] border-[#2F6650] text-white' : 'bg-[#151A17] border-white/10 text-white/45'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setVideoOnly((v) => !v)}
            className={`rounded-full px-2.5 py-0.5 text-[13px] border cursor-pointer inline-flex items-center gap-1 ${
              videoOnly ? 'bg-[#E3B866] border-[#E3B866] text-[#1B1A16]' : 'bg-[#151A17] border-white/10 text-white/70'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" /> பாடல்கள்
          </button>
        </div>

        {!listView && !panelOpen && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]">
            {topics.slice(0, 14).map((t) => (
              <button
                key={t.i}
                onClick={() => pickTopic(t.i)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#151A17] px-3 py-1 text-[13px] text-white/90 font-tamil-sans cursor-pointer hover:bg-[#1D2420]"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: topicColor(t.i) }} />
                {t.ta}
              </button>
            ))}
            <button onClick={() => setListView(true)} className="shrink-0 rounded-full border border-white/10 bg-[#151A17] px-3 py-1 text-[13px] text-[#E3B866] cursor-pointer">
              அனைத்தும் ({topics.length}) →
            </button>
          </div>
        )}
        <div className="text-[12px] text-white/45 px-1">
          {searchMatches ? `${[...searchMatches].filter((n) => visible[n]).length} பொருத்தங்கள் · ` : ''}
          {visibleCount} / 1330 குறள்கள்
        </div>
      </div>

      {/* all topics as a list */}
      {listView && (
        <div className="absolute inset-0 overflow-y-auto pt-[148px] pb-8 px-3 sm:px-6 lg:pl-[400px]" style={{ background: BG }}>
          <div className="max-w-[980px]">
            <p className="mb-3 text-[13px] text-white/55 font-tamil-sans">ஒரு தலைப்பைத் தொடுங்கள் — அந்தப் பொருளைப் பேசும் எல்லாக் குறள்களும் வரும்.</p>
            {topicCards}
          </div>
        </div>
      )}

      {/* zoom buttons */}
      {!listView && data && (
        <div
          className="absolute flex flex-col gap-1.5"
          style={{ right: isWide && kural ? 332 : 12, bottom: !isWide && panelOpen ? `calc(${sheetFull ? 88 : 52}vh + 12px)` : isWide ? 48 : 64 }}
        >
          <button onClick={() => zoomButton(1.5)} aria-label="பெரிதாக்கு" className="w-10 h-10 rounded-xl bg-[#151A17] border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-[#1D2420]">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={() => zoomButton(1 / 1.5)} aria-label="சிறிதாக்கு" className="w-10 h-10 rounded-xl bg-[#151A17] border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-[#1D2420]">
            <Minus className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* hover tooltip (mouse) */}
      {hover && !selected && !listView && (
        <div className="pointer-events-none absolute z-10 max-w-[280px] rounded-lg bg-[#151A17] border border-white/10 px-3 py-2 shadow-xl" style={{ left: Math.min(hover.x + 14, size.w - 290), top: hover.y + 14 }}>
          <div className="text-[11px] text-[#E3B866] font-semibold">குறள் {hover.n} · {getKuralByNumber(hover.n).athikaramTamil}</div>
          <div className="font-tamil-sans text-[13.5px] text-white leading-snug">
            {getKuralByNumber(hover.n).line1}
            <br />
            {getKuralByNumber(hover.n).line2}
          </div>
        </div>
      )}

      {/* phones: a sheet from the bottom; tap the handle to make it taller */}
      {!isWide && panelOpen && !listView && (
        <aside
          className={`absolute left-0 right-0 bottom-0 overflow-y-auto rounded-t-2xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 transition-[max-height] duration-300 ${sheetFull ? 'max-h-[88vh]' : 'max-h-[52vh]'}`}
          style={{ background: PANEL }}
        >
          <button onClick={() => setSheetFull((v) => !v)} aria-label={sheetFull ? 'சுருக்கு' : 'விரி'} className="sticky top-0 z-10 w-full flex justify-center pt-2.5 pb-2 cursor-pointer" style={{ background: PANEL }}>
            <span className="w-12 h-1.5 rounded-full bg-white/30" />
          </button>
          {kural ? (
            <>
              {detail}
              <div className="border-t border-white/10">{similarList}</div>
            </>
          ) : (
            topicPanel
          )}
        </aside>
      )}

      {!panelOpen && !listView && data && (
        <div className="absolute bottom-3 left-0 right-0 text-center text-[11.5px] text-white/40 px-16 pointer-events-none">
          {isWide ? 'Scroll to zoom · drag to move · click a dot · L hides topic names' : 'இரு விரல்களால் பெரிதாக்கவும் · புள்ளியைத் தொடவும்'}
        </div>
      )}

      {/* first visit: a short welcome */}
      {showHint && data && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 px-5" onClick={dismissHint}>
          <div className="w-full max-w-[380px] rounded-2xl border border-white/10 p-6" style={{ background: PANEL }} onClick={(e) => e.stopPropagation()}>
            <div className="font-tamil-sans text-[22px] font-bold text-[#F4EFE4]">குறள் வரைபடம்</div>
            <div className="text-[13px] text-white/55 mb-4">Thirukkural, mapped by meaning</div>
            <ol className="space-y-3 font-tamil-sans text-[15px] text-[#DCD6C8]">
              <li className="flex gap-3"><span className="text-[#E3B866] font-bold">1</span> ஒவ்வொரு புள்ளியும் ஒரு குறள் — மொத்தம் 1330.</li>
              <li className="flex gap-3"><span className="text-[#E3B866] font-bold">2</span> ஒரே பொருளைப் பேசும் குறள்கள் அருகருகே, ஒரே நிறத்தில்.</li>
              <li className="flex gap-3"><span className="text-[#E3B866] font-bold">3</span> ஒரு புள்ளியையோ தலைப்பையோ தொடுங்கள் — அதைப் போன்ற குறள்கள் வரும்.</li>
            </ol>
            <div className="mt-6 flex gap-2">
              <button onClick={dismissHint} className="flex-1 rounded-xl bg-[#1D4234] text-white py-2.5 font-tamil-sans font-semibold cursor-pointer hover:bg-[#245240]">
                தொடங்கு
              </button>
              <button onClick={surprise} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 text-[#E3B866] px-3.5 py-2.5 text-sm cursor-pointer hover:bg-white/10">
                <Dices className="w-4 h-4" /> ஏதேனும் ஒன்று
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KuralMap;
