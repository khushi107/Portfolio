'use client';

import { useEffect, useRef } from 'react';

export interface PinMetrics {
  section: HTMLElement;
  sticky: HTMLElement;
  track: HTMLElement;
  /** How far the track can slide sideways, in pixels. */
  distance: number;
}

interface Props {
  id: string;
  className?: string;
  trackClassName?: string;
  header: React.ReactNode;
  children: React.ReactNode;
  /** Rendered inside the pinned area, after the track (progress bars, the train). */
  after?: React.ReactNode;
  onMeasure?: (m: PinMetrics) => void;
  /** Return true to take over moving the track yourself. */
  onProgress?: (progress: number, m: PinMetrics) => boolean | void;
}

/**
 * Pins a section while you scroll and turns vertical scrolling into sideways
 * movement. The section is made exactly as tall as the sideways distance, so
 * scrolling from its top to its bottom slides the track from start to end.
 */
export function PinnedScroll({ id, className = '', trackClassName = '', header, children, after, onMeasure, onProgress }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onMeasure, onProgress });
  useEffect(() => {
    callbacks.current = { onMeasure, onProgress };
  });

  useEffect(() => {
    const m: PinMetrics = { section: sectionRef.current!, sticky: stickyRef.current!, track: trackRef.current!, distance: 0 };

    const update = () => {
      const top = m.section.getBoundingClientRect().top;
      const p = m.distance ? Math.min(1, Math.max(0, -top / m.distance)) : 0;
      const handled = callbacks.current.onProgress?.(p, m);
      if (!handled) m.track.style.transform = `translate3d(${(-p * m.distance).toFixed(1)}px,0,0)`;
    };
    const measure = () => {
      m.distance = Math.max(0, m.track.offsetWidth - m.sticky.clientWidth);
      m.section.style.height = `${m.sticky.offsetHeight + m.distance}px`;
      callbacks.current.onMeasure?.(m);
      update();
    };

    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(m.track);
    ro.observe(m.sticky);
    window.addEventListener('scroll', onScroll, { passive: true });
    measure();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section className={`hsec ${className}`} id={id} ref={sectionRef}>
      <div className="hsticky" ref={stickyRef}>
        {header}
        <div className={`htrack ${trackClassName}`} ref={trackRef}>
          {children}
        </div>
        {after}
      </div>
    </section>
  );
}
