import { useEffect, useState } from 'react';

// Made offline from the Kurals' meanings: map position, topic and the 12 Kurals closest in meaning for each Kural
export type MapLabel = { ta: string; en: string; x: number; y: number; n: number; core: number };
export type MapData = { labels: MapLabel[]; k: [number, number, number, number[]][] };

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

export const topicColor = (c: number, alpha = 1) => `hsla(${Math.round((c * 137.508) % 360)}, 72%, 63%, ${alpha})`;

/** Why a similar Kural is listed: same topic, same chapter, or a different chapter with a similar meaning */
export function similarReason(data: MapData, from: number, to: number, sameChapter: boolean): string {
  if (sameChapter) return 'இதே அதிகாரம்';
  if (data.k[from - 1][2] === data.k[to - 1][2]) return 'இதே தலைப்பு';
  return 'வேறு அதிகாரம் · ஒத்த பொருள்';
}
