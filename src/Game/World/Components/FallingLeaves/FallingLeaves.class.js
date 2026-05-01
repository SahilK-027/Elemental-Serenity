import FallingLeavesSystem from './FallingLeavesSystem.class';
import Game from '../../../Game.class';

export default class FallingLeaves {
  constructor() {
    this.game = Game.getInstance();
    const leaf = this.game.resources.items.leafModel;
    const leafGeometry = leaf.scene.children[0].geometry;
    const tree1Bounds = {
      yMin: 1.0,
      yMax: 7.5,
      xRange: 6.0,
      zRange: -2.0,
      originX: -4.0,
      originZ: 10,
    };
    const tree2Bounds = {
      yMin: 1.0,
      yMax: 7.5,
      xRange: 6.0,
      zRange: -1.0,
      originX: 4.0,
      originZ: -10,
    };
    this.fallingLeavesSystem_1 = new FallingLeavesSystem(
      leafGeometry.clone(),
      tree1Bounds
    );
    this.fallingLeavesSystem_2 = new FallingLeavesSystem(
      leafGeometry.clone(),
      tree2Bounds
    );
  }

  update(delta) {
    this.fallingLeavesSystem_1.update(delta);
    this.fallingLeavesSystem_2.update(delta);
  }

  dispose() {
    this.fallingLeavesSystem_1.dispose();
    this.fallingLeavesSystem_2.dispose();
  }
}
