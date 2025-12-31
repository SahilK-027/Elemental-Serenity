import * as THREE from 'three';
import EventEmitter from './EventEmitter.class.js';

export default class AmbientSoundManager extends EventEmitter {
  constructor(environmentManager, seasonManager, audioManager, musicControlUI) {
    super();

    this.environmentManager = environmentManager;
    this.seasonManager = seasonManager;
    this.audioManager = audioManager;
    this.musicControlUI = musicControlUI;

    // Sound configuration constants
    this.config = {
      shortGapMin: 8000,
      shortGapMax: 10000,
      longGapMin: 8000,
      longGapMax: 10000,
      thunderLongGapMin: 8000,
      thunderLongGapMax: 10000,
      baseVolume: 0.8,
      // Distance-based sound positions
      firePosition: new THREE.Vector3(-5.4, 1.0, -6.9),
      lakePosition: new THREE.Vector3(0, 0, 0),
      maxDistance: 35, // Maximum distance for volume calculation
    };

    // Active ambient sounds tracking
    this.activeContinuousSounds = new Set();
    this.scheduledTimers = new Map();

    // Track ambient sound state for tab visibility
    this.wasAmbientPlayingBeforeHide = false;
    this.isAmbientSoundsPaused = false;

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateAmbientSounds();
  }

  bindEvents() {
    // Listen for environment and season changes
    this.environmentManager.onChange(() => {
      this.updateAmbientSounds();
    });

    this.seasonManager.onChange(() => {
      this.updateAmbientSounds();
    });

    // Listen for music control changes
    if (this.musicControlUI) {
      // Override the original methods to include ambient sound control
      const originalEnableMusic = this.musicControlUI.enableMusic.bind(
        this.musicControlUI
      );
      const originalDisableMusic = this.musicControlUI.disableMusic.bind(
        this.musicControlUI
      );

      this.musicControlUI.enableMusic = () => {
        originalEnableMusic();
        this.updateAmbientSounds(); // Resume ambient sounds
      };

      this.musicControlUI.disableMusic = () => {
        originalDisableMusic();
        this.stopAllAmbientSounds(); // Stop all ambient sounds
      };
    }

    // Set up our own visibility handlers for ambient sounds
    this.setupAmbientVisibilityHandlers();
  }

  setupAmbientVisibilityHandlers() {
    // Bind methods to preserve 'this' context
    this.handleAmbientVisibilityChange =
      this.handleAmbientVisibilityChange.bind(this);
    this.handleAmbientWindowBlur = this.handleAmbientWindowBlur.bind(this);
    this.handleAmbientWindowFocus = this.handleAmbientWindowFocus.bind(this);
    this.handleAmbientBeforeUnload = this.handleAmbientBeforeUnload.bind(this);

    // Handle page visibility changes (user switching tabs, minimizing window, etc.)
    document.addEventListener(
      'visibilitychange',
      this.handleAmbientVisibilityChange
    );

    // Handle window focus/blur events as backup
    window.addEventListener('blur', this.handleAmbientWindowBlur);
    window.addEventListener('focus', this.handleAmbientWindowFocus);

    // Handle beforeunload (user leaving the page)
    window.addEventListener('beforeunload', this.handleAmbientBeforeUnload);

    // Handle pagehide (more reliable for mobile)
    window.addEventListener('pagehide', this.handleAmbientBeforeUnload);

    // Handle unload as additional backup
    window.addEventListener('unload', this.handleAmbientBeforeUnload);
  }

  handleAmbientVisibilityChange() {
    if (document.hidden) {
      // Page is hidden - pause ambient sounds if music is enabled
      if (
        this.musicControlUI &&
        this.musicControlUI.isMusicEnabled &&
        this.hasActiveAmbientSounds()
      ) {
        this.wasAmbientPlayingBeforeHide = true;
        this.pauseAmbientSounds();
      }
    } else {
      // Page is visible again - resume ambient sounds if they were playing before
      if (
        this.musicControlUI &&
        this.musicControlUI.isMusicEnabled &&
        this.wasAmbientPlayingBeforeHide
      ) {
        this.wasAmbientPlayingBeforeHide = false;
        // Small delay to ensure smooth transition
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
    // Don't play ambient sounds if music is disabled
    if (this.musicControlUI && !this.musicControlUI.isMusicEnabled) {
      this.stopAllAmbientSounds();
      return;
    }

    const season = this.seasonManager.currentSeason;
    const timeOfDay = this.environmentManager.envTime;

    // Stop all current ambient sounds and clear timers
    this.stopAllAmbientSounds();

    // Start appropriate sounds based on conditions
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
    // When: season is autumn OR spring OR winter AND timeOfDay is day
    const shouldPlay =
      (season === 'autumn' || season === 'spring' || season === 'winter') &&
      timeOfDay === 'day';

    if (shouldPlay) {
      this.scheduleRandomSound('birds', () => this.playRandomBird(), 'short');
    }
  }

  handleCrickets(season, timeOfDay) {
    // When: season is autumn OR spring AND timeOfDay is night
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
      // owl_howling.mp3 for autumn, spring, and rainy seasons
      this.scheduleRandomSound(
        'owlHowling',
        () => this.playOwlHowling(),
        'long'
      );
    } else if (season === 'winter') {
      // owl_hooting.mp3 for winter season
      this.scheduleRandomSound(
        'owlHooting',
        () => this.playOwlHooting(),
        'long'
      );
    }
  }

  handleRain(season, timeOfDay) {
    // When: season is rainy (day or night)
    const shouldPlay = season === 'rainy';

    if (shouldPlay) {
      this.playContinuousSound('rainSound');
    }
  }

  handleThunder(season, timeOfDay) {
    // When: season is rainy (day or night)
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
    // Play the thunder strike sound only if:
    // 1. Music is enabled
    // 2. Tab is visible
    // 3. Ambient sounds are not paused
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
    // When: all seasons AND timeOfDay is night
    const shouldPlay = timeOfDay === 'night';

    if (shouldPlay) {
      this.scheduleRandomSound('wolf', () => this.playWolf(), 'long');
    }
  }

  handleFire(season, timeOfDay) {
    // When: all seasons except rainy (day or night)
    const shouldPlay = season !== 'rainy';

    if (shouldPlay) {
      this.playContinuousSoundWithDistance(
        'fireBurningSound',
        this.config.firePosition
      );
    }
  }

  handleLakeWaves(season, timeOfDay) {
    // When: all seasons (day or night)
    const shouldPlay = true;

    if (shouldPlay) {
      this.playContinuousSoundWithDistance(
        'lakeWavesSound',
        this.config.lakePosition
      );
    }
  }

  // Sound playing methods
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

  // Continuous sound management
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

  // Distance-based continuous sound management
  playContinuousSoundWithDistance(soundId, soundPosition) {
    if (!this.activeContinuousSounds.has(soundId)) {
      const volume = this.calculateDistanceBasedVolume(soundPosition);
      this.audioManager.playSound(soundId, volume, true);
      this.activeContinuousSounds.add(soundId);
    } else {
      // Update volume based on current distance
      this.updateSoundVolume(soundId, soundPosition);
    }
  }

  calculateDistanceBasedVolume(soundPosition) {
    const cameraPosition = this.audioManager.listener.parent.position;
    const distance = cameraPosition.distanceTo(soundPosition);

    // Calculate volume based on distance (inverse relationship)
    // At distance 0: full volume, at maxDistance: 0 volume
    const normalizedDistance = Math.min(
      distance / this.config.maxDistance,
      1.0
    );
    const volume = (1.0 - normalizedDistance) * this.config.baseVolume * 0.7;

    return Math.max(volume, 0); // Ensure volume doesn't go negative
  }

  updateSoundVolume(soundId, soundPosition) {
    const sound = this.audioManager.sounds[soundId];
    if (sound && sound.isPlaying) {
      const volume = this.calculateDistanceBasedVolume(soundPosition);
      sound.setVolume(volume);
    }
  }

  // Random sound scheduling
  scheduleRandomSound(soundKey, playFunction, gapType) {
    // Clear any existing timer for this sound
    this.clearTimer(soundKey);

    // Schedule the first play
    const delay = this.getRandomDelay(gapType);
    const timerId = setTimeout(() => {
      playFunction();
      // Schedule the next play
      this.rescheduleRandomSound(soundKey, playFunction, gapType);
    }, delay);

    this.scheduledTimers.set(soundKey, timerId);
  }

  rescheduleRandomSound(soundKey, playFunction, gapType) {
    // Only reschedule if the sound should still be playing
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

  // Cleanup methods
  clearTimer(soundKey) {
    if (this.scheduledTimers.has(soundKey)) {
      clearTimeout(this.scheduledTimers.get(soundKey));
      this.scheduledTimers.delete(soundKey);
    }
  }

  stopAllAmbientSounds() {
    // Clear all timers
    this.scheduledTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });
    this.scheduledTimers.clear();

    // Stop all continuous sounds
    this.activeContinuousSounds.forEach((soundId) => {
      this.stopContinuousSound(soundId);
    });
    this.activeContinuousSounds.clear();
  }

  // Volume controls
  setMasterVolume(volume) {
    this.config.baseVolume = Math.max(0, Math.min(1, volume));
    // Note: Individual sound volumes are managed by AudioManager
  }

  // Tab visibility methods
  hasActiveAmbientSounds() {
    return (
      this.activeContinuousSounds.size > 0 || this.scheduledTimers.size > 0
    );
  }

  pauseAmbientSounds() {
    this.isAmbientSoundsPaused = true;
    // Stop all ambient sounds using AudioManager's method
    this.audioManager.stopAllAmbientSounds();
    // Also clear our timers
    this.scheduledTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });
    this.scheduledTimers.clear();
    // Clear our tracking
    this.activeContinuousSounds.clear();
  }

  resumeAmbientSounds() {
    this.isAmbientSoundsPaused = false;
    // Resume ambient sounds based on current conditions
    this.updateAmbientSounds();
  }

  // Update method for distance-based volume adjustment
  update() {
    // Update volume for distance-based sounds
    if (this.activeContinuousSounds.has('fireBurningSound')) {
      this.updateSoundVolume('fireBurningSound', this.config.firePosition);
    }
    if (this.activeContinuousSounds.has('lakeWavesSound')) {
      this.updateSoundVolume('lakeWavesSound', this.config.lakePosition);
    }
  }

  // Cleanup
  dispose() {
    this.stopAllAmbientSounds();

    // Remove ambient sound visibility event listeners
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
