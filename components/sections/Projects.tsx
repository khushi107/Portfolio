'use client';

import { useRef } from 'react';
import { profile } from '@/data/profile';
import { PinnedScroll } from '@/components/drawing/PinnedScroll';
import { SketchIcon } from '@/components/drawing/SketchIcon';
import { SketchMark } from '@/components/drawing/SketchMark';

/** Project cards that slide sideways while the section is pinned. */
export function Projects() {
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const total = profile.projects.length;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <PinnedScroll
      id="work"
      header={
        <div className="hhead sec-head">
          <div>
            <span className="eyebrow">Selected work</span>
            <h2>
              <SketchMark type="underline" color="coral">
                Projects
              </SketchMark>
            </h2>
          </div>
          <p>Things I owned from the first sketch to a working build. Keep scrolling and they slide past.</p>
        </div>
      }
      after={
        <div className="hprog">
          <span ref={countRef}>
            {pad(1)} / {pad(total)}
          </span>
          <span className="bar">
            <i ref={barRef} />
          </span>
          <span>Scroll</span>
        </div>
      }
      onProgress={(p) => {
        // update the counter and bar directly, without re-rendering on every scroll frame
        if (countRef.current) countRef.current.textContent = `${pad(Math.round(p * (total - 1)) + 1)} / ${pad(total)}`;
        if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(1)}%`;
      }}
    >
      {profile.projects.map((project) => (
        <article className="pcard" key={project.id} style={{ '--li': `var(--c-${project.accent})` } as React.CSSProperties}>
          <div className="p-top">
            <SketchIcon name={project.id} />
            <span className="p-year">
              {project.meta[0]}
              <br />
              {project.meta[1]}
            </span>
          </div>
          {project.badge && (
            <span className={`badge${project.badge.tone === 'status' ? ' soft' : ''}`}>
              <i className="spark" />
              {project.badge.text}
            </span>
          )}
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <ul className="list">
            {project.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="chips">
            {project.stack.map((s) => (
              <span className="chip" key={s}>
                {s}
              </span>
            ))}
          </div>
        </article>
      ))}
    </PinnedScroll>
  );
}
