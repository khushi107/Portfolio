'use client';

import { useEffect, useRef } from 'react';
import { profile } from '@/data/profile';
import { BALL_FOOT, SHADOW_CENTRE, campusScene } from '@/lib/doodles/campus';
import { onRelayout } from '@/lib/browser';
import { geometry, TAU } from '@/lib/sketch/geometry';
import { mulberry32 } from '@/lib/sketch/random';
import { resolveColor, sketchify, wonk } from '@/lib/sketch/sketchify';
import { createPenDrawer, type PenDrawer } from '@/lib/pen/drawer';
import { doodleOps, lineOp } from '@/lib/pen/ops';
import type { PenOp } from '@/lib/pen/types';
import { Pen } from '@/components/drawing/Pen';
import { SketchMark } from '@/components/drawing/SketchMark';
import { useIntro } from '@/components/intro/IntroProvider';

/**
 * When this section scrolls into view, the pen circles the title and then
 * draws Fig. 2: the college, a flying cap and a basketball heading for the hoop.
 */
export function Education() {
  const { finished } = useIntro();
  const hostRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const doodleRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef<HTMLCanvasElement>(null);
  const shadowRef = useRef<HTMLCanvasElement>(null);
  const penRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<PenDrawer | null>(null);
  const visible = useRef(false);

  useEffect(() => {
    const ball = ballRef.current!;
    const shadow = shadowRef.current!;
    const dribble = (on: boolean) => [ball, shadow].forEach((c) => c.classList.toggle('dribbling', on));
    const drawer = createPenDrawer({
      host: hostRef.current!,
      canvas: inkRef.current!,
      pen: penRef.current!,
      canvases: { ball, shadow },
      // the ball sits still while the pen draws it, then starts dribbling
      onStart: () => dribble(false),
      onComplete: () => dribble(true),
      build: (rel) => {
        const t = rel(titleRef.current!);
        const rng = mulberry32(77);
        const ring = wonk(geometry(3).ell(t.x + t.w / 2, t.y + t.h * 0.52, t.w / 2 + 24, t.h / 2 + 14, { turns: 1.13, start: -2.7, tilt: -0.04 }), rng, 0.6);
        const s = sketchify(ring, rng, 1.6);
        const ops: PenOp[] = [lineOp(s.a, s.b, resolveColor('coral'), 3, rng() * TAU, 1.4)];
        ops.push({ kind: 'pause', ms: 220 });
        const fig = rel(doodleRef.current!);
        // squash the ball from where it meets the ground, and shrink the shadow from its centre
        const k = fig.w / 400;
        ball.style.transformOrigin = `${fig.x + BALL_FOOT.x * k}px ${fig.y + BALL_FOOT.y * k}px`;
        shadow.style.transformOrigin = `${fig.x + SHADOW_CENTRE.x * k}px ${fig.y + SHADOW_CENTRE.y * k}px`;
        ops.push(...doodleOps(fig, campusScene, 400, 9));
        ops.push({ kind: 'exit' });
        return ops;
      },
    });
    drawerRef.current = drawer;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(hostRef.current!);
    const off = onRelayout(() => {
      if (drawer.played && !drawer.running) {
        drawer.layout();
        drawer.finish();
      }
    });
    return () => {
      drawer.stop();
      io.disconnect();
      off();
    };
  }, []);

  // draw once, the first time the section is on screen after the intro
  useEffect(() => {
    if (!finished) return;
    const host = hostRef.current!;
    const play = () => {
      const d = drawerRef.current;
      if (!d || d.played) return;
      d.layout();
      d.play();
    };
    if (visible.current) play();
    const io = new IntersectionObserver(([e]) => e.isIntersecting && play(), { threshold: 0.3 });
    io.observe(host);
    return () => io.disconnect();
  }, [finished]);

  const redraw = () => {
    drawerRef.current?.layout();
    drawerRef.current?.play();
  };

  return (
    <section className="section edu" id="education" ref={hostRef}>
      <div className="edu-grid">
        <div className="edu-left">
          <h2 className="edu-title" ref={titleRef}>
            Education
          </h2>
          <div className="doodle-slot" ref={doodleRef} aria-hidden="true" />
          <p className="fig">
            <span>Fig. 2 · Campus, cap and the court</span>
            <button className="textbtn" onClick={redraw}>
              Draw it again
            </button>
          </p>
        </div>
        <div className="edu-right">
          <div>
            <h3 className="sub-h">Degrees and school</h3>
            <ul className="rows">
              {profile.education.map((row) => (
                <li key={row.title}>
                  <strong>{row.title}</strong>
                  <span className="r-sub">{row.detail}</span>
                  <span className="r-val">
                    {row.score}
                    <small>{row.years}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="sub-h">
              <SketchMark type="underline" color="orange">
                Beyond the code
              </SketchMark>
            </h3>
            <ul className="rows">
              {profile.beyond.map((row) => (
                <li key={row.title}>
                  <strong>{row.title}</strong>
                  <span className="r-sub">{row.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <canvas className="ink" ref={inkRef} aria-hidden="true" />
      <canvas className="ink ball-layer" ref={ballRef} aria-hidden="true" />
      <canvas className="ink shadow-layer" ref={shadowRef} aria-hidden="true" />
      <Pen ref={penRef} />
    </section>
  );
}
