import * as THREE from 'three';
import Sizes from './Utils/Sizes.class';
import Time from './Utils/Time.class';
import Camera from './Core/Camera.class';
import Renderer from './Core/Renderer.class';
import World from './World/World.class';
import DebugGUI from './Utils/DebugGUI.class';
import EnvironmentTimeManager from './World/Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from './World/Managers/SeasonManager/SeasonManager.class';

export default class Game {
  constructor(canvas, resources, isDebugMode) {
    // Singleton
    if (Game.instance) {
      return Game.instance;
    }
    Game.instance = this;

    this.isDebugMode = isDebugMode;
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
    this.world = new World();

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
  }

  destroy() {
    this.sizes.off('resize');
    this.time.off('animate');

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
    this.debug.gui.destroy();

    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.debug = null;
  }
}
