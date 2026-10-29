'use client';

import { useRef, useState } from 'react';
import { profile } from '@/data/profile';
import { geometry, type Pt } from '@/lib/sketch/geometry';
import { mulberry32 } from '@/lib/sketch/random';
import { sketchify, svgStrokes, wonk } from '@/lib/sketch/sketchify';
import { skyLandmarks, skyRoute } from '@/lib/doodles/sky';
import { PinnedScroll, type PinMetrics } from '@/components/drawing/PinnedScroll';
import { SketchMark } from '@/components/drawing/SketchMark';
import { Train } from '@/components/journey/Train';
import { Sky, type SkyData } from '@/components/journey/Sky';

const TRAIN_NOSE = 92; // distance from the train's left edge to where it "stops"
/** Landmarks allowed to grow bigger than the usual cap of 1.15 (still limited by the space above their card). */
const MAX_SCALE: Record<string, number> = { hawa: 1.5 };
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Build the landmark doodles to fit the open sky above the station cards.
 * Each landmark is sized to the free space above its own card (gap landmarks
 * use the tighter of their two neighbours), so one tall card only shrinks the
 * landmark above it instead of removing the whole sky.
 */
function buildSky(track: HTMLElement, stops: HTMLElement[], centers: number[]): SkyData | null {
  const freeAbove = stops.map((s) => s.offsetTop + (s.querySelector('.stop-card') as HTMLElement).offsetTop - 18);
  const height = Math.max(...freeAbove);
  if (height < 50) return null;
  const width = track.offsetWidth;
  const rng = mulberry32(5);

  const placements: { name: string; cx: number; room: number }[] = [];
  centers.forEach((cx, i) => {
    placements.push({ name: skyRoute.stations[i], cx, room: freeAbove[i] });
    if (i < centers.length - 1) placements.push({ name: skyRoute.gaps[i], cx: (cx + centers[i + 1]) / 2, room: Math.min(freeAbove[i], freeAbove[i + 1]) });
  });

  const landmarks = placements
    .filter(({ name, room }) => name && skyLandmarks[name] && room >= 50)
    .map(({ name, cx, room }) => {
      const scale = Math.min(MAX_SCALE[name] ?? 1.15, (room - 6) / 124);
      const g = geometry(2.5 / scale);
      const widthK = Math.max(0.9, Math.min(1.25, scale));
      return skyLandmarks[name](g).map((part) => ({
        motion: part.motion,
        delay: part.delay ?? 0,
        duration: part.duration,
        strokes: part.shapes.flatMap(([pts, color, w]) => {
          // landmark boxes are 200 × 120 with the ground at the bottom, which sits just above the card
          const placed = pts.map(([x, y]) => [cx + (x - 100) * scale, room - (120 - y) * scale] as Pt);
          return svgStrokes(sketchify(wonk(placed, rng, 0.7), rng, 1.2), color, w * widthK);
        }),
      }));
    });
  return { width, height, landmarks };
}

/**
 * Experience as a train journey. Scrolling moves the train between stations;
 * it eases in and out of each one and pauses there, and the camera follows it.
 */
export function Journey() {
  const stations = profile.journey;
  const stopRefs = useRef<(HTMLElement | null)[]>([]);
  const trainRef = useRef<HTMLDivElement>(null);
  const centers = useRef<number[]>([]);
    const halfStop = useRef(0); // half a station's width, so the camera never cuts a card off
  const lastX = useRef<number | null>(null);
  const movingTimer = useRef(0);
  const [sky, setSky] = useState<SkyData | null>(null);
  const [live, setLive] = useState(false);

  const onMeasure = (m: PinMetrics) => {
    const stops = stopRefs.current.filter(Boolean) as HTMLElement[];
    centers.current = stops.map((s) => s.offsetLeft + s.offsetWidth / 2);
    halfStop.current = (stops[0]?.offsetWidth ?? 0) / 2;
    setSky(buildSky(m.track, stops, centers.current));
    setLive(true);
  };

  const onProgress = (p: number, m: PinMetrics) => {
    const st = centers.current;
    const train = trainRef.current;
    if (st.length < 2 || !train) return true;

    // which leg of the journey, and how far along it (with a pause at each end)
    const q = p * (st.length - 1);
    const leg = Math.min(st.length - 2, Math.floor(q));
    const f = q - leg;
    const e = f < 0.14 ? 0 : f > 0.86 ? 1 : easeInOutCubic((f - 0.14) / 0.72);
    const x = st[leg] + (st[leg + 1] - st[leg]) * e;

    // the camera keeps the train about a third of the way across the screen. On
    // a phone a card is nearly as wide as the screen, so there the train sits far
    // enough in for the whole card (centred on the train) to stay in view.
    const anchor = Math.max(m.sticky.clientWidth * 0.36, halfStop.current + 16);
    const camera = Math.min(m.distance, Math.max(0, x - anchor));
    m.track.style.transform = `translate3d(${(-camera).toFixed(1)}px,0,0)`;
    train.style.transform = `translate3d(${(x - camera - TRAIN_NOSE).toFixed(1)}px,0,0)`;

    // wheels turn by distance travelled / radius
    const deg = ((x / 8) * 180) / Math.PI;
    train.querySelectorAll<SVGGElement>('.wheel').forEach((w) => (w.style.transform = `rotate(${deg.toFixed(1)}deg)`));
    stopRefs.current.forEach((s, k) => s?.classList.toggle('here', Math.abs(x - st[k]) < 8));

    if (lastX.current !== null && Math.abs(x - lastX.current) > 0.5) {
      train.classList.add('moving');
      clearTimeout(movingTimer.current);
      movingTimer.current = window.setTimeout(() => train.classList.remove('moving'), 220);
    }
    lastX.current = x;
    return true;
  };

  return (
    <PinnedScroll
      id="experience"
      className="rail-sec"
      trackClassName={`rail-track${live ? ' live' : ''}`}
      onMeasure={onMeasure}
      onProgress={onProgress}
      header={
        <div className="hhead sec-head">
          <div>
            <span className="eyebrow">The journey so far</span>
            <h2>
              <SketchMark type="underline" color="green">
                Experience
              </SketchMark>
            </h2>
          </div>
          <p>Scroll to ride along, from campus to client work, one station at a time.</p>
        </div>
      }
      after={<Train ref={trainRef} />}
    >
      {sky && <Sky data={sky} />}
      <div className="rails" aria-hidden="true" />
      {stations.map((s, i) => (
        <article
          className="stop"
          key={s.title}
          ref={(el) => {
            stopRefs.current[i] = el;
          }}
        >
          <div className="stop-card">
            <span className="when">{s.when}</span>
            <h3>{s.title}</h3>
            {s.text && <p>{s.text}</p>}
            {s.points && (
              <ul className="list" style={{ '--li': `var(--c-${s.accent ?? 'blue'})` } as React.CSSProperties}>
                {s.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            )}
            {s.stack && (
              <div className="chips">
                {s.stack.map((c) => (
                  <span className="chip" key={c}>
                    {c}
                  </span>
                ))}
              </div>
            )}
            {s.cta && (
              <a className="btn primary" href={s.cta.href} style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                {s.cta.label}
              </a>
            )}
          </div>
          <div className={`board${s.board.upcoming ? ' next' : ''}`} aria-hidden="true">
            <b>{s.board.name}</b>
            <small>{s.board.note}</small>
          </div>
        </article>
      ))}
    </PinnedScroll>
  );
}
