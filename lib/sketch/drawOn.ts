/**
 * Makes SVG paths "draw themselves": each path's dash is set to its own
 * length and offset by that length (hidden), then transitioned to 0.
 */
export function drawOn(root: Element, { duration = 0.7, stagger = 0, pairs = true, delay: start = 0 } = {}) {
  root.querySelectorAll('path').forEach((node, i) => {
    const p = node as SVGPathElement;
    const len = p.getTotalLength();
    p.style.transition = 'none';
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
    p.getBoundingClientRect(); // commit the hidden state before animating
    const delay = start + (pairs ? Math.floor(i / 2) : i) * stagger;
    p.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(.55,.1,.3,1) ${delay.toFixed(2)}s`;
    p.style.strokeDashoffset = '0';
  });
}
