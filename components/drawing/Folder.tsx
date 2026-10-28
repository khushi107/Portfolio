import { geometry, type ColorName, type Pt } from '@/lib/sketch/geometry';
import { hashString, mulberry32 } from '@/lib/sketch/random';
import { colorVar, sketchify, svgStrokes, toPathData, wonk } from '@/lib/sketch/sketchify';

/*
 * A hand-drawn folder in two pieces (design space 140 × 100): the back with
 * its tab, and the front flap. The skill sheet slides up between them.
 */

const BACK: Pt[] = [[6, 94], [6, 12], [10, 8], [48, 8], [56, 18], [130, 18], [134, 22], [134, 94]];

function sketch(pts: Pt[], seed: string, color: ColorName, width: number) {
  const rng = mulberry32(hashString(seed));
  const stroke = sketchify(wonk(pts, rng, 0.4), rng, 0.8);
  return { fill: toPathData(stroke.a) + 'Z', strokes: svgStrokes(stroke, color, width) };
}

/** Fill mixes the folder's colour into the page colour, so it is opaque in both themes. */
const tint = (color: ColorName, percent: number) => `color-mix(in srgb, ${colorVar(color)} ${percent}%, var(--paper))`;

export function FolderBack({ color, seed }: { color: ColorName; seed: string }) {
  const g = geometry(2);
  const { fill, strokes } = sketch(g.poly(BACK, true), `${seed}-back`, color, 2.2);
  return (
    <svg className="folder-svg" viewBox="0 0 140 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={fill} fill={tint(color, 22)} stroke="none" />
      {strokes.map((s, i) => (
        <path key={i} d={s.d} fill="none" stroke={colorVar(s.color)} strokeWidth={s.width} opacity={s.opacity} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

export function FolderFront({ color, seed }: { color: ColorName; seed: string }) {
  const g = geometry(2);
  const { fill, strokes } = sketch(g.rrect(2, 34, 138, 98, 8), `${seed}-front`, color, 2.4);
  return (
    <svg className="folder-svg" viewBox="0 0 140 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={fill} fill={tint(color, 38)} stroke="none" />
      {strokes.map((s, i) => (
        <path key={i} d={s.d} fill="none" stroke={colorVar(s.color)} strokeWidth={s.width} opacity={s.opacity} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
