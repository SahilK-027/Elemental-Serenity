import Game from '../Game.class';
import Lighting from './Components/Lighting/Lighting.class';
import Ground from './Components/Ground/Ground.class';
import Tent from './Components/Tent/Tent.class';
import Bridge from './Components/Bridge/Bridge.class';
import WindLines from './Components/WindLines/Windlines.class';
import Rocks from './Components/Rocks/Rocks.class';
import Bush from './Components/Bush/Bush.class';
import Trees from './Components/TreeTrunks/TreeTrunks.class';
import Camp from './Components/Camp/Camp.class';
import Fire from './Components/Fire/Fire.class';
import FireFlies from './Components/FireFlies/FireFlies.class';
import FallingLeaves from './Components/FallingLeaves/FallingLeaves.class';
import Rain from './Components/Rain/Rain.class';

export default class World {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.lighting = new Lighting({
      helperEnabled: false,
    });
    this.debugGUI = this.game.debug;
    this.ground = new Ground();
    this.tent = new Tent();
    this.bridge = new Bridge();
    this.windLines = new WindLines();
    this.rocks = new Rocks();
    this.bush = new Bush();
    this.trees = new Trees();
    this.fallingLeaves = new FallingLeaves();
    this.camp = new Camp();
    this.fire = new Fire();
    this.fireFlies = new FireFlies();
    this.rain = new Rain();
  }

  update(delta, elapsedTime) {
    this.ground.update();
    this.bush.update();
    this.fire.update(delta, elapsedTime);
    this.fallingLeaves.update(delta);
    this.fireFlies.update(elapsedTime);
    this.rain.update(delta, elapsedTime);
  }
}
