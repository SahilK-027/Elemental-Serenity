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

    this.onGraphicsQualityChanged = this.onGraphicsQualityChanged.bind(this);
    window.addEventListener(
      'graphicsQualityChanged',
      this.onGraphicsQualityChanged
    );
  }

  getInitialGraphicsSettings() {
    const defaults = {
      antialias: false,
      shadowMapType: 'PCFShadowMap',
      pixelRatioCap: 2,
    };

    try {
      const savedSettings = localStorage.getItem('gameSettings');
      if (!savedSettings) return defaults;

      const settings = JSON.parse(savedSettings);
      const quality = settings.graphicsQuality || 'medium';

      if (quality === 'custom') {
        return {
          antialias: settings.customAntialias || false,
          shadowMapType: settings.customShadows || 'PCFShadowMap',
          pixelRatioCap: settings.customPixelRatio || 2,
        };
      }

      const presetSettings = {
        low: {
          antialias: false,
          shadowMapType: 'BasicShadowMap',
          pixelRatioCap: 2,
        },
        medium: {
          antialias: false,
          shadowMapType: 'PCFShadowMap',
          pixelRatioCap: 2,
        },
        high: {
          antialias: true,
          shadowMapType: 'PCFSoftShadowMap',
          pixelRatioCap: 2,
        },
        ultra: {
          antialias: true,
          shadowMapType: 'PCFSoftShadowMap',
          pixelRatioCap: 3,
        },
      };

      return presetSettings[quality] || defaults;
    } catch (error) {
      console.warn(
        'Failed to load graphics settings from localStorage:',
        error
      );
      return defaults;
    }
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

    const graphicsSettings = this.getInitialGraphicsSettings();
    const useAntialias = graphicsSettings.antialias;

    this.rendererInstance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: useAntialias,
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

    const shadowMapTypes = {
      BasicShadowMap: THREE.BasicShadowMap,
      PCFShadowMap: THREE.PCFShadowMap,
      PCFSoftShadowMap: THREE.PCFSoftShadowMap,
    };
    this.rendererInstance.shadowMap.type =
      shadowMapTypes[graphicsSettings.shadowMapType] || THREE.PCFShadowMap;

    this.rendererInstance.setSize(this.sizes.width, this.sizes.height);

    this.rendererInstance.setPixelRatio(
      Math.min(this.sizes.pixelRatio, graphicsSettings.pixelRatioCap)
    );

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

  onGraphicsQualityChanged(event) {
    const { quality, settings } = event.detail;

    const shadowMapTypes = {
      BasicShadowMap: THREE.BasicShadowMap,
      PCFShadowMap: THREE.PCFShadowMap,
      PCFSoftShadowMap: THREE.PCFSoftShadowMap,
    };

    if (shadowMapTypes[settings.shadowMapType]) {
      this.rendererInstance.shadowMap.type =
        shadowMapTypes[settings.shadowMapType];
    }

    if (this.sizes && settings.pixelRatioCap) {
      const newPixelRatio = Math.min(
        this.sizes.pixelRatio,
        settings.pixelRatioCap
      );
      this.rendererInstance.setPixelRatio(newPixelRatio);
    }

    localStorage.setItem('graphicsAntialias', settings.antialias.toString());
    localStorage.setItem('graphicsShadowMapType', settings.shadowMapType);
    localStorage.setItem(
      'graphicsPixelRatioCap',
      settings.pixelRatioCap.toString()
    );
  }

  setUpPerformanceMonitor() {
    this.perf = new PerformanceMonitor(this.rendererInstance);
  }

  resize() {
    this.rendererInstance.setSize(this.sizes.width, this.sizes.height);

    const graphicsSettings = this.getInitialGraphicsSettings();
    this.rendererInstance.setPixelRatio(
      Math.min(this.sizes.pixelRatio, graphicsSettings.pixelRatioCap)
    );
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
    window.removeEventListener(
      'graphicsQualityChanged',
      this.onGraphicsQualityChanged
    );
    this.rendererInstance.dispose();
  }
}
