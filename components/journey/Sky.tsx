'use client';

import { useEffect, useRef } from 'react';
import { colorVar, type SvgStroke } from '@/lib/sketch/sketchify';
import { drawOn } from '@/lib/sketch/drawOn';
import type { Motion } from '@/lib/doodles/sky';

export interface SkyPartData {
  motion?: Motion;
  delay: number;
  duration?: number;
  strokes: SvgStroke[];
}

export interface SkyData {
  width: number;
  height: number;
  /** One entry per landmark, each made of parts that may move. */
  landmarks: SkyPartData[][];
}

function Paths({ strokes }: { strokes: SvgStroke[] }) {
  return (
    <>
      {strokes.map((s, i) => (
        <path key={i} d={s.d} stroke={colorVar(s.color)} strokeWidth={s.width.toFixed(2)} opacity={s.opacity} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </>
  );
}

/** A part of a landmark, wrapped in a group that CSS animates (waves ripple, birds fly, kites sway...). */
function Part({ part }: { part: SkyPartData }) {
  if (!part.motion) return <Paths strokes={part.strokes} />;
  const style = {
    animationDelay: `${-part.delay}s`,
    ...(part.duration ? { animationDuration: `${part.duration}s` } : {}),
  };
  // birds fly across and flap their wings at the same time, so they get two nested groups
  if (part.motion === 'fly') {
    return (
      <g className="sky-fly" style={style}>
        <g className="sky-flap" style={{ animationDelay: `${-part.delay}s` }}>
          <Paths strokes={part.strokes} />
        </g>
      </g>
    );
  }
  return (
    <g className={`sky-${part.motion}`} style={style}>
      <Paths strokes={part.strokes} />
    </g>
  );
}

/** The landmarks above the railway. Each one sketches itself as it slides into view, then comes alive. */
export function Sky({ data }: { data: SkyData }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const landmarks = Array.from(svgRef.current?.querySelectorAll(':scope > g') ?? []);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          drawOn(e.target, { duration: 0.55, stagger: 0.07 });
          io.unobserve(e.target);
        }
      },
      { threshold: 0.25 },
    );
    landmarks.forEach((g) => io.observe(g));
    return () => io.disconnect();
  }, [data]);

  return (
    <svg ref={svgRef} className="sky" aria-hidden="true" width={data.width} height={data.height} viewBox={`0 0 ${data.width} ${data.height}`}>
      {data.landmarks.map((parts, li) => (
        <g key={li}>
          {parts.map((part, pi) => (
            <Part key={pi} part={part} />
          ))}
        </g>
      ))}
    </svg>
  );
}
