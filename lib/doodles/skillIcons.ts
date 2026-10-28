/**
 * A small hand-drawn logo for every skill (design space 40 × 40).
 * Recognisable things get a picture (Java's coffee cup, React's atom, Git's
 * branches); the rest get a sketchy badge with letters in handwriting.
 */
import { TAU, type ColorName, type Geo, type Pt, type Shape } from '@/lib/sketch/geometry';
import { S } from './shape';

export interface SkillIcon {
  shapes: (g: Geo) => Shape[];
  /** Letters written inside the icon. */
  label?: { text: string; color: ColorName; size?: number; y?: number };
}

// ---------- building blocks ----------
const box = (g: Geo, c: ColorName): Shape[] => [S(g.rrect(4, 5, 36, 35, 8), c, 2.2)];
const disc = (g: Geo, c: ColorName): Shape[] => [S(g.ell(20, 20, 15, 15), c, 2.2)];
const hexagon = (g: Geo, c: ColorName): Shape[] => [
  S(g.poly(Array.from({ length: 6 }, (_, i) => [20 + Math.cos((i / 6) * TAU - Math.PI / 2) * 16, 20 + Math.sin((i / 6) * TAU - Math.PI / 2) * 16] as Pt), true), c, 2.2),
];
const cylinder = (g: Geo, c: ColorName): Shape[] => [
  S(g.ell(20, 9, 13, 4.5, { turns: 1.02 }), c, 2.2),
  S(g.seg(7, 9, 7, 30), c, 2.2),
  S(g.seg(33, 9, 33, 30), c, 2.2),
  S(g.quad([7, 30], [20, 39], [33, 30]), c, 2.2),
  S(g.quad([7, 19], [20, 27], [33, 19]), c, 1.4),
];
const cloud = (g: Geo, c: ColorName): Shape[] => [
  S([...g.quad([9, 29], [2, 22], [10, 17]), ...g.quad([10, 17], [12, 7], [22, 10]).slice(1), ...g.quad([22, 10], [33, 7], [32, 18]).slice(1), ...g.quad([32, 18], [40, 22], [32, 29]).slice(1), ...g.seg(32, 29, 9, 29).slice(1)], c, 2.2),
];
const letters = (text: string, color: ColorName, size?: number, y?: number) => ({ text, color, size, y });

// ---------- the icons ----------
export const skillIcons: Record<string, SkillIcon> = {
  // languages
  Python: {
    shapes: (g) => [
      S(g.quad([9, 12], [22, 2], [27, 14]), 'blue', 2.6),
      S(g.quad([27, 14], [31, 22], [20, 22]), 'blue', 2.6),
      S(g.quad([20, 22], [8, 23], [13, 31]), 'sun', 2.6),
      S(g.quad([13, 31], [20, 39], [32, 29]), 'sun', 2.6),
      S(g.ell(14, 11, 1.4, 1.4, { turns: 1.4 }), 'ink', 2),
    ],
  },
  Java: {
    shapes: (g) => [
      S(g.rrect(8, 17, 28, 35, 5), 'coral', 2.4),
      S(g.quad([28, 21], [37, 22], [28, 30]), 'coral', 2),
      S(g.quad([13, 13], [11, 9], [14, 5]), 'ink', 1.6),
      S(g.quad([19, 13], [17, 9], [20, 5]), 'ink', 1.6),
      S(g.quad([25, 13], [23, 9], [26, 5]), 'ink', 1.6),
    ],
  },
  TypeScript: { shapes: (g) => box(g, 'blue'), label: letters('TS', 'blue') },
  JavaScript: { shapes: (g) => box(g, 'sun'), label: letters('JS', 'sun') },
  'C++': { shapes: (g) => disc(g, 'violet'), label: letters('C++', 'violet', 11) },
  SQL: { shapes: (g) => cylinder(g, 'teal'), label: letters('sql', 'teal', 9, 25) },
  Dart: {
    shapes: (g) => [
      S(g.ell(17, 23, 13, 13), 'teal', 2.2),
      S(g.ell(17, 23, 5, 5), 'coral', 2),
      S(g.seg(17, 23, 35, 5), 'ink', 2),
      S(g.poly([[30, 4], [36, 4], [36, 10]]), 'ink', 1.8),
    ],
  },
  Solidity: {
    shapes: (g) => [
      S(g.poly([[20, 3], [32, 20], [20, 37], [8, 20]], true), 'violet', 2.4),
      S(g.seg(8, 20, 32, 20), 'violet', 1.6),
      S(g.seg(20, 3, 20, 37), 'violet', 1.4),
    ],
  },
  Apex: { shapes: (g) => cloud(g, 'blue'), label: letters('A', 'blue', 12, 22) },

  // frontend and mobile
  React: {
    shapes: (g) => [
      S(g.ell(20, 20, 17, 6.5, { turns: 1.03 }), 'teal', 1.8),
      S(g.ell(20, 20, 17, 6.5, { turns: 1.03, tilt: Math.PI / 3 }), 'teal', 1.8),
      S(g.ell(20, 20, 17, 6.5, { turns: 1.03, tilt: -Math.PI / 3 }), 'teal', 1.8),
      S(g.ell(20, 20, 2.2, 2.2, { turns: 1.5 }), 'teal', 2.4),
    ],
  },
  'Lightning Web Components': {
    shapes: (g) => [
      ...cloud(g, 'blue'),
      S(g.poly([[22, 12], [16, 21], [21, 21], [17, 30], [25, 19], [20, 19], [23, 12]]), 'sun', 1.8),
    ],
  },
  Flutter: {
    shapes: (g) => [
      S(g.poly([[25, 4], [7, 21], [13, 27], [37, 4]], true), 'blue', 2.2),
      S(g.poly([[25, 21], [15, 31], [21, 37], [37, 21]], true), 'teal', 2.2),
    ],
  },
  'HTML5 / CSS3': {
    shapes: (g) => [
      S(g.poly([[13, 11], [4, 20], [13, 29]]), 'coral', 2.4),
      S(g.poly([[27, 11], [36, 20], [27, 29]]), 'coral', 2.4),
      S(g.seg(23, 8, 17, 32), 'blue', 2.2),
    ],
  },
  'Material UI': {
    shapes: (g) => [
      S(g.poly([[5, 32], [5, 10], [20, 22], [35, 10], [35, 32]]), 'blue', 2.6),
      S(g.seg(20, 22, 20, 34), 'blue', 1.8),
    ],
  },

  // backend and APIs
  'Node.js': { shapes: (g) => hexagon(g, 'green'), label: letters('n', 'green', 15) },
  Express: { shapes: (g) => box(g, 'ink'), label: letters('ex', 'ink') },
  'REST APIs': {
    shapes: (g) => [
      S(g.seg(6, 14, 33, 14), 'green', 2.2),
      S(g.poly([[27, 8], [34, 14], [27, 20]]), 'green', 2.2),
      S(g.seg(34, 27, 7, 27), 'coral', 2.2),
      S(g.poly([[13, 21], [6, 27], [13, 33]]), 'coral', 2.2),
    ],
  },
  Microservices: {
    shapes: (g) => [
      S(g.rrect(3, 4, 16, 16, 3), 'violet', 2),
      S(g.rrect(24, 4, 37, 16, 3), 'violet', 2),
      S(g.rrect(13, 24, 27, 36, 3), 'violet', 2),
      S(g.seg(16, 10, 24, 10), 'ink', 1.4),
      S(g.seg(10, 16, 16, 24), 'ink', 1.4),
      S(g.seg(30, 16, 24, 24), 'ink', 1.4),
    ],
  },
  'Spring Boot': {
    shapes: (g) => [
      S(g.quad([8, 33], [6, 8], [33, 6]), 'green', 2.4),
      S(g.quad([33, 6], [34, 30], [8, 33]), 'green', 2.4),
      S(g.quad([8, 33], [18, 22], [28, 12]), 'green', 1.4),
    ],
  },

  // data and cloud
  PostgreSQL: { shapes: (g) => cylinder(g, 'blue'), label: letters('pg', 'blue', 9, 25) },
  MySQL: { shapes: (g) => cylinder(g, 'orange'), label: letters('my', 'orange', 9, 25) },
  MongoDB: {
    shapes: (g) => [
      S(g.quad([20, 3], [36, 20], [20, 35]), 'green', 2.4),
      S(g.quad([20, 35], [4, 20], [20, 3]), 'green', 2.4),
      S(g.seg(20, 8, 20, 38), 'green', 1.6),
    ],
  },
  Firebase: {
    shapes: (g) => [
      S([...g.quad([10, 34], [4, 22], [14, 16]), ...g.quad([14, 16], [14, 22], [18, 23]).slice(1), ...g.quad([18, 23], [16, 10], [24, 3]).slice(1), ...g.quad([24, 3], [24, 14], [30, 18]).slice(1), ...g.quad([30, 18], [36, 30], [10, 34]).slice(1)], 'orange', 2.2),
      S(g.quad([16, 33], [14, 26], [20, 22]), 'sun', 1.8),
    ],
  },
  'Salesforce CRM': { shapes: (g) => cloud(g, 'blue') },
  Docker: {
    shapes: (g) => [
      ...[8, 16, 24].map((x) => S(g.rrect(x, 15, x + 7, 21, 1), 'blue', 1.6)),
      ...[16, 24].map((x) => S(g.rrect(x, 8, x + 7, 14, 1), 'blue', 1.6)),
      S(g.quad([3, 23], [8, 36], [24, 33]), 'blue', 2.2),
      S(g.quad([24, 33], [34, 30], [37, 22]), 'blue', 2.2),
      S(g.seg(3, 23, 37, 22), 'blue', 1.6),
    ],
  },

  // automation
  'Workflow automation': {
    shapes: (g) => [
      S(g.gear(14, 15, 8, 7), 'violet', 1.8),
      S(g.ell(14, 15, 2.5, 2.5), 'violet', 1.6),
      S(g.gear(28, 28, 6.5, 6), 'orange', 1.8),
      S(g.ell(28, 28, 2, 2), 'orange', 1.6),
    ],
  },
  'DevRev Snap-ins': {
    shapes: (g) => [
      S([...g.seg(6, 12, 15, 12), ...g.quad([15, 12], [20, 3], [25, 12]).slice(1), ...g.seg(25, 12, 34, 12).slice(1), ...g.seg(34, 12, 34, 35).slice(1), ...g.seg(34, 35, 6, 35).slice(1), ...g.seg(6, 35, 6, 28).slice(1), ...g.quad([6, 28], [14, 23.5], [6, 19]).slice(1), ...g.seg(6, 19, 6, 12).slice(1)], 'teal', 2.2),
    ],
  },
  'Python automation': {
    shapes: (g) => [
      S(g.quad([6, 12], [16, 3], [20, 13]), 'blue', 2.4),
      S(g.quad([20, 13], [23, 22], [12, 24]), 'sun', 2.4),
      S(g.gear(28, 27, 6.5, 6), 'violet', 1.8),
      S(g.ell(28, 27, 2, 2), 'violet', 1.6),
    ],
  },
  'Salesforce Flow': {
    shapes: (g) => [
      S(g.rrect(12, 3, 28, 12, 3), 'blue', 2),
      S(g.seg(20, 12, 20, 18), 'ink', 1.6),
      S(g.poly([[20, 18], [29, 25], [20, 32], [11, 25]], true), 'coral', 2),
      S(g.seg(29, 25, 36, 25), 'ink', 1.4),
      S(g.seg(20, 32, 20, 37), 'ink', 1.4),
    ],
  },
  Cursor: {
    shapes: (g) => [
      S(g.poly([[9, 4], [9, 32], [16, 25], [21, 36], [26, 34], [21, 23], [31, 23]], true), 'ink', 2.2),
    ],
  },

  // core CS
  'Data structures': {
    shapes: (g) => [
      S(g.ell(20, 7, 4, 4), 'teal', 1.8),
      S(g.ell(9, 22, 4, 4), 'teal', 1.8),
      S(g.ell(31, 22, 4, 4), 'teal', 1.8),
      S(g.ell(25, 35, 3.5, 3.5), 'teal', 1.8),
      S(g.seg(17, 10, 11, 18), 'ink', 1.4),
      S(g.seg(23, 10, 29, 18), 'ink', 1.4),
      S(g.seg(30, 26, 27, 32), 'ink', 1.4),
    ],
  },
  Algorithms: {
    shapes: (g) => [7, 14, 21, 28].map((x, i) => S(g.seg(x + 2, 35, x + 2, 29 - i * 7), (['coral', 'sun', 'green', 'blue'] as ColorName[])[i], 4)),
  },
  'Object-oriented design': {
    shapes: (g) => [
      S(g.rrect(6, 5, 34, 35, 3), 'violet', 2.2),
      S(g.seg(6, 14, 34, 14), 'violet', 1.6),
      S(g.seg(6, 25, 34, 25), 'violet', 1.6),
      S(g.seg(11, 19, 26, 19), 'ink', 1.2),
      S(g.seg(11, 30, 22, 30), 'ink', 1.2),
    ],
  },
  DBMS: { shapes: (g) => cylinder(g, 'teal') },
  'Operating systems': {
    shapes: (g) => [
      S(g.rrect(3, 7, 37, 33, 4), 'ink', 2.2),
      S(g.seg(3, 13, 37, 13), 'ink', 1.4),
      S(g.poly([[9, 19], [14, 23], [9, 27]]), 'green', 2),
      S(g.seg(17, 28, 25, 28), 'green', 2),
    ],
  },
  'PBFT consensus': {
    shapes: (g) => {
      const nodes: Pt[] = [[8, 8], [32, 8], [32, 32], [8, 32]];
      const links: Shape[] = [];
      for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) links.push(S(g.seg(nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1]), 'ink', 1));
      return [...links, ...nodes.map(([x, y]) => S(g.ell(x, y, 4, 4), 'green', 2))];
    },
  },

  // tools
  Git: {
    shapes: (g) => [
      S(g.seg(12, 9, 12, 31), 'coral', 2.2),
      S(g.quad([12, 25], [12, 17], [28, 15]), 'coral', 2.2),
      S(g.ell(12, 7, 3.5, 3.5), 'coral', 2),
      S(g.ell(12, 33, 3.5, 3.5), 'coral', 2),
      S(g.ell(29, 13, 3.5, 3.5), 'coral', 2),
    ],
  },
  Postman: {
    shapes: (g) => [
      ...disc(g, 'orange'),
      S(g.poly([[13, 27], [27, 13], [24, 25]]), 'orange', 1.8),
      S(g.seg(13, 27, 21, 21), 'orange', 1.4),
    ],
  },
  Selenium: { shapes: (g) => box(g, 'green'), label: letters('Se', 'green') },
  'Remix IDE': { shapes: (g) => disc(g, 'blue'), label: letters('R', 'blue', 14) },
  MetaMask: {
    shapes: (g) => [
      S(g.poly([[5, 6], [15, 13], [25, 13], [35, 6], [31, 26], [20, 35], [9, 26]], true), 'orange', 2.2),
      S(g.ell(14, 20, 1.6, 1.6, { turns: 1.4 }), 'ink', 2),
      S(g.ell(26, 20, 1.6, 1.6, { turns: 1.4 }), 'ink', 2),
    ],
  },

  // currently learning
  'Anthropic certification': {
    shapes: (g) => [
      S(g.ell(20, 15, 10, 10), 'sun', 2.2),
      S(g.ell(20, 15, 5, 5), 'coral', 1.6),
      S(g.poly([[14, 23], [10, 37], [16, 33], [19, 37], [20, 25]]), 'coral', 1.8),
      S(g.poly([[26, 23], [30, 37], [24, 33], [21, 37], [20, 25]]), 'coral', 1.8),
    ],
  },
  n8n: {
    shapes: (g) => [
      S(g.ell(7, 20, 4, 4), 'pink', 2),
      S(g.ell(20, 12, 4, 4), 'pink', 2),
      S(g.ell(20, 28, 4, 4), 'pink', 2),
      S(g.ell(33, 20, 4, 4), 'pink', 2),
      S(g.seg(11, 18, 16, 14), 'ink', 1.4),
      S(g.seg(11, 22, 16, 26), 'ink', 1.4),
      S(g.seg(24, 14, 29, 18), 'ink', 1.4),
      S(g.seg(24, 26, 29, 22), 'ink', 1.4),
    ],
  },
  Clay: {
    shapes: (g) => [S([...g.quad([8, 30], [2, 18], [12, 12]), ...g.quad([12, 12], [20, 4], [28, 12]).slice(1), ...g.quad([28, 12], [38, 18], [32, 30]).slice(1), ...g.seg(32, 30, 8, 30).slice(1)], 'violet', 2.2)],
    label: letters('clay', 'violet', 8, 23),
  },
};

/** The icon for a skill, or a lettermark badge from its initials if it has none. */
export function iconFor(name: string): SkillIcon {
  if (skillIcons[name]) return skillIcons[name];
  const initials = name
    .split(/[\s./-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  return { shapes: (g) => box(g, 'ink'), label: letters(initials || '?', 'ink') };
}
