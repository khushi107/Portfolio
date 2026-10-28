import { geometry } from '@/lib/sketch/geometry';
import { hashString, mulberry32 } from '@/lib/sketch/random';
import { colorVar, sketchify, svgStrokes, wonk } from '@/lib/sketch/sketchify';
import { iconFor } from '@/lib/doodles/skillIcons';

/** A skill's hand-drawn logo. Seeded by the skill name, so it renders the same on the server and in the browser. */
export function SkillIcon({ name, size = 28 }: { name: string; size?: number }) {
  const icon = iconFor(name);
  const rng = mulberry32(hashString(name));
  const strokes = icon.shapes(geometry(1.5)).flatMap(([pts, color, width]) => svgStrokes(sketchify(wonk(pts, rng, 0.8), rng, 0.55), color, width * 0.9));
  const label = icon.label;
  return (
    <svg className="skill-icon" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {strokes.map((s, i) => (
        <path key={i} d={s.d} stroke={colorVar(s.color)} strokeWidth={s.width.toFixed(2)} opacity={s.opacity} />
      ))}
      {label && (
        <text
          x="20"
          y={label.y ?? 21}
          textAnchor="middle"
          dominantBaseline="central"
          fill={colorVar(label.color)}
          style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: (label.size ?? (label.text.length > 2 ? 10 : 13)) + 1 }}
        >
          {label.text}
        </text>
      )}
    </svg>
  );
}
