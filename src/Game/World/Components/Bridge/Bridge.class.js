import * as THREE from 'three';
import Game from '../../../Game.class';

export default class Bridge {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.debugGUI = this.game.debug;
    this.isDebugMode = this.game.isDebugMode;

    this.addTent();
    if (this.isDebugMode) {
      this.initGUI();
    }
  }

  addTent() {
    this.tentModel = this.resources.items.bridgeModel.scene;
    this.scene.add(this.tentModel);
    this.tentModel.scale.set(0.8, 0.8, 0.85);
    this.tentModel.position.set(-8.0, 1.5, 1.25);
    this.tentModel.rotation.y = Math.PI;
    this.tentModel.rotation.z = Math.PI / 30;
    this.woodColorMultiplier = new THREE.Color(0.55, 0.4, 0.18);

    const woodColorMap = this.resources.items.woodColorTexture;
    const woodNormalMap = this.resources.items.woodNormalTexture;
    const woodAOMap = this.resources.items.woodAOTexture;

    this.tentModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material.name === 'Material.001') {
          child.material.map = woodColorMap;
          child.material.normalMap = woodNormalMap;
          child.material.aoMap = woodAOMap;
          child.material.aoMapIntensity = 0.15;
          child.material.roughness = 1.0;
          child.material.color = this.woodColorMultiplier;
        }
      }
    });
  }

  initGUI() {
    this.debugGUI.add(
      this,
      'woodColorMultiplier',
      {
        type: 'color',
        label: 'Wood color',
        onChange: (v) => {
          this.woodColorMultiplier = new THREE.Color(v);
          this.tentModel.traverse((child) => {
            if (child.isMesh && child.material.name === 'Material.001') {
              child.material.color = this.woodColorMultiplier;
            }
          });
        },
      },
      'Wood'
    );
  }
}
