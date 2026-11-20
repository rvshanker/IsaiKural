import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

interface Props {
  isDark: boolean;
  onHome: () => void;
}

const TYPES = [
  { id: 'suggestion', ta: 'பரிந்துரை', en: 'Suggestion' },
  { id: 'error', ta: 'பிழை', en: 'Report a mistake' },
  { id: 'praise', ta: 'பாராட்டு', en: 'Appreciation' },
  { id: 'other', ta: 'மற்றவை', en: 'Other' },
] as const;

export const FeedbackPage: React.FC<Props> = ({ isDark, onHome }) => {
  const [type, setType] = useState<string>('suggestion');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [kural, setKural] = useState('');
  const [website, setWebsite] = useState(''); // hidden trap for bots
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const card = isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white border-[#ECEBE5]';
  const input = `w-full rounded-xl border px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#1D5A43]/30 ${
    isDark ? 'bg-[#1B1F1C] border-[#2F3833] text-[#EEE8DC] placeholder:text-[#6F7C74]' : 'bg-[#FBFAF7] border-[#E4E4DE] text-[#1F2A25] placeholder:text-[#9A9F9B]'
  }`;
  const label = `block text-[14px] font-semibold mb-1.5 ${isDark ? 'text-[#D9CFB8]' : 'text-[#2E3B35]'}`;
  const muted = isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (message.trim().length < 3) {
      setError('உங்கள் கருத்தை எழுதுங்கள் · Please write your feedback');
      return;
    }
    setState('sending');
    try {
      const n = parseInt(kural, 10);
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          name,
          contact,
          kural: n >= 1 && n <= 1330 ? n : undefined,
          page: document.referrer || '',
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'error');
      setState('sent');
    } catch (err: any) {
      setState('idle');
      setError(
        err?.message === 'Too many messages, please try again later'
          ? 'சிறிது நேரம் கழித்து மீண்டும் முயலுங்கள் · Please try again in a few minutes'
          : 'அனுப்ப முடியவில்லை. மீண்டும் முயலுங்கள் · Could not send, please try again'
      );
    }
  };

  if (state === 'sent') {
    return (
      <div className={`mt-4 rounded-[18px] border p-8 text-center ${card}`}>
        <CheckCircle2 className="w-12 h-12 mx-auto text-[#2E8B57]" />
        <h2 className={`font-tamil-sans text-[22px] font-bold mt-3 ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>நன்றி!</h2>
        <p className={`mt-1 text-[15px] ${muted}`}>உங்கள் கருத்து எங்களுக்குக் கிடைத்தது · Thank you, we received your feedback.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={onHome} className="px-5 py-2.5 rounded-full bg-[#1D4234] text-white text-[14px] font-semibold cursor-pointer">
            முகப்பு
          </button>
          <button
            onClick={() => {
              setMessage('');
              setKural('');
              setState('idle');
            }}
            className={`px-5 py-2.5 rounded-full border text-[14px] cursor-pointer ${isDark ? 'border-[#2F3833] text-[#D9CFB8]' : 'border-[#DCE3DE] text-[#2E3B35]'}`}
          >
            இன்னொரு கருத்து
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`mt-4 rounded-[18px] border p-5 sm:p-7 ${card}`} noValidate>
      {/* What kind */}
      <p className={label}>எதைப் பற்றி? · About</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {TYPES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            aria-pressed={type === t.id}
            className={`px-4 py-2 rounded-full border text-[14px] cursor-pointer transition-colors ${
              type === t.id
                ? 'bg-[#1D4234] border-[#1D4234] text-white'
                : isDark
                ? 'border-[#2F3833] text-[#D9CFB8] hover:bg-white/5'
                : 'border-[#DCE3DE] bg-white text-[#2E3B35] hover:border-[#1D5A43]'
            }`}
          >
            {t.ta} <span className="opacity-70 text-[12.5px]">· {t.en}</span>
          </button>
        ))}
      </div>

      {/* Message */}
      <label className={label} htmlFor="fb-message">உங்கள் கருத்து · Your feedback</label>
      <textarea
        id="fb-message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={5}
        maxLength={3000}
        placeholder={type === 'error' ? 'எந்தக் குறளில், என்ன பிழை? · Which Kural, what is wrong?' : 'இங்கே எழுதுங்கள்… · Write here…'}
        className={`${input} resize-y min-h-[130px]`}
      />

      {type === 'error' && (
        <div className="mt-4">
          <label className={label} htmlFor="fb-kural">குறள் எண் (விருப்பம்) · Kural number (optional)</label>
          <input id="fb-kural" inputMode="numeric" value={kural} onChange={e => setKural(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="எ.கா. 391" className={`${input} max-w-[180px]`} />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className={label} htmlFor="fb-name">பெயர் (விருப்பம்) · Name (optional)</label>
          <input id="fb-name" value={name} onChange={e => setName(e.target.value)} maxLength={80} autoComplete="name" className={input} />
        </div>
        <div>
          <label className={label} htmlFor="fb-contact">மின்னஞ்சல் / தொலைபேசி (விருப்பம்)</label>
          <input id="fb-contact" value={contact} onChange={e => setContact(e.target.value)} maxLength={120} placeholder="பதில் வேண்டுமெனில் · if you'd like a reply" className={input} />
        </div>
      </div>

      {/* Hidden from people; bots fill it */}
      <input type="text" name="website" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] w-px h-px opacity-0" />

      {error && <p className="mt-4 text-[14px] text-[#C0392B]">{error}</p>}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#1D4234] hover:bg-[#16392E] text-white text-[15px] font-semibold disabled:opacity-60 cursor-pointer"
      >
        <Send className="w-4.5 h-4.5" />
        {state === 'sending' ? 'அனுப்புகிறது…' : 'அனுப்பு · Send'}
      </button>
    </form>
  );
};

export default FeedbackPage;
