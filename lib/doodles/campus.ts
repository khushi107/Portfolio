/**
 * Fig. 2 in Education: the college building, a graduation cap flying off,
 * and a basketball heading for the hoop along a dotted path.
 * Design space: 400 × 290 units.
 */

import type { Geo, Shape } from '@/lib/sketch/geometry';
import { S } from './shape';

/** Where the ball touches the ground and where its shadow sits, in design units (used to anchor the dribble). */
export const BALL_FOOT = { x: 318, y: 246 };
export const SHADOW_CENTRE = { x: 318, y: 268 };

export function campusScene(g: Geo): Shape[] {
  const columns = [76, 116, 164, 204].map((cx) => S(g.rrect(cx - 7, 146, cx + 7, 226, 2), 'blue', 2));
  const door = [...g.seg(128, 226, 128, 196), ...g.quad([128, 196], [140, 178], [152, 196]).slice(1), ...g.seg(152, 196, 152, 226).slice(1)];

  const shapes: Shape[] = [
    S(g.poly([[46, 128], [140, 78], [234, 128]], true), 'violet', 2.6), // pediment
    S(g.ell(140, 108, 9, 9), 'sun', 2.2),
    S(g.rrect(52, 128, 228, 144, 3), 'violet', 2.2),
    ...columns,
    S(door, 'ink', 2),
    S(g.seg(44, 232, 236, 231), 'ink', 2.2), // steps
    S(g.seg(34, 244, 246, 243), 'ink', 2.2),
    S(g.seg(140, 78, 140, 40), 'ink', 2), // flag
    S(g.poly([[140, 40], [171, 48], [140, 57]], true), 'coral', 2.4),
    S(g.poly([[212, 46], [244, 34], [276, 46], [244, 58]], true), 'ink', 2.4), // graduation cap
    S(g.poly([[226, 52], [227, 65], [262, 65], [262, 52]]), 'ink', 2),
    S(g.poly([[244, 46], [266, 56], [268, 74]]), 'sun', 2.2),
    S(g.quad([196, 32], [203, 21], [214, 18]), 'teal', 1.6),
    S(g.quad([186, 44], [192, 32], [202, 28]), 'teal', 1.6),
    S(g.rrect(318, 20, 384, 64, 4), 'coral', 2.2), // backboard and hoop
    S(g.rrect(338, 38, 362, 56, 2), 'coral', 1.8),
    S(g.ell(350, 71, 21, 5, { turns: 1.05 }), 'coral', 2.4),
    S(g.poly([[331, 73], [337, 96], [345, 75], [351, 98], [358, 75], [364, 96], [369, 73]]), 'ink', 1.6),
    // the basketball, its seams and motion marks live on the 'ball' layer so they can dribble
    S(g.ell(318, 206, 40, 40), 'orange', 2.8, 'ball'),
    S(g.seg(279, 206, 357, 206), 'ink', 2, 'ball'),
    S(g.quad([318, 166], [327, 206], [318, 246]), 'ink', 2, 'ball'),
    S(g.quad([292, 176], [309, 206], [292, 236]), 'ink', 2, 'ball'),
    S(g.quad([344, 176], [327, 206], [344, 236]), 'ink', 2, 'ball'),
    S(g.quad([262, 170], [255, 186], [262, 202]), 'orange', 1.8, 'ball'),
    S(g.quad([250, 178], [243, 192], [250, 207]), 'orange', 1.6, 'ball'),
    // its shadow shrinks as the ball rises
    S(g.ell(318, 268, 30, 5, { turns: 1 }), 'ink', 1.6, 'shadow'),
    S(g.sparkle(24, 96, 9), 'sun', 2.2),
    S(g.sparkle(388, 142, 8), 'pink', 2),
    S(g.sparkle(262, 126, 7), 'green', 2),
    S(g.ell(30, 190, 3, 3), 'teal', 2),
    S(g.ell(378, 250, 3, 3), 'violet', 2),
  ];

  // dotted path from the ball to the hoop
  const arc = g.quad([300, 164], [302, 92], [336, 82]);
  const n = arc.length;
  for (let k = 0; k < 5; k++) {
    const a = Math.floor((k / 5) * n);
    const b = Math.min(n - 1, a + Math.floor(n / 10));
    shapes.push(S(arc.slice(a, b + 1), 'teal', 2));
  }
  return shapes;
}
