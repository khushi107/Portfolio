'use client';

import { useEffect, useRef, useState } from 'react';
import { settings } from '@/lib/config';
import { profile } from '@/data/profile';
import { useIntro } from './IntroProvider';

const curvePath = (k: number) => `M0 0 L1000 0 Q500 ${(600 * k).toFixed(1)} 0 0 Z`;
const easeInOutQuart = (p: number) => (p < 0.5 ? 8 * p ** 4 : 1 - (-2 * p + 2) ** 4 / 2);

/**
 * Cycles "hello" in twelve languages, then lifts away. Its bottom edge is an
 * SVG quadratic curve that flattens as the curtain rises.
 */
export function IntroCurtain() {
  const { setRevealed, setFinished } = useIntro();
  const [index, setIndex] = useState(0);
  const [gone, setGone] = useState(false);
  const curtainRef = useRef<HTMLDivElement>(null);
  const curveRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const words = profile.greetings;

  useEffect(() => {
    // every visit starts at the top
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const root = document.documentElement;
    const curtain = curtainRef.current!;
    let timer = 0;
    let raf = 0;
    let leaving = false;
    let i = 0;

    const leave = () => {
      if (leaving) return;
      leaving = true;
      clearTimeout(timer);
      root.classList.remove('hold');
      setRevealed(true);
      const total = window.innerHeight + (curveRef.current?.getBoundingClientRect().height ?? 0);
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 1000);
        const e = easeInOutQuart(p);
        curtain.style.transform = `translate3d(0,${(-e * total).toFixed(1)}px,0)`;
        pathRef.current?.setAttribute('d', curvePath(1 - e));
        if (p < 1) raf = requestAnimationFrame(step);
        else {
          root.classList.remove('intro');
          setGone(true);
          setFinished(true);
        }
      };
      raf = requestAnimationFrame(step);
    };

    const next = () => {
      i++;
      if (i >= words.length) {
        timer = window.setTimeout(leave, 380);
        return;
      }
      setIndex(i);
      timer = window.setTimeout(next, settings.helloMs);
    };
    timer = window.setTimeout(next, settings.firstHelloMs);

    const onKey = (e: KeyboardEvent) => {
      if (['Escape', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        leave();
      }
    };
    curtain.addEventListener('click', leave);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      curtain.removeEventListener('click', leave);
      window.removeEventListener('keydown', onKey);
    };
  }, [setRevealed, setFinished, words.length]);

  if (gone) return null;
  const [word, language] = words[index];

  return (
    <div className="curtain" ref={curtainRef} aria-hidden="true">
      <div className="hello">
        <span key={index}>{word}</span>
      </div>
      <div className="hello-meta">
        <span>{language}</span>
        <span>
          {String(index + 1).padStart(2, '0')} / {words.length}
        </span>
        <span>Click to skip</span>
      </div>
      <svg className="curve" ref={curveRef} viewBox="0 0 1000 300" preserveAspectRatio="none">
        <path ref={pathRef} d={curvePath(1)} />
      </svg>
    </div>
  );
}
