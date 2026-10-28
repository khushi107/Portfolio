/**
 * Animation settings in one place. Change a number here and every effect
 * that uses it updates.
 */
export const settings = {
  /** How fast the pen draws, in CSS pixels per second. */
  penSpeed: 420,
  /** How long each greeting stays on the intro curtain, in milliseconds. */
  helloMs: 160,
  /** How long the first greeting stays before the rest flick past. */
  firstHelloMs: 900,

  ink: {
    /**
     * Colour decay rate per second. Colour falls to about 5% after 3 / fade
     * seconds, so 2 means the trail clears in roughly 1.5 s.
     */
    fade: 2,
    /** Velocity decay rate per second. */
    velocityFade: 0.9,
    /** Vorticity confinement strength: how much the ink curls. */
    swirl: 37,
    /** Splat radius as a percentage of the screen. */
    brush: 0.1,
    /** Pressure carried over between frames (0 to 1). */
    pressure: 0.8,
    /** Jacobi iterations for the pressure solve. */
    pressureIterations: 20,
    /** Force applied per unit of pointer movement. */
    splatForce: 6000,
    palette: 'prism' as const,
  },
} as const;

export type Palette = 'prism' | 'lagoon' | 'ember' | 'ink';
