/**
 * Landmarks along the railway, from Udaipur to Jaipur and on to "your team".
 * Each sits in a 200 × 120 design box with the ground at y = 120.
 *
 * A landmark is a list of parts. Parts with a `motion` are wrapped in their
 * own SVG group and animated with CSS (see styles/sections.css, `.sky-*`).
 */
import { TAU, type Geo, type Pt, type Shape } from '@/lib/sketch/geometry';
import { S } from './shape';

export type Motion = 'wave' | 'fly' | 'flap' | 'flag' | 'sway' | 'drift' | 'float';

export interface SkyPart {
  shapes: Shape[];
  motion?: Motion;
  /** Seconds to offset the animation, so repeated parts move out of step. */
  delay?: number;
  /** Seconds per cycle (overrides the motion's default). */
  duration?: number;
}

const part = (shapes: Shape[], motion?: Motion, delay = 0, duration?: number): SkyPart => ({ shapes, motion, delay, duration });

const wave = (y: number, phase: number): Pt[] => Array.from({ length: 45 }, (_, j) => [j * 5 - 10, y + Math.sin(j * 0.9 + phase) * 2.2] as Pt);
const archWindow = (g: Geo, x: number, y: number, w: number, h: number) => g.quad([x - w, y + h], [x, y - h], [x + w, y + h]);
/** A bird is two little arcs; it flaps by squashing vertically. */
const bird = (g: Geo, x: number, y: number, s = 1): Shape[] => [
  S(g.quad([x - 12 * s, y], [x - 6 * s, y - 6 * s], [x, y]), 'ink', 1.6),
  S(g.quad([x, y], [x + 6 * s, y - 6 * s], [x + 12 * s, y]), 'ink', 1.6),
];

export const skyLandmarks: Record<string, (g: Geo) => SkyPart[]> = {
  /** Udaipur: rising sun, Aravalli hills, a lake palace and Lake Pichola's ripples. */
  udaipur: (g) => [
    part([
      S(g.ell(34, 26, 11, 11), 'sun', 2.2),
      ...Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * TAU;
        return S(g.seg(34 + Math.cos(a) * 16, 26 + Math.sin(a) * 16, 34 + Math.cos(a) * 22, 26 + Math.sin(a) * 22), 'sun', 1.8);
      }),
      S(g.quad([0, 96], [34, 46], [74, 92]), 'green', 2),
      S(g.quad([46, 94], [80, 36], [112, 92]), 'green', 2),
      S(g.poly([[118, 100], [118, 72], [194, 72], [194, 100]]), 'coral', 2.2),
      S(g.quad([126, 72], [134, 54], [142, 72]), 'coral', 2),
      S(g.quad([148, 72], [156, 48], [164, 72]), 'coral', 2),
      S(g.quad([170, 72], [178, 56], [186, 72]), 'coral', 2),
      ...[128, 144, 160, 176].map((x) => S(g.quad([x, 92], [x + 4, 80], [x + 8, 92]), 'pink', 1.6)),
    ]),
    // each ripple slides back and forth on its own rhythm
    ...[104, 112, 119].map((y, i) => part([S(wave(y, i), 'teal', 1.8)], 'wave', i * 0.6, 2.6 + i * 0.5)),
  ],

  /** The Thar desert: dunes, a camel and a bird flying over. */
  camel: (g) => [
    part([
      S(g.quad([0, 118], [50, 86], [110, 118]), 'sun', 2),
      S(g.quad([80, 118], [150, 80], [200, 118]), 'sun', 2),
      S(g.quad([66, 80], [92, 44], [122, 78]), 'orange', 2.4),
      S(g.seg(66, 82, 122, 82), 'orange', 2),
      S(g.poly([[120, 76], [134, 56], [146, 52], [150, 58], [140, 62]]), 'orange', 2.2),
      S(g.seg(74, 82, 72, 108), 'orange', 2),
      S(g.seg(84, 83, 87, 108), 'orange', 2),
      S(g.seg(106, 83, 104, 108), 'orange', 2),
      S(g.seg(116, 81, 119, 108), 'orange', 2),
      S(g.quad([66, 78], [60, 86], [62, 94]), 'orange', 1.8),
    ]),
    part(bird(g, 162, 26), 'fly', 0, 9),
  ],

  /** Jaipur, the Pink City: an arched city gate with chhatris and a waving flag. */
  gate: (g) => [
    part([
      S(g.poly([[40, 118], [40, 52], [160, 52], [160, 118]]), 'coral', 2.4),
      S([...g.seg(80, 118, 80, 86), ...g.quad([80, 86], [100, 58], [120, 86]).slice(1), ...g.seg(120, 86, 120, 118).slice(1)], 'pink', 2.2),
      S(g.quad([82, 52], [100, 22], [118, 52]), 'pink', 2.2),
      S(g.seg(100, 22, 100, 8), 'ink', 1.6),
      S(g.quad([44, 52], [54, 34], [64, 52]), 'pink', 2),
      S(g.quad([136, 52], [146, 34], [156, 52]), 'pink', 2),
      ...[52, 62, 138, 148].map((x) => S(archWindow(g, x, 77, 4, 5), 'sun', 1.6)),
      S(g.seg(40, 62, 160, 62), 'coral', 1.6),
    ]),
    part([S(g.poly([[100, 8], [106, 7], [113, 11], [106, 14], [100, 16]], true), 'sun', 1.8)], 'flag', 0, 1.4),
  ],

  /** Kites, as flown over Jaipur's rooftops at Makar Sankranti. Strings stay put; kites sway. */
  kites: (g) => [
    part([S(g.quad([60, 58], [50, 90], [20, 118]), 'ink', 1.2), S(g.quad([140, 60], [160, 92], [190, 118]), 'ink', 1.2), S(g.quad([100, 74], [98, 96], [104, 118]), 'ink', 1.1)]),
    part(
      [
        S(g.poly([[60, 14], [76, 34], [60, 58], [44, 34]], true), 'violet', 2.2),
        S(g.seg(60, 14, 60, 58), 'violet', 1.4),
        S(g.seg(44, 34, 76, 34), 'violet', 1.4),
        S(g.poly([[60, 58], [56, 66], [64, 70], [58, 78]]), 'pink', 1.8),
      ],
      'sway',
      0,
      3.2,
    ),
    part(
      [
        S(g.poly([[140, 28], [152, 42], [140, 60], [128, 42]], true), 'pink', 2.2),
        S(g.seg(128, 42, 152, 42), 'pink', 1.4),
        S(g.poly([[140, 60], [144, 68], [136, 72], [142, 80]]), 'teal', 1.8),
      ],
      'sway',
      0.8,
      2.6,
    ),
    part([S(g.poly([[100, 54], [108, 62], [100, 74], [92, 62]], true), 'sun', 2)], 'sway', 1.5, 2.2),
  ],

  /** Hawa Mahal: the stepped facade and its rows of jharokha windows. */
  hawa: (g) => {
    // nine columns of jharokhas (bay windows), tallest in the middle, each capped with a small dome
    const columns: [number, number, number][] = [
      // [centre x, top y, width]
      [38, 82, 14], [52, 68, 14], [66, 54, 14], [80.5, 40, 15], [100, 24, 22], [119.5, 40, 15], [134, 54, 14], [148, 68, 14], [162, 82, 14],
    ];
    const shapes: Shape[] = [];
    for (const [x, top, w] of columns) {
      const l = x - w / 2;
      const r = x + w / 2;
      shapes.push(
        S(g.poly([[l, 118], [l, top], [r, top], [r, 118]]), 'coral', 2),
        S(g.quad([l - 1, top], [x, top - 13], [r + 1, top]), 'pink', 2),
        S(g.seg(x, top - 6, x, top - 11), 'ink', 1.2),
      );
      // stacked arched windows down the column, stopping above the gateway in the middle
      const lowest = x === 100 ? 86 : 108;
      for (let y = top + 9; y <= lowest; y += 13) {
        shapes.push(S(archWindow(g, x, y, w * 0.24, 4.5), 'sun', 1.3));
        shapes.push(S(g.seg(l + 2, y + 7, r - 2, y + 7), 'coral', 1.1)); // the jharokha's little balcony ledge
      }
    }
    shapes.push(
      S([...g.seg(94, 118, 94, 106), ...g.quad([94, 106], [100, 96], [106, 106]).slice(1), ...g.seg(106, 106, 106, 118).slice(1)], 'ink', 1.6),
      S(g.seg(24, 118, 176, 118), 'coral', 1.8),
    );
    return [part(shapes)];
  },

  /** Open sky between stations: clouds drifting and birds flying past. */
  clouds: (g) => [
    part(
      [S([...g.quad([30, 60], [34, 42], [52, 46]), ...g.quad([52, 46], [62, 26], [82, 40]).slice(1), ...g.quad([82, 40], [100, 38], [96, 58]).slice(1), ...g.seg(96, 58, 30, 60).slice(1)], 'blue', 2)],
      'drift',
      0,
      9,
    ),
    part(
      [S([...g.quad([120, 86], [124, 72], [138, 76]), ...g.quad([138, 76], [148, 62], [162, 74]).slice(1), ...g.quad([162, 74], [176, 74], [172, 88]).slice(1), ...g.seg(172, 88, 120, 86).slice(1)], 'teal', 2)],
      'drift',
      2.5,
      12,
    ),
    part(bird(g, 122, 30), 'fly', 0, 8),
    part(bird(g, 160, 40, 0.85), 'fly', 1.2, 10),
  ],

  /** The next stop: a city skyline with lit windows and a hot-air balloon floating above. */
  city: (g) => [
    part([
      S(g.poly([[10, 118], [10, 74], [40, 74], [40, 118]]), 'blue', 2.2),
      S(g.poly([[44, 118], [44, 50], [74, 50], [74, 118]]), 'violet', 2.2),
      S(g.poly([[78, 118], [78, 86], [104, 86], [104, 118]]), 'teal', 2.2),
      S(g.poly([[108, 118], [108, 62], [136, 62], [136, 118]]), 'blue', 2.2),
      ...([[18, 84], [30, 84], [18, 98], [30, 98], [52, 60], [64, 60], [52, 76], [64, 76], [52, 92], [64, 92], [116, 72], [128, 72], [116, 88], [128, 88]] as Pt[]).map(([x, y]) =>
        S(g.ell(x, y, 2, 2), 'sun', 1.6),
      ),
    ]),
    part(
      [
        S(g.ell(168, 40, 18, 20), 'coral', 2.2),
        S(g.seg(168, 20, 168, 60), 'sun', 1.6),
        S(g.quad([156, 30], [160, 44], [162, 56]), 'sun', 1.6),
        S(g.seg(158, 58, 162, 72), 'ink', 1.4),
        S(g.seg(178, 58, 174, 72), 'ink', 1.4),
        S(g.rrect(160, 72, 176, 82, 2), 'orange', 1.8),
      ],
      'float',
      0,
      4,
    ),
  ],
};

/** Which landmark sits over each station, and over each gap between stations. */
export const skyRoute = {
  stations: ['udaipur', 'gate', 'hawa', 'city'],
  gaps: ['camel', 'kites', 'clouds'],
};
