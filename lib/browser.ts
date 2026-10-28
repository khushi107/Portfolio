/** Resolves once the web fonts are ready, or after 3 s so nothing waits forever. */
export function fontsReady(): Promise<void> {
  const loads = Promise.all([
    document.fonts.load('40px "Homemade Apple"'),
    document.fonts.load('600 40px "Familjen Grotesk"'),
    document.fonts.ready,
  ]).then(() => undefined);
  return Promise.race([loads.catch(() => undefined), new Promise<void>((r) => setTimeout(r, 3000))]);
}

/**
 * Calls `fn` when drawings need rebuilding: the window width changes or the
 * theme switches between light and dark. Returns an unsubscribe function.
 */
export function onRelayout(fn: () => void): () => void {
  let lastWidth = window.innerWidth;
  let timer = 0;
  const onResize = () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (Math.abs(window.innerWidth - lastWidth) < 2) return;
      lastWidth = window.innerWidth;
      fn();
    }, 180);
  };
  const dark = window.matchMedia('(prefers-color-scheme: dark)');
  const observer = new MutationObserver(fn);
  window.addEventListener('resize', onResize);
  dark.addEventListener('change', fn);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => {
    clearTimeout(timer);
    window.removeEventListener('resize', onResize);
    dark.removeEventListener('change', fn);
    observer.disconnect();
  };
}

export const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
