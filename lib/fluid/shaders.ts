/**
 * GLSL shaders for a stable-fluids simulation (Jos Stam's method), the same
 * family of technique as Pavel Dobryakov's open-source WebGL Fluid Simulation.
 * Each shader is one full-screen pass over a texture.
 */

const PRECISION = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';

/** Shared vertex shader: a full-screen quad, plus the four neighbouring texel coordinates. */
export const baseVertex = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv, vL, vR, vT, vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

export const fragment = {
  /** Multiply a texture by a value (used to relax pressure between frames). */
  clear: `${PRECISION}
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`,

  /** Draw the dye. Colour is premultiplied, so faint ink fades into the page instead of greying it. */
  display: `${PRECISION}
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float intensity;
void main () {
  vec3 c = clamp(texture2D(uTexture, vUv).rgb * intensity, 0.0, 1.0);
  float a = max(c.r, max(c.g, c.b));
  gl_FragColor = vec4(c, a);
}`,

  /** Add a soft Gaussian blob of colour or force at the pointer. */
  splat: `${PRECISION}
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio, radius;
uniform vec3 color;
uniform vec2 point;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
}`,

  /** Semi-Lagrangian advection: look backwards along the velocity to find what flows here. */
  advection: `${PRECISION}
varying vec2 vUv;
uniform sampler2D uVelocity, uSource;
uniform vec2 texelSize;
uniform float dt, dissipation;
void main () {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
}`,

  /** How much fluid is flowing out of each cell. */
  divergence: `${PRECISION}
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,

  /** How much the fluid is spinning at each cell. */
  curl: `${PRECISION}
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,

  /** Vorticity confinement: push the fluid to keep its small swirls alive. */
  vorticity: `${PRECISION}
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity, uCurl;
uniform float curl, dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 v = texture2D(uVelocity, vUv).xy + force * dt;
  gl_FragColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`,

  /** One Jacobi iteration of the pressure Poisson equation. */
  pressure: `${PRECISION}
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uPressure, uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float d = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - d) * 0.25, 0.0, 0.0, 1.0);
}`,

  /** Subtract the pressure gradient so the fluid stays incompressible. */
  gradientSubtract: `${PRECISION}
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uPressure, uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 v = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  gl_FragColor = vec4(v, 0.0, 1.0);
}`,
} as const;
