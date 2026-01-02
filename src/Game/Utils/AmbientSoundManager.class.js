import * as THREE from 'three';
import EventEmitter from './EventEmitter.class.js';

export default class AmbientSoundManager extends EventEmitter {
  constructor(environmentManager, seasonManager, audioManager, musicControlUI) {
    super();

    this.environmentManager = environmentManager;
    this.seasonManager = seasonManager;
    this.audioManager = audioManager;
    this.musicControlUI = musicControlUI;

    this.config = {
      shortGapMin: 8000,
      shortGapMax: 10000,
      longGapMin: 8000,
      longGapMax: 10000,
      thunderLongGapMin: 8000,
      thunderLongGapMax: 10000,
      baseVolume: 0.8,

      firePosition: new THREE.Vector3(-5.4, 1.0, -6.9),
      lakePosition: new THREE.Vector3(0, 0, 0),
      maxDistance: 35,
    };

    this.activeContinuousSounds = new Set();
    this.scheduledTimers = new Map();

    this.wasAmbientPlayingBeforeHide = false;
    this.isAmbientSoundsPaused = false;

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateAmbientSounds();
  }

  bindEvents() {
    this.environmentManager.onChange(() => {
      this.updateAmbientSounds();
    });

    this.seasonManager.onChange(() => {
      this.updateAmbientSounds();
    });

    if (this.musicControlUI) {
      const originalEnableMusic = this.musicControlUI.enableMusic.bind(
        this.musicControlUI
      );
      const originalDisableMusic = this.musicControlUI.disableMusic.bind(
        this.musicControlUI
      );

      this.musicControlUI.enableMusic = () => {
        originalEnableMusic();
        this.updateAmbientSounds();
      };

      this.musicControlUI.disableMusic = () => {
        originalDisableMusic();
        this.stopAllAmbientSounds();
      };
    }

    this.setupAmbientVisibilityHandlers();
  }

  setupAmbientVisibilityHandlers() {
    this.handleAmbientVisibilityChange =
      this.handleAmbientVisibilityChange.bind(this);
    this.handleAmbientWindowBlur = this.handleAmbientWindowBlur.bind(this);
    this.handleAmbientWindowFocus = this.handleAmbientWindowFocus.bind(this);
    this.handleAmbientBeforeUnload = this.handleAmbientBeforeUnload.bind(this);

    document.addEventListener(
      'visibilitychange',
      this.handleAmbientVisibilityChange
    );

    window.addEventListener('blur', this.handleAmbientWindowBlur);
    window.addEventListener('focus', this.handleAmbientWindowFocus);

    window.addEventListener('beforeunload', this.handleAmbientBeforeUnload);

    window.addEventListener('pagehide', this.handleAmbientBeforeUnload);

    window.addEventListener('unload', this.handleAmbientBeforeUnload);
  }

  handleAmbientVisibilityChange() {
    if (document.hidden) {
      if (
        this.musicControlUI &&
        this.musicControlUI.isMusicEnabled &&
        this.hasActiveAmbientSounds()
      ) {
        this.wasAmbientPlayingBeforeHide = true;
        this.pauseAmbientSounds();
      }
    } else {
      if (
        this.musicControlUI &&
        this.musicControlUI.isMusicEnabled &&
        this.wasAmbientPlayingBeforeHide
      ) {
        this.wasAmbientPlayingBeforeHide = false;

        setTimeout(() => {
          this.resumeAmbientSounds();
        }, 500);
      }
    }
  }

  handleAmbientWindowBlur() {
    if (
      this.musicControlUI &&
      this.musicControlUI.isMusicEnabled &&
      this.hasActiveAmbientSounds()
    ) {
      this.wasAmbientPlayingBeforeHide = true;
      this.pauseAmbientSounds();
    }
  }

  handleAmbientWindowFocus() {
    if (
      this.musicControlUI &&
      this.musicControlUI.isMusicEnabled &&
      this.wasAmbientPlayingBeforeHide
    ) {
      this.wasAmbientPlayingBeforeHide = false;
      setTimeout(() => {
        this.resumeAmbientSounds();
      }, 500);
    }
  }

  handleAmbientBeforeUnload() {
    this.stopAllAmbientSounds();
  }

  updateAmbientSounds() {
    if (this.musicControlUI && !this.musicControlUI.isMusicEnabled) {
      this.stopAllAmbientSounds();
      return;
    }

    const season = this.seasonManager.currentSeason;
    const timeOfDay = this.environmentManager.envTime;

    this.stopAllAmbientSounds();

    this.handleBirds(season, timeOfDay);
    this.handleCrickets(season, timeOfDay);
    this.handleOwl(season, timeOfDay);
    this.handleRain(season, timeOfDay);
    this.handleThunder(season, timeOfDay);
    this.handleWolf(season, timeOfDay);
    this.handleFire(season, timeOfDay);
    this.handleLakeWaves(season, timeOfDay);
  }

  handleBirds(season, timeOfDay) {
    const shouldPlay =
      (season === 'autumn' || season === 'spring' || season === 'winter') &&
      timeOfDay === 'day';

    if (shouldPlay) {
      this.scheduleRandomSound('birds', () => this.playRandomBird(), 'short');
    }
  }

  handleCrickets(season, timeOfDay) {
    const shouldPlay =
      (season === 'autumn' || season === 'spring' || season === 'winter') &&
      timeOfDay === 'night';

    if (shouldPlay) {
      this.playContinuousSound('cricketsSound');
    }
  }

  handleOwl(season, timeOfDay) {
    if (timeOfDay !== 'night') return;

    if (season === 'autumn' || season === 'spring' || season === 'rainy') {
      this.scheduleRandomSound(
        'owlHowling',
        () => this.playOwlHowling(),
        'long'
      );
    } else if (season === 'winter') {
      this.scheduleRandomSound(
        'owlHooting',
        () => this.playOwlHooting(),
        'long'
      );
    }
  }

  handleRain(season, timeOfDay) {
    const shouldPlay = season === 'rainy';

    if (shouldPlay) {
      this.playContinuousSound('rainSound');
    }
  }

  handleThunder(season, timeOfDay) {
    const shouldPlay = season === 'rainy';

    if (shouldPlay) {
      this.scheduleRandomSound(
        'thunderDistant',
        () => this.playThunder(),
        'thunder'
      );
    }
  }

  playThunderStrike() {
    if (
      this.musicControlUI &&
      this.musicControlUI.isMusicEnabled &&
      !document.hidden &&
      !this.isAmbientSoundsPaused
    ) {
      this.audioManager.playSound(
        'thunderStrikeSound',
        this.config.baseVolume * 0.9,
        false
      );
    }
  }

  handleWolf(season, timeOfDay) {
    const shouldPlay = timeOfDay === 'night';

    if (shouldPlay) {
      this.scheduleRandomSound('wolf', () => this.playWolf(), 'long');
    }
  }

  handleFire(season, timeOfDay) {
    const shouldPlay = season !== 'rainy';

    if (shouldPlay) {
      this.playContinuousSoundWithDistance(
        'fireBurningSound',
        this.config.firePosition
      );
    }
  }

  handleLakeWaves(season, timeOfDay) {
    const shouldPlay = true;

    if (shouldPlay) {
      this.playContinuousSoundWithDistance(
        'lakeWavesSound',
        this.config.lakePosition
      );
    }
  }

  playRandomBird() {
    const birdSoundId = this.audioManager.getRandomBirdSound();
    this.audioManager.playSound(birdSoundId, this.config.baseVolume, false);
  }

  playOwlHowling() {
    this.audioManager.playSound(
      'owlHowlingSound',
      this.config.baseVolume,
      false
    );
  }

  playOwlHooting() {
    this.audioManager.playSound(
      'owlHootingSound',
      this.config.baseVolume,
      false
    );
  }

  playThunder() {
    this.audioManager.playSound(
      'thunderDistantSound',
      this.config.baseVolume * 0.9,
      false
    );
  }

  playWolf() {
    this.audioManager.playSound(
      'wolfHowlingSound',
      this.config.baseVolume * 0.7,
      false
    );
  }

  playContinuousSound(soundId) {
    if (!this.activeContinuousSounds.has(soundId)) {
      this.audioManager.playSound(soundId, this.config.baseVolume * 0.7, true);
      this.activeContinuousSounds.add(soundId);
    }
  }

  stopContinuousSound(soundId) {
    if (this.activeContinuousSounds.has(soundId)) {
      this.audioManager.stopSound(soundId);
      this.activeContinuousSounds.delete(soundId);
    }
  }

  playContinuousSoundWithDistance(soundId, soundPosition) {
    if (!this.activeContinuousSounds.has(soundId)) {
      const volume = this.calculateDistanceBasedVolume(soundPosition);
      this.audioManager.playSound(soundId, volume, true);
      this.activeContinuousSounds.add(soundId);
    } else {
      this.updateSoundVolume(soundId, soundPosition);
    }
  }

  calculateDistanceBasedVolume(soundPosition) {
    const cameraPosition = this.audioManager.listener.parent.position;
    const distance = cameraPosition.distanceTo(soundPosition);

    const normalizedDistance = Math.min(
      distance / this.config.maxDistance,
      1.0
    );
    const volume = (1.0 - normalizedDistance) * this.config.baseVolume * 0.7;

    return Math.max(volume, 0);
  }

  updateSoundVolume(soundId, soundPosition) {
    const sound = this.audioManager.sounds[soundId];
    if (sound && sound.isPlaying) {
      const volume = this.calculateDistanceBasedVolume(soundPosition);
      sound.setVolume(volume);
    }
  }

  scheduleRandomSound(soundKey, playFunction, gapType) {
    this.clearTimer(soundKey);

    const delay = this.getRandomDelay(gapType);
    const timerId = setTimeout(() => {
      playFunction();

      this.rescheduleRandomSound(soundKey, playFunction, gapType);
    }, delay);

    this.scheduledTimers.set(soundKey, timerId);
  }

  rescheduleRandomSound(soundKey, playFunction, gapType) {
    if (this.shouldSoundBePlaying(soundKey)) {
      const delay = this.getRandomDelay(gapType);
      const timerId = setTimeout(() => {
        playFunction();
        this.rescheduleRandomSound(soundKey, playFunction, gapType);
      }, delay);

      this.scheduledTimers.set(soundKey, timerId);
    }
  }

  shouldSoundBePlaying(soundKey) {
    const season = this.seasonManager.currentSeason;
    const timeOfDay = this.environmentManager.envTime;

    switch (soundKey) {
      case 'birds':
        return (
          (season === 'autumn' || season === 'spring' || season === 'winter') &&
          timeOfDay === 'day'
        );
      case 'owlHowling':
        return (
          (season === 'autumn' || season === 'spring' || season === 'rainy') &&
          timeOfDay === 'night'
        );
      case 'owlHooting':
        return season === 'winter' && timeOfDay === 'night';
      case 'thunderDistant':
        return season === 'rainy';
      case 'wolf':
        return timeOfDay === 'night';
      default:
        return false;
    }
  }

  getRandomDelay(gapType) {
    switch (gapType) {
      case 'short':
        return (
          Math.random() * (this.config.shortGapMax - this.config.shortGapMin) +
          this.config.shortGapMin
        );
      case 'long':
        return (
          Math.random() * (this.config.longGapMax - this.config.longGapMin) +
          this.config.longGapMin
        );
      case 'thunder':
        return (
          Math.random() *
            (this.config.thunderLongGapMax - this.config.thunderLongGapMin) +
          this.config.thunderLongGapMin
        );
      default:
        return this.config.shortGapMin;
    }
  }

  clearTimer(soundKey) {
    if (this.scheduledTimers.has(soundKey)) {
      clearTimeout(this.scheduledTimers.get(soundKey));
      this.scheduledTimers.delete(soundKey);
    }
  }

  stopAllAmbientSounds() {
    this.scheduledTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });
    this.scheduledTimers.clear();

    this.activeContinuousSounds.forEach((soundId) => {
      this.stopContinuousSound(soundId);
    });
    this.activeContinuousSounds.clear();
  }

  setMasterVolume(volume) {
    this.config.baseVolume = Math.max(0, Math.min(1, volume));
  }

  hasActiveAmbientSounds() {
    return (
      this.activeContinuousSounds.size > 0 || this.scheduledTimers.size > 0
    );
  }

  pauseAmbientSounds() {
    this.isAmbientSoundsPaused = true;

    this.audioManager.stopAllAmbientSounds();

    this.scheduledTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });
    this.scheduledTimers.clear();

    this.activeContinuousSounds.clear();
  }

  resumeAmbientSounds() {
    this.isAmbientSoundsPaused = false;

    this.updateAmbientSounds();
  }

  update() {
    if (this.activeContinuousSounds.has('fireBurningSound')) {
      this.updateSoundVolume('fireBurningSound', this.config.firePosition);
    }
    if (this.activeContinuousSounds.has('lakeWavesSound')) {
      this.updateSoundVolume('lakeWavesSound', this.config.lakePosition);
    }
  }

  dispose() {
    this.stopAllAmbientSounds();

    document.removeEventListener(
      'visibilitychange',
      this.handleAmbientVisibilityChange
    );
    window.removeEventListener('blur', this.handleAmbientWindowBlur);
    window.removeEventListener('focus', this.handleAmbientWindowFocus);
    window.removeEventListener('beforeunload', this.handleAmbientBeforeUnload);
    window.removeEventListener('pagehide', this.handleAmbientBeforeUnload);
    window.removeEventListener('unload', this.handleAmbientBeforeUnload);
  }
}
