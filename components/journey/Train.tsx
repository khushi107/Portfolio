/** A hand-drawn locomotive and carriage. Wheels and smoke are animated by the Journey section. */
export function Train({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  const wheels = [20, 47, 82, 106, 129];
  return (
    <div className="train" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 160 74" width="160" height="74">
        <circle className="puff p1" cx="126" cy="6" r="6" />
        <circle className="puff p2" cx="126" cy="6" r="5" />
        <circle className="puff p3" cx="126" cy="6" r="4" />
        <g stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          {/* carriage */}
          <path d="M5.5 22 Q5 19.5 8 19.2 L60 18.6 Q63.2 19 62.8 22.4 L63.2 54.2 L5.8 54.6 Z" fill="var(--c-sun)" />
          <path d="M13 26.2 L25.2 25.7 L25.5 36.2 L13.4 36.5 Z" fill="var(--paper)" />
          <path d="M33.2 25.6 L46.2 25.3 L46.4 36 L33.4 36.3 Z" fill="var(--paper)" />
          <path d="M2.8 17.8 L65 16.6" />
          <path d="M63.4 47.2 L71.2 46.6" />
          {/* cab */}
          <path d="M71 12.4 L101 11.6 L101.6 54.2 L70.7 54.5 Z" fill="var(--c-blue)" />
          <path d="M65.6 11.2 L106.4 9.8" />
          <path d="M78.2 18.2 L94 17.6 L94.3 31 L78.4 31.3 Z" fill="var(--c-sun)" />
          {/* boiler, chimney, lamp and cow-catcher */}
          <path d="M101.4 25.2 L136 24.3 Q145.2 25.2 145.6 39.4 Q145 53.8 135.6 54.1 L101.7 54.2 Z" fill="var(--c-coral)" />
          <path d="M120.2 24.6 L119.6 12.2 L130.6 11.7 L131.2 24.4 Z" fill="var(--ink)" />
          <path d="M116.8 12.2 L133.8 11.2" />
          <circle cx="141" cy="33.5" r="3.2" fill="var(--c-sun)" />
          <path d="M145.2 52.4 L155.4 62.4 L139.6 62.6 Z" fill="var(--c-violet)" />
          <path d="M2.6 56.2 L150 55.4" />
        </g>
        <g stroke="var(--ink)" strokeWidth="2.2" fill="var(--paper)">
          {wheels.map((x) => (
            <g key={x} className="wheel" style={{ transformOrigin: `${x}px 63px` }}>
              <circle cx={x} cy="63" r="8" />
              <path d={`M${x - 7.5} 63h15M${x} 55.5v15`} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
