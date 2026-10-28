'use client';

import { useEffect, useRef } from 'react';
import { profile } from '@/data/profile';
import { heroScene } from '@/lib/doodles/hero';
import { cssVar, fontsReady, onRelayout } from '@/lib/browser';
import { HandwritingLayer } from '@/lib/pen/handwriting';
import { createPenDrawer, type PenDrawer } from '@/lib/pen/drawer';
import { doodleOps } from '@/lib/pen/ops';
import type { PenOp } from '@/lib/pen/types';
import { Pen } from '@/components/drawing/Pen';
import { useIntro } from '@/components/intro/IntroProvider';

const HAND_FONT = '"Homemade Apple","Segoe Script","Bradley Hand","Brush Script MT",cursive';

/**
 * After the intro, the pen writes the greeting along the centre of each
 * letter, then draws Fig. 1 (website, blockchain blocks and a small robot).
 */
export function Hero() {
  const { revealed } = useIntro();
  const hostRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const penRef = useRef<HTMLDivElement>(null);
  const doodleRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<PenDrawer | null>(null);

  useEffect(() => {
    const layer = new HandwritingLayer(slotRef.current!, handRef.current!, HAND_FONT);
    const drawer = createPenDrawer({
      host: hostRef.current!,
      canvas: inkRef.current!,
      pen: penRef.current!,
      layers: [layer],
      build: (rel, dpr) => {
        const ops: PenOp[] = layer.build(`Hello, I’m ${profile.name}`, cssVar('--pen') || '#2b44c9', () => rel(slotRef.current!), dpr);
        ops.push({ kind: 'pause', ms: 300 });
        ops.push(...doodleOps(rel(doodleRef.current!), heroScene, 400, 41));
        ops.push({ kind: 'exit' });
        return ops;
      },
    });
    drawerRef.current = drawer;
    const off = onRelayout(() => {
      if (drawer.played && !drawer.running) {
        drawer.layout();
        drawer.finish();
      }
    });
    return () => {
      drawer.stop();
      off();
    };
  }, []);

  // start drawing shortly after the curtain begins to lift
  useEffect(() => {
    if (!revealed) return;
    let cancelled = false;
    let timer = 0;
    fontsReady().then(() => {
      if (cancelled) return;
      timer = window.setTimeout(() => {
        drawerRef.current?.layout();
        drawerRef.current?.play();
      }, 650);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [revealed]);

  const redraw = () => {
    drawerRef.current?.layout();
    drawerRef.current?.play();
  };

  return (
    <section className="hero" id="hero" aria-label="Introduction" ref={hostRef}>
      <div className="hero-text">
        <p className="sr-only">Hello, I’m {profile.name}</p>
        <div className="hand-slot" ref={slotRef} aria-hidden="true">
          <canvas ref={handRef} />
        </div>
        <h1 className="headline">{profile.hero.headline}</h1>
        <p className="sub">{profile.hero.sub}</p>
        <div className="actions">
          <a className="btn primary" href="#work">
            See my work
          </a>
          <a className="btn" href="#contact">
            Get in touch
          </a>
          <button className="btn icon" onClick={redraw} aria-label="Draw the doodle again" title="Draw it again">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.5 2.5l3 3L6 13H3v-3z" />
              <path d="M9 4l3 3" />
            </svg>
          </button>
        </div>
      </div>
      <figure className="doodle-fig" aria-hidden="true">
        <div className="doodle-slot" ref={doodleRef} />
        <figcaption className="fig">
          <span>{profile.hero.caption[0]}</span>
          <span>{profile.hero.caption[1]}</span>
        </figcaption>
      </figure>
      <canvas className="ink" ref={inkRef} aria-hidden="true" />
      <Pen ref={penRef} />
    </section>
  );
}
