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
import lightningVertexShader from '../../../Shaders/Materials/fire/vertex.glsl';
import lightningFragmentShader from '../../../Shaders/Materials/fire/fragment.glsl';

export default class Lightning {
  #explosionMaterial = null;
  #activeLightningArcs = [];

  constructor(particleSystem) {
    this.game = Game.getInstance();
    this.particleSystem = particleSystem;
    this.scene = this.game.scene;

    // Lightning timing
    this.nextLightningTime = this.getRandomDelay();
    this.elapsedTime = 0;
    this.isEnabled = true;

    // Lightning parameters
    this.cameraShakeDuration = 0.5;
    this.cameraShakeIntensity = 0.3;

    // Colors
    this.colorA = new THREE.Color(0x0000ff);
    this.colorB = new THREE.Color(0x00ffff);
    this.intensity = 3;

    // Particle configuration
    // Recommended explosion preset — faster, punchier, wider radius
    this.explosionParticles = {
      count: 100, // more particles for fullness
      duration: 1, // how long emission lasts (seconds)
      maxLife: 1.3, // particle life (seconds) — short = punchy
      velocityMagnitude: 5.6, // base speed
      velocityMagnitudeVariance: 0.5, // randomness
      rotationAngularVariance: Math.PI * 2,
      gravity: true,
      gravityStrength: -1.5, // moderate downward pull
      dragCoefficient: -2.5, // positive value interpreted as "friction" in code below
      positionRadiusVariance: 0, // spawn over a wider sphere (more volumetric)
    };

    // Create particle stops
    this._createParticleStops();

    // Setup arc and explosion
    this.setupArc();
    this.createExplosionMaterial();

    // Listen for pause/resume events
    this.setupPauseResumeListeners();

    // Setup debug GUI if in debug mode
    this.isDebugMode = this.game.isDebugMode;
    if (this.isDebugMode) {
      this.initGUI();
    }
  }

  setupPauseResumeListeners() {
    if (this.game.musicManager) {
      this.game.musicManager.on('pause', () => {
        this.isEnabled = false;
      });
      this.game.musicManager.on('resume', () => {
        this.isEnabled = true;
      });
    }
  }

  _createParticleStops() {
    this.sizeStops = [
      { time: 0.0, value: 0.1 },
      { time: 0.1, value: 1.0 },
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
      vertexShader: lightningVertexShader,
      fragmentShader: lightningFragmentShader,
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

    // Create tube with thinner radius
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
        uColorA: { value: this.colorA },
        uColorB: { value: this.colorB },
        uIntensity: { value: this.intensity },
      },
      vertexShader: `
      varying vec2 vUv;
      varying float vProgress;
      
      void main() {
        vUv = uv;
        // Use the Y position (0 to 1) as progress along the arc
        vProgress = position.y / 15.0; // height is 15
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: `
      uniform float uTime;
      uniform float uStartTime;
      uniform float uDuration;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uIntensity;
      
      varying vec2 vUv;
      varying float vProgress;
      
      void main() {
        // Calculate time progress (0 to 1)
        float localTime = uTime - uStartTime;
        float timeProgress = clamp(localTime / uDuration, 0.0, 1.0);
        
        // Fade out over time
        float alpha = 1.0 - timeProgress;
        
        // Mix colors from bottom (colorA) to top (colorB)
        vec3 mixedColor = mix(uColorA, uColorB, vProgress);
        
        // Brighten the color
        vec3 finalColor = mixedColor * uIntensity;
        
        gl_FragColor = vec4(finalColor * 1.3, alpha);
      }
    `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.frustumCulled = false;

    console.log('Lightning arc created at', position);

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

    // Create a new renderer for this explosion
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

  triggerCameraShake() {
    const camera = this.game.camera.cameraInstance;
    const originalPosition = camera.position.clone();
    const shakeStart = Date.now();

    const shake = () => {
      const elapsed = (Date.now() - shakeStart) / 1000;

      if (elapsed < this.cameraShakeDuration) {
        const intensity =
          this.cameraShakeIntensity * (1 - elapsed / this.cameraShakeDuration);
        camera.position.x =
          originalPosition.x + (Math.random() - 0.5) * intensity;
        camera.position.y =
          originalPosition.y + (Math.random() - 0.5) * intensity;
        camera.position.z =
          originalPosition.z + (Math.random() - 0.5) * intensity;
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
    this.triggerCameraShake();
    this.playThunderSound();

    // Clean up arc after duration
    setTimeout(() => {
      this.scene.remove(arcMesh);
      arcMesh.geometry.dispose();
      arcMesh.material.dispose();

      // NEW: Remove from tracking array
      const index = this.#activeLightningArcs.indexOf(arcMesh);
      if (index > -1) {
        this.#activeLightningArcs.splice(index, 1);
      }
    }, this.arc.duration * 1000);
  }

  playThunderSound() {
    if (this.game.audioManager?.sounds?.thunderStrikeSound) {
      const sound = this.game.audioManager.sounds.thunderStrikeSound;
      if (sound.isPlaying) sound.stop();
      sound.setVolume(
        this.game.audioManager.soundVolume * this.game.audioManager.masterVolume
      );
      sound.play();
    }
  }

  strikeRandom() {
    const cameraPos = this.game.camera.cameraInstance.position;
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30;

    const position = new THREE.Vector3(
      cameraPos.x + Math.cos(angle) * distance,
      0,
      cameraPos.z + Math.sin(angle) * distance
    );

    this.strike(position);
  }

  manualStrike() {
    this.strike(new THREE.Vector3(0, 0, 0));
  }

  isRainySeason() {
    return this.game.seasonManager?.currentSeason === 'rainy';
  }

  update(delta) {
    this.elapsedTime += delta;

    // Update shader time uniforms
    const currentTime = this.game.time?.elapsedTime || performance.now() / 1000;

    if (this.#explosionMaterial) {
      this.#explosionMaterial.uniforms.uTime.value = currentTime;
    }

    // Update arc meshes
    for (const arc of this.#activeLightningArcs) {
      if (arc.material?.uniforms?.uTime) {
        arc.material.uniforms.uTime.value = currentTime;
      }
    }

    // Only trigger automatic lightning during rainy season and when enabled
    if (
      this.isEnabled &&
      this.isRainySeason() &&
      this.elapsedTime >= this.nextLightningTime
    ) {
      this.strikeRandom();
      this.elapsedTime = 0;
      this.nextLightningTime = this.getRandomDelay();
    }
  }

  dispose() {
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
