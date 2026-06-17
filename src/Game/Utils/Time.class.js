import EventEmitter from './EventEmitter.class';

export default class Time extends EventEmitter {
  #rafId = null;

  constructor() {
    super();

    this.animate = this.animate.bind(this);

    this.start = performance.now();
    this.current = this.start;
    this.elapsedTime = 0;
    this.delta = 0;

    this.#rafId = window.requestAnimationFrame(this.animate);
  }

  animate() {
    const currentTime = performance.now();
    this.delta = Math.min((currentTime - this.current) / 1000, 0.1);
    this.current = currentTime;
    this.elapsedTime = (this.current - this.start) / 1000;

    this.trigger('animate');

    this.#rafId = window.requestAnimationFrame(this.animate);
  }

  dispose() {
    if (this.#rafId) {
      window.cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }
}
