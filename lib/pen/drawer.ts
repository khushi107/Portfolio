/**
 * The pen. Given a list of operations (strokes, pauses, an exit), it moves an
 * SVG fountain pen at a steady speed, lifting it between strokes, and draws
 * whatever is under the nib on a canvas.
 */
import { settings } from '@/lib/config';
import type { HandOp, LineOp, PenOp, Rect } from './types';
import type { HandwritingLayer } from './handwriting';

export interface PenDrawer {
  /** Rebuild the operations for the current layout and theme. */
  layout(): void;
  /** Draw from scratch with the pen. */
  play(): void;
  /** Show the finished drawing immediately (used after resize or theme change). */
  finish(): void;
  stop(): void;
  clear(): void;
  readonly played: boolean;
  readonly running: boolean;
}

interface Options {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  pen: HTMLElement;
  /** Build the operations; `rel` gives an element's box relative to the host. */
  build: (rel: (el: Element) => Rect, dpr: number) => PenOp[];
  layers?: HandwritingLayer[];
  /** Extra canvases (covering the host) that strokes can target by name, so they can be animated separately. */
  canvases?: Record<string, HTMLCanvasElement>;
  /** Called when a drawing starts. */
  onStart?: () => void;
  /** Called when a drawing is complete, whether animated or shown instantly. */
  onComplete?: () => void;
}

type Point = { x: number; y: number };

export function createPenDrawer({ host, canvas, pen, build, layers = [], canvases = {}, onStart, onComplete }: Options): PenDrawer {
  const ctx = canvas.getContext('2d')!;
  const surfaces = [canvas, ...Object.values(canvases)];
  const contexts: Record<string, CanvasRenderingContext2D> = {};
  for (const [name, c] of Object.entries(canvases)) contexts[name] = c.getContext('2d')!;
  const contextFor = (op: LineOp) => (op.layer && contexts[op.layer]) || ctx;
  let ops: PenOp[] = [];
  let size = { w: 0, h: 0 };
  let played = false;
  let raf = 0;
  let anim: { i: number; phase: 'travel' | 'draw'; d: number; wait: number; pos: Point; last: number } | null = null;
  const tilt = { x: 0, ang: 0 };

  const rel = (el: Element): Rect => {
    const h = host.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
  };

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ops = build(rel, dpr);
    const r = host.getBoundingClientRect();
    size = { w: r.width, h: r.height };
    for (const c of surfaces) {
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      const x = c.getContext('2d')!;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.lineCap = 'round';
      x.lineJoin = 'round';
    }
  }

  function clear() {
    for (const c of surfaces) {
      const x = c.getContext('2d')!;
      x.save();
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.clearRect(0, 0, c.width, c.height);
      x.restore();
    }
    layers.forEach((l) => l.clear());
  }

  /** Draw a stroke up to distance d along it. */
  function drawTo(op: LineOp | HandOp, d: number) {
    let i1 = op.drawn;
    while (i1 + 1 < op.pts.length && op.cum[i1 + 1] <= d + 1e-6) i1++;
    if (i1 <= op.drawn) return;
    if (op.kind === 'hand') {
      op.layer.stamp(op.pts.slice(op.drawn + 1, i1 + 1));
    } else {
      const ctx = contextFor(op);
      ctx.strokeStyle = op.color;
      for (let k = Math.max(1, op.drawn + 1); k <= i1; k++) {
        // pen pressure: the width breathes slowly along the stroke
        const press = 0.78 + 0.44 * (0.5 + 0.5 * Math.sin(k * 0.09 + op.phase));
        const p0 = op.pts[k - 1], p1 = op.pts[k], q0 = op.b[k - 1], q1 = op.b[k];
        ctx.lineWidth = op.width * press;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.lineWidth = op.width * 0.55 * press;
        ctx.beginPath();
        ctx.moveTo(q0.x, q0.y);
        ctx.lineTo(q1.x, q1.y);
        ctx.stroke();
      }
    }
    op.drawn = i1;
  }

  function pointAt(op: LineOp | HandOp, d: number): Point {
    const { pts, cum } = op;
    if (pts.length === 1 || d <= 0) return { x: pts[0].x + op.ox, y: pts[0].y + op.oy };
    let lo = 0;
    let hi = cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] <= d) lo = mid;
      else hi = mid;
    }
    const t = Math.min(1, (d - cum[lo]) / (cum[hi] - cum[lo] || 1));
    return { x: pts[lo].x + (pts[hi].x - pts[lo].x) * t + op.ox, y: pts[lo].y + (pts[hi].y - pts[lo].y) * t + op.oy };
  }

  function placePen(x: number, y: number, lifted: boolean) {
    // lean the pen into the direction it is moving
    tilt.ang += (Math.max(-9, Math.min(9, (x - tilt.x) * 0.7)) - tilt.ang) * 0.18;
    tilt.x = x;
    pen.style.transform = `translate3d(${x.toFixed(1)}px,${(y - (lifted ? 5 : 0)).toFixed(1)}px,0) rotate(${tilt.ang.toFixed(2)}deg)`;
    pen.classList.toggle('lift', lifted);
  }

  function stop() {
    cancelAnimationFrame(raf);
    anim = null;
    pen.classList.remove('on');
  }

  function finish() {
    stop();
    clear();
    played = true;
    for (const op of ops) {
      if (op.kind === 'line') {
        op.drawn = -1;
        drawTo(op, Infinity);
      }
    }
    layers.forEach((l) => l.complete());
    onComplete?.();
  }

  function play() {
    stop();
    clear();
    onStart?.();
    played = true;
    for (const op of ops) if (op.kind === 'line' || op.kind === 'hand') op.drawn = -1;
    const start = { x: size.w + 60, y: size.h * 0.5 };
    tilt.x = start.x;
    tilt.ang = 0;
    placePen(start.x, start.y, true);
    pen.classList.add('on');
    anim = { i: 0, phase: 'travel', d: 0, wait: 0, pos: start, last: performance.now() };
    raf = requestAnimationFrame(tick);
  }

  function tick(now: number) {
    const a = anim;
    if (!a) return;
    // seconds of pen time available this frame
    let budget = Math.min(0.05, (now - a.last) / 1000);
    a.last = now;
    const travelSpeed = settings.penSpeed * 3;
    let guard = 0;

    while (budget > 1e-6 && a.i < ops.length && guard++ < 600) {
      const op = ops[a.i];
      if (op.kind === 'pause') {
        a.wait += budget * 1000;
        if (a.wait >= op.ms) {
          budget = (a.wait - op.ms) / 1000;
          a.wait = 0;
          a.i++;
          a.phase = 'travel';
        } else budget = 0;
        continue;
      }
      if (a.phase === 'travel') {
        // pen lifted: glide to the start of the next stroke
        const target = op.kind === 'exit' ? { x: size.w + 80, y: Math.min(size.h, a.pos.y + 160) } : pointAt(op, 0);
        const dx = target.x - a.pos.x;
        const dy = target.y - a.pos.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= travelSpeed * budget) {
          budget -= dist / travelSpeed;
          a.pos = target;
          if (op.kind === 'exit') {
            a.i++;
            break;
          }
          a.phase = 'draw';
          a.d = 0;
          drawTo(op, 0);
        } else {
          const k = (travelSpeed * budget) / dist;
          a.pos = { x: a.pos.x + dx * k, y: a.pos.y + dy * k };
          budget = 0;
        }
        continue;
      }
      if (op.kind === 'exit') {
        a.i++;
        continue;
      }
      // pen down: draw along the stroke
      const speed = settings.penSpeed * op.speedK;
      const nd = Math.min(op.len, a.d + speed * budget);
      drawTo(op, nd);
      if (nd >= op.len) {
        budget -= Math.max(0, op.len - a.d) / speed;
        a.i++;
        a.phase = 'travel';
      } else {
        budget = 0; // this frame's time is used up
      }
      a.d = nd;
      a.pos = pointAt(op, nd);
    }

    layers.forEach((l) => l.flush());
    placePen(a.pos.x, a.pos.y, a.phase === 'travel');
    if (a.i >= ops.length) {
      anim = null;
      pen.classList.remove('on');
      layers.forEach((l) => l.complete());
      onComplete?.();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  return {
    layout,
    play,
    finish,
    stop,
    clear,
    get played() {
      return played;
    },
    get running() {
      return anim !== null;
    },
  };
}
