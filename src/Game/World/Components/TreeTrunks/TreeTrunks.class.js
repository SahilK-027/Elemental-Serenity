import Game from '../../../Game.class';

export default class Trees {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.debugGUI = this.game.debug;

    this.addTrees();
  }

  addTrees() {
    this.treeModel = this.resources.items.TreeTrunksModel.scene;
    this.scene.add(this.treeModel);

    this.treeModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
}
