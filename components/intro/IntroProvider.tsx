'use client';

import { createContext, useContext, useMemo, useState } from 'react';

interface IntroState {
  /** The curtain has started lifting: time for the hero pen to start. */
  revealed: boolean;
  /** The curtain is gone and the page is scrollable. */
  finished: boolean;
  setRevealed: (v: boolean) => void;
  setFinished: (v: boolean) => void;
}

const IntroContext = createContext<IntroState | null>(null);

/** Shares the intro's progress so other sections know when to start drawing. */
export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const value = useMemo(() => ({ revealed, finished, setRevealed, setFinished }), [revealed, finished]);
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro(): IntroState {
  const ctx = useContext(IntroContext);
  if (!ctx) throw new Error('useIntro must be used inside <IntroProvider>');
  return ctx;
}
