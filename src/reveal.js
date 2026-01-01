import revealVertexShader from './Shaders/Materials/reveal/vertex.glsl';
import revealFragmentShader from './Shaders/Materials/reveal/fragment.glsl';

export default class ShaderReveal {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!this.gl) {
      console.warn('WebGL not supported, falling back to simple fade');
      return;
    }

    this.program = null;
    this.uniforms = {};
    this.startTime = 0;
    this.duration = 4500;

    this.textDisplayDuration = 7000;
    this.hasStarted = false;
    this.textOverlay = null;

    this.init();
  }

  init() {
    const vertexShader = this.createShader(
      this.gl.VERTEX_SHADER,
      revealVertexShader
    );
    const fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      revealFragmentShader
    );

    if (!vertexShader || !fragmentShader) return;

    this.program = this.createProgram(vertexShader, fragmentShader);
    if (!this.program) return;

    this.uniforms = {
      time: this.gl.getUniformLocation(this.program, 'uTime'),
      progress: this.gl.getUniformLocation(this.program, 'uProgress'),
      resolution: this.gl.getUniformLocation(this.program, 'uResolution'),
    };

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    const positionLocation = this.gl.getAttribLocation(
      this.program,
      'aPosition'
    );
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(
      positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.resize();
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(
        'Shader compilation error:',
        this.gl.getShaderInfoLog(shader)
      );
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  createProgram(vertexShader, fragmentShader) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error(
        'Program linking error:',
        this.gl.getProgramInfoLog(program)
      );
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  resize() {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  createTextOverlay() {
    this.textOverlay = document.createElement('div');
    this.textOverlay.innerHTML = `
      <div class="reveal-content">
        <h1 class="reveal-title">A Dream Realized</h1>

        <div class="reveal-description">
          <p class="reveal-line">For as long as I can remember, I've dreamed of creating a quiet digital corner where stylised nature could breathe, seasons freely shifting, days fading into nights, leaves whispering in an invisible breeze.
          <br><br>
          And this project turned that dream into reality, built one shader, one texture, and one late night at a time. Countless tutorials, devlogs, and fellow creators kept me going and reminded me that shared passion multiplies.
          <br><br>
          Thank you for visiting. I hope it brings you a moment of quiet wonder!
          </p>
          <p class="reveal-footer">— Sahil K.</p>
        </div>
      </div>
      <style>
        .reveal-content {
          text-align: center;
          font-family: 'Inter', sans-serif;
          max-width: min(600px, 90vw);
          margin: 0 auto;
          padding: 1rem;
        }

        .reveal-title {
          font-family: 'Schoolbell', sans-serif;
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 700;
          color: #000;
          margin: 0 0 1.2rem 0;
          opacity: 0;
          transition: opacity 1.2s ease-out;
          line-height: 1.2;
        }

        .reveal-description {
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.8rem, 2.5vw, 1rem);
          line-height: 1.6;
          color: rgba(0, 0, 0, 0.6);
          font-weight: 400;
        }

        .reveal-line {
          margin: 0.2rem 0;
          opacity: 0;
          transition: opacity 0.8s ease-out;
        }

        .reveal-footer {
          margin: 0.8rem 0 0 0;
          font-style: italic;
          opacity: 0;
          transition: opacity 0.8s ease-out;
          text-align: right;
        }

        /* Small phones */
        @media (max-width: 380px) {
          .reveal-content {
            padding: 0.5rem;
          }
          .reveal-title {
            font-size: 1.5rem;
            margin-bottom: 0.8rem;
          }
          .reveal-description {
            font-size: 0.75rem;
            line-height: 1.5;
          }
        }

        /* Landscape mobile - reduce text for limited height */
        @media (max-height: 500px) and (orientation: landscape) {
          .reveal-content {
            max-width: min(700px, 85vw);
          }
          .reveal-title {
            font-size: clamp(1.3rem, 4vh, 1.8rem);
            margin-bottom: 0.5rem;
          }
          .reveal-description {
            font-size: clamp(0.65rem, 2vh, 0.85rem);
            line-height: 1.4;
          }
          .reveal-line br {
            display: none;
          }
          .reveal-line br + br {
            display: inline;
          }
          .reveal-line br + br::before {
            content: ' ';
          }
          .reveal-footer {
            margin-top: 0.5rem;
          }
        }

        /* Very short landscape (iPhone SE landscape, etc) */
        @media (max-height: 380px) and (orientation: landscape) {
          .reveal-title {
            font-size: 1.2rem;
            margin-bottom: 0.4rem;
          }
          .reveal-description {
            font-size: 0.6rem;
            line-height: 1.35;
          }
        }

        /* Tablets */
        @media (min-width: 768px) and (min-height: 600px) {
          .reveal-content {
            max-width: 550px;
          }
          .reveal-title {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
          }
          .reveal-description {
            font-size: 0.95rem;
            line-height: 1.7;
          }
        }

        /* Large screens */
        @media (min-width: 1200px) {
          .reveal-content {
            max-width: 620px;
          }
          .reveal-title {
            font-size: 3rem;
          }
          .reveal-description {
            font-size: 1rem;
            line-height: 1.8;
          }
        }
      </style>
    `;

    this.textOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #ede8e4;
      z-index: 1001;
      opacity: 1;
      pointer-events: none;
      padding: env(safe-area-inset-top, 1rem) env(safe-area-inset-right, 1rem) env(safe-area-inset-bottom, 1rem) env(safe-area-inset-left, 1rem);
      box-sizing: border-box;
      overflow: hidden;
    `;

    document.body.appendChild(this.textOverlay);

    this.animateTextReveal();
  }

  animateTextReveal() {
    if (!this.textOverlay) return;

    setTimeout(() => {
      const title = this.textOverlay.querySelector('.reveal-title');
      if (title) {
        title.style.opacity = '1';
      }
    }, 200);

    setTimeout(() => {
      const line = this.textOverlay.querySelector('.reveal-line');
      if (line) {
        line.style.opacity = '1';
      }
    }, 800);

    setTimeout(() => {
      const footer = this.textOverlay.querySelector('.reveal-footer');
      if (footer) {
        footer.style.opacity = '1';
      }
    }, 1400);
  }

  start() {
    if (this.hasStarted) {
      return;
    }

    this.hasStarted = true;

    this.createTextOverlay();

    if (!this.gl || !this.program) {
      setTimeout(() => {
        this.animateTextExit();
        setTimeout(() => {
          if (this.textOverlay) {
            this.textOverlay.style.transition = 'opacity 1s ease-out';
            this.textOverlay.style.opacity = '0';
          }
        }, 800);
      }, this.textDisplayDuration - 1000);
      return;
    }

    setTimeout(() => {
      this.animateTextExit();
    }, this.textDisplayDuration - 1200);

    setTimeout(() => {
      this.startRevealAnimation();
    }, this.textDisplayDuration - 400);
  }

  animateTextExit() {
    if (!this.textOverlay) return;

    setTimeout(() => {
      const footer = this.textOverlay.querySelector('.reveal-footer');
      if (footer) {
        footer.style.transition = 'opacity 0.4s ease-out';
        footer.style.opacity = '0';
      }
    }, 0);

    setTimeout(() => {
      const line = this.textOverlay.querySelector('.reveal-line');
      if (line) {
        line.style.transition = 'opacity 0.4s ease-out';
        line.style.opacity = '0';
      }
    }, 150);

    setTimeout(() => {
      const title = this.textOverlay.querySelector('.reveal-title');
      if (title) {
        title.style.transition = 'opacity 0.4s ease-out';
        title.style.opacity = '0';
      }
    }, 300);
  }

  startRevealAnimation() {
    if (this.textOverlay) {
      this.textOverlay.style.transition = 'opacity 0.5s ease-out';
      this.textOverlay.style.opacity = '0';
      setTimeout(() => {
        if (this.textOverlay) {
          this.textOverlay.remove();
          this.textOverlay = null;
        }
      }, 500);
    }

    this.startTime = performance.now();
    this.animate();
  }

  animate() {
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);

    const easeProgress =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    this.gl.useProgram(this.program);

    this.gl.uniform1f(this.uniforms.time, currentTime * 0.001);
    this.gl.uniform1f(this.uniforms.progress, easeProgress);
    this.gl.uniform2f(
      this.uniforms.resolution,
      this.canvas.width,
      this.canvas.height
    );

    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    if (progress < 1) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.finish();
    }
  }

  finish() {
    this.hasStarted = false;

    setTimeout(() => {
      this.canvas.style.display = 'none';
    }, 1500);
  }

  reset() {
    this.hasStarted = false;
    this.canvas.style.display = 'block';
    this.canvas.style.transition = '';

    if (this.textOverlay && this.textOverlay.parentNode) {
      this.textOverlay.parentNode.removeChild(this.textOverlay);
      this.textOverlay = null;
    }
  }

  destroy() {
    this.reset();
  }
}
