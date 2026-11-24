import React, { useMemo, useState } from 'react';
import { ChevronRight, Puzzle, CircleHelp, CalendarDays, Share2, Shuffle, ListChecks, Check } from 'lucide-react';
import { ALL_KURALS } from '../data/kurals';
import { Kural } from '../types/kural';
import { parseKuralList, compactList, MY_SET_KEY } from '../utils/kuralList';
import { shareText } from '../utils/native';

/**
 * கற்போம் — one simple place for the game and the quiz.
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
      tile: 'bg-[#1D4234] text-[#F3D58E]',
      ta: 'சொல் விளையாட்டு',
      en: 'Word game',
      desc: 'மறைந்த சொற்களை இழுத்துக் குறளை நிரப்புங்கள் · Drag the missing words into the Kural',
      tag: 'சிறுவர்களுக்கு',
      to: `#/play/${setPart}`,
    },
    {
      key: 'quiz',
      icon: CircleHelp,
      tile: 'bg-[#E3B866] text-[#16392E]',
      ta: 'வினாடி வினா',
      en: 'Quiz',
      desc: 'சரியான விடையைத் தேர்ந்தெடுங்கள், 10 கேள்விகள் · Pick the right answer, 10 questions',
      tag: 'எல்லோருக்கும்',
      to: `#/quiz/${setPart}`,
    },
  ];
  const step = isDark ? 'bg-[#E3B866] text-[#16392E]' : 'bg-[#1D4234] text-[#F3D58E]';

  return (
    <div className="mt-2">
      {/* Title band in the home page's green and gold */}
      <div className="relative overflow-hidden rounded-[20px] px-5 py-5 sm:px-7 sm:py-6 text-[#F4EEDF] bg-[radial-gradient(120%_140%_at_100%_0%,rgba(227,184,102,0.22),transparent_55%),linear-gradient(160deg,#1D4234,#14302A)]">
        <Puzzle className="absolute -right-3 -bottom-4 w-28 h-28 text-[#E3B866]/15" strokeWidth={1.4} aria-hidden="true" />
        <h1 className="font-tamil-sans text-[28px] sm:text-[34px] font-bold text-[#F3D58E] leading-tight">கற்போம்</h1>
        <p className="mt-1 text-[14.5px] text-[#CFE0D6]">விளையாடிக்கொண்டே குறள் கற்போம் · Learn the Kurals by playing</p>
      </div>

      {/* ── Step 1 ── */}
      <h2 className={`mt-6 flex items-center gap-2.5 font-tamil-sans text-[18px] font-bold ${ink}`}>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[14px] ${step}`}>1</span>
        எந்தக் குறள்கள்? <span className={`text-[14px] font-semibold ${muted}`}>Which Kurals?</span>
      </h2>
      <div role="radiogroup" aria-label="எந்தக் குறள்கள்" className={`mt-3 grid grid-cols-2 gap-1 p-1 rounded-full border ${isDark ? 'bg-[#0F1210] border-[#2A302C]' : 'bg-[#EFEDE5] border-[#E2DFD3]'}`}>
        {([
          ['mine', ListChecks, 'என் வகுப்புக் குறள்கள்', 'என் வகுப்பு'],
          ['any', Shuffle, 'ஏதேனும் குறள்கள்', 'ஏதேனும்'],
        ] as const).map(([key, Icon, label, short]) => (
          <button
            key={key}
            role="radio"
            aria-checked={which === key}
            onClick={() => setWhich(key)}
            className={`flex items-center justify-center gap-2 rounded-full px-2 py-2.5 font-tamil-sans text-[14px] sm:text-[15px] font-semibold cursor-pointer transition-colors ${
              which === key ? 'bg-[#1D4234] text-[#F3D58E] shadow-sm' : `${ink} hover:bg-black/5`
            }`}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            <span className="hidden sm:inline">{label}</span><span className="sm:hidden">{short}</span>
          </button>
        ))}
      </div>
      <p className={`mt-2 text-[13px] ${muted}`}>
        {which === 'mine' ? 'உங்கள் வகுப்பில் படிக்கும் குறள்கள் மட்டும் · Only the Kurals from your class' : 'ஒவ்வொரு முறையும் புதிய குறள்கள் · A surprise set every time'}
      </p>

      {which === 'mine' && (
        <div className={`mt-3 rounded-2xl border px-4 py-4 ${card}`}>
          <label htmlFor="learn-nums" className={`block font-tamil-sans text-[14px] font-semibold ${ink}`}>
            குறள் எண்கள் <span className={`font-normal ${muted}`}>· Kural numbers, e.g. 1, 2, 5-10</span>
          </label>
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <input id="learn-nums" inputMode="numeric" value={setText} onChange={(e) => save(e.target.value)} placeholder="1, 2, 5-10" className={`flex-1 min-w-0 rounded-xl border px-4 py-3 text-[17px] outline-none ${field}`} />
            <select
              value=""
              onChange={(e) => {
                const n = +e.target.value;
                if (!n) return;
                const add = Array.from({ length: 10 }, (_, x) => (n - 1) * 10 + 1 + x);
                save(compactList([...new Set([...nums, ...add])]).replace(/,/g, ', '));
              }}
              aria-label="ஒரு அதிகாரம் முழுவதும் சேர் · Add a whole chapter"
              className={`sm:w-[230px] rounded-xl border px-3 py-3 text-[14px] font-tamil-sans cursor-pointer ${field}`}
            >
              <option value="">+ அதிகாரம் சேர் · Add a chapter</option>
              {CHAPTERS.map(([n, name]) => (
                <option key={n} value={n}>
                  {n}. {name} ({(n - 1) * 10 + 1}–{n * 10})
                </option>
              ))}
            </select>
          </div>
          {nums.length > 0 && (
            <>
              <div className={`mt-3 text-[13px] font-semibold ${muted}`}>{nums.length} குறள்கள் · தொட்டுப் படிக்கலாம்</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {nums.map((n) => (
                  <button
                    key={n}
                    onClick={() => onOpenKural(ALL_KURALS[n - 1])}
                    title={ALL_KURALS[n - 1]?.line1}
                    className={`min-w-[40px] h-9 px-3 rounded-full text-[14px] font-semibold cursor-pointer ${isDark ? 'bg-white/10 text-[#EEE8DC]' : 'bg-[#1D4234]/10 text-[#16392E] hover:bg-[#1D4234]/15'}`}
                  >
                    {n}
                  </button>
                ))}
                <button onClick={() => save('')} className={`ml-1 px-2 h-9 text-[13px] underline cursor-pointer ${muted}`}>
                  அழி · Clear
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Step 2 ── */}
      <h2 className={`mt-7 flex items-center gap-2.5 font-tamil-sans text-[18px] font-bold ${ink} ${ready ? '' : 'opacity-50'}`}>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[14px] ${step}`}>2</span>
        என்ன செய்யலாம்? <span className={`text-[14px] font-semibold ${muted}`}>What to do?</span>
      </h2>
      {!ready && <p className={`mt-1 text-[13px] ${muted}`}>முதலில் குறள் எண்களை உள்ளிடுங்கள் · First type the Kural numbers above</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {activities.map((a) => (
          <button
            key={a.key}
            onClick={() => ready && go(a.to)}
            disabled={!ready}
            className={`group flex items-center gap-4 text-left rounded-[20px] border px-4 py-4 sm:px-5 sm:py-5 cursor-pointer transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${card} hover:border-[#C9A45C]`}
          >
            <span className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl flex items-center justify-center ${a.tile}`}>
              <a.icon className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={1.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2 flex-wrap">
                <span className={`font-tamil-sans text-[19px] sm:text-[21px] font-bold ${ink}`}>{a.ta}</span>
                <span className={`text-[12px] font-semibold ${accent}`}>{a.en} · {a.tag}</span>
              </span>
              <span className={`block mt-0.5 text-[13.5px] leading-snug ${muted}`}>{a.desc}</span>
              <span className={`mt-2 inline-flex items-center gap-1 text-[14px] font-semibold ${isDark ? 'text-[#E3B866]' : 'text-[#1D4234]'}`}>
                {which === 'mine' && nums.length ? `${nums.length} குறள்கள் · ` : ''}தொடங்கு <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Today's quiz is the same for everyone, so it does not use the Kural choice */}
      <button
        onClick={() => go('#/quiz/today')}
        className="mt-3 w-full flex items-center gap-4 rounded-[20px] px-4 py-4 sm:px-5 text-left cursor-pointer text-[#F4EEDF] bg-[linear-gradient(160deg,#1D4234,#14302A)] hover:brightness-110 transition"
      >
        <span className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-[#E3B866] text-[#16392E]">
          <CalendarDays className="w-7 h-7" strokeWidth={1.7} />
        </span>
        <span className="min-w-0">
          <span className="block font-tamil-sans text-[18px] font-bold text-[#F3D58E]">இன்றைய வினா <span className="text-[13px] font-semibold text-[#CFE0D6]">· Today's quiz</span></span>
          <span className="block text-[13px] text-[#CFE0D6]">எல்லோருக்கும் ஒரே 10 கேள்விகள், மதிப்பெண்ணைப் பகிருங்கள் · Same 10 questions for everyone</span>
        </span>
        <ChevronRight className="w-5 h-5 ml-auto shrink-0 text-[#F3D58E]" />
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
