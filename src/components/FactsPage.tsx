import React, { useMemo } from 'react';
import { ALL_KURALS, getKuralByNumber } from '../data/kurals';
import { Kural } from '../types/kural';

interface FactsPageProps {
  isDark: boolean;
  onOpenKural: (k: Kural) => void;
  onOpenMap: () => void;
  onOpenVideos: () => void;
}

/**
 * சுவையான உண்மைகள் — interesting facts about Thirukkural, shown as small charts with one short line each.
 * Counts about the text are worked out from the Kurals on this site; history and monuments come from the
 * sources listed at the bottom.
 */

const ARAM = '#F2C879';
const PORUL = '#9BDB6A';
const INBAM = '#E8549A';
const BLUE = '#5D9BEA';

export const FactsPage: React.FC<FactsPageProps> = ({ isDark, onOpenKural, onOpenMap, onOpenVideos }) => {
  const ink = isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]';
  const body = isDark ? 'text-[#C9C3B6]' : 'text-[#3E4A44]';
  const muted = isDark ? 'text-[#8E9C94]' : 'text-[#6D766F]';
  const card = isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white/80 border-[#ECEBE5]';
  const track = isDark ? 'bg-white/[0.06]' : 'bg-black/[0.05]';
  const accent = isDark ? 'text-[#E3B866]' : 'text-[#9A6B12]';
  const green = isDark ? 'text-[#7FB39A]' : 'text-[#1D5A43]';
  const chip = isDark ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.09]' : 'border-[#E4E2DA] bg-white hover:bg-[#F3F1EA]';

  const songs = ALL_KURALS.filter((k) => k.media?.youtubeUrl).length;
  const open = (n: number) => onOpenKural(getKuralByNumber(n));

  // ── building blocks ──
  const Card = ({ title, en, children }: { title: string; en?: string; children: React.ReactNode }) => (
    <div className={`rounded-2xl border px-5 py-4 ${card}`}>
      <h3 className={`font-tamil-sans text-[17px] font-bold leading-snug ${ink}`}>{title}</h3>
      <div className="mt-3">{children}</div>
      {en && <p className={`mt-2.5 text-[12.5px] leading-relaxed ${muted}`}>{en}</p>}
    </div>
  );

  /** horizontal bar chart: label · bar · number */
  const Bars = ({ rows, max, color = BLUE, labelW = 'w-20' }: { rows: { label: React.ReactNode; n: number; color?: string; onClick?: () => void }[]; max?: number; color?: string; labelW?: string }) => {
    const top = max ?? Math.max(...rows.map((r) => r.n), 1);
    return (
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className={`flex items-center gap-2 ${r.onClick ? 'cursor-pointer' : ''}`} onClick={r.onClick}>
            <span className={`${labelW} shrink-0 font-tamil-sans text-[14px] ${ink}`}>{r.label}</span>
            <div className={`flex-1 h-5 rounded-md overflow-hidden ${track}`}>
              <div className="h-full rounded-md" style={{ width: `${(r.n / top) * 100}%`, minWidth: r.n ? 6 : 0, background: r.color ?? color }} />
            </div>
            <span className={`w-12 text-right text-[13px] font-semibold tabular-nums ${r.n ? accent : 'text-[#D9534F]'}`}>{r.n.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    );
  };

  const KuralChip = ({ n, label }: { n: number; label: string }) => (
    <button onClick={() => open(n)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13.5px] cursor-pointer ${chip}`}>
      <span className={`font-tamil-sans ${ink}`}>{label}</span>
      <span className={`text-[12px] font-semibold ${accent}`}>{n}</span>
    </button>
  );

  const Section = ({ ta, en, children }: { ta: string; en: string; children: React.ReactNode }) => (
    <section className="mt-9">
      <h2 className={`font-tamil-sans text-[21px] sm:text-[24px] font-bold ${ink}`}>{ta}</h2>
      <div className={`text-[13px] mb-3 ${muted}`}>{en}</div>
      <div className="grid gap-3 sm:grid-cols-2 items-start">{children}</div>
    </section>
  );

  const iyals: { ta: string; n: number; c: string }[] = [
    { ta: 'பாயிரம்', n: 4, c: ARAM },
    { ta: 'இல்லறம்', n: 20, c: ARAM },
    { ta: 'துறவறம்', n: 13, c: ARAM },
    { ta: 'ஊழ்', n: 1, c: ARAM },
    { ta: 'அரசியல்', n: 25, c: PORUL },
    { ta: 'அங்கவியல்', n: 32, c: PORUL },
    { ta: 'ஒழிபியல்', n: 13, c: PORUL },
    { ta: 'களவியல்', n: 7, c: INBAM },
    { ta: 'கற்பியல்', n: 18, c: INBAM },
  ];

  const dot = (c: string) => <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: c }} />;

  return (
    <div>
      <h1 className={`font-tamil-sans text-[26px] sm:text-[34px] font-bold tracking-tight ${ink}`}>திருக்குறள் — சுவையான உண்மைகள்</h1>
      <p className={`mt-1 text-[14px] ${muted}`}>Interesting facts about Thirukkural</p>

      {/* ───────── 1. the shape of the book ───────── */}
      <Section ta="எண்களில் திருக்குறள்" en="Thirukkural in numbers">
        <Card title="1330 குறள் = 133 அதிகாரம் × 10" en="Every chapter has exactly 10 couplets; every couplet has 2 lines and 7 metrical words (4 + 3).">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              ['1330', 'குறள்'],
              ['133', 'அதிகாரம்'],
              ['2660', 'அடிகள்'],
              ['9310', 'சீர்கள்'],
            ].map(([n, t]) => (
              <div key={t} className={`rounded-xl py-2 ${track}`}>
                <div className={`text-[20px] sm:text-[24px] font-bold tabular-nums ${accent}`}>{n}</div>
                <div className={`font-tamil-sans text-[12.5px] ${body}`}>{t}</div>
              </div>
            ))}
          </div>
          {/* one Kural = 4 + 3 */}
          <div className="mt-3 space-y-1">
            {[4, 3].map((c, row) => (
              <div key={row} className="flex items-center gap-1">
                {Array.from({ length: c }, (_, i) => (
                  <span key={i} className="h-3 w-10 rounded-full" style={{ background: row ? PORUL : ARAM }} />
                ))}
                <span className={`ml-1 text-[11.5px] ${muted} font-tamil-sans`}>{row ? 'இரண்டாம் அடி' : 'முதல் அடி'} — {c} சீர்</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="பாதிக்கு மேல் பொருட்பால்" en="More than half of all couplets (52.6%) are in the Book of Wealth.">
          <div className="flex h-7 w-full overflow-hidden rounded-full">
            {[
              { n: 380, c: ARAM },
              { n: 700, c: PORUL },
              { n: 250, c: INBAM },
            ].map((p) => (
              <div key={p.n} className="flex items-center justify-center text-[12px] font-semibold text-[#1B1A16]" style={{ width: `${(p.n / 1330) * 100}%`, background: p.c }}>
                {((p.n / 1330) * 100).toFixed(1)}%
              </div>
            ))}
          </div>
          <div className={`mt-2 flex justify-between font-tamil-sans text-[13px] ${body}`}>
            <span>அறம் 380</span>
            <span>பொருள் 700</span>
            <span>இன்பம் 250</span>
          </div>
        </Card>

        <Card title="9 இயல்கள் — எதில் எத்தனை அதிகாரம்" en="The 133 chapters are grouped into 9 sections. அங்கவியல் is the largest (32 chapters); ஊழியல் has just one.">
          <Bars rows={iyals.map((i) => ({ label: i.ta, n: i.n, color: i.c }))} labelW="w-24" />
        </Card>

        <Card title="'அ' முதல் 'ன்' வரை" en="The book opens with அ and ends with ன் — the first and last of the 30 Tamil letters, as Tolkappiyam defines them.">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => open(1)} className="text-center cursor-pointer">
              <div className={`font-tamil-sans text-[44px] font-bold leading-none ${accent}`}>அ</div>
              <div className={`mt-1 font-tamil-sans text-[13px] ${body}`}>அகர முதல…</div>
              <div className={`text-[11.5px] ${muted}`}>குறள் 1</div>
            </button>
            <div className={`flex-1 h-[2px] ${track}`} />
            <button onClick={() => open(1330)} className="text-center cursor-pointer">
              <div className={`font-tamil-sans text-[44px] font-bold leading-none ${accent}`}>ன்</div>
              <div className={`mt-1 font-tamil-sans text-[13px] ${body}`}>…முயங்கப் பெறின்</div>
              <div className={`text-[11.5px] ${muted}`}>குறள் 1330</div>
            </button>
          </div>
        </Card>
      </Section>

      {/* ───────── 2. words and letters ───────── */}
      <Section ta="சொற்களும் எழுத்துகளும்" en="Words and letters, counted from the 1330 couplets">
        <Card title="அதிகம் வரும் சொற்கள் எல்லாம் கடைசிச் சொற்கள்" en="Each of these words appears only as the closing word of a couplet — never in the middle.">
          <Bars
            rows={[
              ['படும்', 42],
              ['தரும்', 37],
              ['இல்', 32],
              ['கெடும்', 28],
              ['செயல்', 22],
              ['தலை', 21],
            ].map(([w, n]) => ({ label: w, n: n as number }))}
          />
        </Card>

        <Card title="இந்தச் சொற்கள் ஒரு முறைகூட இல்லை" en="தமிழ், கடவுள், குறள் and வள்ளுவர் never appear in the couplets — even though the first chapter is called கடவுள் வாழ்த்து.">
          <Bars rows={['தமிழ்', 'கடவுள்', 'குறள்', 'வள்ளுவர்'].map((w) => ({ label: w, n: 0 }))} max={1} />
        </Card>

        <Card title="உயிர் எழுத்துகள் — 'ஔ' ஒரு முறைகூட இல்லை" en="How often each vowel appears as a letter on its own. ஔ is never used — not even as a vowel sign (கௌ, சௌ…).">
          <Bars
            labelW="w-8"
            color={ARAM}
            rows={[
              ['அ', 834],
              ['இ', 671],
              ['உ', 582],
              ['எ', 449],
              ['ஆ', 206],
              ['ஒ', 202],
              ['ஊ', 69],
              ['ஏ', 64],
              ['ஈ', 49],
              ['ஓ', 32],
              ['ஐ', 19],
              ['ஔ', 0],
            ].map(([w, n]) => ({ label: w, n: n as number }))}
          />
        </Card>

        <Card title="அதிகம் வரும் எழுத்து — கடைசி எழுத்தான 'ன்'" en="ன், the letter the book ends on, is also its most used letter. The whole text has about 40,900 letters.">
          <Bars
            labelW="w-8"
            rows={[
              ['ன்', 2112],
              ['ம்', 1915],
              ['ல்', 1461],
              ['ர்', 1315],
              ['க', 1154],
            ].map(([w, n]) => ({ label: w, n: n as number }))}
          />
        </Card>

        <Card title="'… யாதெனின்?' — வள்ளுவர் கேட்கும் 10 கேள்விகள்" en="Valluvar asks 'What is it?' and answers in the same couplet. Tap one to read it.">
          <div className="flex flex-wrap gap-1.5">
            {[
              [291, 'வாய்மை'],
              [324, 'நல்லாறு'],
              [801, 'பழைமை'],
              [844, 'வெண்மை'],
              [831, 'பேதைமை'],
              [321, 'அறவினை'],
              [178, 'அஃகாமை'],
              [789, 'நட்பு'],
              [986, 'சால்பு'],
              [1041, 'இன்மை'],
            ].map(([n, w]) => (
              <KuralChip key={n} n={n as number} label={`${w} யாதெனின்?`} />
            ))}
          </div>
        </Card>

        <Card title="பெயர் சொல்லப்படும் மலர்கள்" en="அனிச்சம், said to wilt at a mere sniff, is the favourite. தாமரை appears only inside names (தாமரையினாள், தாமரைக் கண்ணான்). Tap a flower to read one.">
          <Bars
            color={INBAM}
            rows={[
              { label: 'மலர்', n: 5, onClick: () => open(1112) },
              { label: 'அனிச்சம்', n: 4, onClick: () => open(1111) },
              { label: 'தாமரை', n: 2, onClick: () => open(1103) },
              { label: 'குவளை', n: 1, onClick: () => open(1114) },
            ]}
          />
        </Card>

        <Card title="குறளில் வரும் 10 விலங்குகள்" en="யானை leads with 8 couplets — courage, strength and pride. The yak that dies if it loses its hair stands for honour (969). Tap an animal to read one.">
          <Bars
            color={PORUL}
            labelW="w-24"
            rows={[
              { label: 'யானை', n: 8, onClick: () => open(599) },
              { label: 'ஆ (பசு)', n: 3, onClick: () => open(1066) },
              { label: 'புலி', n: 2, onClick: () => open(273) },
              { label: 'பாம்பு', n: 2, onClick: () => open(890) },
              { label: 'நரி', n: 1, onClick: () => open(500) },
              { label: 'முயல்', n: 1, onClick: () => open(772) },
              { label: 'கவரிமா', n: 1, onClick: () => open(969) },
              { label: 'ஏறு', n: 1, onClick: () => open(59) },
              { label: 'பகடு', n: 1, onClick: () => open(624) },
              { label: 'மா (குதிரை)', n: 1, onClick: () => open(814) },
            ]}
          />
        </Card>

        <Card title="குறளில் வரும் 5 பறவைகள்" en="Each bird is a lesson: the crow that beats the owl by day (481), the heron that waits for its moment (490). மயில் counts its feather too (பீலி, 475). Tap a bird to read one.">
          <Bars
            color={ARAM}
            rows={[
              { label: 'காக்கை', n: 2, onClick: () => open(527) },
              { label: 'மயில்', n: 2, onClick: () => open(1081) },
              { label: 'கூகை', n: 1, onClick: () => open(481) },
              { label: 'கொக்கு', n: 1, onClick: () => open(490) },
              { label: 'அன்னம்', n: 1, onClick: () => open(1120) },
            ]}
          />
        </Card>

        <Card title="குறளில் வரும் 3 நீர்வாழ் உயிரினங்கள்" en="The tortoise that pulls in its limbs (126), the crocodile that wins only in deep water (495), and the fish that swallows the hook (931). Tap one to read it.">
          <Bars
            color={BLUE}
            rows={[
              { label: 'ஆமை', n: 1, onClick: () => open(126) },
              { label: 'முதலை', n: 1, onClick: () => open(495) },
              { label: 'மீன்', n: 1, onClick: () => open(931) },
            ]}
          />
        </Card>

        <Card title="சிறிய குறளும் நீண்ட குறளும்" en="Counted in Tamil letters. Tap one to read it.">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[13px] w-24 ${body} font-tamil-sans`}>23 எழுத்து</span>
            <KuralChip n={833} label="குறள்" />
            <KuralChip n={1304} label="குறள்" />
            <KuralChip n={1329} label="குறள்" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`text-[13px] w-24 ${body} font-tamil-sans`}>39 எழுத்து</span>
            <KuralChip n={957} label="குறள்" />
            <KuralChip n={1246} label="குறள்" />
          </div>
        </Card>

        <Card title="5,180 சொற்கள் ஒரே ஒரு முறைதான்" en="Out of 9,310 metrical words there are about 6,340 different word forms, and about 5,180 of them are used only once (counts shift a little with how sandhi is split).">
          <Bars
            color={PORUL}
            labelW="w-28"
            rows={[
              { label: 'மொத்தச் சீர்கள்', n: 9310 },
              { label: 'வெவ்வேறு சொற்கள்', n: 6340 },
              { label: 'ஒரே ஒரு முறை', n: 5180 },
            ]}
          />
        </Card>
      </Section>

      {/* ───────── 3. history and stone ───────── */}
      <Section ta="வரலாறும் நினைவுச் சின்னங்களும்" en="History and monuments">
        <Card title="காலவரிசை" en="From palm leaves to more than 40 languages.">
          <ol className="relative ml-2 border-l-2 border-[#E3B866]/50 space-y-3">
            {[
              ['1730', 'வீரமாமுனிவர் லத்தீனில் மொழிபெயர்ப்பு'],
              ['1812', 'முதல் அச்சுப் பதிப்பு'],
              ['1976', 'சென்னையில் வள்ளுவர் கோட்டம்'],
              ['2000', 'கன்னியாகுமரியில் 133 அடி சிலை'],
              ['2014', '42+ மொழிகள்; ஆங்கிலத்தில் 57 மொழிபெயர்ப்புகள்'],
            ].map(([y, t]) => (
              <li key={y} className="pl-4 relative">
                <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#E3B866]" />
                <span className={`text-[14px] font-bold tabular-nums ${accent}`}>{y}</span>
                <span className={`ml-2 font-tamil-sans text-[14px] ${body}`}>{t}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="133 அடி = 38 + 95" en="Kanyakumari statue: a 38 ft pedestal for the 38 chapters of Aram, and a 95 ft statue for Porul (70) and Inbam (25). Virtue is the foundation.">
          <div className="flex items-end gap-4">
            <div className="flex flex-col w-16 rounded-lg overflow-hidden" style={{ height: 150 }}>
              <div className="flex items-center justify-center text-[12px] font-bold text-[#1B1A16]" style={{ height: `${(95 / 133) * 100}%`, background: `linear-gradient(${INBAM} ${(25 / 95) * 100}%, ${PORUL} 0)` }}>
                95
              </div>
              <div className="flex items-center justify-center text-[12px] font-bold text-[#1B1A16]" style={{ height: `${(38 / 133) * 100}%`, background: ARAM }}>
                38
              </div>
            </div>
            <div className={`font-tamil-sans text-[14px] leading-relaxed ${body}`}>
              <div>{dot(INBAM)}சிலை — இன்பம் 25</div>
              <div>{dot(PORUL)}சிலை — பொருள் 70</div>
              <div>{dot(ARAM)}அடித்தளம் — அறம் 38</div>
              <div className={`mt-1 text-[13px] ${muted}`}>அறமே அடித்தளம்</div>
            </div>
          </div>
        </Card>

        <Card title="உரையாசிரியர்கள் பதின்மர் — இன்று கிடைப்பவை 5" en="Ten classic commentators (10th–13th century); only five survive in near-complete form. Manakkudavar is the oldest, Parimelazhagar (c. 1271–72) the last.">
          <div className="flex flex-wrap gap-1.5">
            {[
              ['மணக்குடவர்', true],
              ['பரிதி', true],
              ['பரிப்பெருமாள்', true],
              ['காலிங்கர்', true],
              ['பரிமேலழகர்', true],
              ['தருமர்', false],
              ['தாமத்தர்', false],
              ['நச்சர்', false],
              ['திருமலையர்', false],
              ['மல்லர்', false],
            ].map(([n, ok]) => (
              <span
                key={n as string}
                className={`rounded-full px-3 py-1 font-tamil-sans text-[13px] border ${ok ? 'border-transparent text-[#1B1A16]' : `${chip} ${muted} opacity-70`}`}
                style={ok ? { background: ARAM } : undefined}
              >
                {n}
              </span>
            ))}
          </div>
        </Card>

        <Card title="வள்ளுவர் கோட்டம் — கல்லில் 1330 குறள்" en="Chennai, 1976: shaped like the Thiruvarur temple chariot, with all 1330 couplets carved in granite.">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['1976', 'கட்டப்பட்டது'],
              ['39 மீ', 'தேரின் உயரம்'],
              ['1330', 'கல்லில் குறள்'],
            ].map(([n, t]) => (
              <div key={t} className={`rounded-xl py-2 ${track}`}>
                <div className={`text-[20px] font-bold ${accent}`}>{n}</div>
                <div className={`font-tamil-sans text-[12.5px] ${body}`}>{t}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ───────── 4. on this site ───────── */}
      <Section ta="இசையில் திருக்குறள்" en="Thirukkural in music, on this site">
        <Card title={`${songs} குறள்கள் பாடலாக`} en="Songs added so far, out of 1330. New ones keep coming.">
          <div className={`h-6 w-full rounded-full overflow-hidden ${track}`}>
            <div className="h-full rounded-full flex items-center justify-end pr-2 text-[12px] font-bold text-[#1B1A16]" style={{ width: `${Math.max(12, (songs / 1330) * 100)}%`, background: '#E3B866' }}>
              {((songs / 1330) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={onOpenVideos} className="rounded-xl bg-[#E3B866] text-[#1B1A16] px-4 py-2 text-sm font-semibold cursor-pointer hover:brightness-105 font-tamil-sans">
              பாடல்களைக் கேளுங்கள்
            </button>
            <button onClick={onOpenMap} className={`rounded-xl border px-4 py-2 text-sm cursor-pointer font-tamil-sans ${isDark ? 'border-white/15 text-white hover:bg-white/10' : 'border-[#C9D6CD] text-[#1D5A43] hover:bg-[#1D5A43]/5'}`}>
              குறள் வரைபடத்தில் தேடுங்கள்
            </button>
          </div>
        </Card>
      </Section>

      <p className={`mt-6 text-[12px] ${muted}`}>
        சொல், எழுத்து எண்ணிக்கைகள் இத்தளத்தில் உள்ள குறள் பாடத்தைக் கொண்டு கணக்கிடப்பட்டவை. · Word and letter counts are worked out from the Kural text on this site.
      </p>

      <section className={`mt-6 text-[12.5px] leading-relaxed ${muted}`}>
        <div className={`font-semibold ${green}`}>ஆதாரங்கள் · Sources</div>
        <ul className="mt-1 space-y-0.5">
          <li>
            <a className="underline" href="https://en.wikipedia.org/wiki/Kural" target="_blank" rel="noreferrer">Kural — Wikipedia</a> (first printed edition, 1812)
          </li>
          <li>
            <a className="underline" href="https://en.wikipedia.org/wiki/Tirukkural_translations" target="_blank" rel="noreferrer">Tirukkural translations — Wikipedia</a> (languages, English versions, Beschi's Latin translation)
          </li>
          <li>
            <a className="underline" href="https://en.wikipedia.org/wiki/Ten_Medieval_Commentators" target="_blank" rel="noreferrer">Ten Medieval Commentators — Wikipedia</a>
          </li>
          <li>
            <a className="underline" href="https://incredibleindia.gov.in/en/tamil-nadu/kanniyakumari/thiruvalluvar-statue" target="_blank" rel="noreferrer">Thiruvalluvar Statue — Incredible India</a>,{' '}
            <a className="underline" href="https://janataweekly.org/articles/the-enduring-legacy-of-tiruvalluvar" target="_blank" rel="noreferrer">25th anniversary — Janata Weekly</a>
          </li>
          <li>
            <a className="underline" href="https://chennai.nic.in/tourist-place/valluvarkottam/" target="_blank" rel="noreferrer">Valluvar Kottam — Chennai District</a>
          </li>
          <li>
            <a className="underline" href="https://ta.wikisource.org/wiki/தொல்காப்பியம்-எழுத்ததிகாரம்-இயல்1.நூன்மரபு-இளம்பூரணர்_உரை" target="_blank" rel="noreferrer">தொல்காப்பியம், நூன்மரபு — விக்கிமூலம்</a> (அகர முதல் னகர இறுவாய்)
          </li>
        </ul>
      </section>
    </div>
  );
};

export default FactsPage;
