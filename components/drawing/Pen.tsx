/** The fountain pen that follows every stroke. Its tip sits at the element's (0, 0). */
export function Pen({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div className="pen" ref={ref} aria-hidden="true">
      <svg width="1" height="1">
        <g transform="rotate(30)">
          <path d="M0 0 L-5.5 -17 L5.5 -17 Z" fill="var(--nib)" />
          <path d="M0 -2 L0 -11" stroke="var(--grip)" strokeWidth="1" />
          <circle cx="0" cy="-11.5" r="1.5" fill="var(--grip)" />
          <rect x="-6.5" y="-38" width="13" height="22" rx="2.5" fill="var(--grip)" />
          <rect x="-8" y="-112" width="16" height="76" rx="6" fill="var(--barrel)" />
          <rect x="-8" y="-64" width="16" height="3.5" fill="var(--band)" />
          <rect x="8.5" y="-104" width="3" height="36" rx="1.5" fill="var(--band)" />
        </g>
      </svg>
    </div>
  );
}
