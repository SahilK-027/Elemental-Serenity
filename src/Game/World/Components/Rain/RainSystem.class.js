import * as THREE from 'three';
import Game from '../../../Game.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class RainSystem {
  constructor(bounds) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.bounds = bounds;
    this.seasonManager = SeasonManager.getInstance();
    
    // Rain configuration
    this.count = 800; // Number of rain drops
    this.visible = false;
    
    this.createRainGeometry();
    this.createRainMaterial();
    this.createRainMesh();
    this.initializeParticles();
  }

  createRainGeometry() {
    // Create a simple line geometry for rain drops
    this.geometry = new THREE.BufferGeometry();
    
    // Each rain drop is a small line
    const positions = new Float32Array(this.count * 6); // 2 vertices per line, 3 components each
    const colors = new Float32Array(this.count * 6); // 2 vertices per line, 3 components each
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
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
        spawnDelay: Math.random() * 2.0, // Stagger spawning
      });
      this.respawnParticle(this.particles[i]);
      // Distribute particles throughout the fall zone for continuous effect
      this.particles[i].pos.y = 
        this.bounds.yMin + Math.random() * (this.bounds.yMax - this.bounds.yMin + 10);
    }
    
    this.updateGeometry();
  }

  respawnParticle(particle) {
    // Spawn at top of bounds with random X and Z
    particle.pos.x = this.bounds.originX + (Math.random() - 0.5) * this.bounds.xRange;
    particle.pos.y = this.bounds.yMax + Math.random() * 5.0; // Add extra height variation
    particle.pos.z = this.bounds.originZ + (Math.random() - 0.5) * this.bounds.zRange;
    
    // Rain falls straight down with slight wind variation
    particle.vel.set(
      (Math.random() - 0.5) * 0.2, // Slight horizontal drift
      -6.0 - Math.random() * 6.0,  // Varied downward velocity
      (Math.random() - 0.5) * 0.2  // Slight horizontal drift
    );
    
    particle.life = particle.maxLife;
    particle.spawnDelay = 0; // Reset spawn delay
  }

  updateGeometry() {
    const positions = this.geometry.attributes.position.array;
    const colors = this.geometry.attributes.color.array;
    
    for (let i = 0; i < this.count; i++) {
      const particle = this.particles[i];
      const i6 = i * 6;
      
      // Skip particles that are in spawn delay
      if (particle.spawnDelay > 0) {
        // Hide particle by setting positions to same point
        positions[i6] = positions[i6 + 3] = 0;
        positions[i6 + 1] = positions[i6 + 4] = -100; // Far below ground
        positions[i6 + 2] = positions[i6 + 5] = 0;
        
        colors[i6] = colors[i6 + 1] = colors[i6 + 2] = 0;
        colors[i6 + 3] = colors[i6 + 4] = colors[i6 + 5] = 0;
        continue;
      }
      
      // Calculate rain drop length based on velocity
      const dropLength = Math.min(particle.vel.length() * 0.08, 0.4);
      const direction = particle.vel.clone().normalize();
      
      // Start point of rain drop
      positions[i6] = particle.pos.x;
      positions[i6 + 1] = particle.pos.y;
      positions[i6 + 2] = particle.pos.z;
      
      // End point of rain drop (creating a streak)
      positions[i6 + 3] = particle.pos.x - direction.x * dropLength;
      positions[i6 + 4] = particle.pos.y - direction.y * dropLength;
      positions[i6 + 5] = particle.pos.z - direction.z * dropLength;
      
      // Color based on season
      const rainColor = this.getRainColor();
      const baseAlpha = 0.8;
      const fadeAlpha = 0.3;
      
      // Start point color (more opaque)
      colors[i6] = rainColor.r * baseAlpha;
      colors[i6 + 1] = rainColor.g * baseAlpha;
      colors[i6 + 2] = rainColor.b * baseAlpha;
      
      // End point color (more transparent)
      colors[i6 + 3] = rainColor.r * fadeAlpha;
      colors[i6 + 4] = rainColor.g * fadeAlpha;
      colors[i6 + 5] = rainColor.b * fadeAlpha;
    }
    
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  getRainColor() {
    // Get rain color based on current season
    const season = this.seasonManager.currentSeason;
    
    switch (season) {
      case 'rainy':
        return new THREE.Color(0.7, 0.8, 0.9); // Bluish-white
      case 'winter':
        return new THREE.Color(0.9, 0.9, 1.0); // Pure white (snow)
      case 'autumn':
        return new THREE.Color(0.8, 0.8, 0.9); // Slightly warm
      default:
        return new THREE.Color(0.7, 0.8, 0.9); // Default bluish-white
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
      
      // Handle spawn delay for staggered effect
      if (particle.spawnDelay > 0) {
        particle.spawnDelay -= cappedDt;
        continue;
      }
      
      // Update position
      particle.pos.add(particle.vel.clone().multiplyScalar(cappedDt));
      
      // Add subtle wind effect
      const windStrength = 0.02;
      particle.pos.x += Math.sin(elapsedTime * 1.5 + particle.pos.z * 0.05) * windStrength * cappedDt;
      particle.pos.z += Math.cos(elapsedTime * 1.2 + particle.pos.x * 0.03) * windStrength * cappedDt;
      
      // Respawn if particle is below ground
      if (particle.pos.y < -2.0) {
        this.respawnParticle(particle);
        // Add small random delay to prevent synchronized respawning
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