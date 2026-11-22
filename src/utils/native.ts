/**
 * Helpers for the iPhone app (Capacitor). On the website every helper falls back to normal web behaviour.
 */
import { Capacitor } from '@capacitor/core';
import type { Kural } from '../types/kural';

export const isNativeApp = Capacitor.isNativePlatform();

/** The app's pages are served from capacitor://localhost, so API calls must go to the real site. */
export const API_BASE = isNativeApp ? 'https://isaikural.com' : '';

/** The same "Kural of the day" the website shows on a given date. */
export function kuralNumberForDate(d: Date): number {
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  return (dayOfYear % 1330) + 1;
}

export function kuralShareText(k: Kural) {
  return `குறள் ${k.number} · ${k.athikaramTamil}\n\n${k.line1}\n${k.line2}\n\nhttps://isaikural.com/#/kural/${k.number}`;
}

/** Share a Kural: the iPhone share sheet in the app, the Web Share API or the clipboard on the website. */
export async function shareKural(k: Kural): Promise<'shared' | 'copied' | 'cancelled'> {
  const text = kuralShareText(k);
  try {
    if (isNativeApp) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: `குறள் ${k.number}`, text });
      return 'shared';
    }
    if (navigator.share) {
      await navigator.share({ title: `குறள் ${k.number}`, text });
      return 'shared';
    }
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'cancelled';
  }
}

/** Open an outside link (YouTube, Instagram…) in Safari / the matching app rather than inside the app. */
export async function openExternal(url: string) {
  if (isNativeApp) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

/* ───────────── Daily Kural reminder ───────────── */

const REMINDER_KEY = 'isaikural-reminder'; // { on: boolean, hour: number, minute: number }
export interface ReminderSetting {
  on: boolean;
  hour: number;
  minute: number;
}

export function getReminderSetting(): ReminderSetting {
  try {
    const v = JSON.parse(localStorage.getItem(REMINDER_KEY) || 'null');
    if (v && typeof v.hour === 'number') return v;
  } catch {
    /* ignore */
  }
  return { on: false, hour: 7, minute: 0 };
}

/**
 * Schedule the next 45 days of reminders, each showing that day's Kural.
 * (iOS allows 64 pending notifications; the list is topped up every time the app opens.)
 */
export async function applyReminder(setting: ReminderSetting, getKural: (n: number) => Kural | undefined): Promise<boolean> {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(setting));
  } catch {
    /* ignore */
  }
  if (!isNativeApp) return false;
  const { LocalNotifications } = await import('@capacitor/local-notifications');

  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
  if (!setting.on) return true;

  let perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') return false;

  const now = new Date();
  const notifications = [];
  for (let i = 0; i < 45; i++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, setting.hour, setting.minute, 0);
    if (at <= now) continue;
    const n = kuralNumberForDate(at);
    const k = getKural(n);
    if (!k) continue;
    notifications.push({
      id: 1000 + i,
      title: `இன்றைய குறள் · ${k.number}`,
      body: `${k.line1}\n${k.line2}`,
      schedule: { at, allowWhileIdle: true },
      extra: { kural: k.number },
    });
  }
  await LocalNotifications.schedule({ notifications });
  return true;
}

/** App start-up: style the status bar, top up reminders, and open the Kural when a reminder is tapped. */
export async function initNativeApp(getKural: (n: number) => Kural | undefined) {
  if (!isNativeApp) return;
  document.documentElement.classList.add('native-app');
  // Outside links (YouTube channel, Instagram, Facebook…) open in Safari or their own app
  document.addEventListener(
    'click',
    e => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (/^(https?:|mailto:)/i.test(href)) {
        e.preventDefault();
        if (href.startsWith('mailto:')) window.location.href = href;
        else openExternal(href);
      }
    },
    true
  );
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark }); // light text on the dark green header
  } catch {
    /* ignore */
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {
    /* ignore */
  }
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    LocalNotifications.addListener('localNotificationActionPerformed', a => {
      const n = Number(a.notification.extra?.kural);
      if (n >= 1 && n <= 1330) window.location.hash = `#/kural/${n}`;
    });
    const s = getReminderSetting();
    if (s.on) await applyReminder(s, getKural);
  } catch {
    /* ignore */
  }
}

/* ───────────── Song list (updates without a new App Store version) ───────────── */

const SONGS_KEY = 'isaikural-songs';
const SONGS_URL = 'https://isaikural.com/kural-media.json';

/** Before the first screen: use the song list saved from the last download, if any. */
export async function loadSavedSongList() {
  if (!isNativeApp) return;
  try {
    const saved = localStorage.getItem(SONGS_KEY);
    if (!saved) return;
    const { applySongList } = await import('../data/kurals');
    applySongList(JSON.parse(saved));
  } catch {
    /* keep the built-in list */
  }
}

/** Download the latest song list; calls onChange when it differs from what the app is showing. */
export async function refreshSongList(onChange: () => void) {
  if (!isNativeApp) return;
  try {
    const res = await fetch(SONGS_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const text = await res.text();
    const list = JSON.parse(text);
    if (!list || typeof list !== 'object' || Object.keys(list).length < 10) return; // ignore a broken download
    if (localStorage.getItem(SONGS_KEY) === text) return;
    localStorage.setItem(SONGS_KEY, text);
    const { applySongList } = await import('../data/kurals');
    applySongList(list);
    onChange();
  } catch {
    /* offline: keep what we have */
  }
}

/** Check for new songs now and every time the app comes back to the screen. */
export async function watchSongList(onChange: () => void) {
  if (!isNativeApp) return;
  refreshSongList(onChange);
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('resume', () => refreshSongList(onChange));
  } catch {
    /* ignore */
  }
}
