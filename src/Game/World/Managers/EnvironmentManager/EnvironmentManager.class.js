import EventEmitter from '../../../Utils/EventEmitter.class';

export default class EnvironmentTimeManager extends EventEmitter {
  constructor(initialTime = null) {
    super();


    if (EnvironmentTimeManager.instance) {
      return EnvironmentTimeManager.instance;
    }
    EnvironmentTimeManager.instance = this;

    this.availableTimes = ['day', 'night'];
    this._envTime = initialTime ?? this._getTimeFromLocalHour();
  }

  /**
   * Determines day/night based on user's local time
   * Day: 6:00 AM (6) to 5:59 PM (17)
   * Night: 6:00 PM (18) to 5:59 AM (5)
   */
  _getTimeFromLocalHour() {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  }

  static getInstance() {
    if (!EnvironmentTimeManager.instance) {
      EnvironmentTimeManager.instance = new EnvironmentTimeManager();
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
    this.envTime = this._getTimeFromLocalHour();
  }
}
