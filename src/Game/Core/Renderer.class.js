import * as THREE from 'three';
import Game from '../Game.class';
import PerformanceMonitor from '../Utils/PerformanceMonitor.class';
import EnvironmentTimeManager from '../World/Managers/EnvironmentManager/EnvironmentManager.class';

export default class Renderer {
  constructor() {
    this.game = Game.getInstance();
    this.canvas = this.game.canvas;
    this.sizes = this.game.sizes;
    this.scene = this.game.scene;
    this.camera = this.game.camera;

    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;

    this.renderer = this.game.renderer;
    this.debugGUI = this.game.debug;

    this.isDebugMode = this.game.isDebugMode;

    this.setRendererInstance();
    this.environmentTimeManager.onChange((newValue, oldValue) => {
      this.onEnvTimeChanged(newValue, oldValue);
    });
  }

  setRendererInstance() {
    const toneMappingOptions = {
      NoToneMapping: THREE.NoToneMapping,
      LinearToneMapping: THREE.LinearToneMapping,
      ReinhardToneMapping: THREE.ReinhardToneMapping,
      CineonToneMapping: THREE.CineonToneMapping,
      ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
      AgXToneMapping: THREE.AgXToneMapping,
      NeutralToneMapping: THREE.NeutralToneMapping,
    };

    this.rendererInstance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });

    this.updateToneMapping();

    if (this.isDebugMode) {
      this.debugGUI.add(
        this.rendererInstance,
        'toneMapping',
        {
          options: toneMappingOptions,
          label: 'Tone Mapping',
          onChange: (toneMappingType) => {
            this.rendererInstance.toneMapping = toneMappingType;
          },
        },
        'Renderer Settings'
      );
    }

    this.rendererInstance.toneMappingExposure = 1.75;
    this.rendererInstance.shadowMap.enabled = true;
    this.rendererInstance.shadowMap.type = THREE.PCFShadowMap; // Use faster shadow type
    this.rendererInstance.setSize(this.sizes.width, this.sizes.height);
    this.rendererInstance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2)); // Cap pixel ratio

    if (this.isDebugMode) {
      this.setUpPerformanceMonitor();
    }
  }

  updateToneMapping() {
    this.rendererInstance.toneMapping =
      this.envTime === 'day'
        ? THREE.LinearToneMapping
        : THREE.NeutralToneMapping;
  }

  onEnvTimeChanged(newValue, oldValue) {
    this.envTime = newValue;
    this.updateToneMapping();
  }

  setUpPerformanceMonitor() {
    this.perf = new PerformanceMonitor(this.rendererInstance);
  }

  resize() {
    this.rendererInstance.setSize(this.sizes.width, this.sizes.height);
    this.rendererInstance.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    if (this.perf) {
      this.perf.beginFrame();
    }
    this.rendererInstance.render(this.scene, this.camera.cameraInstance);
    if (this.perf) {
      this.perf.endFrame();
    }
  }

  destroy() {
    this.environmentTimeManager.offChange();
    this.rendererInstance.dispose();
  }
}
