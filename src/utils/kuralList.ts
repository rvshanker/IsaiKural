/** Shared by the quiz and the word game: the Kurals a student is learning (e.g. their Tamil school நிலை). */
export const MY_SET_KEY = 'isaikural.quiz.myset';

/** "1, 2, 5-10, 34" → [1,2,5,6,7,8,9,10,34]; ignores anything outside 1–1330; at most 60 Kurals */
export function parseKuralList(text: string): number[] {
  const out: number[] = [];
  for (const part of text.split(/[,\s;]+/)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    const a = +m[1];
    const b = m[2] ? +m[2] : a;
    for (let n = Math.min(a, b); n <= Math.max(a, b) && n <= 1330; n++) if (n >= 1 && !out.includes(n)) out.push(n);
  }
  return out.slice(0, 60);
}

/** [1,2,3,5,6,10] → "1-3,5,6,10" (short form for links) */
export function compactList(nums: number[]): string {
  const a = [...nums].sort((x, y) => x - y);
  const out: string[] = [];
  for (let i = 0; i < a.length; ) {
    let j = i;
    while (j + 1 < a.length && a[j + 1] === a[j] + 1) j++;
    out.push(j - i >= 2 ? `${a[i]}-${a[j]}` : a.slice(i, j + 1).join(','));
    i = j + 1;
  }
  return out.join(',');
}

