import type { XY } from '@/lib/sketch/sketchify';
import type { HandwritingLayer } from './handwriting';

interface StrokeBase {
  /** Points along the stroke, relative to (ox, oy). */
  pts: XY[];
  /** Cumulative distance along the stroke at each point. */
  cum: number[];
  len: number;
  ox: number;
  oy: number;
  /** Index of the last point already drawn (-1 before starting). */
  drawn: number;
  /** Multiplier on the pen speed for this stroke. */
  speedK: number;
}

/** A coloured, sketchy line drawn straight onto the drawer's canvas. */
export interface LineOp extends StrokeBase {
  kind: 'line';
  /** The lighter second pass, index-aligned with `pts`. */
  b: XY[];
  color: string;
  width: number;
  /** Phase for the pen-pressure wave. */
  phase: number;
  /** Draw onto a named extra canvas instead of the main one (e.g. a layer that animates). */
  layer?: string;
}

/** A centre-line stroke of the handwriting, revealed through a mask. */
export interface HandOp extends StrokeBase {
  kind: 'hand';
  pts: (XY & { r: number })[];
  layer: HandwritingLayer;
}

export type PenOp = LineOp | HandOp | { kind: 'pause'; ms: number } | { kind: 'exit' };

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
