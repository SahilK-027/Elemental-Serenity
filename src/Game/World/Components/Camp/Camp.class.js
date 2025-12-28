import Game from '../../../Game.class';

export default class Camp {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.addCamp();
  }

  addCamp() {
    this.campModel = this.resources.items.campModel.scene;
    this.scene.add(this.campModel);

    this.campModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
}
