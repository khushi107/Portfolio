/** A random number generator that returns values in [0, 1). */
export type Rng = () => number;

/**
 * mulberry32: a tiny seeded PRNG. Seeding means a doodle comes out with the
 * same wobbles every time it is drawn, so redraws and resizes look identical.
 */
export function mulberry32(seed: number): Rng {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a string hash, used to give each heading its own stable seed. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
