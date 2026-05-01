import * as THREE from 'three';
import Game from '../Game.class';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class Camera {
  constructor(fov = 25, near = 0.1, far = 200) {
    this.game = Game.getInstance();
    this.canvas = this.game.canvas;
    this.sizes = this.game.sizes;
    this.scene = this.game.scene;

    this.idealRatio = 16 / 9;
    this.ratioOverflow = 0;
    this.initialCameraPosition = null;
    this.adjustedCameraPosition = null;
    this.baseMaxDistance = 35;

    this.setPerspectiveCameraInstance(fov, near, far);
    this.setOrbitControls();

    this.initialCameraPosition = this.cameraInstance.position.clone();
    this.updateCameraForAspectRatio();
  }

  setPerspectiveCameraInstance(fov, near, far) {
    const aspectRatio = this.sizes.width / this.sizes.height;
    this.cameraInstance = new THREE.PerspectiveCamera(
      fov,
      aspectRatio,
      near,
      far
    );

    this.cameraInstance.position.set(18.25, 10.69, 27.32);
    this.scene.add(this.cameraInstance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.cameraInstance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = true;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxDistance = this.baseMaxDistance;
  }

  updateCameraForAspectRatio() {
    const currentRatio = this.sizes.width / this.sizes.height;
    this.ratioOverflow = Math.max(1, this.idealRatio / currentRatio) - 1;

    const baseDistance = this.initialCameraPosition.length();
    const additionalDistance = baseDistance * this.ratioOverflow * 0.1;

    const direction = this.initialCameraPosition.clone().normalize();
    const newDistance = baseDistance + additionalDistance;

    this.adjustedCameraPosition = direction.multiplyScalar(newDistance);
    this.cameraInstance.position.copy(this.adjustedCameraPosition);

    this.controls.maxDistance = Math.max(this.baseMaxDistance, newDistance);
  }

  resize() {
    const aspectRatio = this.sizes.width / this.sizes.height;
    this.cameraInstance.aspect = aspectRatio;
    this.cameraInstance.updateProjectionMatrix();

    this.updateCameraForAspectRatio();
  }

  update() {
    this.controls.update();
  }

  dispose() {
    this.controls.dispose();
    this.scene.remove(this.cameraInstance);
  }
}
