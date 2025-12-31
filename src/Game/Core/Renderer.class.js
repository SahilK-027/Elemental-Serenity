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

    // Subscribe to graphics quality changes
    this.onGraphicsQualityChanged = this.onGraphicsQualityChanged.bind(this);
    window.addEventListener(
      'graphicsQualityChanged',
      this.onGraphicsQualityChanged
    );
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

    // Get antialiasing setting from localStorage (set by graphics quality)
    const storedAntialias = localStorage.getItem('graphicsAntialias');
    const useAntialias = storedAntialias ? storedAntialias === 'true' : false;

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

    // Get shadow map type from localStorage (set by graphics quality)
    const storedShadowMapType = localStorage.getItem('graphicsShadowMapType');
    const shadowMapTypes = {
      BasicShadowMap: THREE.BasicShadowMap,
      PCFShadowMap: THREE.PCFShadowMap,
      PCFSoftShadowMap: THREE.PCFSoftShadowMap,
    };
    this.rendererInstance.shadowMap.type =
      shadowMapTypes[storedShadowMapType] || THREE.PCFShadowMap;

    this.rendererInstance.setSize(this.sizes.width, this.sizes.height);

    // Get pixel ratio cap from localStorage (set by graphics quality)
    const storedPixelRatioCap = localStorage.getItem('graphicsPixelRatioCap');
    const pixelRatioCap = storedPixelRatioCap
      ? parseInt(storedPixelRatioCap)
      : 2;
    this.rendererInstance.setPixelRatio(
      Math.min(this.sizes.pixelRatio, pixelRatioCap)
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

    // Update shadow map type immediately
    const shadowMapTypes = {
      BasicShadowMap: THREE.BasicShadowMap,
      PCFShadowMap: THREE.PCFShadowMap,
      PCFSoftShadowMap: THREE.PCFSoftShadowMap,
    };

    if (shadowMapTypes[settings.shadowMapType]) {
      this.rendererInstance.shadowMap.type =
        shadowMapTypes[settings.shadowMapType];
    }

    // Update pixel ratio immediately
    if (this.sizes && settings.pixelRatioCap) {
      const newPixelRatio = Math.min(
        this.sizes.pixelRatio,
        settings.pixelRatioCap
      );
      this.rendererInstance.setPixelRatio(newPixelRatio);
    }

    // Store settings for next renderer creation (antialiasing requires restart)
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

    // Respect the pixel ratio cap from graphics settings
    const storedPixelRatioCap = localStorage.getItem('graphicsPixelRatioCap');
    const pixelRatioCap = storedPixelRatioCap
      ? parseInt(storedPixelRatioCap)
      : 2;
    this.rendererInstance.setPixelRatio(
      Math.min(this.sizes.pixelRatio, pixelRatioCap)
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
