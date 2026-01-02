import * as THREE from 'three';
import Game from '../../../Game.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';
import skydomeVertexShader from '../../../../Shaders/Materials/skydome/vertex.glsl';
import skydomeFragmentShader from '../../../../Shaders/Materials/skydome/fragment.glsl';

export default class Skydome {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;
    this.currentSeason = this.seasonManager.currentSeason;
    this.debugGUI = this.game.debug;

    this.skydome = null;
    this.skydomeMaterial = null;

    this.skyColors = this.createSkyColorPresets();

    this.initialize();

    this.environmentTimeManager.onChange((newValue) => {
      this.onEnvTimeChanged(newValue);
    });

    this.seasonManager.onChange((newSeason) => {
      this.onSeasonChanged(newSeason);
    });
  }

  createSkyColorPresets() {
    return {
      spring: {
        day: {
          zenithColor: new THREE.Color(0.0, 0.35, 0.82),
          horizonColor: new THREE.Color(0.46, 0.74, 0.93),
          groundColor: new THREE.Color(0.04, 0.55, 0.65),
          sunColor: new THREE.Color(0.639, 0.494, 0.058),
          sunGlowColor: new THREE.Color(1.0, 0.635, 0),
        },
        night: {
          zenithColor: new THREE.Color(0.02, 0.05, 0.15),
          horizonColor: new THREE.Color(0.05, 0.1, 0.25),
          groundColor: new THREE.Color(0.1, 0.15, 0.3),
          moonColor: new THREE.Color(0.95, 0.95, 1.0),
          moonGlowColor: new THREE.Color(0x738ec4),
          starColor: new THREE.Color(1.0, 1.0, 1.0),
        },
      },
      winter: {
        day: {
          zenithColor: new THREE.Color(0.4, 0.6, 0.9),
          horizonColor: new THREE.Color(0.8, 0.85, 0.95),
          groundColor: new THREE.Color(0.9, 0.92, 0.98),
          sunColor: new THREE.Color(0.95, 0.95, 1.0),
          sunGlowColor: new THREE.Color(0.8, 0.9, 1.0),
        },
        night: {
          zenithColor: new THREE.Color(0.01, 0.03, 0.12),
          horizonColor: new THREE.Color(0.03, 0.08, 0.2),
          groundColor: new THREE.Color(0.08, 0.12, 0.25),
          moonColor: new THREE.Color(1.0, 1.0, 1.0),
          moonGlowColor: new THREE.Color(0.8, 0.9, 1.0),
          starColor: new THREE.Color(0.9, 0.95, 1.0),
        },
      },
      autumn: {
        day: {
          zenithColor: new THREE.Color(0.6, 0.4, 0.2),
          horizonColor: new THREE.Color(0.35, 0.66, 0.72),
          groundColor: new THREE.Color(1.0, 0.7, 0.4),
          sunColor: new THREE.Color(0.89, 0.75, 0.06),
          sunGlowColor: new THREE.Color(0.94, 0.53, 0),
        },
        night: {
          zenithColor: new THREE.Color(0.08, 0.04, 0.08),
          horizonColor: new THREE.Color(0.15, 0.08, 0.12),
          groundColor: new THREE.Color(0.25, 0.15, 0.2),
          moonColor: new THREE.Color(1, 0.5, 0.21),
          moonGlowColor: new THREE.Color(0xe5a55d),
          starColor: new THREE.Color(1.0, 0.9, 0.8),
        },
      },
      rainy: {
        day: {
          zenithColor: new THREE.Color(0.25, 0.3, 0.4),
          horizonColor: new THREE.Color(0.4, 0.5, 0.6),
          groundColor: new THREE.Color(0.5, 0.6, 0.7),
          sunColor: new THREE.Color(0.7, 0.7, 0.8),
          sunGlowColor: new THREE.Color(0.6, 0.6, 0.7),
        },
        night: {
          zenithColor: new THREE.Color(0.03, 0.05, 0.08),
          horizonColor: new THREE.Color(0.06, 0.1, 0.15),
          groundColor: new THREE.Color(0.1, 0.15, 0.2),
          moonColor: new THREE.Color(0.6, 0.7, 0.8),
          moonGlowColor: new THREE.Color(0.5, 0.6, 0.8),
          starColor: new THREE.Color(0.7, 0.8, 0.9),
        },
      },
    };
  }

  initialize() {
    this.createSkydome();

    setTimeout(() => {
      this.updateSkyColors();
    }, 0);
  }

  createSkydome() {
    const geometry = new THREE.SphereGeometry(150, 32, 16);

    this.skydomeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uZenithColor: { value: new THREE.Color(0.2, 0.5, 0.9) },
        uHorizonColor: { value: new THREE.Color(0.7, 0.85, 0.95) },
        uGroundColor: { value: new THREE.Color(0.95, 0.9, 0.85) },

        uSunPosition: { value: new THREE.Vector3(-0.846, -0.085, -1.0) },
        uSunColor: { value: new THREE.Color(1.0, 0.95, 0.8) },
        uSunGlowColor: { value: new THREE.Color(1.0, 0.7, 0.3) },
        uSunSize: { value: 0.005 },
        uSunGlowSize: { value: 0.03386 },
        uSunRayCount: { value: 12.0 },
        uSunRayLength: { value: 0.0352 },
        uSunRaySharpness: { value: 8.0 },

        uMoonPosition: { value: new THREE.Vector3(-0.5, -0.085, -1.0) },
        uMoonColor: { value: new THREE.Color(0.95, 0.95, 1.0) },
        uMoonGlowColor: { value: new THREE.Color(0.7, 0.8, 1.0) },
        uMoonSize: { value: 0.0268665 },
        uMoonGlowSize: { value: 0.0266345 },

        uStarColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
        uStarDensity: { value: 10.0 },
        uStarBrightness: { value: 2.5 },

        uTime: { value: 0 },
        uIsNight: { value: 0.0 },
        uSeason: { value: 0.0 },
        uAtmosphereIntensity: { value: 0.0 },
      },
      vertexShader: skydomeVertexShader,
      fragmentShader: skydomeFragmentShader,
      side: THREE.BackSide,
    });

    this.skydome = new THREE.Mesh(geometry, this.skydomeMaterial);
    this.scene.add(this.skydome);

    if (this.game.isDebugMode) {
      this.initGUI();
    }
  }

  onEnvTimeChanged(newValue) {
    this.envTime = newValue;
    this.updateSkyColors();
  }

  onSeasonChanged(newSeason) {
    this.currentSeason = newSeason;
    this.updateSkyColors();
  }

  updateSkyColors() {
    const colors = this.skyColors[this.currentSeason][this.envTime];

    if (this.skydomeMaterial && this.skydomeMaterial.uniforms) {
      this.skydomeMaterial.uniforms.uZenithColor.value.copy(colors.zenithColor);
      this.skydomeMaterial.uniforms.uHorizonColor.value.copy(
        colors.horizonColor
      );
      this.skydomeMaterial.uniforms.uGroundColor.value.copy(colors.groundColor);

      this.skydomeMaterial.uniforms.uIsNight.value =
        this.envTime === 'night' ? 1.0 : 0.0;

      const seasonMap = { spring: 0, winter: 1, autumn: 2, rainy: 3 };
      this.skydomeMaterial.uniforms.uSeason.value =
        seasonMap[this.currentSeason] || 0;

      if (this.envTime === 'day') {
        this.skydomeMaterial.uniforms.uSunColor.value.copy(colors.sunColor);
        this.skydomeMaterial.uniforms.uSunGlowColor.value.copy(
          colors.sunGlowColor
        );
      } else {
        this.skydomeMaterial.uniforms.uMoonColor.value.copy(colors.moonColor);
        this.skydomeMaterial.uniforms.uMoonGlowColor.value.copy(
          colors.moonGlowColor
        );
        this.skydomeMaterial.uniforms.uStarColor.value.copy(colors.starColor);
      }
    }
  }

  update(elapsedTime) {
    if (this.skydomeMaterial && this.skydomeMaterial.uniforms) {
      this.skydomeMaterial.uniforms.uTime.value = elapsedTime;
    }
  }

  initGUI() {
    if (
      !this.debugGUI ||
      !this.skydomeMaterial ||
      !this.skydomeMaterial.uniforms
    )
      return;

    const skyFolder = this.debugGUI.addFolder('Skydome');

    skyFolder
      .addColor(this.skydomeMaterial.uniforms.uZenithColor, 'value')
      .name('Zenith Color');
    skyFolder
      .addColor(this.skydomeMaterial.uniforms.uHorizonColor, 'value')
      .name('Horizon Color');
    skyFolder
      .addColor(this.skydomeMaterial.uniforms.uGroundColor, 'value')
      .name('Ground Color');

    skyFolder
      .add(this.skydomeMaterial.uniforms.uIsNight, 'value', 0, 1)
      .name('Night Mode');
    skyFolder
      .add(this.skydomeMaterial.uniforms.uSeason, 'value', 0, 3)
      .name('Season (0=Spring, 1=Winter, 2=Autumn, 3=Rainy)');
    skyFolder
      .add(this.skydomeMaterial.uniforms.uAtmosphereIntensity, 'value', 0, 3.0)
      .name('Atmosphere');

    const sunFolder = skyFolder.addFolder('Sun');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunPosition.value, 'x', -1, 1)
      .name('Sun X');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunPosition.value, 'y', -1, 1)
      .name('Sun Y');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunPosition.value, 'z', -1, 1)
      .name('Sun Z');
    sunFolder
      .addColor(this.skydomeMaterial.uniforms.uSunColor, 'value')
      .name('Sun Color');
    sunFolder
      .addColor(this.skydomeMaterial.uniforms.uSunGlowColor, 'value')
      .name('Sun Glow');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunSize, 'value', 0.005, 0.05)
      .name('Sun Size');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunGlowSize, 'value', 0.02, 0.2)
      .name('Sun Glow Size');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunRayCount, 'value', 4, 24)
      .step(1)
      .name('Ray Count');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunRayLength, 'value', 0.01, 0.1)
      .name('Ray Length');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunRaySharpness, 'value', 1, 8)
      .name('Ray Sharpness');

    const moonFolder = skyFolder.addFolder('Moon');
    moonFolder
      .add(this.skydomeMaterial.uniforms.uMoonPosition.value, 'x', -1, 1)
      .name('Moon X');
    moonFolder
      .add(this.skydomeMaterial.uniforms.uMoonPosition.value, 'y', -1, 1)
      .name('Moon Y');
    moonFolder
      .add(this.skydomeMaterial.uniforms.uMoonPosition.value, 'z', -1, 1)
      .name('Moon Z');
    moonFolder
      .addColor(this.skydomeMaterial.uniforms.uMoonColor, 'value')
      .name('Moon Color');
    moonFolder
      .addColor(this.skydomeMaterial.uniforms.uMoonGlowColor, 'value')
      .name('Moon Glow');
    moonFolder
      .add(this.skydomeMaterial.uniforms.uMoonSize, 'value', 0.0001, 0.08)
      .name('Moon Size');
    moonFolder
      .add(this.skydomeMaterial.uniforms.uMoonGlowSize, 'value', 0.0005, 0.2)
      .name('Moon Glow Size');

    const starsFolder = skyFolder.addFolder('Stars');
    starsFolder
      .addColor(this.skydomeMaterial.uniforms.uStarColor, 'value')
      .name('Star Color');
    starsFolder
      .add(this.skydomeMaterial.uniforms.uStarDensity, 'value', 0.01, 10.0)
      .name('Star Density');
    starsFolder
      .add(this.skydomeMaterial.uniforms.uStarBrightness, 'value', 0.1, 10.0)
      .name('Star Brightness');
  }

  dispose() {
    this.environmentTimeManager.offChange();
    this.seasonManager.offChange();

    if (this.skydome) {
      this.scene.remove(this.skydome);
      this.skydome.geometry.dispose();
      this.skydomeMaterial.dispose();
    }
  }
}
