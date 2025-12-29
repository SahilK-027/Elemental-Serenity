import * as THREE from 'three';
import Sizes from './Utils/Sizes.class';
import Time from './Utils/Time.class';
import Camera from './Core/Camera.class';
import Renderer from './Core/Renderer.class';
import World from './World/World.class';
import DebugGUI from './Utils/DebugGUI.class';
import AudioManager from './Utils/AudioManager.class';
import MusicManager from './Utils/MusicManager.class';
import ToastManager from './UI/ToastManager.class';
import MusicControlUI from './UI/MusicControlUI.class';
import EnvironmentTimeManager from './World/Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from './World/Managers/SeasonManager/SeasonManager.class';

export default class Game {
  constructor(canvas, resources, isDebugMode, withMusic = true) {
    // Singleton
    if (Game.instance) {
      return Game.instance;
    }
    Game.instance = this;

    this.isDebugMode = isDebugMode;
    this.withMusic = withMusic;
    
    if (this.isDebugMode) {
      this.debug = new DebugGUI();
    }

    this.canvas = canvas;
    this.resources = resources;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    
    // Initialize audio manager
    this.audioManager = new AudioManager(this.resources);
    this.audioManager.addListenerToCamera(this.camera);
    
    // Initialize music manager and toast manager
    this.toastManager = new ToastManager();
    this.musicManager = new MusicManager(this.audioManager);
    
    // Initialize music control UI
    this.musicControlUI = new MusicControlUI(this.musicManager, this.toastManager);
    this.musicControlUI.setInitialState(this.withMusic);
    
    // Listen for track changes to show toast notifications
    this.musicManager.on('trackChanged', (track) => {
      this.toastManager.showMusicToast(track.name);
    });
    
    this.world = new World();

    // Start background music if enabled
    if (this.withMusic) {
      this.musicManager.startRandomMusic();
    }

    this.time.on('animate', () => {
      this.update();
    });
    this.sizes.on('resize', () => {
      this.resize();
    });
    if (this.isDebugMode) {
      this.initGUI();
    }
  }

  static getInstance() {
    if (!Game.instance) {
      Game.instance = new Game();
    }
    return Game.instance;
  }

  get envTime() {
    return this.environmentTimeManager.envTime;
  }

  set envTime(value) {
    this.environmentTimeManager.envTime = value;
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.world.update(this.time.delta, this.time.elapsedTime);
    this.renderer.update();
  }

  initGUI() {
    const envTimeProxy = {
      get time() {
        return Game.instance.environmentTimeManager.envTime;
      },
      set time(value) {
        Game.instance.environmentTimeManager.envTime = value;
      },
    };

    const seasonProxy = {
      get season() {
        return Game.instance.seasonManager.currentSeason;
      },
      set season(value) {
        Game.instance.seasonManager.setSeason(value);
      },
    };

    this.debug.add(
      envTimeProxy,
      'time',
      {
        options: ['day', 'night'],
        label: 'Time of Day',
        onChange: (value) => {
          this.environmentTimeManager.setTime(value);
        },
      },
      'Environment'
    );

    this.debug.add(
      seasonProxy,
      'season',
      {
        options: ['spring', 'winter', 'autumn', 'rainy'],
        label: 'Season',
        onChange: (value) => {
          this.seasonManager.setSeason(value);
        },
      },
      'Environment'
    );

    // Add season toggle button
    const seasonControls = {
      toggleSeason: () => {
        this.seasonManager.toggle();
      }
    };

    this.debug.add(
      seasonControls,
      'toggleSeason',
      {
        label: 'Toggle Season'
      },
      'Environment'
    );

    // Audio controls
    const audioControls = {
      masterVolume: this.audioManager.masterVolume,
      musicVolume: this.audioManager.musicVolume,
      soundVolume: this.audioManager.soundVolume,
      startRandomMusic: () => this.musicManager.startRandomMusic(),
      stopMusic: () => this.musicManager.stopMusic(),
      playMorningPetals: () => this.audioManager.playMusic('morningPetalsMusic'),
      playWindowLight: () => this.audioManager.playMusic('windowLightMusic'),
      playForestDreams: () => this.audioManager.playMusic('forestDreamsMusic'),
      playRain: () => this.audioManager.playSound('rainSound', null, true),
      playFire: () => this.audioManager.playSound('fireBurningSound', null, true),
      playBirds: () => this.audioManager.playSound(this.audioManager.getRandomBirdSound()),
      stopAllSounds: () => {
        Object.keys(this.audioManager.sounds).forEach(soundId => {
          if (!soundId.includes('Music')) {
            this.audioManager.stopSound(soundId);
          }
        });
      }
    };

    this.debug.add(audioControls, 'masterVolume', {
      min: 0, max: 1, step: 0.1,
      onChange: (value) => this.audioManager.setMasterVolume(value)
    }, 'Audio');

    this.debug.add(audioControls, 'musicVolume', {
      min: 0, max: 1, step: 0.1,
      onChange: (value) => this.audioManager.setMusicVolume(value)
    }, 'Audio');

    this.debug.add(audioControls, 'soundVolume', {
      min: 0, max: 1, step: 0.1,
      onChange: (value) => this.audioManager.setSoundVolume(value)
    }, 'Audio');

    this.debug.add(audioControls, 'startRandomMusic', { label: 'Start Random Music' }, 'Audio');
    this.debug.add(audioControls, 'stopMusic', { label: 'Stop Music' }, 'Audio');
    this.debug.add(audioControls, 'playMorningPetals', { label: 'Play Morning Petals' }, 'Audio');
    this.debug.add(audioControls, 'playWindowLight', { label: 'Play Window Light' }, 'Audio');
    this.debug.add(audioControls, 'playForestDreams', { label: 'Play Forest Dreams' }, 'Audio');
    this.debug.add(audioControls, 'playRain', { label: 'Play Rain (Loop)' }, 'Audio');
    this.debug.add(audioControls, 'playFire', { label: 'Play Fire (Loop)' }, 'Audio');
    this.debug.add(audioControls, 'playBirds', { label: 'Play Random Birds' }, 'Audio');
    this.debug.add(audioControls, 'stopAllSounds', { label: 'Stop All Sounds' }, 'Audio');
  }

  destroy() {
    this.sizes.off('resize');
    this.time.off('animate');

    // Cleanup audio
    if (this.musicManager) {
      this.musicManager.stopMusic();
    }
    if (this.audioManager) {
      this.audioManager.dispose();
    }
    if (this.toastManager) {
      this.toastManager.destroy();
    }
    if (this.musicControlUI) {
      this.musicControlUI.destroy();
    }

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];

          if (typeof value?.dispose === 'function') {
            value.dispose();
          }
        }
      }
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const mats = Array.isArray(child.material)
          ? child.material
          : [child.material];
        mats.forEach((m) => {
          for (const key in m) {
            const prop = m[key];
            if (prop && prop.isTexture) prop.dispose();
          }
          m.dispose();
        });
      }
    });

    this.camera.controls.dispose();
    this.renderer.rendererInstance.dispose();
    if (this.debug) {
      this.debug.gui.destroy();
    }

    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.debug = null;
    this.audioManager = null;
    this.musicManager = null;
    this.toastManager = null;
    this.musicControlUI = null;
  }
}
