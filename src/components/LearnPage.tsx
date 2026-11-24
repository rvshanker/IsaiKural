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

  const [showList, setShowList] = useState(false);
  const activities = [
    { key: 'play', icon: Puzzle, tile: 'bg-[#1D4234] text-[#F3D58E]', ta: 'சொல் விளையாட்டு', sub: 'சொற்களை இழுத்துக் குறளை நிரப்பு · Word game', to: `#/play/${setPart}`, needsSet: true },
    { key: 'quiz', icon: CircleHelp, tile: 'bg-[#E3B866] text-[#16392E]', ta: 'வினாடி வினா', sub: '10 கேள்விகள் · Quiz', to: `#/quiz/${setPart}`, needsSet: true },
    { key: 'today', icon: CalendarDays, tile: 'bg-[#2F6B55] text-white', ta: 'இன்றைய வினா', sub: 'எல்லோருக்கும் ஒரே 10 கேள்விகள் · Today’s quiz', to: '#/quiz/today', needsSet: false },
  ];
  const shareLink = async () => {
    const url = `https://isaikural.com/#/learn/${compactList(nums)}`;
    const r = await shareText(`திருக்குறள் பயிற்சி — குறள் ${compactList(nums).replace(/,/g, ', ')}\n${url}`, 'திருக்குறள் பயிற்சி');
    if (r === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="mt-1">
      <h1 className={`font-tamil-sans text-[24px] sm:text-[30px] font-bold leading-tight ${ink}`}>கற்போம்</h1>
      <p className={`text-[13.5px] ${muted}`}>விளையாடிக்கொண்டே குறள் கற்போம் · Learn by playing</p>

      {/* Which Kurals: one small card */}
      <div className={`mt-4 rounded-2xl border p-3 ${card}`}>
        <div role="radiogroup" aria-label="எந்தக் குறள்கள்" className={`grid grid-cols-2 gap-1 p-1 rounded-full ${isDark ? 'bg-[#0F1210]' : 'bg-[#EFEDE5]'}`}>
          {([
            ['any', Shuffle, 'ஏதேனும் குறள்கள்', 'ஏதேனும்'],
            ['mine', ListChecks, 'என் வகுப்பு', 'என் வகுப்பு'],
          ] as const).map(([key, Icon, label, short]) => (
            <button
              key={key}
              role="radio"
              aria-checked={which === key}
              onClick={() => setWhich(key)}
              className={`flex items-center justify-center gap-1.5 rounded-full px-2 py-2 font-tamil-sans text-[14px] font-semibold cursor-pointer transition-colors ${
                which === key ? 'bg-[#1D4234] text-[#F3D58E] shadow-sm' : `${ink} hover:bg-black/5`
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </button>
          ))}
        </div>

        {which === 'mine' && (
          <div className="mt-3">
            <div className="flex gap-2">
              <input
                id="learn-nums"
                inputMode="numeric"
                value={setText}
                onChange={(e) => save(e.target.value)}
                placeholder="குறள் எண்கள்: 1, 2, 5-10"
                aria-label="குறள் எண்கள் · Kural numbers, e.g. 1, 2, 5-10"
                className={`flex-1 min-w-0 rounded-xl border px-3.5 py-2.5 text-[16px] outline-none ${field}`}
              />
              <select
                value=""
                onChange={(e) => {
                  const n = +e.target.value;
                  if (!n) return;
                  const add = Array.from({ length: 10 }, (_, x) => (n - 1) * 10 + 1 + x);
                  save(compactList([...new Set([...nums, ...add])]).replace(/,/g, ', '));
                }}
                aria-label="ஒரு அதிகாரம் முழுவதும் சேர் · Add a whole chapter"
                className={`w-[128px] shrink-0 rounded-xl border px-2 py-2.5 text-[13.5px] font-tamil-sans cursor-pointer ${field}`}
              >
                <option value="">+ அதிகாரம்</option>
                {CHAPTERS.map(([n, name]) => (
                  <option key={n} value={n}>
                    {n}. {name} ({(n - 1) * 10 + 1}–{n * 10})
                  </option>
                ))}
              </select>
            </div>
            {nums.length > 0 && (
              <div className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] ${muted}`}>
                <button onClick={() => setShowList((v) => !v)} className="font-semibold underline-offset-2 hover:underline cursor-pointer" aria-expanded={showList}>
                  {nums.length} குறள்கள் {showList ? '▴' : '▾'}
                </button>
                <button onClick={shareLink} className="inline-flex items-center gap-1 hover:underline cursor-pointer" title="மாணவர்களுக்கு இணைப்பு அனுப்ப · Send students a link">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copied ? 'நகலெடுக்கப்பட்டது' : 'இணைப்பைப் பகிர்'}
                </button>
                <button onClick={() => save('')} className="hover:underline cursor-pointer">அழி</button>
              </div>
            )}
            {showList && nums.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {nums.map((n) => (
                  <button
                    key={n}
                    onClick={() => onOpenKural(ALL_KURALS[n - 1])}
                    title={ALL_KURALS[n - 1]?.line1}
                    className={`min-w-[38px] h-8 px-2.5 rounded-full text-[13.5px] font-semibold cursor-pointer ${isDark ? 'bg-white/10 text-[#EEE8DC]' : 'bg-[#1D4234]/10 text-[#16392E]'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* What to do: three short rows */}
      <div className="mt-3 space-y-2">
        {activities.map((a) => {
          const off = a.needsSet && !ready;
          return (
            <button
              key={a.key}
              onClick={() => !off && go(a.to)}
              disabled={off}
              className={`group w-full flex items-center gap-3.5 rounded-2xl border px-3.5 py-3 text-left cursor-pointer transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${card} hover:border-[#C9A45C]`}
            >
              <span className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${a.tile}`}>
                <a.icon className="w-7 h-7" strokeWidth={1.7} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block font-tamil-sans text-[17px] font-bold leading-tight ${ink}`}>{a.ta}</span>
                <span className={`block text-[13px] truncate ${muted}`}>
                  {off ? 'முதலில் குறள் எண்களை உள்ளிடுங்கள்' : a.needsSet && which === 'mine' ? `${nums.length} குறள்கள் · ${a.sub}` : a.sub}
                </span>
              </span>
              <ChevronRight className={`w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5 ${accent}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LearnPage;
