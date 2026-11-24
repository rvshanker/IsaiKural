import React, { useMemo, useState } from 'react';
import { ChevronRight, Puzzle, CircleHelp, CalendarDays, Share2, Shuffle, ListChecks, Check } from 'lucide-react';
import { ALL_KURALS } from '../data/kurals';
import { Kural } from '../types/kural';
import { parseKuralList, compactList, MY_SET_KEY } from '../utils/kuralList';
import { shareText } from '../utils/native';

/**
 * கற்போம் · விளையாடுவோம் — one simple place for the game and the quiz.
 * Step 1: which Kurals (my class's Kurals, or any). Step 2: what to do (word game, quiz, today's quiz).
 */

const CHAPTERS = (() => {
  const m = new Map<number, string>();
  for (const k of ALL_KURALS) if (!m.has(k.athikaramNumber)) m.set(k.athikaramNumber, k.athikaramTamil);
  return [...m.entries()].sort((a, b) => a[0] - b[0]);
})();

interface LearnPageProps {
  isDark: boolean;
  go: (hash: string) => void;
  onOpenKural: (k: Kural) => void;
  initialSet?: string;
}

export const LearnPage: React.FC<LearnPageProps> = ({ isDark, go, onOpenKural, initialSet }) => {
  const ink = isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]';
  const muted = isDark ? 'text-[#8E9C94]' : 'text-[#6D766F]';
  const card = isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white/85 border-[#ECEBE5]';
  const accent = isDark ? 'text-[#E3B866]' : 'text-[#9A6B12]';
  const ghost = isDark ? 'border-white/15 text-[#EEE8DC] hover:bg-white/5' : 'border-[#D8DDD7] text-[#16392E] hover:bg-[#F3F1EA]';
  const selected = isDark ? 'border-[#E3B866] bg-[#E3B866]/10' : 'border-[#1D5A43] bg-[#1D5A43]/[0.06]';
  const field = isDark ? 'bg-[#0F1210] border-[#2A302C] text-[#EEE8DC] focus:border-[#E3B866]' : 'bg-white border-[#D8DDD7] text-[#16392E] focus:border-[#1D5A43]';

  const [setText, setSetText] = useState(() => {
    if (initialSet) return initialSet.replace(/,/g, ', ');
    try {
      return localStorage.getItem(MY_SET_KEY) || '';
    } catch {
      return '';
    }
  });
  const nums = useMemo(() => parseKuralList(setText), [setText]);
  const [which, setWhich] = useState<'mine' | 'any'>(() => (initialSet || setText ? 'mine' : 'any'));
  const [copied, setCopied] = useState(false);

  const save = (text: string) => {
    setSetText(text);
    try {
      localStorage.setItem(MY_SET_KEY, text);
    } catch {
      /* ignore */
    }
  };
  const ready = which === 'any' || nums.length > 0;
  const setPart = which === 'mine' ? compactList(nums) : 'random';

  const activities = [
    {
      key: 'play',
      icon: Puzzle,
      colour: 'text-[#E8743B]',
      ta: 'சொல் விளையாட்டு',
      en: 'Word game',
      desc: 'மறைந்த சொற்களை இழுத்துக் குறளை நிரப்பு · Drag the missing words into the Kural',
      tag: 'சிறுவர்களுக்கு · For kids',
      to: `#/play/${setPart}`,
    },
    {
      key: 'quiz',
      icon: CircleHelp,
      colour: 'text-[#4C8DF6]',
      ta: 'வினாடி வினா',
      en: 'Quiz',
      desc: 'சரியான விடையைத் தேர்ந்தெடு — 10 கேள்விகள் · Pick the right answer, 10 questions',
      tag: 'எல்லோருக்கும் · For everyone',
      to: `#/quiz/${setPart}`,
    },
  ];

  return (
    <div className="mt-2">
      <h1 className={`font-tamil-sans text-[26px] sm:text-[32px] font-bold ${ink}`}>கற்போம் · விளையாடுவோம்</h1>
      <p className={`text-[14px] mt-0.5 ${muted}`}>விளையாடிக்கொண்டே குறள் கற்போம் · Learn the Kurals by playing</p>

      {/* ── Step 1 ── */}
      <h2 className={`mt-6 flex items-center gap-2 font-tamil-sans text-[17px] font-bold ${ink}`}>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[14px] ${isDark ? 'bg-[#E3B866] text-[#1A1A14]' : 'bg-[#1D5A43] text-white'}`}>1</span>
        எந்தக் குறள்கள்? · Which Kurals?
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button onClick={() => setWhich('mine')} className={`rounded-2xl border-2 px-3 py-3 text-left cursor-pointer ${which === 'mine' ? selected : card}`}>
          <ListChecks className={`w-6 h-6 ${accent}`} />
          <span className={`block mt-1 font-tamil-sans text-[15px] font-bold ${ink}`}>என் வகுப்புக் குறள்கள்</span>
          <span className={`block text-[12px] ${muted}`}>My class's Kurals</span>
        </button>
        <button onClick={() => setWhich('any')} className={`rounded-2xl border-2 px-3 py-3 text-left cursor-pointer ${which === 'any' ? selected : card}`}>
          <Shuffle className={`w-6 h-6 ${accent}`} />
          <span className={`block mt-1 font-tamil-sans text-[15px] font-bold ${ink}`}>ஏதேனும் குறள்கள்</span>
          <span className={`block text-[12px] ${muted}`}>Any Kurals, a surprise each time</span>
        </button>
      </div>

      {which === 'mine' && (
        <div className={`mt-2 rounded-2xl border px-4 py-4 ${card}`}>
          <label htmlFor="learn-nums" className={`block text-[13px] font-semibold ${ink}`}>
            குறள் எண்கள் · Kural numbers <span className={`font-normal ${muted}`}>(e.g. 1, 2, 5-10)</span>
          </label>
          <input id="learn-nums" value={setText} onChange={(e) => save(e.target.value)} placeholder="1, 2, 5-10" className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-[16px] outline-none ${field}`} />
          <select
            value=""
            onChange={(e) => {
              const n = +e.target.value;
              if (!n) return;
              const add = Array.from({ length: 10 }, (_, x) => (n - 1) * 10 + 1 + x);
              save(compactList([...new Set([...nums, ...add])]).replace(/,/g, ', '));
            }}
            className={`mt-2 max-w-full rounded-full border px-3 py-1.5 text-[13px] font-tamil-sans cursor-pointer ${field}`}
          >
            <option value="">+ ஒரு அதிகாரம் முழுவதும் · Add a whole chapter</option>
            {CHAPTERS.map(([n, name]) => (
              <option key={n} value={n}>
                {n}. {name} ({(n - 1) * 10 + 1}–{n * 10})
              </option>
            ))}
          </select>
          {nums.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {nums.map((n) => (
                <button
                  key={n}
                  onClick={() => onOpenKural(ALL_KURALS[n - 1])}
                  title={ALL_KURALS[n - 1]?.line1}
                  className={`px-2.5 py-0.5 rounded-full text-[13px] cursor-pointer ${isDark ? 'bg-white/10 text-[#EEE8DC]' : 'bg-[#1D5A43]/10 text-[#16392E]'}`}
                >
                  {n}
                </button>
              ))}
              <button onClick={() => save('')} className={`ml-1 text-[12px] underline cursor-pointer ${muted}`}>
                அழி · Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2 ── */}
      <h2 className={`mt-7 flex items-center gap-2 font-tamil-sans text-[17px] font-bold ${ink} ${ready ? '' : 'opacity-50'}`}>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[14px] ${isDark ? 'bg-[#E3B866] text-[#1A1A14]' : 'bg-[#1D5A43] text-white'}`}>2</span>
        என்ன செய்யலாம்? · What would you like to do?
      </h2>
      {!ready && <p className={`mt-1 text-[13px] ${muted}`}>முதலில் குறள் எண்களை உள்ளிடுங்கள் · First type the Kural numbers above</p>}
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {activities.map((a) => (
          <button
            key={a.key}
            onClick={() => ready && go(a.to)}
            disabled={!ready}
            className={`group text-left rounded-3xl border-2 px-5 py-5 cursor-pointer transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${card} hover:border-[#C9A45C]`}
          >
            <span className="flex items-start justify-between">
              <a.icon className={`w-11 h-11 ${a.colour}`} strokeWidth={1.7} />
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-[#C9C3B6]' : 'bg-black/[0.05] text-[#5A645E]'}`}>{a.tag}</span>
            </span>
            <span className={`block mt-3 font-tamil-sans text-[22px] font-bold ${ink}`}>{a.ta}</span>
            <span className={`block text-[13px] font-semibold ${accent}`}>{a.en}</span>
            <span className={`block mt-1 text-[13px] ${muted}`}>{a.desc}</span>
            <span className={`mt-3 inline-flex items-center gap-1 text-[14px] font-semibold ${ink}`}>
              {which === 'mine' && nums.length ? `${nums.length} குறள்கள் · ` : ''}தொடங்கு · Start <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        ))}
      </div>

      {/* Today's quiz is the same for everyone, so it does not use the Kural choice */}
      <button onClick={() => go('#/quiz/today')} className={`mt-3 w-full flex items-center gap-3 rounded-2xl border px-5 py-4 text-left cursor-pointer ${card} hover:border-[#C9A45C]`}>
        <CalendarDays className="w-8 h-8 text-[#3FA56B] shrink-0" strokeWidth={1.7} />
        <span className="min-w-0">
          <span className={`block font-tamil-sans text-[17px] font-bold ${ink}`}>இன்றைய வினா · Today's quiz</span>
          <span className={`block text-[13px] ${muted}`}>எல்லோருக்கும் ஒரே 10 கேள்விகள் — மதிப்பெண்ணைப் பகிருங்கள் · Same 10 questions for everyone, share your score</span>
        </span>
        <ChevronRight className={`w-5 h-5 ml-auto shrink-0 ${muted}`} />
      </button>

      {which === 'mine' && nums.length > 0 && (
        <div className={`mt-6 rounded-2xl border border-dashed px-4 py-4 ${isDark ? 'border-white/15' : 'border-[#C9D6CD]'}`}>
          <span className={`block font-tamil-sans text-[15px] font-bold ${ink}`}>ஆசிரியர்களுக்கு · For teachers</span>
          <span className={`block text-[13px] ${muted}`}>இந்தக் குறள்களுடன் ஒரு இணைப்பை மாணவர்களுக்கு அனுப்புங்கள் · Send students a link with these Kurals already chosen</span>
          <button
            onClick={async () => {
              const url = `https://isaikural.com/#/learn/${compactList(nums)}`;
              const r = await shareText(`திருக்குறள் பயிற்சி — குறள் ${compactList(nums).replace(/,/g, ', ')}\n${url}`, 'திருக்குறள் பயிற்சி');
              if (r === 'copied') {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }
            }}
            className={`mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-[14px] cursor-pointer ${ghost}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} {copied ? 'இணைப்பு நகலெடுக்கப்பட்டது · Link copied' : 'இணைப்பைப் பகிர் · Share link'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LearnPage;
