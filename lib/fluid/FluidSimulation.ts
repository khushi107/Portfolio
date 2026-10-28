/**
 * The ink that follows the cursor. A small fluid simulation runs on the GPU
 * every frame: pointer movement adds colour ("dye") and force, the velocity
 * field carries the dye around, and both fade a little each frame.
 */
import { settings, type Palette } from '@/lib/config';
import { baseVertex, fragment } from './shaders';

type GL = WebGLRenderingContext | WebGL2RenderingContext;
type Uniforms = Record<string, WebGLUniformLocation | null>;
type Color = [number, number, number];

interface Program {
  uniforms: Uniforms;
  bind(): void;
}
interface Target {
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelX: number;
  texelY: number;
  attach(unit: number): number;
  dispose(): void;
}
interface DoubleTarget {
  width: number;
  height: number;
  texelX: number;
  texelY: number;
  read: Target;
  write: Target;
  swap(): void;
  dispose(): void;
}

const SIM_RESOLUTION = 128;

function hsvToRgb(h: number, s: number, v: number): Color {
  h = ((h % 1) + 1) % 1;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  return ([[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]] as Color[])[i % 6];
}

const PALETTES: Record<Palette, () => [number, number, number]> = {
  prism: () => [Math.random(), 0.9, 1],
  lagoon: () => [0.45 + Math.random() * 0.23, 0.85, 1],
  ember: () => [0.9 + Math.random() * 0.19, 0.9, 1],
  ink: () => [0.6 + Math.random() * 0.06, 0.8, 0.85],
};

export class FluidSimulation {
  private gl: GL;
  private programs: Record<keyof typeof fragment, Program>;
  private formats: { internal: number; type: number; filter: number };
  private dye!: DoubleTarget;
  private velocity!: DoubleTarget;
  private divergence!: Target;
  private curl!: Target;
  private pressure!: DoubleTarget;
  private raf = 0;
  private last = performance.now();
  private queue: [number, number, number, number, Color][] = [];
  private pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, ready: false, color: [0, 0, 0] as Color, colorAt: 0 };
  private dyeResolution: number;
  private cleanup: (() => void)[] = [];

  /** Returns null when the browser cannot run the simulation (no WebGL or no float textures). */
  static create(canvas: HTMLCanvasElement): FluidSimulation | null {
    try {
      return new FluidSimulation(canvas);
    } catch (err) {
      console.warn('Ink background unavailable:', err);
      return null;
    }
  }

  private constructor(private canvas: HTMLCanvasElement) {
    const opts: WebGLContextAttributes = { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false };
    const gl2 = canvas.getContext('webgl2', opts);
    const gl = gl2 ?? canvas.getContext('webgl', opts);
    if (!gl) throw new Error('WebGL is not available');
    this.gl = gl;

    if (gl2) {
      gl2.getExtension('EXT_color_buffer_float');
      gl2.getExtension('EXT_color_buffer_half_float');
      this.formats = { internal: gl2.RGBA16F, type: gl2.HALF_FLOAT, filter: gl2.LINEAR };
    } else {
      const half = gl.getExtension('OES_texture_half_float');
      if (!half) throw new Error('Half-float textures are not supported');
      const linear = gl.getExtension('OES_texture_half_float_linear');
      this.formats = { internal: gl.RGBA, type: half.HALF_FLOAT_OES, filter: linear ? gl.LINEAR : gl.NEAREST };
    }
    gl.clearColor(0, 0, 0, 0);

    this.programs = this.compileAll();
    this.createQuad();
    this.dyeResolution = Math.min(window.innerWidth, window.innerHeight) < 600 ? 512 : 1024;
    this.resize();
    this.createTargets();
    this.pointer.color = this.pickColor(0.15);
    this.listen();
    this.raf = requestAnimationFrame(this.frame);
  }

  /** Throw a few random blobs of ink onto the page. */
  splash(count: number) {
    for (let i = 0; i < count; i++) {
      this.queue.push([Math.random(), Math.random() * 0.8 + 0.1, 1000 * (Math.random() - 0.5), 1000 * (Math.random() - 0.5), this.pickColor(1.4)]);
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.cleanup.forEach((fn) => fn());
    [this.dye, this.velocity, this.divergence, this.curl, this.pressure].forEach((t) => t?.dispose());
  }

  // ---------- setup ----------

  private compileAll() {
    const gl = this.gl;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader error');
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, baseVertex);
    const make = (source: string): Program => {
      const program = gl.createProgram()!;
      gl.attachShader(program, vertex);
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, source));
      gl.bindAttribLocation(program, 0, 'aPosition');
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link error');
      const uniforms: Uniforms = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(program, i)!.name;
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      return { uniforms, bind: () => gl.useProgram(program) };
    };
    const out = {} as Record<keyof typeof fragment, Program>;
    (Object.keys(fragment) as (keyof typeof fragment)[]).forEach((k) => (out[k] = make(fragment[k])));
    return out;
  }

  private createQuad() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
  }

  private target(width: number, height: number, filter: number): Target {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.formats.internal, width, height, 0, gl.RGBA, this.formats.type, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Cannot render to float textures');
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      fbo,
      width,
      height,
      texelX: 1 / width,
      texelY: 1 / height,
      attach: (unit) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return unit;
      },
      dispose: () => {
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(fbo);
      },
    };
  }

  /** Two textures we read from and write to alternately ("ping-pong"). */
  private doubleTarget(width: number, height: number, filter: number): DoubleTarget {
    let a = this.target(width, height, filter);
    let b = this.target(width, height, filter);
    return {
      width,
      height,
      texelX: a.texelX,
      texelY: a.texelY,
      get read() {
        return a;
      },
      get write() {
        return b;
      },
      swap() {
        [a, b] = [b, a];
      },
      dispose() {
        a.dispose();
        b.dispose();
      },
    };
  }

  private resolution(base: number) {
    const gl = this.gl;
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(base);
    const max = Math.round(base * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { w: max, h: min } : { w: min, h: max };
  }

  private createTargets() {
    [this.dye, this.velocity, this.divergence, this.curl, this.pressure].forEach((t) => t?.dispose());
    const gl = this.gl;
    const sim = this.resolution(SIM_RESOLUTION);
    const dye = this.resolution(this.dyeResolution);
    this.dye = this.doubleTarget(dye.w, dye.h, this.formats.filter);
    this.velocity = this.doubleTarget(sim.w, sim.h, this.formats.filter);
    this.divergence = this.target(sim.w, sim.h, gl.NEAREST);
    this.curl = this.target(sim.w, sim.h, gl.NEAREST);
    this.pressure = this.doubleTarget(sim.w, sim.h, gl.NEAREST);
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width === w && this.canvas.height === h) return false;
    this.canvas.width = w;
    this.canvas.height = h;
    return true;
  }

  private listen() {
    const toUV = (e: PointerEvent): [number, number] => [e.clientX / this.canvas.clientWidth, 1 - e.clientY / this.canvas.clientHeight];
    const move = (e: PointerEvent) => {
      const [x, y] = toUV(e);
      const p = this.pointer;
      if (!p.ready) {
        p.x = x;
        p.y = y;
        p.ready = true;
        return;
      }
      const aspect = this.canvas.width / this.canvas.height;
      let dx = x - p.x;
      let dy = y - p.y;
      if (aspect < 1) dx *= aspect;
      if (aspect > 1) dy /= aspect;
      Object.assign(p, { x, y, dx, dy, moved: dx !== 0 || dy !== 0 });
    };
    const down = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (el?.closest?.('button, input, select, a, .curtain')) return;
      const [x, y] = toUV(e);
      this.queue.push([x, y, 10 * (Math.random() - 0.5), 30 * (Math.random() - 0.5), this.pickColor(1.5)]);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    this.cleanup.push(() => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
    });
  }

  private pickColor(multiplier: number): Color {
    const [h, s, v] = PALETTES[settings.ink.palette]();
    return hsvToRgb(h, s, v).map((c) => c * multiplier) as Color;
  }

  // ---------- each frame ----------

  private blit(target: Target | null) {
    const gl = this.gl;
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  /** Add a soft blob of force (velocity) and colour (dye) at a point. */
  private splat(x: number, y: number, dx: number, dy: number, color: Color) {
    const gl = this.gl;
    const p = this.programs.splat;
    const aspect = this.canvas.width / this.canvas.height;
    let radius = settings.ink.brush / 100;
    if (aspect > 1) radius *= aspect;
    p.bind();
    gl.uniform1i(p.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(p.uniforms.aspectRatio, aspect);
    gl.uniform2f(p.uniforms.point, x, y);
    gl.uniform3f(p.uniforms.color, dx, dy, 0);
    gl.uniform1f(p.uniforms.radius, radius);
    this.blit(this.velocity.write);
    this.velocity.swap();
    gl.uniform1i(p.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform3f(p.uniforms.color, color[0], color[1], color[2]);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private step(dt: number) {
    const gl = this.gl;
    const P = this.programs;
    const v = this.velocity;
    gl.disable(gl.BLEND);

    P.curl.bind();
    gl.uniform2f(P.curl.uniforms.texelSize, v.texelX, v.texelY);
    gl.uniform1i(P.curl.uniforms.uVelocity, v.read.attach(0));
    this.blit(this.curl);

    P.vorticity.bind();
    gl.uniform2f(P.vorticity.uniforms.texelSize, v.texelX, v.texelY);
    gl.uniform1i(P.vorticity.uniforms.uVelocity, v.read.attach(0));
    gl.uniform1i(P.vorticity.uniforms.uCurl, this.curl.attach(1));
    gl.uniform1f(P.vorticity.uniforms.curl, settings.ink.swirl);
    gl.uniform1f(P.vorticity.uniforms.dt, dt);
    this.blit(v.write);
    v.swap();

    P.divergence.bind();
    gl.uniform2f(P.divergence.uniforms.texelSize, v.texelX, v.texelY);
    gl.uniform1i(P.divergence.uniforms.uVelocity, v.read.attach(0));
    this.blit(this.divergence);

    P.clear.bind();
    gl.uniform1i(P.clear.uniforms.uTexture, this.pressure.read.attach(0));
    gl.uniform1f(P.clear.uniforms.value, settings.ink.pressure);
    this.blit(this.pressure.write);
    this.pressure.swap();

    P.pressure.bind();
    gl.uniform2f(P.pressure.uniforms.texelSize, v.texelX, v.texelY);
    gl.uniform1i(P.pressure.uniforms.uDivergence, this.divergence.attach(0));
    for (let i = 0; i < settings.ink.pressureIterations; i++) {
      gl.uniform1i(P.pressure.uniforms.uPressure, this.pressure.read.attach(1));
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    P.gradientSubtract.bind();
    gl.uniform2f(P.gradientSubtract.uniforms.texelSize, v.texelX, v.texelY);
    gl.uniform1i(P.gradientSubtract.uniforms.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(P.gradientSubtract.uniforms.uVelocity, v.read.attach(1));
    this.blit(v.write);
    v.swap();

    P.advection.bind();
    gl.uniform2f(P.advection.uniforms.texelSize, v.texelX, v.texelY);
    const unit = v.read.attach(0);
    gl.uniform1i(P.advection.uniforms.uVelocity, unit);
    gl.uniform1i(P.advection.uniforms.uSource, unit);
    gl.uniform1f(P.advection.uniforms.dt, dt);
    gl.uniform1f(P.advection.uniforms.dissipation, settings.ink.velocityFade);
    this.blit(v.write);
    v.swap();

    gl.uniform1i(P.advection.uniforms.uVelocity, v.read.attach(0));
    gl.uniform1i(P.advection.uniforms.uSource, this.dye.read.attach(1));
    gl.uniform1f(P.advection.uniforms.dissipation, settings.ink.fade);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private render() {
    const gl = this.gl;
    const p = this.programs.display;
    p.bind();
    gl.uniform1i(p.uniforms.uTexture, this.dye.read.attach(0));
    gl.uniform1f(p.uniforms.intensity, 1);
    this.blit(null);
  }

  private frame = (now: number) => {
    const dt = Math.min((now - this.last) / 1000, 1 / 60);
    this.last = now;
    if (this.resize()) this.createTargets();
    // the cursor leaks ink: each movement splats colour and force where the pointer is
    const p = this.pointer;
    if (p.moved) {
      p.moved = false;
      if (now - p.colorAt > 140) {
        p.color = this.pickColor(0.15);
        p.colorAt = now;
      }
      this.splat(p.x, p.y, p.dx * settings.ink.splatForce, p.dy * settings.ink.splatForce, p.color);
    }
    while (this.queue.length) this.splat(...this.queue.shift()!);
    this.step(dt);
    this.render();
    this.raf = requestAnimationFrame(this.frame);
  };
}
