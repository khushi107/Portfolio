'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { profile } from '@/data/profile';
import { drawOn } from '@/lib/sketch/drawOn';
import { colorVar } from '@/lib/sketch/sketchify';
import { SketchMark } from '@/components/drawing/SketchMark';
import { SkillIcon } from '@/components/drawing/SkillIcon';
import { FolderBack, FolderFront } from '@/components/drawing/Folder';

/** Lists longer than this split into two columns so the sheet stays short. */
const ONE_COLUMN_MAX = 6;

/**
 * Skills as folders in rows of 3, 3 and 2, all closed to begin with. Hovering
 * (or tapping, or focusing) a folder opens its flap and a lined sheet rises
 * straight up out of it, over the folders above, listing that category's
 * skills with a doodled logo each. Moving the pointer off the folders (or
 * tapping anywhere else) slides the sheet back in. A folder hidden behind the
 * sheet ignores hover (so the sheet does not flicker) but still opens on click.
 */
export function Skills() {
  const groups = profile.skills;
  const [active, setActive] = useState<number | null>(null); // the open folder, or null when all are closed
  const [shown, setShown] = useState<number | null>(null); // the sheet on screen; it stays while it sinks back in
  const cabinetRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const folderRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const group = shown === null ? null : groups[shown];

  const open = (i: number) => {
    setActive(i);
    setShown(i);
  };
  const close = () => setActive(null);

  // place the sheet's slot over the open folder: as wide as the folder, ending at its middle
  const placeSlot = useCallback(() => {
    const cabinet = cabinetRef.current;
    const slot = slotRef.current;
    if (shown === null) return;
    const folder = folderRefs.current[shown];
    if (!cabinet || !slot || !folder) return;
    slot.style.left = `${folder.offsetLeft + 12}px`;
    slot.style.width = `${folder.offsetWidth - 24}px`;
    slot.style.bottom = `${cabinet.clientHeight - (folder.offsetTop + folder.offsetHeight * 0.5)}px`;
  }, [shown]);

  useLayoutEffect(() => {
    placeSlot();
    const ro = new ResizeObserver(placeSlot);
    if (cabinetRef.current) ro.observe(cabinetRef.current);
    return () => ro.disconnect();
  }, [placeSlot]);

  // the logos sketch themselves in, one after another, as the sheet rises
  useEffect(() => {
    sheetRef.current?.querySelectorAll('.skill-icon').forEach((icon, i) => {
      drawOn(icon, { duration: 0.45, stagger: 0.02, delay: 0.25 + i * 0.06 });
    });
  }, [shown]);

  // on touch screens there is no "pointer leaves", so a tap anywhere else closes the folder
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!cabinetRef.current?.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  /** Is this folder hidden behind the open sheet? */
  const isCovered = (el: Element) => {
    if (active === null) return false;
    const sheet = sheetRef.current?.getBoundingClientRect();
    const f = el.getBoundingClientRect();
    return !!sheet && f.left < sheet.right && f.right > sheet.left && f.top < sheet.bottom - 4 && f.bottom > sheet.top;
  };

  return (
    <section className="section" id="skills">
      <div className="sec-head">
        <div>
          <span className="eyebrow">Toolkit</span>
          <h2>
            <SketchMark type="circle" color="coral">
              Skills
            </SketchMark>
          </h2>
        </div>
        <p>Hover over a folder to pull out what is inside. These are the stacks I have shipped with.</p>
      </div>

      <div
        className={`cabinet${active === null ? '' : ' is-open'}`}
        ref={cabinetRef}
        style={group ? ({ '--fc': colorVar(group.color) } as React.CSSProperties) : undefined}
        onMouseLeave={close}
      >
        <p className="cabinet-hint" aria-hidden="true">
          pick a folder, any folder ↓
        </p>

        <div className="sheet-slot" ref={slotRef}>
          {group && (
            <div
              className={`sheet${active === null ? ' away' : ''}`}
              key={shown}
              ref={sheetRef}
              role="tabpanel"
              id="skills-sheet"
              aria-labelledby={`folder-${shown}`}
              aria-hidden={active === null}
            >
              <p className="sheet-title">{group.label}</p>
              <ul className={`sheet-list${group.items.length > ONE_COLUMN_MAX ? ' two' : ''}`}>
                {group.items.map((item, i) => (
                  <li key={item} style={{ '--d': i } as React.CSSProperties}>
                    <SkillIcon name={item} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="folders" role="tablist" aria-label="Skill categories">
          {groups.map((g, i) => (
            <button
              key={g.label}
              ref={(el) => {
                folderRefs.current[i] = el;
              }}
              id={`folder-${i}`}
              role="tab"
              aria-selected={i === active}
              aria-controls="skills-sheet"
              className={`folder${i === active ? ' open' : ''}${i === shown ? ' held' : ''}`}
              style={{ '--fc': colorVar(g.color) } as React.CSSProperties}
              onMouseEnter={(e) => {
                if (!isCovered(e.currentTarget)) open(i);
              }}
              onFocus={() => open(i)}
              onClick={() => open(i)}
            >
              <span className="folder-back">
                <FolderBack color={g.color} seed={g.label} />
              </span>
              <span className="folder-front">
                <FolderFront color={g.color} seed={g.label} />
                <span className="folder-label">{g.label}</span>
                <span className="folder-count">{g.items.length} inside</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
