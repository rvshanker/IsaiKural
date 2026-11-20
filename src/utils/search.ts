import { Kural } from '../types/kural';

/**
 * Normalises text for searching:
 *  - Unicode NFC (pasted Tamil can arrive in different encodings)
 *  - lower-case (for English / transliteration)
 *  - removes zero-width joiners and punctuation (. , ; : ! ? quotes dashes brackets)
 *  - collapses all whitespace / new lines into single spaces
 */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[​-‍﻿]/g, '')
    .replace(/[.,;:!?'"“”‘’`()\[\]{}\-–—_/\\|*~…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const wordStartCache = new Map<string, RegExp>();
function wordStart(w: string): RegExp {
  let re = wordStartCache.get(w);
  if (!re) {
    re = new RegExp(`(^|[^a-z])${w.replace(/[^a-z0-9]/g, '')}`);
    wordStartCache.set(w, re);
  }
  return re;
}

/** Same as normalizeForSearch, with every space removed (Kurals are split into words differently in different sources). */
const compact = (text: string) => normalizeForSearch(text).replace(/ /g, '');

// Pre-computed search text per Kural (built once, reused on every keystroke)
const cache = new WeakMap<Kural, { couplet: string; coupletCompact: string; other: string }>();
function indexFor(k: Kural) {
  let entry = cache.get(k);
  if (!entry) {
    const couplet = normalizeForSearch(`${k.line1} ${k.line2}`);
    entry = {
      couplet,
      coupletCompact: couplet.replace(/ /g, ''),
      other: normalizeForSearch(
        [
          k.transliteration,
          k.athikaramTamil,
          k.athikaramEnglish,
          k.commentaries.english,
          k.commentaries.muVa,
          k.commentaries.karunanidhi,
          k.commentaries.solomon,
          k.commentaries.parimelazhagar,
        ]
          .filter(Boolean)
          .join(' \n ')
      ),
    };
    cache.set(k, entry);
  }
  return entry;
}

/**
 * True when the Kural matches the search text. Works for:
 *  - a Kural number ("1251")
 *  - any part of the couplet, including the whole Kural across both lines,
 *    with any punctuation, line breaks or word spacing
 *  - all the words typed, in any order ("அன்பு அறன்")
 *  - chapter names, transliteration and commentaries
 */
export function kuralMatchesSearch(k: Kural, query: string): boolean {
  const raw = query.trim();
  if (!raw) return true;
  if (/^\d+$/.test(raw)) return k.number === parseInt(raw, 10);

  const q = normalizeForSearch(raw);
  if (!q) return true;
  const { couplet, coupletCompact, other } = indexFor(k);

  // English / transliteration: match from the start of a word, so "rain" finds "rain" and "rainy"
  // but not "restrain" or "train"
  if (/^[a-z0-9 ]+$/.test(q)) {
    const words = q.split(' ').filter(Boolean);
    return words.every(w => wordStart(w).test(other));
  }

  // Phrase anywhere in the couplet (spacing-insensitive) or in the other fields
  if (coupletCompact.includes(compact(raw))) return true;
  if (other.includes(q)) return true;

  // Every word appears somewhere (couplet or other fields)
  const words = q.split(' ').filter(w => w.length > 1);
  return words.length > 1 && words.every(w => couplet.includes(w) || other.includes(w));
}

/**
 * Adhikarams whose Tamil or English name matches the search text.
 * Tamil: spacing-insensitive "contains" ("அன்பு" → அன்புடைமை); English: from the start of a word.
 * An exact name match comes first.
 */
export function matchChapters<T extends { number: number; name: string; nameEn: string }>(
  chapters: T[],
  query: string,
  limit = 6
): T[] {
  const raw = query.trim();
  if (!raw || /^\d+$/.test(raw)) return [];
  const q = normalizeForSearch(raw);
  if (!q) return [];
  const latin = /^[a-z0-9 ]+$/.test(q);
  if (latin && q.replace(/ /g, '').length < 3) return [];
  if (!latin && compact(raw).length < 2) return [];
  const qc = compact(raw);
  const scored: { c: T; s: number }[] = [];
  for (const c of chapters) {
    let s = -1;
    if (latin) {
      const en = normalizeForSearch(c.nameEn);
      const words = q.split(' ').filter(Boolean);
      if (en === q) s = 0;
      else if (words.every(w => wordStart(w).test(en))) s = en.startsWith(q) ? 1 : 2;
    } else {
      const ta = compact(c.name);
      if (ta === qc) s = 0;
      else if (ta.startsWith(qc)) s = 1;
      else if (ta.includes(qc)) s = 2;
    }
    if (s >= 0) scored.push({ c, s });
  }
  return scored.sort((a, b) => a.s - b.s || a.c.number - b.c.number).slice(0, limit).map(x => x.c);
}
