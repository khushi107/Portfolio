'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { geometry, type ColorName, type Pt } from '@/lib/sketch/geometry';
import { hashString, mulberry32 } from '@/lib/sketch/random';
import { colorVar, sketchify, svgStrokes, wonk, type SvgStroke } from '@/lib/sketch/sketchify';
import { drawOn } from '@/lib/sketch/drawOn';

interface Props {
  type: 'circle' | 'underline';
  color: ColorName;
  children: string;
}

interface Layout {
  left: number;
  top: number;
  width: number;
  height: number;
  strokes: SvgStroke[];
}

/** Wraps text in a hand-drawn circle or underline that draws itself when scrolled into view. */
export function SketchMark({ type, color, children }: Props) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);

  // measure the text and build the mark around it (and again when it resizes)
  useLayoutEffect(() => {
    const host = hostRef.current!;
    const build = () => {
      const rng = mulberry32(hashString(children));
      const g = geometry(2.5);
      const w = host.offsetWidth;
      const h = host.offsetHeight;
      let left: number, top: number, width: number, height: number;
      const shapes: [Pt[], number][] = [];
      if (type === 'circle') {
        const px = 22;
        const py = 16;
        width = w + px * 2;
        height = h + py * 2;
        left = -px;
        top = -py;
        shapes.push([g.ell(width / 2, height / 2, width / 2 - 6, height / 2 - 5, { turns: 1.14, start: -2.7, tilt: -0.03 }), 2.8]);
      } else {
        width = w + 14;
        height = 18;
        left = -5;
        top = h - 3;
        shapes.push([g.quad([3, 8], [width * 0.5, 8 + (rng() - 0.5) * 7], [width - 3, 6]), 2.6]);
        // sometimes a second, quicker flick underneath, like a real double underline
        if (rng() > 0.45) shapes.push([g.quad([width * 0.82, 12], [width * 0.55, 14 + (rng() - 0.5) * 3], [width * 0.22, 13]), 1.8]);
      }
      const amp = type === 'circle' ? 1.3 : 0.9;
      const strokes = shapes.flatMap(([pts, sw]) => svgStrokes(sketchify(wonk(pts, rng, 0.5), rng, amp), color, sw));
      setLayout({ left, top, width, height, strokes });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(host);
    return () => ro.disconnect();
  }, [type, color, children]);

  // draw it on the first time it scrolls into view
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || svg.dataset.drawn) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        svg.dataset.drawn = '1';
        drawOn(svg, { duration: type === 'circle' ? 1 : 0.7 });
        io.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(hostRef.current!);
    return () => io.disconnect();
  }, [layout, type]);

  return (
    <span className="mark-host" ref={hostRef}>
      {children}
      {layout && (
        <svg
          ref={svgRef}
          className="scr"
          aria-hidden="true"
          style={{ left: layout.left, top: layout.top, width: layout.width, height: layout.height }}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
        >
          {layout.strokes.map((s, i) => (
            <path key={i} d={s.d} stroke={colorVar(s.color)} strokeWidth={s.width.toFixed(2)} opacity={s.opacity} />
          ))}
        </svg>
      )}
    </span>
  );
}
