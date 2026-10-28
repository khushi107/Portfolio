/**
 * Fig. 1 in the hero: a website wireframe at the back, a chain of
 * blockchain blocks under it, and a small busy robot in front.
 * Design space: 400 × 315 units, scaled to the slot at runtime.
 */
import type { Geo, Pt, Shape } from '@/lib/sketch/geometry';
import { S, transformShapes } from './shape';

/** The robot on its own (design space 400 × 315, robot body around x 108–338). */
export function robot(g: Geo): Shape[] {
  const ticks = [210, 232, 254].flatMap((y) => [
    S(g.poly([[289, y], [294, y + 5], [303, y - 6]]), 'green', 2.4),
    S(g.seg(310, y - 1, 328, y - 1), 'ink', 1.8),
  ]);
  return [
    S(g.rrect(140, 62, 260, 140, 22), 'blue', 2.6), // head
    S(g.seg(200, 62, 200, 40), 'blue', 2.2), // antenna
    S(g.ell(200, 31, 8, 8), 'coral', 2.4),
    S(g.ell(173, 96, 11, 11), 'ink', 2.2), // eyes
    S(g.ell(227, 96, 11, 11), 'ink', 2.2),
    S(g.ell(176, 98, 2.5, 2.5, { turns: 1.6 }), 'ink', 2.6),
    S(g.ell(230, 98, 2.5, 2.5, { turns: 1.6 }), 'ink', 2.6),
    S(g.quad([182, 117], [200, 133], [218, 117]), 'coral', 2.4), // smile
    S(g.ell(157, 119, 5, 4), 'pink', 2), // cheeks
    S(g.ell(243, 119, 5, 4), 'pink', 2),
    S(g.seg(192, 140, 192, 152), 'ink', 2), // neck
    S(g.seg(208, 140, 208, 152), 'ink', 2),
    S(g.rrect(148, 152, 252, 238, 18), 'violet', 2.6), // body
    S(g.poly([[207, 166], [188, 196], [202, 196], [193, 224], [216, 188], [201, 188], [212, 166]], true), 'sun', 2.4), // bolt
    S(g.quad([148, 172], [116, 168], [110, 130]), 'blue', 2.4), // waving arm
    S(g.ell(108, 121, 8, 8), 'blue', 2.2),
    S(g.quad([90, 122], [82, 112], [89, 100]), 'teal', 1.8),
    S(g.quad([78, 127], [68, 112], [77, 95]), 'teal', 1.8),
    S(g.quad([252, 176], [270, 194], [283, 204]), 'blue', 2.4), // arm holding the clipboard
    S(g.rrect(280, 182, 338, 266, 6), 'sun', 2.4),
    S(g.rrect(296, 176, 322, 190, 4), 'ink', 2),
    ...ticks,
    S(g.seg(176, 238, 176, 249), 'ink', 2), // wheels
    S(g.seg(224, 238, 224, 249), 'ink', 2),
    S(g.ell(176, 262, 13, 13), 'ink', 2.4),
    S(g.ell(224, 262, 13, 13), 'ink', 2.4),
    S(g.ell(176, 262, 3, 3, { turns: 1.5 }), 'ink', 2),
    S(g.ell(224, 262, 3, 3, { turns: 1.5 }), 'ink', 2),
    S(g.seg(116, 281, 302, 280), 'ink', 1.6), // ground
    S(g.seg(98, 252, 132, 252), 'teal', 2), // speed lines
    S(g.seg(86, 265, 126, 265), 'teal', 2),
    S(g.rrect(272, 26, 352, 78, 16), 'teal', 2.2), // speech bubble with a tick
    S(g.poly([[287, 77], [271, 96], [302, 79]]), 'teal', 2.2),
    S(g.poly([[295, 52], [306, 63], [328, 40]]), 'green', 2.8),
  ];
}

export function heroScene(g: Geo): Shape[] {
  const website: Shape[] = [
    S(g.rrect(10, 12, 236, 196, 14), 'blue', 2.4),
    S(g.seg(10, 34, 236, 34), 'blue', 1.8),
    S(g.ell(24, 23, 3.5, 3.5), 'coral', 1.8),
    S(g.ell(36, 23, 3.5, 3.5), 'sun', 1.8),
    S(g.ell(48, 23, 3.5, 3.5), 'green', 1.8),
    S(g.rrect(84, 18, 200, 28, 5), 'ink', 1.4),
    S(g.seg(26, 58, 118, 58), 'ink', 3.4),
    S(g.seg(26, 72, 96, 72), 'ink', 3.4),
    S(g.seg(26, 90, 112, 90), 'ink', 1.4),
    S(g.seg(26, 99, 104, 99), 'ink', 1.4),
    S(g.seg(26, 108, 108, 108), 'ink', 1.4),
    S(g.rrect(26, 120, 84, 136, 8), 'coral', 2),
    S(g.rrect(132, 48, 220, 136, 8), 'violet', 2),
    S(g.ell(200, 66, 7, 7), 'sun', 1.8),
    S(g.quad([136, 128], [160, 84], [182, 120]), 'green', 1.8),
    S(g.quad([168, 126], [192, 94], [218, 130]), 'green', 1.8),
    S(g.rrect(26, 150, 94, 184, 6), 'teal', 1.8),
    S(g.rrect(104, 150, 166, 184, 6), 'teal', 1.8),
    S(g.rrect(176, 150, 222, 184, 6), 'teal', 1.8),
  ];

  // an isometric block with a hash mark on its face
  const block = (x: number, y: number, s: number, color: 'violet' | 'teal' | 'orange'): Shape[] => {
    const face: Pt[] = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]];
    return [
      S(g.poly(face, true), color, 2.2),
      S(g.poly([[x, y], [x + s * 0.35, y - s * 0.35], [x + s * 1.35, y - s * 0.35], [x + s, y]]), color, 2),
      S(g.poly([[x + s * 1.35, y - s * 0.35], [x + s * 1.35, y + s * 0.65], [x + s, y + s]]), color, 2),
      S(g.seg(x + s * 0.38, y + s * 0.22, x + s * 0.32, y + s * 0.8), 'ink', 1.4),
      S(g.seg(x + s * 0.66, y + s * 0.2, x + s * 0.6, y + s * 0.78), 'ink', 1.4),
      S(g.seg(x + s * 0.18, y + s * 0.4, x + s * 0.84, y + s * 0.38), 'ink', 1.4),
      S(g.seg(x + s * 0.16, y + s * 0.62, x + s * 0.82, y + s * 0.6), 'ink', 1.4),
    ];
  };
  const link = (x: number, y: number): Shape[] => [
    S(g.ell(x, y, 8, 4.5, { turns: 1.05 }), 'ink', 1.8),
    S(g.ell(x + 10, y, 8, 4.5, { turns: 1.05 }), 'ink', 1.8),
  ];
  const chain = [...block(18, 242, 38, 'violet'), ...link(80, 264), ...block(100, 242, 38, 'teal'), ...link(162, 264), ...block(182, 242, 38, 'orange')];

  // the robot at about half size, standing in front on the right
  const smallRobot = transformShapes(robot(g), 247, 150, 0.52, 78, 24, 0.85);

  const sparkles: Shape[] = [
    S(g.sparkle(264, 44, 9), 'pink', 2),
    S(g.sparkle(330, 92, 7), 'sun', 2),
    S(g.sparkle(384, 36, 6), 'teal', 1.8),
    S(g.sparkle(390, 128, 7), 'coral', 2),
    S(g.ell(300, 24, 2.5, 2.5), 'violet', 2),
    S(g.ell(12, 216, 2.5, 2.5), 'coral', 2),
  ];

  return [...website, ...chain, ...smallRobot, ...sparkles];
}
