import * as THREE from 'three';
import Game from '../Game.class';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class Camera {
  constructor(fov = 25, near = 0.1, far = 200) {
    this.game = Game.getInstance();
    this.canvas = this.game.canvas;
    this.sizes = this.game.sizes;
    this.scene = this.game.scene;

    this.setPerspectiveCameraInstance(fov, near, far);
    this.setOrbitControls();
  }

  setPerspectiveCameraInstance(fov, near, far) {
    const aspectRatio = this.sizes.width / this.sizes.height;
    this.cameraInstance = new THREE.PerspectiveCamera(
      fov,
      aspectRatio,
      near,
      far
    );

    this.cameraInstance.position.set(
      17.84938625934108,
      9.437683136448264,
      26.480550356456746
    );
    this.scene.add(this.cameraInstance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.cameraInstance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxDistance = 33.3;
  }

  resize() {
    const aspectRatio = this.sizes.width / this.sizes.height;
    this.cameraInstance.aspect = aspectRatio;
    this.cameraInstance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
