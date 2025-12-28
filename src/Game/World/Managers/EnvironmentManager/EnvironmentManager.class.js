import EventEmitter from '../../../Utils/EventEmitter.class';

export default class EnvironmentTimeManager extends EventEmitter {
  constructor(initialTime = 'night') {
    super();

    // Singleton pattern
    if (EnvironmentTimeManager.instance) {
      return EnvironmentTimeManager.instance;
    }
    EnvironmentTimeManager.instance = this;

    this._envTime = initialTime;
    this.availableTimes = ['day', 'night'];
  }

  static getInstance() {
    if (!EnvironmentTimeManager.instance) {
      EnvironmentTimeManager.instance = new EnvironmentTimeManager('day');
    }
    return EnvironmentTimeManager.instance;
  }

  get envTime() {
    return this._envTime;
  }

  set envTime(value) {
    if (!this.availableTimes.includes(value)) {
      console.warn(
        `Invalid envTime value: ${value}. Must be one of:`,
        this.availableTimes
      );
      return;
    }

    const oldValue = this._envTime;

    if (oldValue === value) {
      return;
    }

    this._envTime = value;
    this.trigger('envTimeChanged', value, oldValue);
  }

  toggle() {
    this.envTime = this._envTime === 'day' ? 'night' : 'day';
  }

  setTime(time) {
    this.envTime = time;
  }

  isDay() {
    return this._envTime === 'day';
  }

  isNight() {
    return this._envTime === 'night';
  }

  onChange(callback) {
    this.on('envTimeChanged', callback);
    return this;
  }

  offChange(callback) {
    this.off('envTimeChanged');
    return this;
  }

  reset() {
    this.envTime = 'night';
  }
}
