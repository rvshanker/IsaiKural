import { Kural } from '../types/kural';
import allKuralsData from './allKurals.json';
import { KURAL_MEDIA } from './kuralMedia';

// All 1,330 Thirukkurals, with the shared videos/images from kuralMedia.ts merged in
export const ALL_KURALS: Kural[] = (allKuralsData as Kural[]).map((k) => {
  const shared = KURAL_MEDIA[k.number];
  const merged = { ...k.media, ...shared };
  return Object.keys(merged).length > 0 ? { ...k, media: merged } : k;
});

// Kurals that have a video or image
export const CURATED_KURALS: Kural[] = ALL_KURALS.filter(k => !!k.media?.youtubeUrl || !!k.media?.imageUrl);

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
