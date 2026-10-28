/** Small doodles on the project cards (design space 120 × 80). */
import { TAU, type Geo, type Pt, type Shape } from '@/lib/sketch/geometry';
import { S } from './shape';

export const projectIcons: Record<'ehr' | 'doc' | 'maidan', (g: Geo) => Shape[]> = {
  /** A heart with a heartbeat line through it. */
  ehr: (g) => [
    S(g.heart(40, 38, 1.75), 'coral', 2.6),
    S(g.poly([[4, 45], [22, 45], [30, 31], [38, 58], [48, 17], [56, 45], [116, 45]]), 'blue', 2.2),
    S(g.sparkle(98, 16, 7), 'sun', 2),
    S(g.ell(108, 64, 2.5, 2.5), 'violet', 2),
  ],
  /** A document under a magnifying glass, with a tick. */
  doc: (g) => [
    S(g.rrect(14, 8, 62, 74, 6), 'blue', 2.4),
    S(g.seg(22, 24, 50, 24), 'ink', 1.6),
    S(g.seg(22, 34, 54, 34), 'ink', 1.6),
    S(g.seg(22, 44, 42, 44), 'ink', 1.6),
    S(g.ell(80, 47, 15, 15), 'violet', 2.6),
    S(g.seg(91, 58, 106, 73), 'violet', 3),
    S(g.poly([[73, 47], [78, 53], [87, 41]]), 'green', 2.4),
    S(g.sparkle(106, 14, 6), 'coral', 2),
  ],
  /** A phone with a map pin, a football and tufts of turf. */
  maidan: (g) => {
    const pentagon = Array.from({ length: 5 }, (_, i) => [84 + Math.cos((i / 5) * TAU - Math.PI / 2) * 6, 48 + Math.sin((i / 5) * TAU - Math.PI / 2) * 6] as Pt);
    return [
      S(g.rrect(12, 6, 48, 76, 8), 'teal', 2.4),
      S(g.seg(24, 13, 36, 13), 'ink', 1.4),
      S(g.ell(30, 34, 7, 7), 'coral', 2.2),
      S(g.poly([[24, 38], [30, 52], [36, 38]]), 'coral', 2.2),
      S(g.ell(84, 48, 16, 16), 'ink', 2.4),
      S(g.poly(pentagon, true), 'ink', 1.8),
      S(g.poly([[60, 74], [64, 64], [68, 74], [72, 66], [76, 74]]), 'green', 2),
      S(g.poly([[94, 74], [98, 65], [102, 74], [106, 64], [110, 74]]), 'green', 2),
      S(g.sparkle(106, 14, 6), 'sun', 2),
    ];
  },
};
