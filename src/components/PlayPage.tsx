import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Star, Volume2, VolumeX, ChevronRight, RotateCcw, Music, Shuffle, ListChecks, Sparkles, Lightbulb } from 'lucide-react';
import { ALL_KURALS } from '../data/kurals';
import { Kural } from '../types/kural';
import { parseKuralList, compactList, MY_SET_KEY } from '../utils/kuralList';

/**
 * குறள் விளையாட்டு — a word game for children.
 * A Kural is shown with some words hidden; the child drags (or taps) word tiles into the gaps.
 * Right word → it snaps in with a chime; wrong word → the tile shakes and goes back.
 * Levels: எளிது (1 word), நடுத்தரம் (3 words), கடினம் (all 7 words — build the whole Kural).
 */

type Level = 1 | 3 | 7;
const LEVELS: { n: Level; ta: string; en: string; stars: number }[] = [
  { n: 1, ta: 'எளிது', en: '1 word', stars: 1 },
  { n: 3, ta: 'நடுத்தரம்', en: '3 words', stars: 2 },
  { n: 7, ta: 'கடினம்', en: 'whole Kural', stars: 3 },
];

interface Tile {
  id: number;
  text: string; // shown on the tile
  key: string; // compared with the gap (punctuation removed)
  used: boolean;
}
interface Round {
  kural: Kural;
  words: string[]; // all 7 words as written
  hidden: number[]; // indices of hidden words, in order
  tiles: Tile[];
}

const strip = (w: string) => w.replace(/[.,;:!?'"“”‘’()]/g, '');
const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

function makeRound(k: Kural, level: Level): Round {
  const words = `${k.line1} ${k.line2}`.split(/\s+/).filter(Boolean);
  let hidden: number[];
  if (level >= words.length) hidden = words.map((_, i) => i);
  else {
    // prefer real words (not tiny particles) for the gaps
    const good = words.map((w, i) => ({ w: strip(w), i })).filter(({ w }) => w.length >= 3).map(({ i }) => i);
    hidden = shuffle(good.length >= level ? good : words.map((_, i) => i)).slice(0, level).sort((a, b) => a - b);
  }
  const answers = hidden.map((i) => strip(words[i]));
  // add 2 "wrong" words from other Kurals so it is not just elimination (not for the whole-Kural level)
  const extra: string[] = [];
  if (level < 7) {
    for (let t = 0; extra.length < 2 && t < 200; t++) {
      const o = ALL_KURALS[Math.floor(Math.random() * ALL_KURALS.length)];
      if (o.number === k.number) continue;
      const ws = `${o.line1} ${o.line2}`.split(/\s+/).map(strip).filter((w) => w.length >= 3 && !answers.includes(w) && !extra.includes(w));
      if (ws.length) extra.push(ws[Math.floor(Math.random() * ws.length)]);
    }
  }
  const tiles = shuffle([...answers, ...extra]).map((w, id) => ({ id, text: w, key: w, used: false }));
  return { kural: k, words, hidden, tiles };
}

// ── little sounds made in the browser (no files to download) ──
let audio: AudioContext | null = null;
function tone(freqs: number[], dur = 0.12, type: OscillatorType = 'sine', gain = 0.12) {
  try {
    audio = audio || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t0 = audio.currentTime;
    freqs.forEach((f, i) => {
      const o = audio!.createOscillator();
      const g = audio!.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(gain, t0 + i * dur);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur + 0.05);
      o.connect(g).connect(audio!.destination);
      o.start(t0 + i * dur);
      o.stop(t0 + (i + 1) * dur + 0.06);
    });
  } catch {
    /* no sound available */
  }
}
const sounds = {
  right: () => tone([660, 880], 0.09),
  wrong: () => tone([200, 150], 0.12, 'square', 0.05),
  win: () => tone([523, 659, 784, 1047], 0.11, 'triangle', 0.14),
};

function confetti() {
  const colours = ['#E3B866', '#3FA56B', '#E8743B', '#4C8DF6', '#D94F8C', '#F5D547'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('span');
    el.className = 'kp-confetti';
    el.style.left = `${Math.random() * 100}vw`;
    el.style.background = colours[i % colours.length];
    el.style.animationDelay = `${Math.random() * 0.3}s`;
    el.style.setProperty('--kp-dx', `${(Math.random() - 0.5) * 30}vw`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }
}

const PRAISE = ['சபாஷ்!', 'அருமை!', 'மிகச் சிறப்பு!', 'வெற்றி!', 'நல்லது!'];

interface PlayPageProps {
  isDark: boolean;
  onOpenKural: (k: Kural) => void;
  initialSet?: string;
}

export const PlayPage: React.FC<PlayPageProps> = ({ isDark, onOpenKural, initialSet }) => {
  const ink = isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]';
  const body = isDark ? 'text-[#C9C3B6]' : 'text-[#3E4A44]';
  const muted = isDark ? 'text-[#8E9C94]' : 'text-[#6D766F]';
  const card = isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white/85 border-[#ECEBE5]';
  const accent = isDark ? 'text-[#E3B866]' : 'text-[#9A6B12]';
  const primary = isDark ? 'bg-[#E3B866] text-[#1A1A14] hover:bg-[#EBC67D]' : 'bg-[#1D5A43] text-white hover:bg-[#174A37]';
  const ghost = isDark ? 'border-white/15 text-[#EEE8DC] hover:bg-white/5' : 'border-[#D8DDD7] text-[#16392E] hover:bg-[#F3F1EA]';
  const tileCls = isDark
    ? 'bg-[#2B2416] border-[#E3B866]/60 text-[#F3E6C6]'
    : 'bg-[#FFF6DF] border-[#E2B95A] text-[#5A3D06] shadow-[0_3px_0_#E2B95A]';

  // ── which Kurals to play ──
  const [setText, setSetText] = useState(() => {
    if (initialSet) return initialSet.replace(/,/g, ', ');
    try {
      return localStorage.getItem(MY_SET_KEY) || '';
    } catch {
      return '';
    }
  });
  const myNums = useMemo(() => parseKuralList(setText), [setText]);
  const [level, setLevel] = useState<Level>(1);
  const [muted_, setMuted] = useState(false);
  const [queue, setQueue] = useState<Kural[]>([]);
  const [qi, setQi] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [filled, setFilled] = useState<Record<number, string>>({}); // word index → placed text
  const [mistakes, setMistakes] = useState(0);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [popIdx, setPopIdx] = useState<number | null>(null);
  const [totalStars, setTotalStars] = useState(0);
  const [earned, setEarned] = useState<number[]>([]);
  const [hint, setHint] = useState(false);

  const play = (s: keyof typeof sounds) => !muted_ && sounds[s]();

  const begin = (nums: number[] | 'random') => {
    const list = nums === 'random' ? shuffle(ALL_KURALS).slice(0, 5) : shuffle(nums.map((n) => ALL_KURALS[n - 1]).filter(Boolean));
    if (nums !== 'random') {
      try {
        localStorage.setItem(MY_SET_KEY, compactList(nums).replace(/,/g, ', '));
      } catch {
        /* ignore */
      }
    }
    setQueue(list);
    setQi(0);
    setTotalStars(0);
    setEarned([]);
    startKural(list[0]);
    window.scrollTo({ top: 0 });
  };
  const startKural = (k: Kural) => {
    setRound(makeRound(k, level));
    setFilled({});
    setMistakes(0);
    setHint(false);
  };

  const nextGap = (r: Round, f: Record<number, string>) => r.hidden.find((i) => !(i in f));
  const done = round ? round.hidden.every((i) => i in filled) : false;
  const starsNow = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

  useEffect(() => {
    if (done && round) {
      play('win');
      confetti();
      setTotalStars((t) => t + starsNow);
      setEarned((e) => [...e, starsNow]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  /** try to put a tile into a gap (or the next empty gap) */
  const place = (tileId: number, gap?: number) => {
    if (!round || done) return;
    const tile = round.tiles.find((t) => t.id === tileId);
    if (!tile || tile.used) return;
    const target = gap ?? nextGap(round, filled);
    if (target === undefined || target in filled) return;
    // a word that appears twice in the Kural fits either of its gaps
    const fits = strip(round.words[target]) === tile.key;
    if (fits) {
      setFilled({ ...filled, [target]: round.words[target] });
      setRound({ ...round, tiles: round.tiles.map((t) => (t.id === tileId ? { ...t, used: true } : t)) });
      setPopIdx(target);
      setTimeout(() => setPopIdx(null), 400);
      play('right');
    } else {
      setMistakes((m) => m + 1);
      setShakeId(tileId);
      setTimeout(() => setShakeId(null), 450);
      play('wrong');
    }
  };

  // ── dragging with a finger or mouse ──
  const drag = useRef<{ id: number; el: HTMLElement; sx: number; sy: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent<HTMLButtonElement>, id: number) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    drag.current = { id, el, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    d.el.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
    d.el.style.zIndex = '50';
    // light up the gap under the finger
    document.querySelectorAll('[data-gap]').forEach((g) => g.classList.remove('ring-4'));
    d.el.style.visibility = 'hidden';
    const under = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-gap]');
    d.el.style.visibility = '';
    under?.classList.add('ring-4');
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    d.el.style.visibility = 'hidden';
    const under = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-gap]') as HTMLElement | null;
    d.el.style.visibility = '';
    d.el.style.transform = '';
    d.el.style.zIndex = '';
    document.querySelectorAll('[data-gap]').forEach((g) => g.classList.remove('ring-4'));
    if (!d.moved) place(d.id); // a tap: fill the next gap
    else if (under) place(d.id, +under.dataset.gap!);
  };

  const nextKural = () => {
    if (qi + 1 < queue.length) {
      setQi(qi + 1);
      startKural(queue[qi + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setRound(null);
      setQi(queue.length);
    }
  };

  // ───────────── start screen ─────────────
  if (!queue.length) {
    return (
      <div className="mt-2">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-7 h-7 ${accent} kp-bounce`} />
          <h1 className={`font-tamil-sans text-[26px] sm:text-[32px] font-bold ${ink}`}>குறள் விளையாட்டு</h1>
        </div>
        <p className={`text-[14px] mt-0.5 ${muted}`}>மறைந்த சொற்களை இழுத்து, சரியான இடத்தில் வையுங்கள்! · Drag the missing words into the Kural</p>

        <h2 className={`mt-5 font-tamil-sans text-[16px] font-bold ${ink}`}>1. நிலை தேர்ந்தெடு · Choose a level</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.n}
              onClick={() => setLevel(l.n)}
              className={`rounded-2xl border-2 px-2 py-3 text-center cursor-pointer transition-colors ${
                level === l.n ? (isDark ? 'border-[#E3B866] bg-[#E3B866]/10' : 'border-[#1D5A43] bg-[#1D5A43]/5') : card
              }`}
            >
              <span className="flex justify-center gap-0.5">
                {Array.from({ length: l.stars }, (_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F5B731] text-[#F5B731]" />
                ))}
              </span>
              <span className={`block mt-1 font-tamil-sans text-[16px] font-bold ${ink}`}>{l.ta}</span>
              <span className={`block text-[12px] ${muted}`}>{l.en}</span>
            </button>
          ))}
        </div>

        <h2 className={`mt-6 font-tamil-sans text-[16px] font-bold ${ink}`}>2. குறள்களைத் தேர்ந்தெடு · Choose Kurals</h2>
        <div className={`mt-2 rounded-2xl border px-5 py-4 ${card}`}>
          <span className={`flex items-center gap-2 font-tamil-sans text-[16px] font-bold ${ink}`}>
            <ListChecks className={`w-5 h-5 ${accent}`} /> என் குறள்கள் · My Kurals
          </span>
          <span className={`block text-[13px] ${muted}`}>தமிழ்ப் பள்ளியில் படிக்கும் குறள் எண்கள் · Kural numbers from your Tamil school</span>
          <input
            value={setText}
            onChange={(e) => setSetText(e.target.value)}
            placeholder="1, 2, 5-10, 34"
            aria-label="Kural numbers"
            className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-[16px] outline-none ${
              isDark ? 'bg-[#0F1210] border-[#2A302C] text-[#EEE8DC] focus:border-[#E3B866]' : 'bg-white border-[#D8DDD7] text-[#16392E] focus:border-[#1D5A43]'
            }`}
          />
          <button
            onClick={() => begin(myNums)}
            disabled={!myNums.length}
            className={`mt-3 inline-flex items-center gap-1 px-5 py-2.5 rounded-full text-[15px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${primary}`}
          >
            விளையாடு · Play ({myNums.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => begin('random')} className={`mt-3 w-full flex items-center gap-3 rounded-2xl border px-5 py-4 text-left cursor-pointer ${card} hover:border-[#C9A45C]`}>
          <Shuffle className={`w-6 h-6 ${accent}`} />
          <span>
            <span className={`block font-tamil-sans text-[16px] font-bold ${ink}`}>ஏதேனும் 5 குறள்கள் · Any 5 Kurals</span>
            <span className={`block text-[13px] ${muted}`}>ஒவ்வொரு முறையும் புதியவை · Different every time</span>
          </span>
          <ChevronRight className={`w-5 h-5 ml-auto ${muted}`} />
        </button>
      </div>
    );
  }

  // ───────────── finished all ─────────────
  if (!round) {
    const max = queue.length * 3;
    return (
      <div className="mt-6 text-center">
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <Star key={i} className={`w-12 h-12 kp-pop ${totalStars >= max * ((i + 1) / 3) - 0.01 ? 'fill-[#F5B731] text-[#F5B731]' : isDark ? 'text-white/20' : 'text-black/15'}`} />
          ))}
        </div>
        <h1 className={`mt-3 font-tamil-sans text-[28px] font-bold ${ink}`}>எல்லாம் முடிந்தது! 🎉</h1>
        <p className={`mt-1 text-[16px] ${body}`}>
          {queue.length} குறள்கள் · <b>{totalStars}</b> / {max} நட்சத்திரங்கள் · stars
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {queue.map((k, i) => (
            <button key={k.number} onClick={() => onOpenKural(k)} className={`px-3 py-1 rounded-full border text-[13px] cursor-pointer ${ghost}`}>
              குறள் {k.number} {'⭐'.repeat(earned[i] || 0)}
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => begin(queue.map((k) => k.number))} className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[15px] font-semibold cursor-pointer ${primary}`}>
            <RotateCcw className="w-4 h-4" /> மீண்டும் · Play again
          </button>
          {level < 7 && (
            <button
              onClick={() => {
                setLevel(level === 1 ? 3 : 7);
                setQueue([]);
                setQi(0);
              }}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-[15px] cursor-pointer ${ghost}`}
            >
              அடுத்த நிலை · Next level <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              setQueue([]);
              setQi(0);
            }}
            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-[15px] cursor-pointer ${ghost}`}
          >
            வேறு குறள்கள் · Other Kurals
          </button>
        </div>
      </div>
    );
  }

  // ───────────── playing one Kural ─────────────
  const firstLen = round.kural.line1.split(/\s+/).filter(Boolean).length;
  const gapWord = (i: number) => {
    const isGap = round.hidden.includes(i);
    const value = filled[i];
    if (!isGap)
      return (
        <span key={i} className={`font-tamil-serif text-[22px] sm:text-[26px] leading-[1.9] ${ink}`}>
          {round.words[i]}
        </span>
      );
    if (value)
      return (
        <span key={i} className={`inline-block rounded-lg px-1.5 font-tamil-serif text-[22px] sm:text-[26px] leading-[1.6] text-[#2E8B57] bg-[#3FA56B]/15 ${popIdx === i ? 'kp-pop' : ''}`}>
          {value}
        </span>
      );
    const isNext = nextGap(round, filled) === i;
    return (
      <span
        key={i}
        data-gap={i}
        onClick={() => setHint(false)}
        className={`inline-block align-middle min-w-[84px] h-[44px] rounded-xl border-2 border-dashed ring-[#E3B866] transition-shadow ${
          isNext ? (isDark ? 'border-[#E3B866] bg-[#E3B866]/10' : 'border-[#1D5A43] bg-[#1D5A43]/5') : isDark ? 'border-white/25' : 'border-black/20'
        }`}
        style={{ width: `${Math.max(84, strip(round.words[i]).length * 15)}px` }}
      >
        {hint && isNext && <span className={`block text-center leading-[40px] font-tamil-serif text-[20px] ${muted}`}>{strip(round.words[i]).slice(0, 1)}…</span>}
      </span>
    );
  };

  return (
    <div className="mt-2 select-none" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <div className="flex items-center justify-between gap-2">
        <span className={`font-tamil-sans text-[15px] font-bold ${ink}`}>
          குறள் {qi + 1}/{queue.length} · {LEVELS.find((l) => l.n === level)?.ta}
        </span>
        <span className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 text-[15px] font-bold ${ink}`}>
            <Star className="w-5 h-5 fill-[#F5B731] text-[#F5B731]" /> {totalStars}
          </span>
          <button onClick={() => setMuted(!muted_)} aria-label={muted_ ? 'Sound on' : 'Sound off'} className={`p-1.5 rounded-full cursor-pointer ${muted}`}>
            {muted_ ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </span>
      </div>

      <div className={`mt-3 rounded-3xl border-2 px-4 sm:px-6 py-5 ${card} ${done ? 'border-[#3FA56B]' : ''}`}>
        <div className={`text-[12px] ${muted}`}>
          குறள் {round.kural.number} · {round.kural.athikaramTamil}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2">{round.words.slice(0, firstLen).map((_, i) => gapWord(i))}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2">{round.words.slice(firstLen).map((_, i) => gapWord(firstLen + i))}</div>
      </div>

      {!done ? (
        <>
          <p className={`mt-5 text-center text-[14px] ${muted}`}>சொல்லை இழுத்து இடத்தில் விடுங்கள் — அல்லது தட்டுங்கள் · Drag a word into the gap, or tap it</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {round.tiles.map((t) =>
              t.used ? null : (
                <button
                  key={t.id}
                  onPointerDown={(e) => onDown(e, t.id)}
                  style={{ touchAction: 'none' }}
                  className={`relative px-4 py-2.5 rounded-2xl border-2 font-tamil-serif text-[20px] cursor-grab active:cursor-grabbing transition-transform ${tileCls} ${
                    shakeId === t.id ? 'kp-shake !border-[#D9534F]' : ''
                  }`}
                >
                  {t.text}
                </button>
              )
            )}
          </div>
          <div className="mt-5 flex justify-center">
            <button onClick={() => setHint(true)} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-[14px] cursor-pointer ${ghost}`}>
              <Lightbulb className="w-4 h-4" /> குறிப்பு · Hint
            </button>
          </div>
        </>
      ) : (
        <div className="mt-5 text-center">
          <div className="flex justify-center gap-1">
            {[1, 2, 3].map((s) => (
              <Star key={s} className={`w-10 h-10 kp-pop ${s <= starsNow ? 'fill-[#F5B731] text-[#F5B731]' : isDark ? 'text-white/20' : 'text-black/15'}`} style={{ animationDelay: `${s * 0.12}s` }} />
            ))}
          </div>
          <div className={`mt-2 font-tamil-sans text-[26px] font-bold text-[#2E8B57]`}>{PRAISE[round.kural.number % PRAISE.length]}</div>
          {round.kural.commentaries.muVa && <p className={`mt-3 text-left text-[15px] leading-relaxed ${body}`}>{round.kural.commentaries.muVa}</p>}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button onClick={nextKural} className={`inline-flex items-center gap-1 px-6 py-3 rounded-full text-[16px] font-semibold cursor-pointer ${primary}`}>
              {qi + 1 < queue.length ? 'அடுத்த குறள் · Next' : 'முடிவு · Finish'} <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => onOpenKural(round.kural)} className={`inline-flex items-center gap-1.5 px-5 py-3 rounded-full border text-[15px] cursor-pointer ${ghost}`}>
              {round.kural.media?.youtubeUrl && <Music className="w-4 h-4" />} {round.kural.media?.youtubeUrl ? 'பாட்டு கேள் · Hear the song' : 'முழு விளக்கம் · Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayPage;
