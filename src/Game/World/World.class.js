import Game from '../Game.class';
import Lighting from './Components/Lighting/Lighting.class';
import Skydome from './Components/Skydome/Skydome.class';
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
import SnowFall from './Components/SnowFall/SnowFall.class';
import { ParticleSystem } from './Systems/ParticleSystem.class';
import Lightning from './Systems/Lightning.class';
import Fog from './Components/Fog/Fog.class';

export default class World {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.lighting = new Lighting({
      helperEnabled: false,
    });
    this.skydome = new Skydome();
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
    this.snowFall = new SnowFall();

    // Initialize particle system and lightning
    this.particleSystem = new ParticleSystem();

    // Calculate ground bounds from Ground dimensions
    const worldSize = this.ground.WORLD_SIZE;
    const halfSize = worldSize / 2 - 3;
    console.log(halfSize);
    const groundBounds = {
      minX: -halfSize,
      maxX: halfSize,
      minZ: -halfSize,
      maxZ: halfSize,
    };

    this.lightning = new Lightning(this.particleSystem, groundBounds);

    // Initialize fog to hide ground corners
    this.fog = new Fog(worldSize);

    // Setup debug UI
    if (this.debugGUI) {
      this.setupDebugUI();
    }
  }

  setupDebugUI() {
    const lightningControls = {
      strikeNow: () => this.lightning.manualStrike(),
    };

    this.debugGUI.add(
      lightningControls,
      'strikeNow',
      { label: 'Strike Lightning' },
      'Lightning'
    );
  }

  update(delta, elapsedTime) {
    this.ground.update();
    this.bush.update();
    this.skydome.update(delta, elapsedTime);
    this.fire.update(delta, elapsedTime);
    this.fallingLeaves.update(delta);
    this.fireFlies.update(elapsedTime);
    this.rain.update(delta, elapsedTime);
    this.snowFall.update(delta, elapsedTime);

    // Update particle system and lightning
    this.particleSystem.update(delta, elapsedTime);
    this.lightning.update(delta);
  }
}
