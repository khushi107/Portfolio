/**
 * Handwriting that is actually written, not wiped in.
 *
 * 1. Render the text in a handwriting font onto an offscreen canvas.
 * 2. Thin the letters to one-pixel centre lines (Zhang–Suen thinning).
 * 3. Measure stroke thickness with a distance transform.
 * 4. Walk the centre lines into ordered strokes, left to right.
 * 5. While the pen moves along a stroke, stamp circles into a mask; the
 *    visible text is the font drawn "source-in" through that mask.
 */
import { cumulative } from './ops';
import type { HandOp, Rect } from './types';

type Bitmap = Uint8Array;

/** Chamfer distance transform: distance from each ink pixel to the nearest edge. */
function distanceTransform(img: Bitmap, W: number, H: number): Float32Array {
  const d = new Float32Array(W * H);
  const D = Math.SQRT2;
  for (let i = 0; i < d.length; i++) d[i] = img[i] ? 1e6 : 0;
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (d[i]) d[i] = Math.min(d[i], d[i - 1] + 1, d[i - W] + 1, d[i - W - 1] + D, d[i - W + 1] + D);
    }
  for (let y = H - 2; y > 0; y--)
    for (let x = W - 2; x > 0; x--) {
      const i = y * W + x;
      if (d[i]) d[i] = Math.min(d[i], d[i + 1] + 1, d[i + W] + 1, d[i + W + 1] + D, d[i + W - 1] + D);
    }
  return d;
}

/** Zhang–Suen thinning: peel pixels off the outline until only the skeleton is left. */
function thin(img: Bitmap, W: number, H: number) {
  let changed = true;
  const remove: number[] = [];
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      remove.length = 0;
      for (let y = 1; y < H - 1; y++)
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          if (!img[i]) continue;
          const p2 = img[i - W], p3 = img[i - W + 1], p4 = img[i + 1], p5 = img[i + W + 1];
          const p6 = img[i + W], p7 = img[i + W - 1], p8 = img[i - 1], p9 = img[i - W - 1];
          const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (B < 2 || B > 6) continue;
          const ring = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
          let A = 0;
          for (let k = 0; k < 8; k++) if (!ring[k] && ring[k + 1]) A++;
          if (A !== 1) continue;
          if (pass === 0 ? p2 * p4 * p6 || p4 * p6 * p8 : p2 * p4 * p8 || p2 * p6 * p8) continue;
          remove.push(i);
        }
      if (remove.length) {
        changed = true;
        for (const i of remove) img[i] = 0;
      }
    }
  }
}

/** Walk skeleton pixels into strokes, starting from line ends. */
function traceStrokes(sk: Bitmap, W: number): number[][] {
  const OFF = [-W - 1, -W, -W + 1, -1, 1, W - 1, W, W + 1];
  const pixels: number[] = [];
  for (let i = 0; i < sk.length; i++) if (sk[i]) pixels.push(i);
  const degree = (i: number) => OFF.reduce((n, o) => n + (sk[i + o] ? 1 : 0), 0);
  const seen = new Uint8Array(sk.length);
  const label = new Int32Array(sk.length).fill(-1);

  const walk = (start: number) => {
    const pts = [start];
    seen[start] = 1;
    let cur = start;
    let pdx = 0;
    let pdy = 0;
    for (;;) {
      let best = -1;
      let bestScore = -1e9;
      const cx = cur % W;
      const cy = (cur / W) | 0;
      for (const o of OFF) {
        const j = cur + o;
        if (!sk[j] || seen[j]) continue;
        const dx = (j % W) - cx;
        const dy = ((j / W) | 0) - cy;
        // keep going the same way, and prefer straight steps so staircases are not skipped
        const score = dx * pdx + dy * pdy + (Math.abs(dx) + Math.abs(dy) === 1 ? 0.6 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = j;
        }
      }
      if (best < 0) break;
      pdx = (best % W) - cx;
      pdy = ((best / W) | 0) - cy;
      seen[best] = 1;
      pts.push(best);
      cur = best;
    }
    return pts;
  };

  const strokes: number[][] = [];
  for (const i of pixels) if (!seen[i] && degree(i) === 1) strokes.push(walk(i));
  for (const i of pixels) if (!seen[i]) strokes.push(walk(i)); // closed loops
  strokes.forEach((s, k) => s.forEach((i) => (label[i] = k)));

  // drop tiny spurs next to other strokes, but keep isolated dots (i-dots, apostrophes)
  return strokes.filter((s, k) => {
    if (s.length >= 5) return true;
    for (const i of s) {
      const x = i % W;
      const y = (i / W) | 0;
      for (let yy = -4; yy <= 4; yy++)
        for (let xx = -4; xx <= 4; xx++) {
          const j = (y + yy) * W + (x + xx);
          if (j >= 0 && j < label.length && label[j] >= 0 && label[j] !== k) return false;
        }
    }
    return true;
  });
}

export class HandwritingLayer {
  private text = document.createElement('canvas');
  private mask = document.createElement('canvas');
  private textCtx = this.text.getContext('2d')!;
  private maskCtx = this.mask.getContext('2d')!;
  private outCtx: CanvasRenderingContext2D;
  private dirty = false;

  constructor(
    private slot: HTMLElement,
    private out: HTMLCanvasElement,
    private font: string,
  ) {
    this.outCtx = out.getContext('2d')!;
  }

  /** Lay out the text to fit the slot and return its strokes as pen operations. */
  build(text: string, color: string, slotRect: () => Rect, dpr: number): HandOp[] {
    const PAD = 12;
    const W = Math.max(200, this.slot.clientWidth);
    const t = this.textCtx;
    t.setTransform(1, 0, 0, 1, 0, 0);
    t.font = `100px ${this.font}`;
    let m = t.measureText(text);
    const w100 = (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width);
    const size = Math.max(18, Math.min(Math.min(70, Math.max(30, W / 8)), ((W - 2 * PAD) / w100) * 100));
    t.font = `${size}px ${this.font}`;
    m = t.measureText(text);
    const asc = m.actualBoundingBoxAscent || size * 0.95;
    const desc = m.actualBoundingBoxDescent || size * 0.4;
    const H = Math.ceil(asc + desc + PAD * 2);
    this.slot.style.height = `${H}px`;
    const ox = PAD + (m.actualBoundingBoxLeft || 0);
    const oy = PAD + asc;

    for (const c of [this.out, this.text, this.mask]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    t.setTransform(dpr, 0, 0, dpr, 0, 0);
    t.font = `${size}px ${this.font}`;
    t.fillStyle = color;
    t.fillText(text, ox, oy);
    this.maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // trace at 2x for cleaner centre lines
    const K = 2;
    const SW = Math.ceil(W * K);
    const SH = Math.ceil(H * K);
    const scratch = document.createElement('canvas');
    scratch.width = SW;
    scratch.height = SH;
    const sx = scratch.getContext('2d', { willReadFrequently: true })!;
    sx.setTransform(K, 0, 0, K, 0, 0);
    sx.font = `${size}px ${this.font}`;
    sx.fillText(text, ox, oy);
    const data = sx.getImageData(0, 0, SW, SH).data;
    const img = new Uint8Array(SW * SH);
    for (let i = 0; i < img.length; i++) img[i] = data[i * 4 + 3] > 110 ? 1 : 0;
    const dist = distanceTransform(img, SW, SH);
    thin(img, SW, SH);

    const strokes = traceStrokes(img, SW).map((s) =>
      s.map((i) => ({ x: ((i % SW) + 0.5) / K, y: (((i / SW) | 0) + 0.5) / K, r: Math.max(1, dist[i] / K) })),
    );
    // write left to right; horizontal strokes from the left, vertical ones from the top
    const ordered = strokes
      .map((s) => {
        const a = s[0];
        const b = s[s.length - 1];
        const horizontal = Math.abs(b.x - a.x) > Math.abs(b.y - a.y) * 0.6;
        if (horizontal ? b.x < a.x : b.y < a.y) s.reverse();
        return { s, minX: s.reduce((mn, p) => Math.min(mn, p.x), Infinity) };
      })
      .sort((p, q) => p.minX - q.minX);

    const r = slotRect();
    return ordered.map(({ s }) => {
      const cum = cumulative(s);
      return { kind: 'hand', pts: s, cum, len: cum[cum.length - 1], ox: r.x, oy: r.y, drawn: -1, speedK: 0.8, layer: this };
    });
  }

  /** Reveal ink under the pen at these points. */
  stamp(points: { x: number; y: number; r: number }[]) {
    const m = this.maskCtx;
    m.fillStyle = '#000';
    for (const p of points) {
      m.beginPath();
      m.arc(p.x, p.y, p.r + 0.9, 0, Math.PI * 2);
      m.fill();
    }
    this.dirty = true;
  }

  /** Show the text only where the mask has been stamped. */
  flush() {
    if (!this.dirty) return;
    const o = this.outCtx;
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalCompositeOperation = 'copy';
    o.drawImage(this.mask, 0, 0);
    o.globalCompositeOperation = 'source-in';
    o.drawImage(this.text, 0, 0);
    o.globalCompositeOperation = 'source-over';
    this.dirty = false;
  }

  /** Show the finished text exactly as the font draws it. */
  complete() {
    const o = this.outCtx;
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalCompositeOperation = 'copy';
    o.drawImage(this.text, 0, 0);
    o.globalCompositeOperation = 'source-over';
  }

  clear() {
    for (const [ctx, c] of [
      [this.maskCtx, this.mask],
      [this.outCtx, this.out],
    ] as const) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.restore();
    }
  }
}
