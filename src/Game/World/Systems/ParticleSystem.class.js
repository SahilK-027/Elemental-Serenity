import * as THREE from 'three';
import * as MATH from '../../Utils/Math.class';

const GRAVITY = new THREE.Vector3(0, -0.09, 0);
const DRAG = -0.5;

class ParticleSystem {
  #emitters = [];

  constructor() {}

  dispose() {
    for (let i = 0; i < this.#emitters.length; i++) {
      this.#emitters[i].dispose();
    }
  }

  get StillActive() {
    for (let i = 0; i < this.#emitters.length; i++) {
      if (this.#emitters[i].StillActive) {
        return true;
      }
    }

    return false;
  }

  addEmitter(emitter) {
    this.#emitters.push(emitter);
  }

  update(elapsedTime, totalTimeElapsed) {
    for (let i = this.#emitters.length - 1; i >= 0; i--) {
      const e = this.#emitters[i];

      if (!e.StillActive) {
        e.dispose();

        this.#emitters[i] = this.#emitters[this.#emitters.length - 1];
        this.#emitters.pop();
      } else {
        e.update(elapsedTime, totalTimeElapsed);
      }
    }
  }
}

class ParticleRendererParams {
  maxParticles = 100;
  group = new THREE.Group();

  constructor() {}
}

class ParticleRenderer {
  #particlesGeometry = null;
  #particleMesh = null;
  #material = null;
  #lastParticleCount = 0;

  constructor() {}

  dispose() {
    if (this.#particleMesh) {
      this.#particleMesh.removeFromParent();
      this.#particleMesh = null;
    }

    if (this.#particlesGeometry) {
      this.#particlesGeometry.dispose();
      this.#particlesGeometry = null;
    }

    if (this.#material) {
      this.#material.dispose();
      this.#material = null;
    }
  }

  initialize(material, params) {
    this.#particlesGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(params.maxParticles * 3);
    const particleData = new Float32Array(params.maxParticles * 2);

    this.#particlesGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    this.#particlesGeometry.setAttribute(
      'particleData',
      new THREE.Float32BufferAttribute(particleData, 2)
    );

    this.#particlesGeometry.attributes.position.setUsage(
      THREE.DynamicDrawUsage
    );
    this.#particlesGeometry.attributes.particleData.setUsage(
      THREE.DynamicDrawUsage
    );
    this.#particlesGeometry.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(),
      1000
    );

    this.#particleMesh = new THREE.Points(this.#particlesGeometry, material);

    this.#material = material;

    params.group.add(this.#particleMesh);
  }

  updateFromParticles(particles, totalTimeElapsed) {
    if (!this.#particleMesh) return;

    this.#material.uniforms.uTime.value = totalTimeElapsed;

    const positions = this.#particlesGeometry.attributes.position.array;
    const particleData = this.#particlesGeometry.attributes.particleData.array;
    const count = particles.length;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const i3 = i * 3;
      const i2 = i * 2;

      positions[i3] = p.position.x;
      positions[i3 + 1] = p.position.y;
      positions[i3 + 2] = p.position.z;

      particleData[i2] = p.life / p.maxLife;
      particleData[i2 + 1] = p.id;
    }

    this.#particlesGeometry.attributes.position.needsUpdate = true;
    this.#particlesGeometry.attributes.particleData.needsUpdate = true;

    if (count !== this.#lastParticleCount) {
      this.#particlesGeometry.setDrawRange(0, count);
      this.#particlesGeometry.computeBoundingSphere();
      this.#lastParticleCount = count;
    }
  }
}

class Particle {
  position = new THREE.Vector3(0, 0, 0);
  velocity = new THREE.Vector3();
  life = 0;
  maxLife = 5;
  id = 0;
  attachedEmitter = null;
  attachedShape = null;

  constructor() {}

  reset() {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.life = 0;
    this.maxLife = 5;
    this.attachedEmitter = null;
    this.attachedShape = null;
  }
}

class EmitterShape {
  constructor() {}

  emit(particle) {
    particle.position.set(0, 0, 0);
  }
}

class PointShape extends EmitterShape {
  position = new THREE.Vector3();
  positionRadiusVariance = 0;
  #tempVec = new THREE.Vector3();

  constructor() {
    super();
  }

  emit(particle) {
    particle.position.copy(this.position);

    if (this.positionRadiusVariance > 0) {
      const phi = MATH.random() * Math.PI * 2;
      const theta = MATH.random() * Math.PI;
      const radius = MATH.random() * this.positionRadiusVariance;

      this.#tempVec.set(
        Math.sin(theta) * Math.cos(phi),
        Math.cos(theta),
        Math.sin(theta) * Math.sin(phi)
      );
      this.#tempVec.multiplyScalar(radius);
      particle.position.add(this.#tempVec);
    }
  }
}

class EmitterParams {
  maxLife = 5;
  velocityMagnitude = 0;
  velocityMagnitudeVariance = 0;
  rotation = new THREE.Quaternion();
  rotationAngularVariance = 0;

  maxParticles = 100;
  maxEmission = 100;
  emissionRate = 1;
  gravity = false;
  gravityStrength = 1;
  dragCoefficient = DRAG;
  renderer = null;
  shape = new PointShape();

  onCreated = null;
  onUpdate = null;
  onDestroy = null;

  constructor() {}
}

class Emitter {
  #particles = [];
  #particlePool = [];
  #emissionTime = 0;
  #numParticlesEmitted = 0;
  #params = null;
  #dead = false;
  #tempVec = null;
  #hasOnCreated = false;
  #hasOnUpdate = false;
  #hasOnDestroy = false;
  #secondsPerParticle = 0;

  constructor(params) {
    this.#params = params;
    this.#tempVec = new THREE.Vector3();

    this.#hasOnCreated = typeof params.onCreated === 'function';
    this.#hasOnUpdate = typeof params.onUpdate === 'function';
    this.#hasOnDestroy = typeof params.onDestroy === 'function';

    this.#secondsPerParticle = 1 / params.emissionRate;

    for (let i = 0; i < params.maxParticles; i++) {
      const p = new Particle();
      p.id = MATH.random();
      this.#particlePool.push(p);
    }
  }

  dispose() {
    if (this.#params.onDestroy) {
      for (let i = 0; i < this.#particles.length; ++i) {
        this.#params.onDestroy(this.#particles[i]);
      }
    }
    this.#particles = [];
    this.#particlePool = [];

    if (this.#params.renderer) {
      this.#params.renderer.dispose();
    }
  }

  get StillActive() {
    if (this.#dead) {
      return false;
    }

    return (
      this.#numParticlesEmitted < this.#params.maxEmission ||
      this.#particles.length > 0
    );
  }

  stop() {
    this.#params.maxEmission = 0;
  }

  kill() {
    this.#dead = true;
  }

  #acquireParticle() {
    return this.#particlePool.pop() || new Particle();
  }

  #releaseParticle(particle) {
    particle.reset();
    this.#particlePool.push(particle);
  }

  canCreateParticle() {
    if (this.#dead) {
      return false;
    }

    return (
      this.#emissionTime >= this.#secondsPerParticle &&
      this.#particles.length < this.#params.maxParticles &&
      this.#numParticlesEmitted < this.#params.maxEmission
    );
  }

  emitParticle() {
    const p = this.#acquireParticle();
    if (p.id === 0) {
      p.id = MATH.random();
    }

    this.#params.shape.emit(p);
    p.maxLife = this.#params.maxLife;

    const phi = MATH.random() * 2 * Math.PI;
    const theta = MATH.random() * this.#params.rotationAngularVariance;

    p.velocity.set(
      Math.sin(theta) * Math.cos(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.sin(phi)
    );

    const velocity =
      this.#params.velocityMagnitude +
      (MATH.random() * 2 - 1) * this.#params.velocityMagnitudeVariance;
    p.velocity.multiplyScalar(velocity);
    p.velocity.applyQuaternion(this.#params.rotation);

    if (this.#hasOnCreated) {
      this.#params.onCreated(p);
    }

    return p;
  }

  updateEmission(elapsedTime) {
    if (this.#dead) {
      return;
    }

    this.#emissionTime += elapsedTime;

    while (this.canCreateParticle()) {
      this.#emissionTime -= this.#secondsPerParticle;
      this.#numParticlesEmitted++;
      const particle = this.emitParticle();

      this.#particles.push(particle);
    }
  }

  updateParticle(p, elapsedTime) {
    p.life += elapsedTime;
    p.life = Math.min(p.life, p.maxLife);

    if (this.#params.gravity) {
      this.#tempVec.copy(GRAVITY);
    } else {
      this.#tempVec.set(0, 0, 0);
    }

    this.#tempVec.addScaledVector(p.velocity, -this.#params.dragCoefficient);
    this.#tempVec.multiplyScalar(this.#params.gravityStrength);
    p.velocity.addScaledVector(this.#tempVec, elapsedTime);
    p.position.addScaledVector(p.velocity, elapsedTime);

    if (this.#hasOnUpdate) {
      this.#params.onUpdate(p);
    }

    if (p.life >= p.maxLife && this.#hasOnDestroy) {
      this.#params.onDestroy(p);
    }
  }

  updateParticles(elapsedTime) {
    for (let i = this.#particles.length - 1; i >= 0; i--) {
      const p = this.#particles[i];
      this.updateParticle(p, elapsedTime);

      if (p.life >= p.maxLife) {
        this.#releaseParticle(p);

        this.#particles[i] = this.#particles[this.#particles.length - 1];
        this.#particles.pop();
      }
    }
  }

  update(elapsedTime, totalTimeElapsed) {
    this.updateEmission(elapsedTime);
    this.updateParticles(elapsedTime);

    if (this.#params.renderer) {
      this.#params.renderer.updateFromParticles(
        this.#particles,
        totalTimeElapsed
      );
    }
  }
}

export {
  ParticleSystem,
  ParticleRenderer,
  ParticleRendererParams,
  Emitter,
  EmitterParams,
  Particle,
  EmitterShape,
  PointShape,
};
