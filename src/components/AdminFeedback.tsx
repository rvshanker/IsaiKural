import React, { useCallback, useEffect, useState } from 'react';
import { Check, Trash2, RotateCcw, RefreshCw, LogOut } from 'lucide-react';

interface Item {
  id: number;
  created_at: string;
  type: string;
  message: string;
  name?: string;
  contact?: string;
  kural?: number | null;
  page?: string;
  country?: string;
  device?: string;
  status: 'new' | 'done';
}

const TYPE_LABEL: Record<string, string> = {
  suggestion: 'பரிந்துரை',
  error: 'பிழை',
  praise: 'பாராட்டு',
  other: 'மற்றவை',
};
const TYPE_COLOR: Record<string, string> = {
  suggestion: 'bg-[#E6F0FA] text-[#1F5A8A]',
  error: 'bg-[#FBE9E7] text-[#B23A2B]',
  praise: 'bg-[#E8F5E9] text-[#2E7D32]',
  other: 'bg-[#EFEFEA] text-[#555]',
};

const KEY = 'isaikural-admin-key';

export const AdminFeedback: React.FC<{ isDark: boolean; onOpenKural: (n: number) => void }> = ({ isDark, onOpenKural }) => {
  const [key, setKey] = useState<string>(() => {
    try {
      return sessionStorage.getItem(KEY) || '';
    } catch {
      return '';
    }
  });
  const [typed, setTyped] = useState('');
  const [items, setItems] = useState<Item[] | null>(null);
  const [filter, setFilter] = useState<'new' | 'all' | string>('new');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const api = useCallback(
    (path: string, init: RequestInit = {}) =>
      fetch(path, { ...init, headers: { 'content-type': 'application/json', 'x-admin-key': key, ...(init.headers || {}) } }),
    [key]
  );

  const load = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    setError('');
    try {
      const res = await api('/api/feedback');
      if (res.status === 401) {
        setError('தவறான கடவுச்சொல் · Wrong password');
        setKey('');
        try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setError('Could not load feedback');
    } finally {
      setLoading(false);
    }
  }, [api, key]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: number, status: 'new' | 'done') => {
    setItems(list => list?.map(i => (i.id === id ? { ...i, status } : i)) || null);
    await api(`/api/feedback/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  };
  const remove = async (id: number) => {
    setItems(list => list?.filter(i => i.id !== id) || null);
    await api(`/api/feedback/${id}`, { method: 'DELETE' });
  };

  const text = isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]';
  const muted = isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]';
  const card = isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white border-[#ECEBE5]';

  if (!key) {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!typed) return;
          try { sessionStorage.setItem(KEY, typed); } catch { /* ignore */ }
          setKey(typed);
          setTyped('');
        }}
        className={`mt-6 max-w-[380px] rounded-[18px] border p-6 ${card}`}
      >
        <h1 className={`text-[20px] font-bold ${text}`}>Admin · கருத்துகள்</h1>
        <label className={`block mt-4 mb-1.5 text-[14px] ${muted}`} htmlFor="admin-key">Password</label>
        <input
          id="admin-key"
          type="password"
          value={typed}
          onChange={e => setTyped(e.target.value)}
          autoComplete="current-password"
          className={`w-full rounded-xl border px-4 py-3 text-[16px] ${isDark ? 'bg-[#1B1F1C] border-[#2F3833] text-[#EEE8DC]' : 'bg-[#FBFAF7] border-[#E4E4DE]'}`}
        />
        {error && <p className="mt-3 text-[14px] text-[#C0392B]">{error}</p>}
        <button type="submit" className="mt-4 w-full py-3 rounded-full bg-[#1D4234] text-white font-semibold cursor-pointer">Open</button>
      </form>
    );
  }

  const all = items || [];
  const counts = {
    new: all.filter(i => i.status === 'new').length,
    all: all.length,
    ...Object.fromEntries(Object.keys(TYPE_LABEL).map(t => [t, all.filter(i => i.type === t).length])),
  } as Record<string, number>;
  const shown = all.filter(i => (filter === 'all' ? true : filter === 'new' ? i.status === 'new' : i.type === filter));

  const chip = (id: string, label: string) => (
    <button
      key={id}
      onClick={() => setFilter(id)}
      className={`shrink-0 px-3.5 py-1.5 rounded-full border text-[13.5px] cursor-pointer ${
        filter === id ? 'bg-[#1D4234] border-[#1D4234] text-white' : isDark ? 'border-[#2F3833] text-[#D9CFB8]' : 'border-[#DCE3DE] bg-white text-[#2E3B35]'
      }`}
    >
      {label} ({counts[id] || 0})
    </button>
  );

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className={`text-[22px] sm:text-[26px] font-bold ${text}`}>கருத்துகள் · Feedback</h1>
        <div className="flex gap-1">
          <button onClick={load} title="Refresh" className={`p-2 rounded-full cursor-pointer ${muted} hover:bg-black/5`}>
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
              setKey('');
              setItems(null);
            }}
            title="Sign out"
            className={`p-2 rounded-full cursor-pointer ${muted} hover:bg-black/5`}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
        {chip('new', 'புதியவை')}
        {chip('all', 'அனைத்தும்')}
        {Object.entries(TYPE_LABEL).map(([id, l]) => chip(id, l))}
      </div>

      {error && <p className="text-[14px] text-[#C0392B]">{error}</p>}
      {items && shown.length === 0 && <p className={`py-12 text-center ${muted}`}>இங்கே எதுவும் இல்லை · Nothing here</p>}

      <div className="space-y-3">
        {shown.map(i => (
          <div key={i.id} className={`rounded-[14px] border p-4 sm:p-5 ${card} ${i.status === 'done' ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
              <span className={`px-2 py-0.5 rounded-md font-semibold ${TYPE_COLOR[i.type] || TYPE_COLOR.other}`}>{TYPE_LABEL[i.type] || i.type}</span>
              {i.kural ? (
                <button onClick={() => onOpenKural(i.kural!)} className="px-2 py-0.5 rounded-md bg-[#E3EDE7] text-[#1D5A43] font-semibold cursor-pointer">
                  குறள் {i.kural}
                </button>
              ) : null}
              <span className={muted}>
                {new Date(i.created_at).toLocaleString()} · {[i.device, i.country].filter(Boolean).join(' · ')}
              </span>
            </div>
            <p className={`mt-2.5 whitespace-pre-wrap text-[15.5px] leading-relaxed ${text}`}>{i.message}</p>
            {(i.name || i.contact) && (
              <p className={`mt-2 text-[13.5px] ${muted}`}>
                — {[i.name, i.contact].filter(Boolean).join(' · ')}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              {i.status === 'new' ? (
                <button onClick={() => setStatus(i.id, 'done')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1D4234] text-white text-[13px] cursor-pointer">
                  <Check className="w-4 h-4" /> முடிந்தது
                </button>
              ) : (
                <button onClick={() => setStatus(i.id, 'new')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] cursor-pointer ${isDark ? 'border-[#2F3833] text-[#D9CFB8]' : 'border-[#DCE3DE] text-[#2E3B35]'}`}>
                  <RotateCcw className="w-4 h-4" /> புதியதாக்கு
                </button>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Delete this feedback?')) remove(i.id);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] cursor-pointer ${isDark ? 'border-[#2F3833] text-[#E79A8F]' : 'border-[#F0D5D0] text-[#B23A2B]'}`}
              >
                <Trash2 className="w-4 h-4" /> நீக்கு
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeedback;
