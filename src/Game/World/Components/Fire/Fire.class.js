import * as THREE from 'three';
import Game from '../../../Game.class';
import particleVertexShader from '../../../../Shaders/Materials/fire/vertex.glsl';
import particleFragmentShader from '../../../../Shaders/Materials/fire/fragment.glsl';
import * as MATH from '../../../Utils/Math.class';
import * as PARTICLES from '../../Systems/ParticleSystem.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class Fire {
  #particleSystem = null;
  #fireMaterial = null;
  #smokeMaterial = null;
  #amberMaterial = null;

  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.renderer = this.game.renderer;
    this.camera = this.game.camera;
    this.resources = this.game.resources;
    this.debugGUI = this.game.debug;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;
    this.currentSeason = this.seasonManager.currentSeason;

    this.smokeAlphaConfig = this.seasonManager.getColorConfig('fire');

    this.flickerTime = 0;
    this.flickerSpeed = 10.0;
    this.flickerAmount = 0.4;
    this.noiseOffset1 = MATH.random() * 100;
    this.noiseOffset2 = MATH.random() * 100;

    this.fireEmitterParams = null;
    this.smokeEmitterParams = null;
    this.amberEmitterParams = null;

    const particleSettings = this.getInitialParticleSettings();
    this.originalFireEmissionRate = particleSettings.fireEmissionRate;
    this.originalAmberEmissionRate = particleSettings.amberEmissionRate;
    this.originalSmokeEmissionRate = particleSettings.smokeEmissionRate;
    this.originalSmokePosition = { x: -5.4, y: 1.9, z: -6.9 };
    this.rainySmokePosition = { x: -5.4, y: 0.6, z: -6.9 };
    this.rainySmokeEmissionRate = 8;

    this.originalSmokeColorStops = [
      { time: 0.0, value: new THREE.Color(0xfff1cc) },
      { time: 0.3, value: new THREE.Color(0xfffbf0) },
      { time: 1.0, value: new THREE.Color(0xffffff) },
    ];
    this.rainySmokeColorStops = [
      { time: 0.0, value: new THREE.Color(0x666666) },
      { time: 0.3, value: new THREE.Color(0x888888) },
      { time: 1.0, value: new THREE.Color(0xaaaaaa) },
    ];

    this._createDefaultStops();

    this.addFire();

    this.fireLightPresent = false;
    this.addFireLighting();
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

    this.updateFireEffectsForSeason();
  }

  getInitialParticleSettings() {
    const defaults = {
      fireEmissionRate: 500,
      smokeEmissionRate: 50,
      amberEmissionRate: 30,
    };

    try {
      const savedSettings = localStorage.getItem('gameSettings');
      if (!savedSettings) return defaults;

      const settings = JSON.parse(savedSettings);
      const quality = settings.graphicsQuality || 'medium';

      if (quality === 'custom') {
        const customParticles = settings.customParticles || 500;
        return {
          fireEmissionRate: customParticles,
          smokeEmissionRate: Math.round(customParticles * 0.1),
          amberEmissionRate: Math.round(customParticles * 0.06),
        };
      }

      const presetSettings = {
        low: {
          fireEmissionRate: 350,
          smokeEmissionRate: 35,
          amberEmissionRate: 20,
        },
        medium: {
          fireEmissionRate: 500,
          smokeEmissionRate: 50,
          amberEmissionRate: 30,
        },
        high: {
          fireEmissionRate: 650,
          smokeEmissionRate: 65,
          amberEmissionRate: 40,
        },
        ultra: {
          fireEmissionRate: 800,
          smokeEmissionRate: 80,
          amberEmissionRate: 50,
        },
      };

      return presetSettings[quality] || defaults;
    } catch (error) {
      console.warn(
        'Failed to load particle settings from localStorage:',
        error
      );
      return defaults;
    }
  }

  _createDefaultStops() {
    this.fireSizeStops = [
      { time: 0.0, value: 15 },
      { time: 0.5, value: 60 },
      { time: 1.0, value: 5 },
    ];
    this.fireAlphaStops = [
      { time: 0.0, value: 0.0 },
      { time: 0.2, value: 1.0 },
      { time: 0.8, value: 0.8 },
      { time: 1.0, value: 0.0 },
    ];
    this.fireColorStops = [
      { time: 0.0, value: new THREE.Color(0x946110) },
      { time: 0.3, value: new THREE.Color(0x9f710f) },
      { time: 0.7, value: new THREE.Color(0xfd4700) },
      { time: 1.0, value: new THREE.Color(0xfc0000) },
    ];
    this.fireTwinkleStops = [
      { time: 0.0, value: 0.0 },
      { time: 0.3, value: 0.8 },
      { time: 1.0, value: 1.0 },
    ];

    this.smokeSizeStops = [
      { time: 0.0, value: 15 },
      { time: 0.5, value: 60 },
      { time: 1.0, value: 20 },
    ];
    const smokeAlphaValue =
      this.smokeAlphaConfig[this.envTime].smokeAlphaSecondStop;
    this.smokeAlphaStops = [
      { time: 0.0, value: 0.0 },
      { time: 0.1, value: smokeAlphaValue },
      { time: 0.55, value: 0.04 },
      { time: 1.0, value: 0.01 },
    ];
    this.smokeColorStops = [
      { time: 0.0, value: new THREE.Color(0xfff1cc) },
      { time: 0.3, value: new THREE.Color(0xfffbf0) },
      { time: 1.0, value: new THREE.Color(0xffffff) },
    ];
    this.smokeTwinkleStops = [
      { time: 0.0, value: 0.0 },
      { time: 1.0, value: 0.0 },
    ];

    this.amberSizeStops = [
      { time: 0.0, value: 0 },
      { time: 0.5, value: 0.75 },
      { time: 1.0, value: 0 },
    ];
    this.amberAlphaStops = [
      { time: 0.0, value: 0.0 },
      { time: 0.1, value: 0.9 },
      { time: 0.7, value: 0.4 },
      { time: 1.0, value: 0.0 },
    ];
    this.amberColorStops = [
      { time: 0.0, value: new THREE.Color(0xff0000) },
      { time: 0.4, value: new THREE.Color(0xff2424) },
      { time: 0.8, value: new THREE.Color(0xffd438) },
      { time: 1.0, value: new THREE.Color(0xff961f) },
    ];
    this.amberTwinkleStops = [
      { time: 0.0, value: 0.0 },
      { time: 0.5, value: 0.5 },
      { time: 1.0, value: 0.3 },
    ];
  }

  addFire() {
    this.createParticleMaterials();
    this.createParticleSystem();
  }

  createParticleMaterials() {
    this.createFireMaterial();
    this.createSmokeMaterial();
    this.createAmberMaterial();
  }

  _buildFireInterpolantsAndTextures() {
    this.fireSizeOverLife = new MATH.FloatInterpolat(
      this.fireSizeStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.fireAlphaOverLife = new MATH.FloatInterpolat(
      this.fireAlphaStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.fireColorOverLife = new MATH.ColorInterpolat(
      this.fireColorStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.fireTwinkleOverLife = new MATH.FloatInterpolat(
      this.fireTwinkleStops.map((s) => ({ time: s.time, value: s.value }))
    );

    const sizeTex = this.fireSizeOverLife.toTexture();
    const colorTex = this.fireColorOverLife.toTexture(this.fireAlphaOverLife);
    const twinkleTex = this.fireTwinkleOverLife.toTexture();

    if (this.#fireMaterial) {
      this.#fireMaterial.uniforms.uSizeOverLife.value = sizeTex;
      this.#fireMaterial.uniforms.uColorOverLife.value = colorTex;
      this.#fireMaterial.uniforms.uTwinkleOverLife.value = twinkleTex;

      sizeTex.needsUpdate = true;
      colorTex.needsUpdate = true;
      twinkleTex.needsUpdate = true;
    }
  }

  _buildSmokeInterpolantsAndTextures() {
    this.smokeSizeOverLife = new MATH.FloatInterpolat(
      this.smokeSizeStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.smokeAlphaOverLife = new MATH.FloatInterpolat(
      this.smokeAlphaStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.smokeColorOverLife = new MATH.ColorInterpolat(
      this.smokeColorStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.smokeTwinkleOverLife = new MATH.FloatInterpolat(
      this.smokeTwinkleStops.map((s) => ({ time: s.time, value: s.value }))
    );

    const sizeTex = this.smokeSizeOverLife.toTexture();
    const colorTex = this.smokeColorOverLife.toTexture(this.smokeAlphaOverLife);
    const twinkleTex = this.smokeTwinkleOverLife.toTexture();

    if (this.#smokeMaterial) {
      this.#smokeMaterial.uniforms.uSizeOverLife.value = sizeTex;
      this.#smokeMaterial.uniforms.uColorOverLife.value = colorTex;
      this.#smokeMaterial.uniforms.uTwinkleOverLife.value = twinkleTex;
      sizeTex.needsUpdate = true;
      colorTex.needsUpdate = true;
      twinkleTex.needsUpdate = true;
    }
  }

  _buildAmberInterpolantsAndTextures() {
    this.amberSizeOverLife = new MATH.FloatInterpolat(
      this.amberSizeStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.amberAlphaOverLife = new MATH.FloatInterpolat(
      this.amberAlphaStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.amberColorOverLife = new MATH.ColorInterpolat(
      this.amberColorStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.amberTwinkleOverLife = new MATH.FloatInterpolat(
      this.amberTwinkleStops.map((s) => ({ time: s.time, value: s.value }))
    );

    const sizeTex = this.amberSizeOverLife.toTexture();
    const colorTex = this.amberColorOverLife.toTexture(this.amberAlphaOverLife);
    const twinkleTex = this.amberTwinkleOverLife.toTexture();

    if (this.#amberMaterial) {
      this.#amberMaterial.uniforms.uSizeOverLife.value = sizeTex;
      this.#amberMaterial.uniforms.uColorOverLife.value = colorTex;
      this.#amberMaterial.uniforms.uTwinkleOverLife.value = twinkleTex;
      sizeTex.needsUpdate = true;
      colorTex.needsUpdate = true;
      twinkleTex.needsUpdate = true;
    }
  }

  createFireMaterial() {
    const fireTexture = this.game.resources.items.fireTexture;
    if (fireTexture) {
      fireTexture.flipY = false;
      fireTexture.needsUpdate = true;
    }

    this._buildFireInterpolantsAndTextures();

    this.#fireMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uParticleTexture: { value: fireTexture },
        uSizeOverLife: { value: this.fireSizeOverLife.toTexture() },
        uColorOverLife: {
          value: this.fireColorOverLife.toTexture(this.fireAlphaOverLife),
        },
        uTwinkleOverLife: { value: this.fireTwinkleOverLife.toTexture() },
        uSizeMultiplier: { value: 1.0 },
        uColorTint: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
      },
      depthWrite: false,
      depthTest: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    this.#fireMaterial.uniforms.uSizeOverLife.value.needsUpdate = true;
    this.#fireMaterial.uniforms.uColorOverLife.value.needsUpdate = true;
    this.#fireMaterial.uniforms.uTwinkleOverLife.value.needsUpdate = true;
  }

  createSmokeMaterial() {
    const smokeTexture = this.game.resources.items.smokeTexture;
    if (smokeTexture) {
      smokeTexture.flipY = false;
      smokeTexture.needsUpdate = true;
    }

    this._buildSmokeInterpolantsAndTextures();

    this.#smokeMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uParticleTexture: { value: smokeTexture },
        uSizeOverLife: { value: this.smokeSizeOverLife.toTexture() },
        uColorOverLife: {
          value: this.smokeColorOverLife.toTexture(this.smokeAlphaOverLife),
        },
        uTwinkleOverLife: { value: this.smokeTwinkleOverLife.toTexture() },
        uSizeMultiplier: { value: 1.0 },
        uColorTint: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
      },
      depthWrite: false,
      depthTest: true,
      transparent: true,
      blending: THREE.NormalBlending,
    });

    this.#smokeMaterial.uniforms.uSizeOverLife.value.needsUpdate = true;
    this.#smokeMaterial.uniforms.uColorOverLife.value.needsUpdate = true;
    this.#smokeMaterial.uniforms.uTwinkleOverLife.value.needsUpdate = true;
  }

  createAmberMaterial() {
    const amberTexture = this.game.resources.items.particleTexture;
    if (amberTexture) {
      amberTexture.flipY = false;
      amberTexture.needsUpdate = true;
    }

    this._buildAmberInterpolantsAndTextures();

    this.#amberMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uParticleTexture: { value: amberTexture },
        uSizeOverLife: { value: this.amberSizeOverLife.toTexture() },
        uColorOverLife: {
          value: this.amberColorOverLife.toTexture(this.amberAlphaOverLife),
        },
        uTwinkleOverLife: { value: this.amberTwinkleOverLife.toTexture() },
        uSizeMultiplier: { value: 1.0 },
        uColorTint: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
      },
      depthWrite: false,
      depthTest: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    this.#amberMaterial.uniforms.uSizeOverLife.value.needsUpdate = true;
    this.#amberMaterial.uniforms.uColorOverLife.value.needsUpdate = true;
    this.#amberMaterial.uniforms.uTwinkleOverLife.value.needsUpdate = true;
  }

  createParticleSystem() {
    this.#particleSystem = new PARTICLES.ParticleSystem();

    this.createFireEmitter();
    this.createSmokeEmitter();
    this.createAmberEmitter();
  }

  createFireEmitter() {
    const fireEmitterParams = new PARTICLES.EmitterParams();
    fireEmitterParams.shape = new PARTICLES.PointShape();
    fireEmitterParams.shape.position.set(-5.4, 1.0, -6.9);
    fireEmitterParams.shape.positionRadiusVariance = 0.3;
    fireEmitterParams.emissionRate = this.originalFireEmissionRate;
    fireEmitterParams.maxParticles = 500;
    fireEmitterParams.maxEmission = Infinity;
    fireEmitterParams.maxLife = 1;
    fireEmitterParams.gravity = false;
    fireEmitterParams.dragCoefficient = 0.5;
    fireEmitterParams.velocityMagnitude = 0.5;
    fireEmitterParams.velocityMagnitudeVariance = 0;
    fireEmitterParams.rotation = new THREE.Quaternion();
    fireEmitterParams.rotation.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 32
    );
    fireEmitterParams.rotationAngularVariance = Math.PI / 16;

    const fireRendererParams = new PARTICLES.ParticleRendererParams();
    fireRendererParams.maxParticles = fireEmitterParams.maxParticles;
    fireRendererParams.group = new THREE.Group();

    fireEmitterParams.renderer = new PARTICLES.ParticleRenderer();
    fireEmitterParams.renderer.initialize(
      this.#fireMaterial,
      fireRendererParams
    );

    const fireEmitter = new PARTICLES.Emitter(fireEmitterParams);

    this.fireEmitterParams = fireEmitterParams;
    this.fireEmitter = fireEmitter;
    this.fireRendererGroup = fireRendererParams.group;

    this.#particleSystem.addEmitter(fireEmitter);
    this.scene.add(fireRendererParams.group);
  }

  createSmokeEmitter() {
    const smokeEmitterParams = new PARTICLES.EmitterParams();
    smokeEmitterParams.shape = new PARTICLES.PointShape();
    smokeEmitterParams.shape.position.set(
      this.originalSmokePosition.x,
      this.originalSmokePosition.y,
      this.originalSmokePosition.z
    );
    smokeEmitterParams.shape.positionRadiusVariance = 0.4;
    smokeEmitterParams.emissionRate = this.originalSmokeEmissionRate;
    smokeEmitterParams.maxParticles = 150;
    smokeEmitterParams.maxEmission = Infinity;
    smokeEmitterParams.maxLife = 3;
    smokeEmitterParams.gravity = false;
    smokeEmitterParams.gravityStrength = -0.3;
    smokeEmitterParams.dragCoefficient = 0.0;
    smokeEmitterParams.velocityMagnitude = 0.8;
    smokeEmitterParams.velocityMagnitudeVariance = 1.0;
    smokeEmitterParams.rotation = new THREE.Quaternion();
    smokeEmitterParams.rotation.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 8
    );
    smokeEmitterParams.rotationAngularVariance = Math.PI / 8;
    smokeEmitterParams.swirlX = 0.02;
    smokeEmitterParams.swirlZ = 0.01;

    smokeEmitterParams.onUpdate = (particle) => {
      const swirl = Math.sin(particle.life * 2 + particle.id * Math.PI) * 0.5;
      particle.velocity.x += swirl * (smokeEmitterParams.swirlX ?? 0.02);
      particle.velocity.z +=
        Math.cos(particle.life * 2 + particle.id * Math.PI) *
        (smokeEmitterParams.swirlZ ?? 0.01);
    };

    const smokeRendererParams = new PARTICLES.ParticleRendererParams();
    smokeRendererParams.maxParticles = smokeEmitterParams.maxParticles;
    smokeRendererParams.group = new THREE.Group();

    smokeEmitterParams.renderer = new PARTICLES.ParticleRenderer();
    smokeEmitterParams.renderer.initialize(
      this.#smokeMaterial,
      smokeRendererParams
    );

    const smokeEmitter = new PARTICLES.Emitter(smokeEmitterParams);

    this.smokeEmitterParams = smokeEmitterParams;
    this.smokeEmitter = smokeEmitter;
    this.smokeRendererGroup = smokeRendererParams.group;

    this.#particleSystem.addEmitter(smokeEmitter);
    this.scene.add(smokeRendererParams.group);
  }

  createAmberEmitter() {
    const amberEmitterParams = new PARTICLES.EmitterParams();
    amberEmitterParams.shape = new PARTICLES.PointShape();
    amberEmitterParams.shape.position.set(-5.4, 1.0, -6.9);
    amberEmitterParams.shape.positionRadiusVariance = 0.35;
    amberEmitterParams.emissionRate = this.originalAmberEmissionRate;
    amberEmitterParams.maxParticles = 120;
    amberEmitterParams.maxEmission = Infinity;
    amberEmitterParams.maxLife = 3;
    amberEmitterParams.gravity = true;
    amberEmitterParams.gravityStrength = -0.2;
    amberEmitterParams.dragCoefficient = 2.8;
    amberEmitterParams.velocityMagnitude = 0.12;
    amberEmitterParams.velocityMagnitudeVariance = 0.6;
    amberEmitterParams.rotation = new THREE.Quaternion();
    amberEmitterParams.rotation.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 12
    );
    amberEmitterParams.rotationAngularVariance = Math.PI / 6;

    amberEmitterParams.onUpdate = (particle) => {
      const drift = Math.sin(particle.life * 3 + particle.id * 0.5) * 0.3;
      particle.velocity.x += drift * 0.01;
      particle.velocity.z +=
        Math.cos(particle.life * 3 + particle.id * 0.5) * 0.005;
    };

    const amberRendererParams = new PARTICLES.ParticleRendererParams();
    amberRendererParams.maxParticles = amberEmitterParams.maxParticles;
    amberRendererParams.group = new THREE.Group();

    amberEmitterParams.renderer = new PARTICLES.ParticleRenderer();
    amberEmitterParams.renderer.initialize(
      this.#amberMaterial,
      amberRendererParams
    );

    const amberEmitter = new PARTICLES.Emitter(amberEmitterParams);

    this.amberEmitterParams = amberEmitterParams;
    this.amberEmitter = amberEmitter;
    this.amberRendererGroup = amberRendererParams.group;

    this.#particleSystem.addEmitter(amberEmitter);
    this.scene.add(amberRendererParams.group);
  }

  addFireLighting() {
    this.fireLightPresent = true;

    this.firelight1OriginalIntensity = 4;
    this.fireLight = new THREE.PointLight(
      new THREE.Color(0.97, 0.42, 0.106),
      this.firelight1OriginalIntensity,
      4,
      2
    );
    this.fireLight.position.set(-5.5, 1.0, -7.0);
    this.scene.add(this.fireLight);

    this.firelight2OriginalIntensity = 2;
    this.fireLight2 = new THREE.PointLight(
      new THREE.Color(0.97, 0.5, 0.18),
      2.0,
      1.0,
      2.0
    );
    this.fireLight2.position.set(-5.5, 0.5, -7.0);
    this.scene.add(this.fireLight2);
  }

  smoothNoise(x) {
    const primary = Math.sin(x);
    const secondary = Math.sin(x * 2.3) * 0.5;
    const tertiary = Math.sin(x * 4.7) * 0.25;
    return (primary + secondary + tertiary) / 1.5;
  }

  initGUI() {
    if (!this.debugGUI) return;

    this.debugGUI.add(
      this.fireLight,
      'color',
      { type: 'color', label: 'Fire light color 1' },
      'Fire'
    );
    this.debugGUI.add(
      this.fireLight2,
      'color',
      { type: 'color', label: 'Fire light color 2' },
      'Fire'
    );
    this.debugGUI.add(
      this,
      'flickerSpeed',
      { min: 0.5, max: 40.0, step: 0.1, label: 'Flicker Speed' },
      'Fire'
    );
    this.debugGUI.add(
      this,
      'flickerAmount',
      { min: 0.0, max: 2.0, step: 0.01, label: 'Flicker Amount' },
      'Fire'
    );
    this.debugGUI
      .add(
        this,
        'firelight1OriginalIntensity',
        { min: 0, max: 10, step: 0.1, label: 'Light1 Intensity' },
        'Fire'
      )
      .onChange((v) => {
        this.fireLight.intensity = v;
      });
    this.debugGUI
      .add(
        this,
        'firelight2OriginalIntensity',
        { min: 0, max: 10, step: 0.1, label: 'Light2 Intensity' },
        'Fire'
      )
      .onChange((v) => {
        this.fireLight2.intensity = v;
      });
    if (this.fireEmitterParams) {
      const f = 'Emitters/Fire';
      this.debugGUI.add(
        this.fireEmitterParams,
        'emissionRate',
        { min: 0, max: 2000, step: 1, label: 'Emission Rate' },
        f
      );
      this.debugGUI.add(
        this.fireEmitterParams,
        'maxParticles',
        { min: 1, max: 2000, step: 1, label: 'Max Particles' },
        f
      );
      this.debugGUI.add(
        this.fireEmitterParams,
        'maxLife',
        { min: 0.05, max: 5, step: 0.01, label: 'Particle Life' },
        f
      );
    }
    if (this.smokeEmitterParams) {
      const s = 'Emitters/Smoke';
      this.debugGUI.add(
        this.smokeEmitterParams,
        'emissionRate',
        { min: 0, max: 500, step: 1, label: 'Emission Rate' },
        s
      );
      this.debugGUI.add(
        this.smokeEmitterParams,
        'maxLife',
        { min: 0.1, max: 10, step: 0.01, label: 'Particle Life' },
        s
      );
    }
    if (this.amberEmitterParams) {
      const a = 'Emitters/Amber';
      this.debugGUI.add(
        this.amberEmitterParams,
        'emissionRate',
        { min: 0, max: 500, step: 1, label: 'Emission Rate' },
        a
      );
      this.debugGUI.add(
        this.amberEmitterParams,
        'maxParticles',
        { min: 1, max: 500, step: 1, label: 'Max Particles' },
        a
      );
      this.debugGUI.add(
        this.amberEmitterParams,
        'maxLife',
        { min: 0.1, max: 5, step: 0.01, label: 'Particle Life' },
        a
      );
    }

    this._addFireInterpolantGUI();
    this._addSmokeInterpolantGUI();
    this._addAmberInterpolantGUI();
  }

  _addFireInterpolantGUI() {
    const folder = 'Material/Fire';
    this.fireSizeStops.forEach((stop, i) => {
      this.debugGUI
        .add(
          stop,
          'value',
          { min: 0, max: 200, step: 0.1, label: `Size @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildFireInterpolantsAndTextures());
    });
    this.fireAlphaStops.forEach((stop, i) => {
      this.debugGUI
        .add(
          stop,
          'value',
          { min: 0, max: 1, step: 0.01, label: `Alpha @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildFireInterpolantsAndTextures());
    });
    this.fireColorStops.forEach((stop, i) => {
      const colorObj = { color: `#${stop.value.getHexString()}` };
      this.debugGUI
        .add(
          colorObj,
          'color',
          { color: true, label: `Color @ ${stop.time}` },
          folder
        )
        .onChange((hex) => {
          stop.value.set(hex);
          this._buildFireInterpolantsAndTextures();
        });
    });
    this.fireTwinkleStops.forEach((stop, i) => {
      this.debugGUI
        .add(
          stop,
          'value',
          { min: 0, max: 2, step: 0.01, label: `Twinkle @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildFireInterpolantsAndTextures());
    });
    this.debugGUI.add(
      this.#fireMaterial.uniforms.uSizeMultiplier,
      'value',
      { min: 0, max: 3, step: 0.01, label: 'Size Multiplier' },
      folder
    );
    const tintVec = { r: 1.0, g: 1.0, b: 1.0 };
    this.debugGUI
      .add(
        tintVec,
        'r',
        { min: 0, max: 2, step: 0.01, label: 'Tint R' },
        folder
      )
      .onChange((v) => {
        this.#fireMaterial.uniforms.uColorTint.value.x = v;
      });
    this.debugGUI
      .add(
        tintVec,
        'g',
        { min: 0, max: 2, step: 0.01, label: 'Tint G' },
        folder
      )
      .onChange((v) => {
        this.#fireMaterial.uniforms.uColorTint.value.y = v;
      });
    this.debugGUI
      .add(
        tintVec,
        'b',
        { min: 0, max: 2, step: 0.01, label: 'Tint B' },
        folder
      )
      .onChange((v) => {
        this.#fireMaterial.uniforms.uColorTint.value.z = v;
      });
  }

  _addSmokeInterpolantGUI() {
    const folder = 'Material/Smoke';

    this.smokeSizeStops.forEach((stop) => {
      this.debugGUI
        .add(
          stop,
          'value',
          { min: 0, max: 200, step: 0.1, label: `Size @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildSmokeInterpolantsAndTextures());
    });

    this.smokeAlphaStops.forEach((stop) => {
      this.debugGUI
        .add(
          stop,
          'value',
          { min: 0, max: 1, step: 0.01, label: `Alpha @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildSmokeInterpolantsAndTextures());
    });

    this.smokeColorStops.forEach((stop) => {
      const colorObj = { color: `#${stop.value.getHexString()}` };
      this.debugGUI
        .add(
          colorObj,
          'color',
          { color: true, label: `Color @ ${stop.time}` },
          folder
        )
        .onChange((hex) => {
          stop.value.set(hex);
          this._buildSmokeInterpolantsAndTextures();
        });
    });

    this.smokeTwinkleStops.forEach((stop) => {
      this.debugGUI
        .add(
          stop,
          'value',
          { min: 0, max: 2, step: 0.01, label: `Twinkle @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildSmokeInterpolantsAndTextures());
    });

    this.debugGUI.add(
      this.#smokeMaterial.uniforms.uSizeMultiplier,
      'value',
      { min: 0, max: 3, step: 0.01, label: 'Size Multiplier' },
      folder
    );
  }

  _addAmberInterpolantGUI() {
    const folder = 'Material/Amber';

    this.amberSizeStops.forEach((stop) => {
      this.debugGUI
        .add(
          stop,
          'value',
          { min: 0, max: 100, step: 0.1, label: `Size @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildAmberInterpolantsAndTextures());
    });

    this.amberAlphaStops.forEach((stop) => {
      this.debugGUI
        .add(
          stop,
          'value',
          { min: 0, max: 1, step: 0.01, label: `Alpha @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildAmberInterpolantsAndTextures());
    });

    this.amberColorStops.forEach((stop) => {
      const colorObj = { color: `#${stop.value.getHexString()}` };
      this.debugGUI
        .add(
          colorObj,
          'color',
          { color: true, label: `Color @ ${stop.time}` },
          folder
        )
        .onChange((hex) => {
          stop.value.set(hex);
          this._buildAmberInterpolantsAndTextures();
        });
    });

    this.amberTwinkleStops.forEach((stop) => {
      this.debugGUI
        .add(
          stop,
          'value',
          { min: 0, max: 2, step: 0.01, label: `Twinkle @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildAmberInterpolantsAndTextures());
    });

    this.debugGUI.add(
      this.#amberMaterial.uniforms.uSizeMultiplier,
      'value',
      { min: 0, max: 3, step: 0.01, label: 'Size Multiplier' },
      folder
    );

    const tintVec = { r: 1.0, g: 1.0, b: 1.0 };
    this.debugGUI
      .add(
        tintVec,
        'r',
        { min: 0, max: 2, step: 0.01, label: 'Tint R' },
        folder
      )
      .onChange((v) => {
        this.#amberMaterial.uniforms.uColorTint.value.x = v;
      });
    this.debugGUI
      .add(
        tintVec,
        'g',
        { min: 0, max: 2, step: 0.01, label: 'Tint G' },
        folder
      )
      .onChange((v) => {
        this.#amberMaterial.uniforms.uColorTint.value.y = v;
      });
    this.debugGUI
      .add(
        tintVec,
        'b',
        { min: 0, max: 2, step: 0.01, label: 'Tint B' },
        folder
      )
      .onChange((v) => {
        this.#amberMaterial.uniforms.uColorTint.value.z = v;
      });
  }

  onEnvTimeChanged(newValue, oldValue) {
    this.envTime = newValue;
    this.updateSmokeAlpha();
  }

  onSeasonChanged(newSeason, oldSeason) {
    this.currentSeason = newSeason;
    this.smokeAlphaConfig = this.seasonManager.getColorConfig('fire');
    this.updateSmokeAlpha();
    this.updateFireEffectsForSeason();
  }

  updateFireEffectsForSeason() {
    const isRainySeason = this.currentSeason === 'rainy';

    if (this.fireEmitterParams) {
      this.fireEmitterParams.emissionRate = isRainySeason
        ? 0
        : this.originalFireEmissionRate;
    }

    if (this.amberEmitterParams) {
      this.amberEmitterParams.emissionRate = isRainySeason
        ? 0
        : this.originalAmberEmissionRate;
    }

    if (this.smokeEmitterParams) {
      this.smokeEmitterParams.emissionRate = isRainySeason
        ? this.rainySmokeEmissionRate
        : this.originalSmokeEmissionRate;

      const smokePos = isRainySeason
        ? this.rainySmokePosition
        : this.originalSmokePosition;
      this.smokeEmitterParams.shape.position.set(
        smokePos.x,
        smokePos.y,
        smokePos.z
      );
    }

    this.updateSmokeColorForSeason(isRainySeason);

    if (this.fireRendererGroup) {
      this.fireRendererGroup.visible = !isRainySeason;
    }

    if (this.amberRendererGroup) {
      this.amberRendererGroup.visible = !isRainySeason;
    }

    if (this.fireLight) {
      this.fireLight.visible = !isRainySeason;
    }

    if (this.fireLight2) {
      this.fireLight2.visible = !isRainySeason;
    }
  }

  updateSmokeColorForSeason(isRainySeason) {
    const colorStops = isRainySeason
      ? this.rainySmokeColorStops
      : this.originalSmokeColorStops;

    this.smokeColorStops.forEach((stop, index) => {
      if (colorStops[index]) {
        stop.value.copy(colorStops[index].value);
      }
    });

    this._buildSmokeInterpolantsAndTextures();
  }

  updateSmokeAlpha() {
    if (!this.smokeAlphaStops) return;

    const config = this.smokeAlphaConfig[this.envTime];

    this.smokeAlphaStops[1].value = config.smokeAlphaSecondStop;

    this._buildSmokeInterpolantsAndTextures();
  }

  updateParticles(delta, totalTimeElapsed) {
    if (!this.#particleSystem) return;
    this.#particleSystem.update(delta, totalTimeElapsed);
  }

  updateFlickerLight(delta) {
    if (!this.fireLightPresent) return;

    this.flickerTime += delta;
    if (this.flickerTime > 628) {
      this.flickerTime -= 628;
    }
    const flicker1 = this.smoothNoise(
      this.flickerTime * this.flickerSpeed + this.noiseOffset1
    );
    const flicker2 = this.smoothNoise(
      this.flickerTime * this.flickerSpeed * 1.3 + this.noiseOffset2
    );
    const combinedFlicker = (flicker1 + flicker2 * 0.5) / 1.5;
    const intensityVariation =
      this.firelight1OriginalIntensity * this.flickerAmount;
    this.fireLight.intensity =
      this.firelight1OriginalIntensity + combinedFlicker * intensityVariation;
    const positionOffset = Math.sin(this.flickerTime * 2.0) * 0.1;
    this.fireLight.position.y = 1.0 + positionOffset;
    const flicker2Noise = this.smoothNoise(
      this.flickerTime * this.flickerSpeed * 0.8 + this.noiseOffset2 + 50
    );
    this.fireLight2.intensity =
      this.firelight2OriginalIntensity + flicker2Noise * this.flickerAmount * 2;
  }

  update(delta, totalTime) {
    this.updateParticles(delta, totalTime);
    this.updateFlickerLight(delta);
    if (this.#fireMaterial) this.#fireMaterial.uniforms.uTime.value = totalTime;
    if (this.#smokeMaterial)
      this.#smokeMaterial.uniforms.uTime.value = totalTime;
    if (this.#amberMaterial)
      this.#amberMaterial.uniforms.uTime.value = totalTime;
  }

  dispose() {
    this.environmentTimeManager.offChange();
    this.seasonManager.offChange();

    if (this.#particleSystem) {
      this.#particleSystem.dispose();
    }

    [this.#fireMaterial, this.#smokeMaterial, this.#amberMaterial].forEach((mat) => {
      if (mat) mat.dispose();
    });

    [this.fireLight, this.fireLight2].forEach((light) => {
      if (light) {
        light.dispose();
        this.scene.remove(light);
      }
    });
  }
}
