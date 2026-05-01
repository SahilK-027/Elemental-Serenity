import * as THREE from 'three';
import Game from '../../../Game.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class FallingLeavesSystem {
  constructor(geometry, bounds) {
    this.game = Game.getInstance();
    this.count = 35;
    this.scene = this.game.scene;
    this.bounds = bounds;
    this.seasonManager = SeasonManager.getInstance();
    this.currentSeason = this.seasonManager.currentSeason;

    const leafColor = this.seasonManager.getColorConfig('fallingLeaves').color;
    this.material = new THREE.MeshStandardMaterial({
      color: leafColor,
    });

    this.mesh = new THREE.InstancedMesh(geometry, this.material, this.count);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);

    this.dummy = new THREE.Object3D();
    this.particles = [];

    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: new THREE.Euler(),
        rotSpeed: new THREE.Vector3(),
        scale: 1,
      });
      this.respawn(this.particles[i]);
      this.particles[i].pos.y =
        Math.random() * (bounds.yMax - bounds.yMin) + bounds.yMin;
    }

    this.seasonManager.onChange((newSeason, oldSeason) => {
      this.onSeasonChanged(newSeason, oldSeason);
    });
  }

  onSeasonChanged(newSeason, oldSeason) {
    this.currentSeason = newSeason;
    const leafColor = this.seasonManager.getColorConfig('fallingLeaves').color;
    this.material.color.copy(leafColor);
  }

  respawn(p) {
    p.pos.x = this.bounds.originX + (Math.random() - 0.5) * this.bounds.xRange;
    p.pos.y = this.bounds.yMax - Math.random();
    p.pos.z = this.bounds.originZ + (Math.random() - 0.5) * this.bounds.zRange;

    p.vel.set(
      (Math.random() - 0.2) * 0.05,
      -(Math.random() * 0.01 + 0.02),
      (Math.random() - 0.7) * 0.05
    );

    p.rot.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    p.rotSpeed.set(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1
    );

    p.scale = 0.0;
  }

  update(dt) {
    const cappedDt = Math.min(dt, 0.1);
    for (let i = 0; i < this.count; i++) {
      const p = this.particles[i];

      p.pos.add(p.vel);
      p.rot.x += p.rotSpeed.x;
      p.rot.y += p.rotSpeed.y;
      p.rot.z += p.rotSpeed.z;

      if (p.scale < 0.8) {
        p.scale = THREE.MathUtils.lerp(
          p.scale,
          0.8,
          Math.min(cappedDt * 2.0, 1.0)
        );
      }

      p.pos.z -= Math.sin(p.pos.y) * 0.001;

      this.dummy.position.copy(p.pos);
      this.dummy.rotation.copy(p.rot);
      const s = p.scale;
      this.dummy.scale.set(s, s, s);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);

      if (p.pos.y < 0.0) {
        this.respawn(p);
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.seasonManager.offChange();
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
