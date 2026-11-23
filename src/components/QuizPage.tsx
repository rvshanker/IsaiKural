import React, { useMemo, useState } from 'react';
import { Check, X, Share2, RotateCcw, Trophy, Flame, Music, ChevronRight, CalendarDays, Shuffle } from 'lucide-react';
import { ALL_KURALS } from '../data/kurals';
import { Kural, Paal } from '../types/kural';
import { shareText } from '../utils/native';

/**
 * குறள் வினாடி வினா — a 10-question quiz built from the Kurals on this site.
 * • இன்றைய வினா: the same 10 questions for everyone on a given day (seeded by the date), shareable like Wordle.
 * • பயிற்சி: unlimited random rounds, optionally limited to one பால்.
 * Four kinds of question: missing word, second line, which அதிகாரம், and meaning → Kural.
 */

type QType = 'blank' | 'nextline' | 'chapter' | 'meaning';
interface Question {
  type: QType;
  kural: Kural;
  prompt: string; // shown above the options
  body: string[]; // lines shown in the card
  options: string[];
  answer: number; // index into options
}

const ROUND = 10;
const STORE = 'isaikural.quiz.v1';
const SITE = 'https://isaikural.com/#/quiz';

// ── deterministic random numbers so the daily quiz is the same for everyone ──
function seedFrom(s: string) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];
function shuffle<T>(r: () => number, arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const clean = (w: string) => w.replace(/[.,;:!?'"“”‘’()]/g, '');
const wordsOf = (k: Kural) => `${k.line1} ${k.line2}`.split(/\s+/).filter(Boolean);

/** pick `n` distinct values that are not `right`, using `make` to draw candidates */
function distractors(r: () => number, right: string, n: number, make: () => string | undefined) {
  const out = new Set<string>();
  for (let tries = 0; out.size < n && tries < 400; tries++) {
    const v = make();
    if (v && v !== right) out.add(v);
  }
  return [...out];
}

function buildQuestion(r: () => number, type: QType, k: Kural, pool: Kural[]): Question | null {
  const samePaal = pool.filter((x) => x.paal === k.paal && x.number !== k.number);
  const others = samePaal.length > 20 ? samePaal : pool.filter((x) => x.number !== k.number);
  let right = '';
  let wrong: string[] = [];
  let prompt = '';
  let body: string[] = [];

  if (type === 'blank') {
    const words = wordsOf(k);
    const candidates = words.map((w, i) => ({ w: clean(w), i })).filter(({ w }) => w.length >= 4);
    if (!candidates.length) return null;
    const { w, i } = pick(r, candidates);
    right = w;
    const all = words.map((x, j) => (j === i ? x.replace(clean(x), '＿＿＿＿') : x));
    const firstLen = k.line1.split(/\s+/).filter(Boolean).length;
    body = [all.slice(0, firstLen).join(' '), all.slice(firstLen).join(' ')];
    prompt = 'விடுபட்ட சொல் எது? · Fill in the missing word';
    wrong = distractors(r, right, 3, () => {
      const ws = wordsOf(pick(r, others)).map(clean).filter((x) => Math.abs(x.length - right.length) <= 2 && x.length >= 3);
      return ws.length ? pick(r, ws) : undefined;
    });
  } else if (type === 'nextline') {
    right = k.line2;
    body = [k.line1, '…'];
    prompt = 'அடுத்த அடி எது? · Which line comes next?';
    wrong = distractors(r, right, 3, () => pick(r, others).line2);
  } else if (type === 'chapter') {
    right = k.athikaramTamil;
    body = [k.line1, k.line2];
    prompt = 'இந்தக் குறள் எந்த அதிகாரம்? · Which chapter is this from?';
    wrong = distractors(r, right, 3, () => pick(r, others).athikaramTamil);
  } else {
    const m = (k.commentaries.muVa || '').trim();
    if (m.length < 20) return null;
    right = k.line1;
    body = [m];
    prompt = 'இந்தப் பொருளுக்கான குறள் எது? · Which Kural has this meaning?';
    wrong = distractors(r, right, 3, () => pick(r, others).line1);
  }
  if (wrong.length < 3) return null;
  const options = shuffle(r, [right, ...wrong]);
  return { type, kural: k, prompt, body, options, answer: options.indexOf(right) };
}

function buildRound(seed: number, paal: Paal | 'all'): Question[] {
  const r = rng(seed);
  const pool = paal === 'all' ? ALL_KURALS : ALL_KURALS.filter((k) => k.paal === paal);
  const types: QType[] = shuffle(r, ['blank', 'blank', 'blank', 'nextline', 'nextline', 'nextline', 'chapter', 'chapter', 'meaning', 'meaning']);
  const used = new Set<number>();
  const qs: Question[] = [];
  for (const t of types) {
    for (let tries = 0; tries < 30; tries++) {
      const k = pick(r, pool);
      if (used.has(k.number)) continue;
      const q = buildQuestion(r, t, k, pool);
      if (q) {
        used.add(k.number);
        qs.push(q);
        break;
      }
    }
  }
  return qs.slice(0, ROUND);
}

// ── saved scores (this browser only) ──
interface Stats {
  days: Record<string, number>; // date → daily score
  best: number; // best practice score
  played: number;
}
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
function loadStats(): Stats {
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || '');
    return { days: s.days || {}, best: s.best || 0, played: s.played || 0 };
  } catch {
    return { days: {}, best: 0, played: 0 };
  }
}
function saveStats(s: Stats) {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    /* private mode */
  }
}
function streakOf(days: Record<string, number>) {
  let n = 0;
  const d = new Date();
  // today's quiz not done yet does not break the streak
  const key = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  if (!(key(d) in days)) d.setDate(d.getDate() - 1);
  while (key(d) in days) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

const PAALS: { key: Paal | 'all'; label: string }[] = [
  { key: 'all', label: 'அனைத்தும்' },
  { key: 'அறத்துப்பால்', label: 'அறம்' },
  { key: 'பொருட்பால்', label: 'பொருள்' },
  { key: 'காமத்துப்பால்', label: 'இன்பம்' },
];

interface QuizPageProps {
  isDark: boolean;
  onOpenKural: (k: Kural) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ isDark, onOpenKural }) => {
  const ink = isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]';
  const body = isDark ? 'text-[#C9C3B6]' : 'text-[#3E4A44]';
  const muted = isDark ? 'text-[#8E9C94]' : 'text-[#6D766F]';
  const card = isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white/80 border-[#ECEBE5]';
  const accent = isDark ? 'text-[#E3B866]' : 'text-[#9A6B12]';
  const primary = isDark ? 'bg-[#E3B866] text-[#1A1A14] hover:bg-[#EBC67D]' : 'bg-[#1D5A43] text-white hover:bg-[#174A37]';
  const ghost = isDark ? 'border-white/15 text-[#EEE8DC] hover:bg-white/5' : 'border-[#D8DDD7] text-[#16392E] hover:bg-[#F3F1EA]';

  const [stats, setStats] = useState<Stats>(loadStats);
  const [mode, setMode] = useState<'menu' | 'daily' | 'practice'>('menu');
  const [paal, setPaal] = useState<Paal | 'all'>('all');
  const [seed, setSeed] = useState(0);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [marks, setMarks] = useState<boolean[]>([]);
  const [copied, setCopied] = useState(false);

  const date = today();
  const dailyDone = date in stats.days;
  const streak = streakOf(stats.days);

  const questions = useMemo(
    () => (mode === 'daily' ? buildRound(seedFrom('daily-' + date), 'all') : mode === 'practice' ? buildRound(seed, paal) : []),
    [mode, seed, paal, date]
  );
  const finished = mode !== 'menu' && questions.length > 0 && marks.length === questions.length && i >= questions.length;
  const score = marks.filter(Boolean).length;

  const start = (m: 'daily' | 'practice') => {
    setMode(m);
    setSeed(Math.floor(Math.random() * 2 ** 31));
    setI(0);
    setChosen(null);
    setMarks([]);
    setCopied(false);
    window.scrollTo({ top: 0 });
  };

  const answer = (o: number) => {
    if (chosen !== null) return;
    setChosen(o);
    const ok = o === questions[i].answer;
    const next = [...marks, ok];
    setMarks(next);
    if (next.length === questions.length) {
      const s = { ...stats, played: stats.played + 1 };
      const sc = next.filter(Boolean).length;
      if (mode === 'daily') s.days = { ...s.days, [date]: sc };
      else s.best = Math.max(s.best, sc);
      setStats(s);
      saveStats(s);
    }
  };

  const nextQ = () => {
    setChosen(null);
    setI(i + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resultLine = (ms: boolean[]) => ms.map((m) => (m ? '🟩' : '🟥')).join('');
  const share = async (sc: number, ms: boolean[]) => {
    const title = mode === 'daily' ? `இன்றைய குறள் வினா ${date.split('-').reverse().join('-')}` : 'குறள் வினாடி வினா';
    const text = `${title}\n${sc}/${ROUND} ${resultLine(ms)}\n${SITE}`;
    const done = await shareText(text);
    if (done === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ───────────── start screen ─────────────
  if (mode === 'menu') {
    return (
      <div className="mt-2">
        <h1 className={`font-tamil-sans text-[26px] sm:text-[32px] font-bold ${ink}`}>குறள் வினாடி வினா</h1>
        <p className={`text-[14px] mt-0.5 ${muted}`}>10 கேள்விகள் — விடுபட்ட சொல், அடுத்த அடி, அதிகாரம், பொருள் · A 10-question Thirukkural quiz</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button onClick={() => start('daily')} className={`text-left rounded-2xl border px-5 py-5 cursor-pointer transition-colors ${card} hover:border-[#C9A45C]`}>
            <CalendarDays className={`w-8 h-8 ${accent}`} strokeWidth={1.8} />
            <span className={`block mt-2 font-tamil-sans text-[20px] font-bold ${ink}`}>இன்றைய வினா</span>
            <span className={`block text-[13px] ${muted}`}>
              {dailyDone ? `இன்று ${stats.days[date]}/${ROUND} — மீண்டும் விளையாடலாம் · Play again` : 'எல்லோருக்கும் ஒரே 10 கேள்விகள் · Same 10 questions for everyone today'}
            </span>
          </button>
          <div className={`rounded-2xl border px-5 py-5 ${card}`}>
            <Shuffle className={`w-8 h-8 ${accent}`} strokeWidth={1.8} />
            <span className={`block mt-2 font-tamil-sans text-[20px] font-bold ${ink}`}>பயிற்சி</span>
            <span className={`block text-[13px] ${muted}`}>புதிய கேள்விகள் ஒவ்வொரு முறையும் · New random questions every time</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {PAALS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPaal(p.key)}
                  className={`px-3 py-1 rounded-full border text-[13px] font-tamil-sans cursor-pointer ${
                    paal === p.key ? (isDark ? 'bg-[#E3B866] text-[#1A1A14] border-transparent' : 'bg-[#1D5A43] text-white border-transparent') : ghost
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={() => start('practice')} className={`mt-4 inline-flex items-center gap-1 px-4 py-2 rounded-full text-[14px] font-semibold cursor-pointer ${primary}`}>
              தொடங்கு · Start <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[14px] ${body}`}>
          <span className="inline-flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#E8743B]" /> தொடர் நாட்கள் · Streak: <b>{streak}</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Trophy className={`w-4 h-4 ${accent}`} /> பயிற்சியில் சிறந்தது · Best: <b>{stats.best}/{ROUND}</b>
          </span>
        </div>
      </div>
    );
  }

  // ───────────── result screen ─────────────
  if (finished) {
    const msg =
      score === 10 ? 'அருமை! முழு மதிப்பெண்! · Perfect!' : score >= 8 ? 'மிகச் சிறப்பு! · Excellent!' : score >= 5 ? 'நன்று! · Well done!' : 'இன்னும் படிப்போம்! · Keep learning!';
    return (
      <div className="mt-2">
        <div className={`rounded-2xl border px-5 py-6 text-center ${card}`}>
          <Trophy className={`w-10 h-10 mx-auto ${accent}`} strokeWidth={1.8} />
          <div className={`mt-2 font-heading text-[44px] leading-none ${ink}`}>
            {score}
            <span className={`text-[24px] ${muted}`}>/{ROUND}</span>
          </div>
          <div className={`mt-2 font-tamil-sans text-[18px] font-bold ${ink}`}>{msg}</div>
          <div className="mt-3 text-[22px] tracking-[2px]">{resultLine(marks)}</div>
          {mode === 'daily' && (
            <div className={`mt-2 text-[13px] ${muted}`}>
              <Flame className="inline w-4 h-4 text-[#E8743B] -mt-0.5" /> தொடர் நாட்கள் · Streak {streak}
            </div>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button onClick={() => share(score, marks)} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-semibold cursor-pointer ${primary}`}>
              <Share2 className="w-4 h-4" /> {copied ? 'நகலெடுக்கப்பட்டது · Copied' : 'பகிர் · Share'}
            </button>
            <button onClick={() => start('practice')} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-[14px] cursor-pointer ${ghost}`}>
              <RotateCcw className="w-4 h-4" /> புதிய சுற்று · New round
            </button>
            <button onClick={() => setMode('menu')} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-[14px] cursor-pointer ${ghost}`}>
              வினா முகப்பு · Quiz home
            </button>
          </div>
        </div>

        <h2 className={`mt-6 mb-2 font-tamil-sans text-[17px] font-bold ${ink}`}>இந்தச் சுற்றின் குறள்கள் · Kurals in this round</h2>
        <div className="grid gap-2">
          {questions.map((q, n) => (
            <button
              key={n}
              onClick={() => onOpenKural(q.kural)}
              className={`text-left flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer ${card} hover:border-[#C9A45C]`}
            >
              {marks[n] ? <Check className="w-5 h-5 mt-0.5 shrink-0 text-[#3FA56B]" /> : <X className="w-5 h-5 mt-0.5 shrink-0 text-[#D9534F]" />}
              <span className="min-w-0">
                <span className={`block text-[12px] ${muted}`}>
                  குறள் {q.kural.number} · {q.kural.athikaramTamil}
                  {q.kural.media?.youtubeUrl && <Music className={`inline w-3.5 h-3.5 ml-1 -mt-0.5 ${accent}`} />}
                </span>
                <span className={`block font-tamil-serif text-[15px] leading-snug ${ink}`}>{q.kural.line1}</span>
                <span className={`block font-tamil-serif text-[15px] leading-snug ${ink}`}>{q.kural.line2}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ───────────── a question ─────────────
  const q = questions[i];
  if (!q) return null;
  const answered = chosen !== null;
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between gap-3">
        <span className={`font-tamil-sans text-[15px] font-bold ${ink}`}>
          {mode === 'daily' ? 'இன்றைய வினா' : 'பயிற்சி'} · {i + 1}/{questions.length}
        </span>
        <span className="text-[15px] tracking-[1px]">{resultLine(marks)}</span>
      </div>
      <div className={`mt-2 h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
        <div className={`h-full rounded-full ${isDark ? 'bg-[#E3B866]' : 'bg-[#1D5A43]'} transition-all`} style={{ width: `${(marks.length / questions.length) * 100}%` }} />
      </div>

      <p className={`mt-5 text-[14px] font-semibold ${accent}`}>{q.prompt}</p>
      <div className={`mt-2 rounded-2xl border px-5 py-4 ${card}`}>
        {q.type === 'meaning' ? (
          <p className={`text-[16px] leading-relaxed ${body}`}>{q.body[0]}</p>
        ) : (
          q.body.map((l, n) => (
            <p key={n} className={`font-tamil-serif text-[18px] sm:text-[20px] leading-snug ${ink}`}>
              {l}
            </p>
          ))
        )}
      </div>

      <div className="mt-4 grid gap-2">
        {q.options.map((o, n) => {
          const isRight = n === q.answer;
          const isPicked = n === chosen;
          const state = !answered
            ? `${card} hover:border-[#C9A45C] cursor-pointer`
            : isRight
              ? 'border-[#3FA56B] bg-[#3FA56B]/15'
              : isPicked
                ? 'border-[#D9534F] bg-[#D9534F]/12'
                : `${card} opacity-60`;
          return (
            <button key={n} onClick={() => answer(n)} disabled={answered} className={`text-left flex items-center gap-3 rounded-xl border px-4 py-3 ${state}`}>
              <span className={`w-7 h-7 shrink-0 rounded-full border flex items-center justify-center text-[13px] ${isDark ? 'border-white/20' : 'border-black/15'} ${muted}`}>
                {answered && isRight ? <Check className="w-4 h-4 text-[#3FA56B]" /> : answered && isPicked ? <X className="w-4 h-4 text-[#D9534F]" /> : String.fromCharCode(65 + n)}
              </span>
              <span className={`font-tamil-serif text-[16px] leading-snug ${ink}`}>{o}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`mt-4 rounded-2xl border px-5 py-4 ${card}`}>
          <div className={`font-tamil-sans text-[16px] font-bold ${chosen === q.answer ? 'text-[#3FA56B]' : 'text-[#D9534F]'}`}>
            {chosen === q.answer ? 'சரி! · Correct' : 'தவறு · Not quite'}
          </div>
          <div className={`mt-1 text-[12px] ${muted}`}>
            குறள் {q.kural.number} · {q.kural.athikaramTamil} · {q.kural.paal}
          </div>
          <p className={`mt-1 font-tamil-serif text-[17px] leading-snug ${ink}`}>{q.kural.line1}</p>
          <p className={`font-tamil-serif text-[17px] leading-snug ${ink}`}>{q.kural.line2}</p>
          {q.type !== 'meaning' && q.kural.commentaries.muVa && <p className={`mt-2 text-[14px] leading-relaxed ${body}`}>{q.kural.commentaries.muVa}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={nextQ} className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-[14px] font-semibold cursor-pointer ${primary}`}>
              {i + 1 < questions.length ? 'அடுத்து · Next' : 'மதிப்பெண் · See score'} <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => onOpenKural(q.kural)} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-[14px] cursor-pointer ${ghost}`}>
              {q.kural.media?.youtubeUrl ? <Music className="w-4 h-4" /> : null} முழு விளக்கம் · Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
