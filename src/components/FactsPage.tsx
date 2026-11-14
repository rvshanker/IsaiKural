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
 * சுவையான உண்மைகள் — interesting facts about Thirukkural.
 * Facts about the text itself are worked out from the Kurals on this site; facts about history and
 * monuments come from the sources listed at the bottom of the page.
 */
export const FactsPage: React.FC<FactsPageProps> = ({ isDark, onOpenKural, onOpenMap, onOpenVideos }) => {
  const ink = isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]';
  const body = isDark ? 'text-[#C9C3B6]' : 'text-[#3E4A44]';
  const muted = isDark ? 'text-[#8E9C94]' : 'text-[#6D766F]';
  const card = isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white/80 border-[#ECEBE5]';
  const accent = isDark ? 'text-[#E3B866]' : 'text-[#9A6B12]';
  const green = isDark ? 'text-[#7FB39A]' : 'text-[#1D5A43]';

  const songs = useMemo(() => ALL_KURALS.filter((k) => k.media?.youtubeUrl).length, []);
  const first = getKuralByNumber(1);
  const last = getKuralByNumber(1330);

  const KuralLink = ({ n }: { n: number }) => (
    <button onClick={() => onOpenKural(getKuralByNumber(n))} className={`font-semibold underline decoration-dotted underline-offset-4 cursor-pointer ${accent}`}>
      குறள் {n}
    </button>
  );

  const Stat = ({ big, ta, en }: { big: string; ta: string; en: string }) => (
    <div className={`rounded-2xl border px-4 py-4 ${card}`}>
      <div className={`text-[30px] sm:text-[36px] font-bold leading-none ${accent}`}>{big}</div>
      <div className={`mt-2 font-tamil-sans text-[15px] font-semibold ${ink}`}>{ta}</div>
      <div className={`text-[12.5px] ${muted}`}>{en}</div>
    </div>
  );

  const Fact = ({ title, en, children }: { title: string; en: string; children: React.ReactNode }) => (
    <div className={`rounded-2xl border px-5 py-4 ${card}`}>
      <h3 className={`font-tamil-sans text-[17px] font-bold ${ink}`}>{title}</h3>
      <div className={`mt-1.5 font-tamil-sans text-[15px] leading-relaxed ${body}`}>{children}</div>
      <p className={`mt-2 text-[13px] leading-relaxed ${muted}`}>{en}</p>
    </div>
  );

  const Section = ({ ta, en, children }: { ta: string; en: string; children: React.ReactNode }) => (
    <section className="mt-9">
      <h2 className={`font-tamil-sans text-[21px] sm:text-[24px] font-bold ${ink}`}>{ta}</h2>
      <div className={`text-[13px] mb-3 ${muted}`}>{en}</div>
      {children}
    </section>
  );

  return (
    <div>
      <h1 className={`font-tamil-sans text-[26px] sm:text-[34px] font-bold tracking-tight ${ink}`}>திருக்குறள் — சுவையான உண்மைகள்</h1>
      <p className={`mt-1 text-[14px] ${muted}`}>Interesting facts about Thirukkural</p>

      <Section ta="எண்களில் திருக்குறள்" en="Thirukkural in numbers">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat big="1330" ta="குறள்கள்" en="couplets" />
          <Stat big="133" ta="அதிகாரங்கள் — ஒவ்வொன்றிலும் 10" en="chapters, 10 couplets each" />
          <Stat big="3" ta="பால்கள் — அறம், பொருள், இன்பம்" en="books: virtue, wealth, love" />
          <Stat big="9" ta="இயல்கள்" en="sections across the three books" />
          <Stat big="7" ta="சீர்கள் ஒவ்வொரு குறளிலும் (4 + 3)" en="metrical words in every couplet: 4 on the first line, 3 on the second" />
          <Stat big="38 · 70 · 25" ta="அதிகாரங்கள் — அறம் · பொருள் · இன்பம்" en="chapters in each book (380 · 700 · 250 couplets)" />
        </div>
      </Section>

      <Section ta="சொற்களில் ஒளிந்திருக்கும் சுவை" en="Hidden in the words">
        <div className="grid gap-3 sm:grid-cols-2">
          <Fact title="'அ'வில் தொடங்கி 'ன்'இல் முடிகிறது" en="The book opens with அ, the first letter of the Tamil alphabet, and its last couplet ends with ன், the last letter.">
            முதல் குறள் “{first.line1.split(' ')[0]}” என்று <b>அ</b>கரத்தில் தொடங்குகிறது (<KuralLink n={1} />). கடைசிக் குறள் “
            {last.line2.replace(/\.$/, '').split(' ').pop()}” என்று <b>ன்</b>-இல் முடிகிறது (<KuralLink n={1330} />). தமிழ் எழுத்துகளின் முதல் எழுத்தும் கடைசி எழுத்தும் இவையே.
          </Fact>
          <Fact title="'தமிழ்' என்ற சொல்லே இல்லை" en="The word 'Tamil' does not appear in any of the 1330 couplets.">
            தமிழின் பெருமைமிகு நூலான திருக்குறளின் 1330 குறள்களில் ஒன்றில் கூட “தமிழ்” என்ற சொல் வரவில்லை.
          </Fact>
          <Fact title="'கடவுள்' என்ற சொல்லும் இல்லை" en="The first chapter is called கடவுள் வாழ்த்து, yet the word கடவுள் itself never appears in the couplets.">
            முதல் அதிகாரத்தின் பெயர் “கடவுள் வாழ்த்து”. ஆனால் குறள்களில் “கடவுள்” என்ற சொல் எங்கும் இல்லை — இறைவனை ஆதிபகவன், இறைவன், வாலறிவன் என்றே வள்ளுவர் குறிக்கிறார்.
          </Fact>
          <Fact title="'ஔ' எழுத்து வராத நூல்" en="The letter ஔ (and its vowel sign ௌ) does not appear anywhere in the text.">
            உயிர் எழுத்து “ஔ” திருக்குறளில் ஒரு முறைகூட வரவில்லை — தனியாகவோ, கௌ, சௌ போல உயிர்மெய்யாகவோ கூட இல்லை. ஆனால் ஆய்த எழுத்து “ஃ” 48 குறள்களில் வருகிறது.
          </Fact>
          <Fact title="நூலின் பெயரும் ஆசிரியர் பெயரும் உள்ளே இல்லை" en="Neither the words 'குறள்' nor 'வள்ளுவர்' appear in the couplets.">
            “குறள்”, “திருக்குறள்”, “வள்ளுவர்” — இந்தச் சொற்கள் எதுவும் 1330 குறள்களில் வரவில்லை. நூலுக்கும் ஆசிரியருக்கும் பின்னாளில் வந்த பெயர்கள் இவை.
          </Fact>
          <Fact title="'… எனப்படுவது யாதெனின்' — கேள்வியும் பதிலும்" en="Valluvar often asks 'What is X?' and answers it himself. யாதெனின் ('if you ask what it is') appears in 10 couplets; the full phrase 'எனப்படுவது யாதெனின் யாதொன்றும்' appears twice.">
            “வாய்மை எனப்படுவது யாதெனின் யாதொன்றும் தீமை இலாத சொலல்” (<KuralLink n={291} />), “நல்லாறு எனப்படுவது யாதெனின் யாதொன்றும் கொல்லாமை சூழும் நெறி” (<KuralLink n={324} />) — ஒரே வடிவில் இரண்டு குறள்கள். “யாதெனின்” மொத்தம் 10 குறள்களில் வருகிறது: பழைமை (<KuralLink n={801} />), வெண்மை (<KuralLink n={844} />), பேதைமை (<KuralLink n={831} />) போன்றவற்றையும் வள்ளுவர் இப்படியே கேட்டு விளக்குகிறார். “யாதொன்றும்” 5 குறள்களில் வருகிறது.
          </Fact>
          <Fact title="அனிச்சம் — மிக மென்மையான மலர்" en="The anicham flower, said to wilt at a mere sniff, appears in 4 couplets: once for how gently a guest must be treated, and three times to praise the beloved's tenderness.">
            முகர்ந்தாலே வாடும் அனிச்ச மலர் 4 குறள்களில் வருகிறது. விருந்தினர் முகம் கோணினாலே வாடுவர் என்று விருந்தோம்பலில் (<KuralLink n={90} />); காதலி அனிச்சத்தை விட மென்மையானவள் என்று நலம் புனைந்துரைத்தலில் மூன்று முறை (<KuralLink n={1111} />, <KuralLink n={1115} />, <KuralLink n={1120} />).
          </Fact>
        </div>
        <p className={`mt-2 text-[12px] ${muted}`}>
          இந்தப் பகுதியின் எண்ணிக்கைகள் இத்தளத்தில் உள்ள குறள் பாடத்தைக் கொண்டு கணக்கிடப்பட்டவை. · Counts in this section are worked out from the Kural text on this site.
        </p>
      </Section>

      <Section ta="எண்களின் கதை" en="By the numbers: what a word-by-word count of the 1330 couplets shows">
        <div className="grid gap-3 sm:grid-cols-2 items-start">
          {/* three books as one bar */}
          <div className={`rounded-2xl border px-5 py-4 ${card}`}>
            <h3 className={`font-tamil-sans text-[17px] font-bold ${ink}`}>பாதிக்கு மேல் பொருட்பால்</h3>
            <div className="mt-3 flex h-7 w-full overflow-hidden rounded-full">
              {[
                { ta: 'அறம்', n: 380, c: '#F2C879' },
                { ta: 'பொருள்', n: 700, c: '#9BDB6A' },
                { ta: 'இன்பம்', n: 250, c: '#E8549A' },
              ].map((p) => (
                <div key={p.ta} className="flex items-center justify-center text-[12px] font-semibold text-[#1B1A16]" style={{ width: `${(p.n / 1330) * 100}%`, background: p.c }}>
                  {((p.n / 1330) * 100).toFixed(1)}%
                </div>
              ))}
            </div>
            <div className={`mt-2 flex justify-between font-tamil-sans text-[13px] ${body}`}>
              <span>அறம் 380</span>
              <span>பொருள் 700</span>
              <span>இன்பம் 250</span>
            </div>
            <p className={`mt-2 text-[13px] ${muted}`}>More than half of all couplets (52.6%) are in the Book of Wealth.</p>
          </div>

          {/* last-word chart */}
          <div className={`rounded-2xl border px-5 py-4 ${card}`}>
            <h3 className={`font-tamil-sans text-[17px] font-bold ${ink}`}>அதிகம் வரும் சொற்கள் எல்லாம் கடைசிச் சொற்கள்</h3>
            <div className="mt-3 space-y-1.5">
              {[
                ['படும்', 42],
                ['தரும்', 37],
                ['இல்', 32],
                ['கெடும்', 28],
                ['செயல்', 22],
                ['தலை', 21],
              ].map(([w, n]) => (
                <div key={w as string} className="flex items-center gap-2">
                  <span className={`w-16 shrink-0 font-tamil-sans text-[14px] ${ink}`}>{w}</span>
                  <div className="flex-1 h-5 rounded-md bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div className="h-full rounded-md bg-[#5D9BEA]" style={{ width: `${((n as number) / 42) * 100}%` }} />
                  </div>
                  <span className={`w-7 text-right text-[13px] font-semibold ${accent}`}>{n}</span>
                </div>
              ))}
            </div>
            <p className={`mt-2 font-tamil-sans text-[14px] leading-relaxed ${body}`}>இந்தச் சொற்கள் ஒவ்வொன்றும் குறளின் இறுதிச் சொல்லாக மட்டுமே வருகின்றன — நடுவில் ஒரு முறைகூட இல்லை.</p>
            <p className={`mt-1 text-[13px] ${muted}`}>Each of these top words appears only as the closing word of a couplet, never in the middle.</p>
          </div>

          <Fact title="கடைசி எழுத்தே அதிகம் வரும் எழுத்து" en="ன், the letter the book ends on, is also its most used letter: 2,112 times, ahead of ம் (1,915), ல் (1,461) and ர் (1,315).">
            நூல் முடியும் எழுத்தான <b>ன்</b>, திருக்குறளில் அதிகம் வரும் எழுத்தும் கூட — 2,112 முறை. அடுத்து ம் (1,915), ல் (1,461), ர் (1,315). மொத்தம் சுமார் 40,900 எழுத்துகள்.
          </Fact>
          <Fact title="9,310 சீர்கள் — 6,300-க்கும் மேற்பட்ட சொல் வடிவங்கள்" en="1330 × 7 = 9,310 metrical words. About 6,340 different word forms are used, and about 5,180 of them appear only once.">
            1330 குறள் × 7 சீர் = 9,310 சீர்கள். அவற்றில் சுமார் 6,340 வெவ்வேறு சொல் வடிவங்கள்; அவற்றில் ஏறத்தாழ 5,180 ஒரே ஒரு முறைதான் வருகின்றன. (சந்தியைப் பிரிக்கும் முறையைப் பொறுத்து எண்ணிக்கை சிறிது மாறும்.)
          </Fact>
          <Fact title="சிறிய குறளும் நீண்ட குறளும்" en="The shortest couplets have 23 letters (833, 1304, 1329); the longest have 39 (957, 1246).">
            மிகச் சிறியவை 23 எழுத்துகள் — <KuralLink n={833} />, <KuralLink n={1304} />, <KuralLink n={1329} />. மிக நீளமானவை 39 எழுத்துகள் — <KuralLink n={957} />, <KuralLink n={1246} />.
          </Fact>
          <Fact title="பெயர் சொல்லப்படும் மலர்கள்" en="Named flowers: anicham (4 couplets), kuvalai, the blue water lily (1114), and the lotus, only in epithets such as தாமரையினாள் (617) and தாமரைக் கண்ணான் (1103).">
            அனிச்சம் (4 குறள்கள்), குவளை (<KuralLink n={1114} />). தாமரை “தாமரையினாள்” (<KuralLink n={617} />), “தாமரைக் கண்ணான்” (<KuralLink n={1103} />) என்று பெயர்களுக்குள் மட்டும் வருகிறது. “மலர்” என்ற பொதுச் சொல் 5 குறள்களில் வருகிறது.
          </Fact>
        </div>
      </Section>

      <Section ta="நூலின் வரலாறு" en="History of the book">
        <div className="grid gap-3 sm:grid-cols-2">
          <Fact title="1812 — முதல் அச்சுப் பதிப்பு" en="The first known printed edition appeared in 1812; before that the Kural survived on palm-leaf manuscripts.">
            பல நூற்றாண்டுகள் ஓலைச்சுவடிகளில் வாழ்ந்த திருக்குறள், 1812-ல் முதன்முதலில் அச்சானது. அன்று முதல் அச்சில் இல்லாத காலமே இல்லை.
          </Fact>
          <Fact title="40-க்கும் மேற்பட்ட மொழிகளில்" en="One of the most widely translated non-religious works: 40+ languages, and 57 English versions by 2014.">
            உலகில் அதிகம் மொழிபெயர்க்கப்பட்ட சமயம் சாரா நூல்களில் ஒன்று. 2014 வரை 42-க்கும் மேற்பட்ட மொழிகளில், ஆங்கிலத்தில் மட்டும் 57 மொழிபெயர்ப்புகள்.
          </Fact>
          <Fact title="1730 — ஐரோப்பாவுக்கு லத்தீன் வழியாக" en="Constantius Joseph Beschi (Veeramamunivar) translated it into Latin in 1730, introducing it to Europe.">
            வீரமாமுனிவர் (பெஸ்கி) 1730-ல் லத்தீனில் மொழிபெயர்த்தார் — ஐரோப்பியர் திருக்குறளை அறிந்தது இப்படித்தான்.
          </Fact>
          <Fact title="உரையாசிரியர்கள் பதின்மர்" en="Ten medieval scholars (10th–13th century) wrote the classic commentaries; only five survive in near-complete form.">
            தருமர், மணக்குடவர், தாமத்தர், நச்சர், பரிதி, பரிமேலழகர், திருமலையர், மல்லர், பரிப்பெருமாள், காலிங்கர் — இவர்களுள் மணக்குடவர் மிகப் பழையவர், பரிமேலழகர் கடைசியானவர் (சுமார் கி.பி. 1271–72).
          </Fact>
        </div>
      </Section>

      <Section ta="கல்லில் திருக்குறள்" en="Thirukkural in stone">
        <div className="grid gap-3 sm:grid-cols-2">
          <Fact title="கன்னியாகுமரி — 133 அடி சிலை" en="The Kanyakumari statue is 133 ft tall for the 133 chapters: a 38 ft pedestal for the 38 chapters of Aram, and a 95 ft statue for the 70 + 25 chapters of Porul and Inbam.">
            சிலையின் மொத்த உயரம் 133 அடி — 133 அதிகாரங்களுக்கு. அடித்தளம் 38 அடி (அறத்துப்பாலின் 38 அதிகாரங்கள்), சிலை 95 அடி (பொருள் 70 + இன்பம் 25). அறமே அடித்தளம் என்பதன் அடையாளம்.
          </Fact>
          <Fact title="வள்ளுவர் கோட்டம், சென்னை" en="Built in 1976 like a temple chariot, 39 m tall, with all 1330 couplets carved in granite.">
            1976-ல் கட்டப்பட்ட வள்ளுவர் கோட்டம் திருவாரூர்த் தேர் வடிவில் 39 மீட்டர் உயரம் கொண்டது. 1330 குறள்களும் கருங்கல்லில் செதுக்கப்பட்டுள்ளன.
          </Fact>
        </div>
      </Section>

      <Section ta="இசையில் திருக்குறள்" en="Thirukkural in music, on this site">
        <div className={`rounded-2xl border px-5 py-4 ${card}`}>
          <div className={`font-tamil-sans text-[16px] leading-relaxed ${body}`}>
            இத்தளத்தில் <b className={accent}>{songs}</b> குறள்கள் இப்போது பாடலாகக் கேட்கக் கிடைக்கின்றன — தொடர்ந்து புதியவை சேர்கின்றன.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={onOpenVideos} className="rounded-xl bg-[#E3B866] text-[#1B1A16] px-4 py-2 text-sm font-semibold cursor-pointer hover:brightness-105 font-tamil-sans">
              பாடல்களைக் கேளுங்கள்
            </button>
            <button onClick={onOpenMap} className={`rounded-xl border px-4 py-2 text-sm cursor-pointer font-tamil-sans ${isDark ? 'border-white/15 text-white hover:bg-white/10' : 'border-[#C9D6CD] text-[#1D5A43] hover:bg-[#1D5A43]/5'}`}>
              குறள் வரைபடத்தில் தேடுங்கள்
            </button>
          </div>
        </div>
      </Section>

      <section className={`mt-10 text-[12.5px] leading-relaxed ${muted}`}>
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
            <a className="underline" href="https://incredibleindia.gov.in/en/tamil-nadu/kanniyakumari/thiruvalluvar-statue" target="_blank" rel="noreferrer">Thiruvalluvar Statue — Incredible India</a>
          </li>
          <li>
            <a className="underline" href="https://chennai.nic.in/tourist-place/valluvarkottam/" target="_blank" rel="noreferrer">Valluvar Kottam — Chennai District (Govt. of Tamil Nadu)</a>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default FactsPage;
