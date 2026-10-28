import { geometry, TAU, type Pt, type ShapeFn } from '@/lib/sketch/geometry';
import { mulberry32 } from '@/lib/sketch/random';
import { resolveColor, sketchify, wonk, type XY } from '@/lib/sketch/sketchify';
import type { LineOp, Rect } from './types';

/** Cumulative distances along a list of points. */
export function cumulative(pts: XY[]): number[] {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return cum;
}

export function lineOp(a: XY[], b: XY[], color: string, width: number, phase: number, speedK = 1): LineOp {
  const cum = cumulative(a);
  return { kind: 'line', pts: a, b, cum, len: cum[cum.length - 1], ox: 0, oy: 0, drawn: -1, speedK, color, width, phase };
}

/**
 * Turn a doodle (designed in its own units) into pen strokes positioned in
 * `rect`, in the coordinate space of the drawer's host element.
 */
export function doodleOps(rect: Rect, shapes: ShapeFn, designWidth: number, seed: number): LineOp[] {
  const scale = rect.w / designWidth;
  const rng = mulberry32(seed);
  const cs = getComputedStyle(document.documentElement);
  const g = geometry(3 / scale); // about one point every 3 screen pixels
  const widthK = Math.min(1.3, Math.max(0.85, scale));
  const amp = 1.5 * Math.min(1.3, Math.max(0.8, scale));
  return shapes(g).map(([pts, color, width, layer]) => {
    const placed = wonk(pts.map(([x, y]) => [rect.x + x * scale, rect.y + y * scale] as Pt), rng);
    const s = sketchify(placed, rng, amp);
    return { ...lineOp(s.a, s.b, resolveColor(color, cs), width * widthK, rng() * TAU, 1.3), layer };
  });
}
