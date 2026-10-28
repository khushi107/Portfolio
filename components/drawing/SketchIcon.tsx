import { geometry } from '@/lib/sketch/geometry';
import { hashString, mulberry32 } from '@/lib/sketch/random';
import { colorVar, sketchify, svgStrokes, wonk } from '@/lib/sketch/sketchify';
import { projectIcons } from '@/lib/doodles/projectIcons';

/**
 * A project card's doodle. The wobble is seeded from the icon's name, so the
 * same paths come out on the server and in the browser.
 */
export function SketchIcon({ name }: { name: keyof typeof projectIcons }) {
  const rng = mulberry32(hashString(name));
  const strokes = projectIcons[name](geometry(2)).flatMap(([pts, color, width]) => svgStrokes(sketchify(wonk(pts, rng), rng, 0.9), color, width));
  return (
    <svg className="sketch-svg" width="120" height="80" viewBox="0 0 120 80" aria-hidden="true">
      {strokes.map((s, i) => (
        <path key={i} d={s.d} stroke={colorVar(s.color)} strokeWidth={s.width.toFixed(2)} opacity={s.opacity} />
      ))}
    </svg>
  );
}
