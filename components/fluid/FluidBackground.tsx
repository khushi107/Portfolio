'use client';

import { useEffect, useRef } from 'react';
import { FluidSimulation } from '@/lib/fluid/FluidSimulation';
import { useIntro } from '@/components/intro/IntroProvider';

/** Full-screen WebGL canvas behind the page; the ink follows the pointer. */
export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<FluidSimulation | null>(null);
  const { revealed } = useIntro();

  useEffect(() => {
    const sim = FluidSimulation.create(canvasRef.current!);
    simRef.current = sim;
    return () => {
      sim?.dispose();
      simRef.current = null;
    };
  }, []);

  // a few splashes of colour as the curtain lifts
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => simRef.current?.splash(4), 250);
    return () => clearTimeout(t);
  }, [revealed]);

  return <canvas ref={canvasRef} className="fluid" aria-hidden="true" />;
}
