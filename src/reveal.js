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
    this.duration = 5000;
    this.isAnimating = false;
    this.hasStarted = false;

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

  start() {
    if (this.hasStarted) {
      console.log('Shader reveal already started, ignoring duplicate call');
      return;
    }

    this.hasStarted = true;

    if (!this.gl || !this.program) {
      this.canvas.style.opacity = '1';
      this.canvas.style.background = '#ede8e4';
      this.canvas.style.transition = 'opacity 2.5s ease-out';

      setTimeout(() => {
        this.canvas.style.opacity = '0';
        setTimeout(() => {
          this.canvas.style.display = 'none';
        }, 2500);
      }, 100);
      return;
    }

    this.canvas.style.opacity = '1';
    this.startTime = performance.now();
    this.isAnimating = true;
    this.animate();
  }

  animate() {
    if (!this.isAnimating) return;

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
    this.isAnimating = false;

    this.canvas.style.transition = 'opacity 1.5s ease-out';
    this.canvas.style.opacity = '0';

    setTimeout(() => {
      this.canvas.style.display = 'none';
    }, 1500);
  }

  reset() {
    this.hasStarted = false;
    this.isAnimating = false;
    this.canvas.style.opacity = '0';
    this.canvas.style.display = 'block';
  }
}
