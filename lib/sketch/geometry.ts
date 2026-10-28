/**
 * Ideal shapes as dense point lists. Everything is sampled every `step`
 * units so the sketchify pass and the pen have evenly spaced points to work with.
 */
export type Pt = [number, number];
export type ColorName = 'blue' | 'coral' | 'sun' | 'green' | 'violet' | 'orange' | 'pink' | 'teal' | 'ink';
/** A shape to draw: its points, its colour, its stroke width and, optionally, a named canvas layer to draw it on. */
export type Shape = [Pt[], ColorName, number, string?];
export type ShapeFn = (g: Geo) => Shape[];

const TAU = Math.PI * 2;

export function sampleSegment(a: Pt, b: Pt, step: number): Pt[] {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(1, Math.ceil(len / step));
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

function joinPolyline(list: Pt[], step: number): Pt[] {
  let out: Pt[] = [];
  for (let i = 1; i < list.length; i++) {
    const s = sampleSegment(list[i - 1], list[i], step);
    out = out.concat(i > 1 ? s.slice(1) : s);
  }
  return out;
}

export interface EllipseOptions {
  /** How many times round; a little over 1 leaves a hand-drawn overlap. */
  turns?: number;
  /** Start angle in radians. */
  start?: number;
  /** Rotation in radians. */
  tilt?: number;
}

export function geometry(step: number) {
  return {
    seg: (x1: number, y1: number, x2: number, y2: number) => sampleSegment([x1, y1], [x2, y2], step),

    poly: (pts: Pt[], closed = false) => joinPolyline(closed ? [...pts, pts[0]] : pts, step),

    /** Quadratic Bézier from a to b with control point c. */
    quad: (a: Pt, c: Pt, b: Pt): Pt[] => {
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]) + Math.hypot(b[0] - c[0], b[1] - c[1]);
      const n = Math.max(4, Math.ceil(len / step));
      const out: Pt[] = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
      }
      return out;
    },

    /** An ellipse that spirals out slightly, so the end never meets the start exactly. */
    ell: (cx: number, cy: number, rx: number, ry: number, o: EllipseOptions = {}): Pt[] => {
      const { turns = 1.08, start = -2.4, tilt = 0 } = o;
      const n = Math.max(10, Math.ceil((Math.PI * (rx + ry) * turns) / step));
      const out: Pt[] = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const a = start + t * turns * TAU;
        const k = 1 + 0.04 * t;
        const x = Math.cos(a) * rx * k;
        const y = Math.sin(a) * ry * k;
        out.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
      }
      return out;
    },

    /** Rounded rectangle drawn in one stroke, ending with a small overlap. */
    rrect: (x1: number, y1: number, x2: number, y2: number, radius: number): Pt[] => {
      const r = Math.min(radius, (x2 - x1) / 2, (y2 - y1) / 2);
      const arc = (cx: number, cy: number, a0: number): Pt[] => {
        const n = Math.max(3, Math.ceil((r * 1.571) / step));
        const o: Pt[] = [];
        for (let i = 1; i <= n; i++) {
          const a = a0 + (i / n) * (Math.PI / 2);
          o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
        return o;
      };
      const S = (ax: number, ay: number, bx: number, by: number) => sampleSegment([ax, ay], [bx, by], step).slice(1);
      return [
        [x1 + r, y1],
        ...S(x1 + r, y1, x2 - r, y1),
        ...arc(x2 - r, y1 + r, -Math.PI / 2),
        ...S(x2, y1 + r, x2, y2 - r),
        ...arc(x2 - r, y2 - r, 0),
        ...S(x2 - r, y2, x1 + r, y2),
        ...arc(x1 + r, y2 - r, Math.PI / 2),
        ...S(x1, y2 - r, x1, y1 + r),
        ...arc(x1 + r, y1 + r, Math.PI),
        ...S(x1 + r, y1, x1 + r + Math.min(8, (x2 - x1) * 0.18), y1 + 0.6),
      ];
    },

    /** Four-point sparkle with concave, curved sides. */
    sparkle: (cx: number, cy: number, s: number): Pt[] => {
      const tips: Pt[] = ([[0, -1], [1, 0], [0, 1], [-1, 0], [0, -1]] as Pt[]).map(([a, b]) => [a * s, b * s * 1.15]);
      const out: Pt[] = [];
      for (let k = 0; k < 4; k++) {
        const [ax, ay] = tips[k];
        const [bx, by] = tips[k + 1];
        const qx = (ax + bx) * 0.08;
        const qy = (ay + by) * 0.08;
        const n = Math.max(6, Math.ceil((s * 1.6) / step));
        for (let i = k ? 1 : 0; i <= n; i++) {
          const t = i / n;
          const u = 1 - t;
          out.push([cx + u * u * ax + 2 * u * t * qx + t * t * bx, cy + u * u * ay + 2 * u * t * qy + t * t * by]);
        }
      }
      return out;
    },

    gear: (cx: number, cy: number, r: number, teeth: number): Pt[] => {
      const pts: Pt[] = [];
      const w = TAU / teeth;
      for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * TAU;
        pts.push(
          [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r],
          [cx + Math.cos(a0 + w * 0.12) * r * 1.28, cy + Math.sin(a0 + w * 0.12) * r * 1.28],
          [cx + Math.cos(a0 + w * 0.42) * r * 1.28, cy + Math.sin(a0 + w * 0.42) * r * 1.28],
          [cx + Math.cos(a0 + w * 0.54) * r, cy + Math.sin(a0 + w * 0.54) * r],
        );
      }
      pts.push(pts[0]);
      return joinPolyline(pts, step);
    },

    /** The classic parametric heart curve. */
    heart: (cx: number, cy: number, s: number): Pt[] => {
      const n = Math.max(40, Math.ceil((100 * s) / step));
      const out: Pt[] = [];
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * TAU;
        out.push([
          cx + 16 * Math.pow(Math.sin(t), 3) * s,
          cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s,
        ]);
      }
      return out;
    },
  };
}

export type Geo = ReturnType<typeof geometry>;
export { TAU };
