import * as THREE from 'three';
import Game from '../../../Game.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class Fog {
  constructor(worldSize) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;
    this.currentSeason = this.seasonManager.currentSeason;
    this.debugGUI = this.game.debug;

    this.worldSize = worldSize;
    this.fogNear = 47;
    this.fogFar = 57;

    this.fogColors = this.createFogColorPresets();

    this.initialize();

    this.environmentTimeManager.onChange((newValue) => {
      this.onEnvTimeChanged(newValue);
    });

    this.seasonManager.onChange((newSeason) => {
      this.onSeasonChanged(newSeason);
    });
  }

  createFogColorPresets() {
    return {
      spring: {
        day: new THREE.Color(
          0.19607843137254902,
          0.5098039215686274,
          0.803921568627451
        ),
        night: new THREE.Color(0.0, 0.011, 0.039),
      },
      winter: {
        day: new THREE.Color(0.6, 0.702, 0.898),
        night: new THREE.Color(0, 0.007, 0.039),
      },
      autumn: {
        day: new THREE.Color(
          0.09019607843137255,
          0.39215686274509803,
          0.45098039215686275
        ),
        night: new THREE.Color(
          0.0196078431372549,
          0.00784313725490196,
          0.011764705882352941
        ),
      },
      rainy: {
        day: new THREE.Color(0.133, 0.223, 0.305),
        night: new THREE.Color(
          0.00392156862745098,
          0.011764705882352941,
          0.0196078431372549
        ),
      },
    };
  }

  initialize() {
    const color = this.fogColors[this.currentSeason][this.envTime];
    this.scene.fog = new THREE.Fog(color, this.fogNear, this.fogFar);

    if (this.game.isDebugMode) {
      this.initGUI();
    }
  }

  onEnvTimeChanged(newValue) {
    this.envTime = newValue;
    this.updateFogColor();
  }

  onSeasonChanged(newSeason) {
    this.currentSeason = newSeason;
    this.updateFogColor();
  }

  updateFogColor() {
    if (!this.scene.fog) return;

    const targetColor = this.fogColors[this.currentSeason][this.envTime];
    this.scene.fog.color.copy(targetColor);
  }

  initGUI() {
    if (!this.debugGUI || !this.scene.fog) return;

    this.debugGUI.add(
      this.scene.fog,
      'near',
      { min: 0, max: 100, step: 0.5, label: 'Fog Near' },
      'Fog'
    );
    this.debugGUI.add(
      this.scene.fog,
      'far',
      { min: 0, max: 100, step: 0.5, label: 'Fog Far' },
      'Fog'
    );
    this.debugGUI.add(
      this.scene.fog,
      'color',
      { type: 'color', label: 'Fog Color' },
      'Fog'
    );
  }

  dispose() {
    this.environmentTimeManager.offChange();
    this.seasonManager.offChange();
    this.scene.fog = null;
  }
}
