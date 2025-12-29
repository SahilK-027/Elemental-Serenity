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
      <div class="reveal-content" style="
        text-align: center; 
        font-family: 'Inter', sans-serif;
        max-width: 600px;
        margin: 0 auto;
      ">
        <h1 class="reveal-title" style="
          font-family: 'Schoolbell', sans-serif;
          font-size: clamp(2.5rem, 6vw, 3rem);
          font-weight: 700;
          color: #000;
          margin: 0 0 1.5rem 0;
          opacity: 0;
          transition: opacity 1.2s ease-out;
        ">A Dream Realized</h1>
        
        <div class="reveal-description" style="
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.85rem, 2vw, 1rem);
          line-height: 1.7;
          color: rgba(0, 0, 0, 0.6);
          font-weight: 400;
        ">
          <p class="reveal-line" style="
            margin: 0.2rem 0;
            opacity: 0;
            transition: opacity 0.8s ease-out;
          "> For as long as I can remember, I've dreamed of creating a quiet digital corner where stylised nature could breathe, seasons freely shifting, days fading into nights, leaves whispering in an invisible breeze.
          <br>
          <br>
          And this project turned that dream into reality, built one shader, one texture, and one late night at a time. Countless tutorials, devlogs, and fellow creators kept me going and reminded me that shared passion multiplies.
          <br>
          <br>
          Thank you for visiting. I hope it brings you a moment of quiet wonder!
          </p>
          <p class="reveal-footer" style="
            margin: 0.8rem 0 0 0;
            font-style: italic;
            opacity: 0;
            transition: opacity 0.8s ease-out;
            text-align: right;
          ">
          — Sahil K.
          </p>
        </div>
      </div>
    `;

    this.textOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #ede8e4;
      z-index: 1001;
      opacity: 1;
      pointer-events: none;
      padding: 2rem;
      box-sizing: border-box;
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
      console.log('Shader reveal already started, ignoring duplicate call');
      return;
    }

    console.log('Starting unified reveal experience');
    this.hasStarted = true;

    this.createTextOverlay();

    this.canvas.style.opacity = '0';

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
    console.log('Starting reveal animation');

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

    this.canvas.style.opacity = '1';
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

    this.canvas.style.transition = 'opacity 1.5s ease-out';
    this.canvas.style.opacity = '0';

    setTimeout(() => {
      this.canvas.style.display = 'none';
    }, 1500);
  }

  reset() {
    this.hasStarted = false;
    this.canvas.style.opacity = '0';
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
