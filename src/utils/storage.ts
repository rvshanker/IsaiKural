import { KuralMedia } from '../types/kural';
import { CAN_EDIT_MEDIA } from '../config';

const STORAGE_MEDIA_KEY = 'thirukkural_custom_media_v1';
const STORAGE_BOOKMARKS_KEY = 'thirukkural_bookmarks_v1';

export type UserMediaMap = Record<number, KuralMedia>;

/**
 * Loads locally drafted media (only used by the editor on your own computer).
 * On the live site this always returns {} — visitors only see kuralMedia.ts.
 */
export function loadUserMedia(): UserMediaMap {
  if (!CAN_EDIT_MEDIA) return {};
  try {
    const raw = localStorage.getItem(STORAGE_MEDIA_KEY);
    if (!raw) return {};
    const parsed: UserMediaMap = JSON.parse(raw);
    const cleaned: UserMediaMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      const num = parseInt(k, 10);
      if (v && (v.youtubeUrl || v.imageUrl)) {
        // Exclude old sample test links
        if (
          v.youtubeUrl?.includes('kYJqD7t77cE') ||
          v.youtubeUrl?.includes('3M5vQ9TzP8g') ||
          v.youtubeUrl?.includes('4Zt7n79mU2k') ||
          v.imageUrl?.includes('images.unsplash.com/photo-1544717305')
        ) {
          continue;
        }
        cleaned[num] = v;
      }
    }
    return cleaned;
  } catch (err) {
    console.error('Failed to load user media from localStorage', err);
    return {};
  }
}

/**
 * Exports locally drafted media as JSON (backup / re-import).
 */
export function exportLocalMediaAsJson(): string {
  return JSON.stringify(loadUserMedia(), null, 2);
}

/**
 * Exports locally drafted media as lines ready to paste into
 * KURAL_MEDIA in src/data/kuralMedia.ts — that file is what every visitor sees.
 */
export function exportAsKuralMediaCode(): string {
  const data = loadUserMedia();
  return Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b)
    .map(n => {
      const clean = Object.fromEntries(
        Object.entries(data[n]).filter(([, v]) => v !== undefined && v !== '')
      );
      return `  ${n}: ${JSON.stringify(clean)},`;
    })
    .join('\n');
}

/**
 * Imports media entries from a JSON string into local drafts.
 */
export function importMediaFromJson(jsonStr: string): { count: number; media: UserMediaMap } {
  const parsed = JSON.parse(jsonStr);
  const cleaned: UserMediaMap = {};
  for (const [k, v] of Object.entries(parsed)) {
    const num = parseInt(k, 10);
    if (!isNaN(num) && num >= 1 && num <= 1330 && v) {
      cleaned[num] = v as KuralMedia;
    }
  }
  const merged: UserMediaMap = { ...loadUserMedia(), ...cleaned };
  localStorage.setItem(STORAGE_MEDIA_KEY, JSON.stringify(merged));
  return { count: Object.keys(cleaned).length, media: merged };
}

export function saveUserMedia(kuralNumber: number, media: KuralMedia): UserMediaMap {
  try {
    const current = loadUserMedia();
    const updated = {
      ...current,
      [kuralNumber]: {
        ...current[kuralNumber],
        ...media,
      },
    };
    localStorage.setItem(STORAGE_MEDIA_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save user media to localStorage', err);
    return loadUserMedia();
  }
}

export function deleteUserMedia(kuralNumber: number): UserMediaMap {
  try {
    const current = loadUserMedia();
    delete current[kuralNumber];
    localStorage.setItem(STORAGE_MEDIA_KEY, JSON.stringify(current));
    return { ...current };
  } catch (err) {
    console.error('Failed to delete user media', err);
    return loadUserMedia();
  }
}

export function loadBookmarks(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load bookmarks', err);
    return [];
  }
}

export function toggleBookmark(kuralNumber: number): number[] {
  try {
    const current = loadBookmarks();
    let next: number[];
    if (current.includes(kuralNumber)) {
      next = current.filter(id => id !== kuralNumber);
    } else {
      next = [...current, kuralNumber];
    }
    localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    console.error('Failed to save bookmark', err);
    return loadBookmarks();
  }
}
