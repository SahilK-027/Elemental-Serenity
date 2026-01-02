import * as THREE from 'three';
import Game from '../../Game.class';
import {
  Emitter,
  EmitterParams,
  PointShape,
  ParticleRenderer,
  ParticleRendererParams,
} from './ParticleSystem.class';
import * as MATH from '../../Utils/Math.class';
import particleExplosionVertexShader from '../../../Shaders/Materials/fire/vertex.glsl';
import particleExplosionFragmentShader from '../../../Shaders/Materials/fire/fragment.glsl';
import lightningArcVertexShader from '../../../Shaders/Materials/lightning/vertex.glsl';
import lightningArcFragmentShader from '../../../Shaders/Materials/lightning/fragment.glsl';

export default class Lightning {
  #explosionMaterial = null;
  #activeLightningArcs = [];

  constructor(particleSystem, groundBounds = null) {
    this.game = Game.getInstance();
    this.particleSystem = particleSystem;
    this.scene = this.game.scene;

    this.baseGroundBounds = groundBounds || {
      minX: -5.5,
      maxX: 5.5,
      minZ: -5.5,
      maxZ: 5.5,
    };

    this.groundBounds = { ...this.baseGroundBounds };

    this.updateBoundsForAspectRatio();

    this.handleResize = this.updateBoundsForAspectRatio.bind(this);
    window.addEventListener('resize', this.handleResize);

    this.nextLightningTime = this.getRandomDelay();
    this.elapsedTime = 0;

    this.cameraShakeDuration = 0.65;
    this.cameraShakeIntensity = 0.85;
    this.cameraShakeFrequency = 25;
    this.cameraShakeDecay = 2.5;

    this.colorA = new THREE.Color(0xff8117);
    this.colorB = new THREE.Color(0xffd500);
    this.intensity = 3;

    this.colorLightningA = new THREE.Color(0x0000ff);
    this.colorLightningB = new THREE.Color(0x00ffff);

    this.explosionParticles = {
      count: 100,
      duration: 1,
      maxLife: 1.3,
      velocityMagnitude: 5.6,
      velocityMagnitudeVariance: 0.5,
      rotationAngularVariance: Math.PI * 2,
      gravity: true,
      gravityStrength: -1.5,
      dragCoefficient: -2.5,
      positionRadiusVariance: 0,
    };

    this._createParticleStops();

    this.setupArc();
    this.createExplosionMaterial();

    this.isDebugMode = this.game.isDebugMode;
    if (this.isDebugMode) {
      this.initGUI();
    }
  }

  _createParticleStops() {
    this.sizeStops = [
      { time: 0.0, value: 0.1 },
      { time: 0.1, value: 0.68 },
      { time: 1.0, value: 0.0 },
    ];

    this.alphaStops = [
      { time: 0.0, value: 1.0 },
      { time: 0.5, value: 0.8 },
      { time: 1.0, value: 0.0 },
    ];

    this.colorStops = [
      { time: 0.0, value: this.colorA.clone() },
      {
        time: 0.5,
        value: new THREE.Color().lerpColors(this.colorA, this.colorB, 0.5),
      },
      { time: 1.0, value: this.colorB.clone() },
    ];

    this.twinkleStops = [
      { time: 0.0, value: 0.8 },
      { time: 0.5, value: 0.5 },
      { time: 1.0, value: 0.2 },
    ];
  }

  _buildInterpolantsAndTextures() {
    this.sizeOverLife = new MATH.FloatInterpolat(
      this.sizeStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.alphaOverLife = new MATH.FloatInterpolat(
      this.alphaStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.colorOverLife = new MATH.ColorInterpolat(
      this.colorStops.map((s) => ({ time: s.time, value: s.value }))
    );
    this.twinkleOverLife = new MATH.FloatInterpolat(
      this.twinkleStops.map((s) => ({ time: s.time, value: s.value }))
    );

    const sizeTex = this.sizeOverLife.toTexture();
    const colorTex = this.colorOverLife.toTexture(this.alphaOverLife);
    const twinkleTex = this.twinkleOverLife.toTexture();

    if (this.#explosionMaterial) {
      this.#explosionMaterial.uniforms.uSizeOverLife.value = sizeTex;
      this.#explosionMaterial.uniforms.uColorOverLife.value = colorTex;
      this.#explosionMaterial.uniforms.uTwinkleOverLife.value = twinkleTex;

      sizeTex.needsUpdate = true;
      colorTex.needsUpdate = true;
      twinkleTex.needsUpdate = true;
    }
  }

  createExplosionMaterial() {
    const particleTexture = this.game.resources.items.particleTexture;
    if (particleTexture) {
      particleTexture.flipY = false;
      particleTexture.needsUpdate = true;
    }

    this._buildInterpolantsAndTextures();

    this.#explosionMaterial = new THREE.ShaderMaterial({
      vertexShader: particleExplosionVertexShader,
      fragmentShader: particleExplosionFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uParticleTexture: { value: particleTexture },
        uSizeOverLife: { value: this.sizeOverLife.toTexture() },
        uColorOverLife: {
          value: this.colorOverLife.toTexture(this.alphaOverLife),
        },
        uTwinkleOverLife: { value: this.twinkleOverLife.toTexture() },
        uSizeMultiplier: { value: 1.0 },
        uColorTint: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
      },
      depthWrite: false,
      depthTest: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    this.#explosionMaterial.uniforms.uSizeOverLife.value.needsUpdate = true;
    this.#explosionMaterial.uniforms.uColorOverLife.value.needsUpdate = true;
    this.#explosionMaterial.uniforms.uTwinkleOverLife.value.needsUpdate = true;
  }

  getRandomDelay() {
    return 10 + Math.random() * 10;
  }

  setupArc() {
    this.arc = {
      duration: 3,
      meshes: [],
    };
  }

  createArcMesh(position) {
    const points = [];
    const pointsCount = 15;
    const height = 15;
    const interY = height / (pointsCount - 1);

    for (let i = 0; i < pointsCount; i++) {
      const point = new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        i * interY,
        (Math.random() - 0.5) * 1
      );
      points.push(point);
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 18, 0.07, 8, false);

    const startTime = this.game.time?.elapsedTime ?? performance.now() / 1000;

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: startTime },
        uStartTime: { value: startTime },
        uDuration: { value: this.arc.duration },
        uColorA: { value: this.colorLightningA },
        uColorB: { value: this.colorLightningB },
        uIntensity: { value: this.intensity },
      },
      vertexShader: lightningArcVertexShader,
      fragmentShader: lightningArcFragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.frustumCulled = false;

    this.scene.add(mesh);
    this.#activeLightningArcs.push(mesh);

    return mesh;
  }

  createExplosionParticles(position) {
    const params = new EmitterParams();
    params.maxLife = this.explosionParticles.maxLife;
    params.maxParticles = this.explosionParticles.count;
    params.maxEmission = this.explosionParticles.count;
    params.emissionRate = this.explosionParticles.count;
    params.velocityMagnitude = this.explosionParticles.velocityMagnitude;
    params.velocityMagnitudeVariance =
      this.explosionParticles.velocityMagnitudeVariance;
    params.rotationAngularVariance =
      this.explosionParticles.rotationAngularVariance;
    params.gravity = this.explosionParticles.gravity;
    params.gravityStrength = this.explosionParticles.gravityStrength;
    params.dragCoefficient = this.explosionParticles.dragCoefficient;

    const rendererParams = new ParticleRendererParams();
    rendererParams.maxParticles = this.explosionParticles.count;
    rendererParams.group = new THREE.Group();

    params.renderer = new ParticleRenderer();
    params.renderer.initialize(this.#explosionMaterial, rendererParams);

    const shape = new PointShape();
    shape.position.copy(position);
    shape.positionRadiusVariance =
      this.explosionParticles.positionRadiusVariance;
    params.shape = shape;

    const emitter = new Emitter(params);
    this.particleSystem.addEmitter(emitter);
    this.scene.add(rendererParams.group);

    return emitter;
  }

  triggerCameraShake(strikePosition = null) {
    const camera = this.game.camera.cameraInstance;
    const originalPosition = camera.position.clone();
    const shakeStart = performance.now();

    let shakeDirection = new THREE.Vector3(0, 0, 1);
    if (strikePosition) {
      shakeDirection = new THREE.Vector3()
        .subVectors(strikePosition, camera.position)
        .normalize();
    }

    const shake = () => {
      const elapsed = (performance.now() - shakeStart) / 1000;
      const progress = Math.min(elapsed / this.cameraShakeDuration, 1);

      if (progress < 1) {
        const easeIn = progress < 0.1 ? Math.pow(progress / 0.1, 2) : 1;
        const decayFactor = Math.pow(1 - progress, this.cameraShakeDecay);
        const currentIntensity =
          this.cameraShakeIntensity * decayFactor * easeIn;

        const time = elapsed * this.cameraShakeFrequency;
        const noise1 = Math.sin(time * 1.0) * 0.6;
        const noise2 = Math.sin(time * 2.3) * 0.3;
        const noise3 = Math.sin(time * 4.7) * 0.1;
        const combinedNoise = noise1 + noise2 + noise3;

        const randomX = (Math.random() - 0.5) * 2;
        const randomY = (Math.random() - 0.5) * 2;
        const randomZ = (Math.random() - 0.5) * 2;

        camera.position.x =
          originalPosition.x +
          (randomX + shakeDirection.x * combinedNoise * 0.5) * currentIntensity;
        camera.position.y =
          originalPosition.y +
          (randomY + shakeDirection.y * combinedNoise * 0.5) * currentIntensity;
        camera.position.z =
          originalPosition.z +
          (randomZ + shakeDirection.z * combinedNoise * 0.5) * currentIntensity;

        requestAnimationFrame(shake);
      } else {
        camera.position.copy(originalPosition);
      }
    };

    shake();
  }

  strike(position) {
    const arcMesh = this.createArcMesh(position);
    this.createExplosionParticles(position);
    this.triggerCameraShake(position);

    if (this.game.ambientSoundManager) {
      this.game.ambientSoundManager.playThunderStrike();
    }

    setTimeout(() => {
      this.scene.remove(arcMesh);
      arcMesh.geometry.dispose();
      arcMesh.material.dispose();

      const index = this.#activeLightningArcs.indexOf(arcMesh);
      if (index > -1) {
        this.#activeLightningArcs.splice(index, 1);
      }
    }, this.arc.duration * 1000);
  }

  strikeRandom() {
    const x =
      this.groundBounds.minX +
      Math.random() * (this.groundBounds.maxX - this.groundBounds.minX);
    const z =
      this.groundBounds.minZ +
      Math.random() * (this.groundBounds.maxZ - this.groundBounds.minZ);

    const position = new THREE.Vector3(x, 0, z);
    this.strike(position);
  }

  manualStrike() {
    this.strikeRandom();
  }

  setGroundBounds(bounds) {
    this.baseGroundBounds = { ...bounds };
    this.updateBoundsForAspectRatio();
  }

  updateBoundsForAspectRatio() {
    const sizes = this.game.sizes;
    const aspectRatio = sizes.width / sizes.height;
    const idealRatio = 16 / 9;

    this.groundBounds = { ...this.baseGroundBounds };

    if (aspectRatio < idealRatio) {
      const shrinkFactor = aspectRatio / idealRatio;

      const centerX =
        (this.baseGroundBounds.minX + this.baseGroundBounds.maxX) / 2;
      const halfWidthX =
        (this.baseGroundBounds.maxX - this.baseGroundBounds.minX) / 2;

      this.groundBounds.minX = centerX - halfWidthX * shrinkFactor;
      this.groundBounds.maxX = centerX + halfWidthX * shrinkFactor;

      if (aspectRatio < 1) {
        const centerZ =
          (this.baseGroundBounds.minZ + this.baseGroundBounds.maxZ) / 2;
        const halfWidthZ =
          (this.baseGroundBounds.maxZ - this.baseGroundBounds.minZ) / 2;
        const zShrink = 0.7 + aspectRatio * 0.3;

        this.groundBounds.minZ = centerZ - halfWidthZ * zShrink;
        this.groundBounds.maxZ = centerZ + halfWidthZ * zShrink;
      }
    }
  }

  isRainySeason() {
    return this.game.seasonManager?.currentSeason === 'rainy';
  }

  update(delta) {
    this.elapsedTime += delta;

    const currentTime = this.game.time?.elapsedTime || performance.now() / 1000;

    if (this.#explosionMaterial) {
      this.#explosionMaterial.uniforms.uTime.value = currentTime;
    }

    for (const arc of this.#activeLightningArcs) {
      if (arc.material?.uniforms?.uTime) {
        arc.material.uniforms.uTime.value = currentTime;
      }
    }

    if (this.isRainySeason() && this.elapsedTime >= this.nextLightningTime) {
      this.strikeRandom();
      this.elapsedTime = 0;
      this.nextLightningTime = this.getRandomDelay();
    }
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);

    if (this.#explosionMaterial) {
      this.#explosionMaterial.dispose();
    }

    for (const arc of this.#activeLightningArcs) {
      this.scene.remove(arc);
      arc.geometry.dispose();
      arc.material.dispose();
    }
    this.#activeLightningArcs = [];
  }

  initGUI() {
    if (!this.game.debug) return;

    const folder = 'Lightning/Explosion Particles';

    this.game.debug.add(
      this.explosionParticles,
      'count',
      { min: 1, max: 500, step: 1, label: 'Particle Count' },
      folder
    );

    this.game.debug.add(
      this.explosionParticles,
      'maxLife',
      { min: 0.1, max: 10, step: 0.1, label: 'Max Life' },
      folder
    );

    this.game.debug.add(
      this.explosionParticles,
      'velocityMagnitude',
      { min: 0, max: 50, step: 0.5, label: 'Velocity Magnitude' },
      folder
    );

    this.game.debug.add(
      this.explosionParticles,
      'velocityMagnitudeVariance',
      { min: 0, max: 30, step: 0.5, label: 'Velocity Variance' },
      folder
    );

    this.game.debug.add(
      this.explosionParticles,
      'rotationAngularVariance',
      { min: 0, max: Math.PI * 2, step: 0.1, label: 'Rotation Variance' },
      folder
    );

    this.game.debug.add(
      this.explosionParticles,
      'gravity',
      { label: 'Gravity Enabled' },
      folder
    );

    this.game.debug.add(
      this.explosionParticles,
      'gravityStrength',
      { min: -5, max: 5, step: 0.1, label: 'Gravity Strength' },
      folder
    );

    this.game.debug.add(
      this.explosionParticles,
      'dragCoefficient',
      { min: -5, max: 0, step: 0.1, label: 'Drag Coefficient' },
      folder
    );

    this.game.debug.add(
      this.explosionParticles,
      'positionRadiusVariance',
      { min: 0, max: 5, step: 0.1, label: 'Position Radius Variance' },
      folder
    );

    const shakeFolder = 'Lightning/Camera Shake';
    this.game.debug.add(
      this,
      'cameraShakeDuration',
      { min: 0.1, max: 2, step: 0.05, label: 'Duration' },
      shakeFolder
    );

    this.game.debug.add(
      this,
      'cameraShakeIntensity',
      { min: 0, max: 2, step: 0.05, label: 'Intensity' },
      shakeFolder
    );

    this.game.debug.add(
      this,
      'cameraShakeFrequency',
      { min: 5, max: 50, step: 1, label: 'Frequency (Hz)' },
      shakeFolder
    );

    this.game.debug.add(
      this,
      'cameraShakeDecay',
      { min: 0.5, max: 5, step: 0.1, label: 'Decay Curve' },
      shakeFolder
    );

    this._addParticleInterpolantGUI();
  }

  _addParticleInterpolantGUI() {
    const folder = 'Lightning/Material';

    this.sizeStops.forEach((stop) => {
      this.game.debug
        .add(
          stop,
          'value',
          { min: 0, max: 2, step: 0.01, label: `Size @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildInterpolantsAndTextures());
    });

    this.alphaStops.forEach((stop) => {
      this.game.debug
        .add(
          stop,
          'value',
          { min: 0, max: 1, step: 0.01, label: `Alpha @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildInterpolantsAndTextures());
    });

    this.colorStops.forEach((stop) => {
      const colorObj = { color: `#${stop.value.getHexString()}` };
      this.game.debug
        .add(
          colorObj,
          'color',
          { color: true, label: `Color @ ${stop.time}` },
          folder
        )
        .onChange((hex) => {
          stop.value.set(hex);
          this._buildInterpolantsAndTextures();
        });
    });

    this.twinkleStops.forEach((stop) => {
      this.game.debug
        .add(
          stop,
          'value',
          { min: 0, max: 2, step: 0.01, label: `Twinkle @ ${stop.time}` },
          folder
        )
        .onChange(() => this._buildInterpolantsAndTextures());
    });

    this.game.debug.add(
      this.#explosionMaterial.uniforms.uSizeMultiplier,
      'value',
      { min: 0, max: 3, step: 0.01, label: 'Size Multiplier' },
      folder
    );
  }
}
