import * as THREE from 'three';
import Game from '../../../Game.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class Lighting {
  constructor({ helperEnabled = false } = {}) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.helperEnabled = helperEnabled;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;
    this.currentSeason = this.seasonManager.currentSeason;
    this.debugGUI = this.game.debug;

    this.lights = {
      key: null,
      fill: null,
      ambient: null,
      rim: null,
      lamp: null,
    };

    this.presets = this.seasonManager.getColorConfig('lighting');

    this.initialize();

    this.isDebugMode = this.game.isDebugMode;

    if (this.isDebugMode) {
      this.initGUI();
    }

    this.environmentTimeManager.onChange((newValue, oldValue) => {
      this.onEnvTimeChanged(newValue, oldValue);
    });

    this.seasonManager.onChange((newSeason, oldSeason) => {
      this.onSeasonChanged(newSeason, oldSeason);
    });
  }

  createLightingPresets() {
    return {
      day: {
        key: {
          color: 0xfff4e6,
          intensity: 2.0,
          position: [-15, 12, 8],
          castShadow: true,
        },
        fill: {
          color: 0x87ceeb,
          intensity: 0.6,
          position: [10, 5, -6],
          castShadow: false,
        },
        ambient: {
          color: 0xfff8f0,
          intensity: 0.4,
        },
        rim: {
          color: 0xffd7a3,
          intensity: 0.3,
          position: [5, 10, -12],
          castShadow: false,
        },
        environment: {
          intensity: 0.3,
          backgroundIntensity: 1.0,
          rotationY: 6.64,
          rotationX: 3.95,
          rotationZ: 6.27,
        },
        lamp: {
          color: 0xffe286,
          intensity: 0,
          distance: 20,
          decay: 1.5,
          position: [2.9, 4.6, -5.5],
          castShadow: false,
        },
      },
      night: {
        key: {
          color: 0x3d5a7a,
          intensity: 1.25,
          position: [-10, 15, 5],
          castShadow: true,
        },
        fill: {
          color: 0x3d5a7a,
          intensity: 0.15,
          position: [10, 5, -6],
          castShadow: false,
        },
        ambient: {
          color: 0x4a5568,
          intensity: 0.08,
        },
        rim: {
          color: 0x7a8faa,
          intensity: 0.1,
          position: [5, 10, -12],
          castShadow: false,
        },
        environment: {
          intensity: 0.12,
          backgroundIntensity: 1.0,
          rotationY: 3.25,
          rotationX: 4.65,
          rotationZ: 4.67,
        },
        lamp: {
          color: 0xffe286,
          intensity: 5,
          distance: 20,
          decay: 1.5,
          position: [2.9, 4.6, -5.5],
          castShadow: false,
        },
      },
    };
  }

  initialize() {
    this.createLights();
    this.configureShadows();
    this.setupEnvironment();
    this.applyPreset(this.envTime);

    if (this.helperEnabled) {
      this.addHelpers();
    }
  }

  createLights() {
    this.lights.lamp = new THREE.PointLight();
    this.scene.add(this.lights.lamp);

    this.lights.key = new THREE.DirectionalLight();
    this.lights.key.name = 'keyLight';
    this.scene.add(this.lights.key);

    this.lights.fill = new THREE.DirectionalLight();
    this.lights.fill.name = 'fillLight';
    this.scene.add(this.lights.fill);

    this.lights.ambient = new THREE.AmbientLight();
    this.lights.ambient.name = 'ambientLight';
    this.scene.add(this.lights.ambient);

    this.lights.rim = new THREE.DirectionalLight();
    this.lights.rim.name = 'rimLight';
    this.scene.add(this.lights.rim);
  }

  configureShadows() {
    const shadowSize = 2048;
    const frustumSize = 12;

    this.lights.key.castShadow = true;
    this.lights.key.shadow.mapSize.set(shadowSize, shadowSize);
    this.lights.key.shadow.camera.left = -frustumSize;
    this.lights.key.shadow.camera.right = frustumSize;
    this.lights.key.shadow.camera.top = frustumSize;
    this.lights.key.shadow.camera.bottom = -frustumSize;
    this.lights.key.shadow.camera.near = 0.1;
    this.lights.key.shadow.camera.far = 60;
    this.lights.key.shadow.bias = -0.0001;
    this.lights.key.shadow.normalBias = 0.02;
    this.lights.key.shadow.radius = 2;
  }

  setupEnvironment() {
    this.environmentMap = {
      day: this.resources.items.environmentMapDayTexture,
      night: this.resources.items.environmentMapNightTexture,
      current: null,
      intensity: 0.3,
    };

    this.environmentMap.day.colorSpace = THREE.SRGBColorSpace;
    this.environmentMap.night.colorSpace = THREE.SRGBColorSpace;
  }

  onEnvTimeChanged(newValue, oldValue) {
    this.applyPreset(newValue);
  }

  onSeasonChanged(newSeason, oldSeason) {
    this.currentSeason = newSeason;
    this.presets = this.seasonManager.getColorConfig('lighting');
    this.applyPreset(this.envTime);
  }

  applyPreset(timeOfDay) {
    const preset = this.presets[timeOfDay];
    if (!preset) {
      console.warn(`Lighting preset '${timeOfDay}' not found`);
      return;
    }

    this.envTime = timeOfDay;

    this.lights.lamp.color.setHex(preset.lamp.color);
    this.lights.lamp.intensity = preset.lamp.intensity;
    this.lights.lamp.position.set(...preset.lamp.position);
    this.lights.lamp.castShadow = preset.lamp.castShadow;
    this.lights.lamp.distance = preset.lamp.distance;
    this.lights.lamp.decay = preset.lamp.decay;

    this.lights.key.color.setHex(preset.key.color);
    this.lights.key.intensity = preset.key.intensity;
    this.lights.key.position.set(...preset.key.position);
    this.lights.key.castShadow = preset.key.castShadow;

    this.lights.fill.color.setHex(preset.fill.color);
    this.lights.fill.intensity = preset.fill.intensity;
    this.lights.fill.position.set(...preset.fill.position);

    this.lights.ambient.color.setHex(preset.ambient.color);
    this.lights.ambient.intensity = preset.ambient.intensity;

    this.lights.rim.color.setHex(preset.rim.color);
    this.lights.rim.intensity = preset.rim.intensity;
    this.lights.rim.position.set(...preset.rim.position);

    this.updateEnvironment(timeOfDay, preset.environment);
  }

  updateEnvironment(timeOfDay, envSettings) {
    this.environmentMap.current = this.environmentMap[timeOfDay];
    this.environmentMap.intensity = envSettings.intensity;

    this.scene.environment = this.environmentMap.current;
    this.scene.background = null;
    this.scene.environmentIntensity = envSettings.intensity;

    this.envMapRotationY = envSettings.rotationY;
    this.envMapRotationX = envSettings.rotationX;
    this.envMapRotationZ = envSettings.rotationZ;

    this.scene.environmentRotation.y = this.envMapRotationY;
    this.scene.environmentRotation.x = this.envMapRotationX;
    this.scene.environmentRotation.z = this.envMapRotationZ;

    this.updateMaterials();
  }

  updateMaterials() {
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material;

        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhysicalMaterial
        ) {
          material.envMap = this.environmentMap.current;
          material.envMapIntensity = this.environmentMap.intensity;

          if (material.roughness > 0.6) {
            material.roughness = 0.75;
          }

          material.needsUpdate = true;
        } else if (
          material instanceof THREE.MeshPhongMaterial ||
          material instanceof THREE.MeshBasicMaterial
        ) {
          material.envMap = this.environmentMap.current;
          material.reflectivity = this.envTime === 'day' ? 0.5 : 0.3;
          material.needsUpdate = true;
        }
      }
    });
  }

  addHelpers() {
    const keyHelper = new THREE.DirectionalLightHelper(this.lights.key, 0.5);
    const fillHelper = new THREE.DirectionalLightHelper(this.lights.fill, 0.5);
    const rimHelper = new THREE.DirectionalLightHelper(this.lights.rim, 0.5);
    const lampHelper = new THREE.PointLightHelper(this.lights.lamp, 0.5);

    this.scene.add(keyHelper, fillHelper, rimHelper, lampHelper);

    this.shadowCameraHelper = new THREE.CameraHelper(
      this.lights.key.shadow.camera
    );
    this.scene.add(this.shadowCameraHelper);
  }

  initGUI() {
    if (!this.debugGUI) return;

    this.debugGUI.add(
      this.lights.key,
      'color',
      { type: 'color', label: 'Key Light Color' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.key,
      'intensity',
      { min: 0, max: 5.0, step: 0.05, label: 'Key Light Intensity' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.key.position,
      'x',
      { min: -30, max: 30, step: 0.5, label: 'Key Light Position X' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.key.position,
      'y',
      { min: 0, max: 30, step: 0.5, label: 'Key Light Position Y' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.key.position,
      'z',
      { min: -30, max: 30, step: 0.5, label: 'Key Light Position Z' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.fill,
      'color',
      { type: 'color', label: 'Fill Light Color' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.fill,
      'intensity',
      { min: 0, max: 2.0, step: 0.05, label: 'Fill Light Intensity' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.fill.position,
      'x',
      { min: -30, max: 30, step: 0.5, label: 'Fill Light Position X' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.fill.position,
      'y',
      { min: 0, max: 30, step: 0.5, label: 'Fill Light Position Y' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.fill.position,
      'z',
      { min: -30, max: 30, step: 0.5, label: 'Fill Light Position Z' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.ambient,
      'color',
      { type: 'color', label: 'Ambient Light Color' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.ambient,
      'intensity',
      { min: 0, max: 2.0, step: 0.05, label: 'Ambient Light Intensity' },
      'Lighting'
    );

    this.debugGUI.add(
      this.lights.rim,
      'color',
      { type: 'color', label: 'Rim Light Color' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.rim,
      'intensity',
      { min: 0, max: 2.0, step: 0.05, label: 'Rim Light Intensity' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.rim.position,
      'x',
      { min: -30, max: 30, step: 0.5, label: 'Rim Light Position X' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.rim.position,
      'y',
      { min: 0, max: 30, step: 0.5, label: 'Rim Light Position Y' },
      'Lighting'
    );
    this.debugGUI.add(
      this.lights.rim.position,
      'z',
      { min: -30, max: 30, step: 0.5, label: 'Rim Light Position Z' },
      'Lighting'
    );
    this.debugGUI.add(
      this.environmentMap,
      'intensity',
      {
        min: 0,
        max: 2.0,
        step: 0.05,
        label: 'Environment Intensity',
        onChange: () => this.updateMaterials(),
      },
      'Lighting'
    );
    this.debugGUI.add(
      this,
      'envMapRotationY',
      {
        min: 0,
        max: 10,
        step: 0.01,
        label: 'Environment Rotation Y',
        onChange: () => {
          this.scene.environmentRotation.y = this.envMapRotationY;
          this.scene.backgroundRotation.y = this.envMapRotationY;
        },
      },
      'Lighting'
    );
    this.debugGUI.add(
      this,
      'envMapRotationX',
      {
        min: 0,
        max: 10,
        step: 0.01,
        label: 'Environment Rotation X',
        onChange: () => {
          this.scene.environmentRotation.x = this.envMapRotationX;
          this.scene.backgroundRotation.x = this.envMapRotationX;
        },
      },
      'Lighting'
    );
    this.debugGUI.add(
      this,
      'envMapRotationZ',
      {
        min: 0,
        max: 10,
        step: 0.01,
        label: 'Environment Rotation Z',
        onChange: () => {
          this.scene.environmentRotation.z = this.envMapRotationZ;
          this.scene.backgroundRotation.z = this.envMapRotationZ;
        },
      },
      'Lighting'
    );
  }

  dispose() {
    this.environmentTimeManager.offChange();
    this.seasonManager.offChange();

    Object.values(this.lights).forEach((light) => {
      if (light) {
        light.dispose();
        this.scene.remove(light);
      }
    });

    if (this.shadowCameraHelper) {
      this.scene.remove(this.shadowCameraHelper);
    }

    // Dispose debug helpers
    ['keyHelper', 'fillHelper', 'rimHelper', 'lampHelper'].forEach((key) => {
      if (this[key]) {
        this[key].dispose?.();
        this.scene.remove(this[key]);
      }
    });

    // Dispose environment map textures
    if (this.scene.environment) {
      this.scene.environment.dispose();
      this.scene.environment = null;
    }
  }
}
