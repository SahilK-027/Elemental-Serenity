import * as THREE from 'three';
import Game from '../../../Game.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class RainSystem {
  constructor(bounds) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.bounds = bounds;
    this.seasonManager = SeasonManager.getInstance();

    this.count = 800;
    this.visible = false;

    this.createRainGeometry();
    this.createRainMaterial();
    this.createRainMesh();
    this.initializeParticles();
  }

  createRainGeometry() {
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.count * 6);
    const colors = new Float32Array(this.count * 6);

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  createRainMaterial() {
    this.material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
  }

  createRainMesh() {
    this.mesh = new THREE.LineSegments(this.geometry, this.material);
    this.mesh.visible = this.visible;
    this.scene.add(this.mesh);
  }

  initializeParticles() {
    this.particles = [];

    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 1.0,
        maxLife: 1.0,
        spawnDelay: Math.random() * 2.0,
      });
      this.respawnParticle(this.particles[i]);

      this.particles[i].pos.y =
        this.bounds.yMin +
        Math.random() * (this.bounds.yMax - this.bounds.yMin + 10);
    }

    this.updateGeometry();
  }

  respawnParticle(particle) {
    particle.pos.x =
      this.bounds.originX + (Math.random() - 0.5) * this.bounds.xRange;
    particle.pos.y = this.bounds.yMax + Math.random() * 5.0;
    particle.pos.z =
      this.bounds.originZ + (Math.random() - 0.5) * this.bounds.zRange;

    particle.vel.set(
      (Math.random() - 0.5) * 0.2,
      -6.0 - Math.random() * 6.0,
      (Math.random() - 0.5) * 0.2
    );

    particle.life = particle.maxLife;
    particle.spawnDelay = 0;
  }

  updateGeometry() {
    const positions = this.geometry.attributes.position.array;
    const colors = this.geometry.attributes.color.array;

    const direction = new THREE.Vector3();
    const rainColor = this.getRainColor();

    for (let i = 0; i < this.count; i++) {
      const particle = this.particles[i];
      const i6 = i * 6;

      if (particle.spawnDelay > 0) {
        positions[i6] = positions[i6 + 3] = 0;
        positions[i6 + 1] = positions[i6 + 4] = -100;
        positions[i6 + 2] = positions[i6 + 5] = 0;

        colors[i6] = colors[i6 + 1] = colors[i6 + 2] = 0;
        colors[i6 + 3] = colors[i6 + 4] = colors[i6 + 5] = 0;
        continue;
      }

      const dropLength = Math.min(particle.vel.length() * 0.08, 0.4);
      direction.copy(particle.vel).normalize();

      positions[i6] = particle.pos.x;
      positions[i6 + 1] = particle.pos.y;
      positions[i6 + 2] = particle.pos.z;

      positions[i6 + 3] = particle.pos.x - direction.x * dropLength;
      positions[i6 + 4] = particle.pos.y - direction.y * dropLength;
      positions[i6 + 5] = particle.pos.z - direction.z * dropLength;

      const baseAlpha = 0.8;
      const fadeAlpha = 0.3;

      colors[i6] = rainColor.r * baseAlpha;
      colors[i6 + 1] = rainColor.g * baseAlpha;
      colors[i6 + 2] = rainColor.b * baseAlpha;

      colors[i6 + 3] = rainColor.r * fadeAlpha;
      colors[i6 + 4] = rainColor.g * fadeAlpha;
      colors[i6 + 5] = rainColor.b * fadeAlpha;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  getRainColor() {
    const season = this.seasonManager.currentSeason;

    switch (season) {
      case 'rainy':
        return new THREE.Color(0.7, 0.8, 0.9);
      case 'winter':
        return new THREE.Color(0.9, 0.9, 1.0);
      case 'autumn':
        return new THREE.Color(0.8, 0.8, 0.9);
      default:
        return new THREE.Color(0.7, 0.8, 0.9);
    }
  }

  setVisible(visible) {
    this.visible = visible;
    if (this.mesh) {
      this.mesh.visible = visible;
    }
  }

  update(delta, elapsedTime) {
    if (!this.visible) return;

    const cappedDt = Math.min(delta, 0.2);

    for (let i = 0; i < this.count; i++) {
      const particle = this.particles[i];

      if (particle.spawnDelay > 0) {
        particle.spawnDelay -= cappedDt;
        continue;
      }

      particle.pos.addScaledVector(particle.vel, cappedDt);

      const windStrength = 0.02;
      particle.pos.x +=
        Math.sin(elapsedTime * 1.5 + particle.pos.z * 0.05) *
        windStrength *
        cappedDt;
      particle.pos.z +=
        Math.cos(elapsedTime * 1.2 + particle.pos.x * 0.03) *
        windStrength *
        cappedDt;

      if (particle.pos.y < -2.0) {
        this.respawnParticle(particle);

        particle.spawnDelay = Math.random() * 0.1;
      }
    }

    this.updateGeometry();
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.geometry.dispose();
      this.material.dispose();
    }
  }
}
