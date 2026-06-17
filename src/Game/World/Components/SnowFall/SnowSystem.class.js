import * as THREE from 'three';
import Game from '../../../Game.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class SnowSystem {
  constructor(bounds) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.bounds = bounds;
    this.seasonManager = SeasonManager.getInstance();

    this.count = 600;
    this.visible = false;

    this.createSnowGeometry();
    this.createSnowMaterial();
    this.createSnowMesh();
    this.initializeParticles();
  }

  createSnowGeometry() {
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  }

  createSnowMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const context = canvas.getContext('2d');

    const gradient = context.createRadialGradient(2, 2, 0, 2, 2, 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 4, 4);

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }

  createSnowMesh() {
    this.mesh = new THREE.Points(this.geometry, this.material);
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
        size: 0.1 + Math.random() * 0.2,
        rotationSpeed: (Math.random() - 0.5) * 2.0,
        spawnDelay: Math.random() * 0.1,
      });
      this.respawnParticle(this.particles[i]);

      this.particles[i].pos.y =
        this.bounds.yMin +
        Math.random() * (this.bounds.yMax - this.bounds.yMin + 15);
    }

    this.updateGeometry();
  }

  respawnParticle(particle) {
    particle.pos.x =
      this.bounds.originX + (Math.random() - 0.5) * this.bounds.xRange;
    particle.pos.y = this.bounds.yMax + Math.random() * 8.0;
    particle.pos.z =
      this.bounds.originZ + (Math.random() - 0.5) * this.bounds.zRange;

    particle.vel.set(
      (Math.random() - 0.5) * 0.5,
      -0.8 - Math.random() * 1.2,
      (Math.random() - 0.5) * 0.5
    );

    particle.life = particle.maxLife;
    particle.spawnDelay = 0;
  }

  updateGeometry() {
    const positions = this.geometry.attributes.position.array;
    const colors = this.geometry.attributes.color.array;
    const sizes = this.geometry.attributes.size.array;

    for (let i = 0; i < this.count; i++) {
      const particle = this.particles[i];
      const i3 = i * 3;

      if (particle.spawnDelay > 0) {
        positions[i3] = 0;
        positions[i3 + 1] = -100;
        positions[i3 + 2] = 0;

        colors[i3] = colors[i3 + 1] = colors[i3 + 2] = 0;
        sizes[i] = 0;
        continue;
      }

      positions[i3] = particle.pos.x;
      positions[i3 + 1] = particle.pos.y;
      positions[i3 + 2] = particle.pos.z;

      const brightness = 0.9 + Math.random() * 0.1;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness;
      colors[i3 + 2] = 1.0;

      sizes[i] = particle.size;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
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

      const swayStrength = 0.3;
      const timeOffset = particle.pos.z * 0.1 + particle.pos.x * 0.05;
      particle.pos.x +=
        Math.sin(elapsedTime * 0.8 + timeOffset) * swayStrength * cappedDt;
      particle.pos.z +=
        Math.cos(elapsedTime * 0.6 + timeOffset) * swayStrength * cappedDt;

      particle.pos.y +=
        Math.sin(elapsedTime * 2.0 + particle.pos.x * 0.1) * 0.05 * cappedDt;

      if (particle.pos.y < -2.0) {
        this.respawnParticle(particle);

        particle.spawnDelay = Math.random() * 0.2;
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
