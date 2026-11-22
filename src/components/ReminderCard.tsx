import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { getKuralByNumber } from '../data/kurals';
import { applyReminder, getReminderSetting, ReminderSetting } from '../utils/native';

/** iPhone app only: daily "Kural of the day" notification at a time the reader picks. */
export const ReminderCard: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [s, setS] = useState<ReminderSetting>(getReminderSetting);
  const [msg, setMsg] = useState('');

  const save = async (next: ReminderSetting) => {
    setS(next);
    const ok = await applyReminder(next, getKuralByNumber);
    if (next.on && !ok) {
      setS({ ...next, on: false });
      await applyReminder({ ...next, on: false }, getKuralByNumber);
      setMsg('அறிவிப்புகளை அனுமதிக்க: Settings → இசையில் திருக்குறள் → Notifications');
    } else setMsg(next.on ? 'சரி! தினமும் இந்த நேரத்தில் இன்றைய குறள் வரும்.' : '');
  };

  const time = `${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`;
  const card = isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white border-[#ECEBE5]';

  return (
    <div className={`rounded-[18px] border p-4 sm:p-5 ${card}`}>
      <div className="flex items-center gap-3">
        <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.on ? 'bg-[#1D4234] text-[#E3B866]' : isDark ? 'bg-white/5 text-[#9FB0A6]' : 'bg-[#EEF3EF] text-[#1D5A43]'}`}>
          {s.on ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-tamil-sans text-[16px] font-semibold ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>தினம் ஒரு குறள்</p>
          <p className={`text-[12.5px] ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>ஒவ்வொரு நாளும் இன்றைய குறள் அறிவிப்பாக · Daily Kural reminder</p>
        </div>
        <button
          role="switch"
          aria-checked={s.on}
          aria-label="Daily Kural reminder"
          onClick={() => save({ ...s, on: !s.on })}
          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer ${s.on ? 'bg-[#2E8B57]' : isDark ? 'bg-[#2F3833]' : 'bg-[#D5DAD6]'}`}
        >
          <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${s.on ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>
      {s.on && (
        <label className={`mt-3 flex items-center justify-between gap-3 text-[14px] ${isDark ? 'text-[#D9CFB8]' : 'text-[#2E3B35]'}`}>
          நேரம் · Time
          <input
            type="time"
            value={time}
            onChange={e => {
              const [h, m] = e.target.value.split(':').map(Number);
              if (!isNaN(h) && !isNaN(m)) save({ on: true, hour: h, minute: m });
            }}
            className={`rounded-lg border px-3 py-1.5 text-[15px] ${isDark ? 'bg-[#1B1F1C] border-[#2F3833] text-[#EEE8DC]' : 'bg-[#FBFAF7] border-[#E4E4DE]'}`}
          />
        </label>
      )}
      {msg && <p className={`mt-2 text-[12.5px] ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>{msg}</p>}
    </div>
  );
};
