import * as THREE from 'three';
import Game from '../../../Game.class';
import fireFliesVertexShader from '../../../../Shaders/Materials/fireflies/vertex.glsl';
import fireFliesFragmentShader from '../../../../Shaders/Materials/fireflies/fragment.glsl';
import * as MATH from '../../../Utils/Math.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';

export default class FireFlies {
  constructor() {
    this.game = Game.getInstance();
    this.sizes = this.game.sizes;
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;

    this.addFireFlies();

    this.fireFlies.visible = this.environmentTimeManager.isNight();

    this.environmentTimeManager.onChange((newValue, oldValue) => {
      this.onEnvTimeChanged(newValue, oldValue);
    });
  }

  addFireFlies() {
    const particleTexture = this.game.resources.items.particleTextureNoAlpha;

    this.fireFliesMaterial = new THREE.ShaderMaterial({
      vertexShader: fireFliesVertexShader,
      fragmentShader: fireFliesFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(this.sizes.width, this.sizes.height),
        },
        uTexture: {
          value: particleTexture,
        },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 10.0 },
      },
      depthWrite: false,
      depthTest: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    let fireFliesCount = 50;
    let minRadius = 9;
    let maxRadius = 16;

    this.fireFliesGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(fireFliesCount * 3);
    const scales = new Float32Array(fireFliesCount);

    for (let i = 0; i < fireFliesCount; i++) {
      const theta = MATH.random() * Math.PI * 2;

      const rInner2 = minRadius * minRadius;
      const rOuter2 = maxRadius * maxRadius;
      const r = Math.sqrt(MATH.random() * (rOuter2 - rInner2) + rInner2);

      const radialJitter = (MATH.random() - 0.5) * 0.6;
      const finalR = r + radialJitter;

      const x = finalR * Math.cos(theta);
      const z = finalR * Math.sin(theta);

      const y = 1.0 + (MATH.random() - 0.5) * 3.0;

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      scales[i] = MATH.random() * 1.0 + 0.5;
    }

    this.fireFliesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    this.fireFliesGeometry.setAttribute(
      'aScale',
      new THREE.BufferAttribute(scales, 1)
    );

    this.fireFlies = new THREE.Points(
      this.fireFliesGeometry,
      this.fireFliesMaterial
    );
    this.fireFlies.renderOrder = -1;

    this.scene.add(this.fireFlies);
  }

  onEnvTimeChanged(newValue, oldValue) {
    const isNight = newValue === 'night';
    if (this.fireFlies) {
      this.fireFlies.visible = isNight;
    }
  }

  update(elapsedTime) {
    if (!this.fireFlies || !this.fireFlies.visible) return;

    this.fireFliesMaterial.uniforms.uTime.value = elapsedTime;
  }

  dispose() {
    this.environmentTimeManager.offChange();

    if (this.fireFlies) {
      this.scene.remove(this.fireFlies);
      this.fireFliesGeometry.dispose();
      this.fireFliesMaterial.dispose();
    }
  }
}
