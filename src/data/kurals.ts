import { Kural, KuralMedia } from '../types/kural';
import allKuralsData from './allKurals.json';
import { KURAL_MEDIA } from './kuralMedia';

// All 1,330 Thirukkurals, with the shared videos/images from kuralMedia.ts merged in
export const ALL_KURALS: Kural[] = (allKuralsData as Kural[]).map((k) => {
  const shared = KURAL_MEDIA[k.number];
  const merged = { ...k.media, ...shared };
  return Object.keys(merged).length > 0 ? { ...k, media: merged } : k;
});

// Kurals that have a video or image
export let CURATED_KURALS: Kural[] = ALL_KURALS.filter(k => !!k.media?.youtubeUrl || !!k.media?.imageUrl);

// Fast O(1) lookup by kural number
const kuralMap = new Map<number, Kural>();
for (const k of ALL_KURALS) {
  kuralMap.set(k.number, k);
}

/**
 * Returns the Kural object for any Kural number (1 - 1330).
 */
export function getKuralByNumber(num: number): Kural {
  const found = kuralMap.get(num);
  if (found) return found;
  return ALL_KURALS[0];
}

/**
 * iPhone app: replace the built-in song list with the latest one downloaded from isaikural.com,
 * so new songs appear without a new App Store version.
 */
let songListVersion = 0;
export function getSongListVersion() {
  return songListVersion;
}
export function applySongList(list: Record<number, KuralMedia>) {
  const base = allKuralsData as Kural[];
  for (let i = 0; i < base.length; i++) {
    const k = base[i];
    const merged = { ...k.media, ...list[k.number] };
    const next = Object.keys(merged).length > 0 ? { ...k, media: merged } : k;
    ALL_KURALS[i] = next;
    kuralMap.set(next.number, next);
  }
  CURATED_KURALS = ALL_KURALS.filter(k => !!k.media?.youtubeUrl || !!k.media?.imageUrl);
  songListVersion++;
}
