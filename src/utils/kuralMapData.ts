import { useEffect, useState } from 'react';
import { Paal } from '../types/kural';

/**
 * Made offline from the Kurals' meanings:
 *  a: for each of the 133 அதிகாரங்கள் — map position (x, y) and the 6 அதிகாரங்கள் closest in meaning
 *  k: for each of the 1330 Kurals — the 15 Kurals closest in meaning, closest first
 */
export type MapData = { a: [number, number, number[]][]; k: number[][] };

let cache: Promise<MapData> | null = null;

export function loadMapData(): Promise<MapData> {
  if (!cache) {
    cache = fetch('/kural-map.json').then((r) => {
      if (!r.ok) throw new Error('map data');
      return r.json();
    });
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}

export function useMapData(enabled = true) {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!enabled || data) return;
    let alive = true;
    loadMapData()
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [enabled, data]);
  return { data, error };
}

/** One colour per பால் */
export const PAAL_COLORS: Record<Paal, string> = {
  அறத்துப்பால்: '#4FA383',
  பொருட்பால்: '#5D8FD0',
  காமத்துப்பால்: '#D46F93',
};
