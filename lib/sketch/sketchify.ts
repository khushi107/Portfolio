/**
 * The "hand-drawn" look. A perfect shape becomes two imperfect strokes:
 *  1. wonk()      tilts and stretches the whole shape a little;
 *  2. sketchify() adds a slow wobble along the line, lets the ends overshoot,
 *                 and returns a second, slightly offset pass, like going over a
 *                 line twice with a pen.
 */
import { TAU, type ColorName, type Pt } from './geometry';
import type { Rng } from './random';

export interface XY {
  x: number;
  y: number;
}
export interface SketchStroke {
  a: XY[];
  b: XY[];
}

/** Rotate by up to ±2.3° and stretch by up to ±3% around the shape's centre. */
export function wonk(pts: Pt[], rng: Rng, k = 1): Pt[] {
  let cx = 0;
  let cy = 0;
  for (const p of pts) {
    cx += p[0];
    cy += p[1];
  }
  cx /= pts.length;
  cy /= pts.length;
  const a = (rng() - 0.5) * 0.08 * k;
  const sx = 1 + (rng() - 0.5) * 0.06 * k;
  const sy = 1 + (rng() - 0.5) * 0.06 * k;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => {
    const dx = (x - cx) * sx;
    const dy = (y - cy) * sy;
    return [cx + dx * c - dy * s, cy + dx * s + dy * c];
  });
}

/**
 * Offsets every point along its normal by a sum of two slow sine waves, so
 * the line drifts instead of jittering. `amp` is the wobble size in pixels.
 */
export function sketchify(input: Pt[], rng: Rng, amp: number): SketchStroke {
  const pts = input.length < 2 ? [input[0], [input[0][0] + 0.5, input[0][1]] as Pt] : input;
  const extend = (p: Pt, q: Pt, l: number): Pt => {
    const dx = p[0] - q[0];
    const dy = p[1] - q[1];
    const d = Math.hypot(dx, dy) || 1;
    return [p[0] + (dx / d) * l, p[1] + (dy / d) * l];
  };
  // overshoot both ends, the way a quick pen stroke does
  const base: Pt[] = [
    extend(pts[0], pts[1], rng() * amp * 2.2),
    ...pts,
    extend(pts[pts.length - 1], pts[pts.length - 2], rng() * amp * 2.8),
  ];

  const pass = (k: number, shift: number): XY[] => {
    const p1 = rng() * TAU;
    const p2 = rng() * TAU;
    const f1 = (0.02 + rng() * 0.03) / Math.max(0.4, amp);
    const f2 = (0.07 + rng() * 0.05) / Math.max(0.4, amp);
    let travelled = 0;
    return base.map((p, i) => {
      if (i) travelled += Math.hypot(p[0] - base[i - 1][0], p[1] - base[i - 1][1]);
      const next = base[Math.min(base.length - 1, i + 1)];
      const prev = base[Math.max(0, i - 1)];
      const tx = next[0] - prev[0];
      const ty = next[1] - prev[1];
      const tl = Math.hypot(tx, ty) || 1;
      const off = amp * k * (Math.sin(travelled * f1 + p1) * 0.65 + Math.sin(travelled * f2 + p2) * 0.35) + shift;
      return { x: p[0] - (ty / tl) * off, y: p[1] + (tx / tl) * off };
    });
  };

  return { a: pass(1, 0), b: pass(1.3, (rng() - 0.5) * amp * 1.6) };
}

/** SVG path data for a list of points. */
export function toPathData(pts: XY[]): string {
  return 'M' + pts.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join('L');
}

/** CSS variable for a doodle colour, for SVG strokes. */
export const colorVar = (c: ColorName) => (c === 'ink' ? 'var(--ink)' : `var(--c-${c})`);

/** Resolved colour value for a doodle colour, for canvas drawing. */
export function resolveColor(c: ColorName, cs: CSSStyleDeclaration = getComputedStyle(document.documentElement)): string {
  return cs.getPropertyValue(c === 'ink' ? '--ink' : `--c-${c}`).trim() || '#2b44c9';
}

export interface SvgStroke {
  d: string;
  color: ColorName;
  width: number;
  opacity: number;
}

/** Turn a sketch stroke into the two SVG paths it is drawn with. */
export function svgStrokes(stroke: SketchStroke, color: ColorName, width: number): SvgStroke[] {
  return [
    { d: toPathData(stroke.a), color, width, opacity: 1 },
    { d: toPathData(stroke.b), color, width: width * 0.55, opacity: 0.9 },
  ];
}
