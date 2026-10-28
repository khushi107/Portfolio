import type { ColorName, Pt, Shape } from '@/lib/sketch/geometry';

/** Small helper so doodle files read as a list of strokes: S(points, colour, width). */
export const S = (pts: Pt[], color: ColorName, width: number, layer?: string): Shape => [pts, color, width, layer];

/** Move and scale a group of shapes (used to shrink the robot into the hero scene). */
export function transformShapes(shapes: Shape[], ox: number, oy: number, k: number, bx: number, by: number, widthK = 1): Shape[] {
  return shapes.map(([pts, c, w, layer]) => [pts.map(([x, y]) => [ox + (x - bx) * k, oy + (y - by) * k] as Pt), c, w * widthK, layer]);
}
