import RainSystem from './RainSystem.class';
import Game from '../../../Game.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class Rain {
  constructor() {
    this.game = Game.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    
    // Create rain system with bounds covering the entire scene
    const rainBounds = {
      yMin: 15.0,
      yMax: 20.0,
      xRange: 40.0,
      zRange: 40.0,
      originX: 0.0,
      originZ: 0.0,
    };
    
    this.rainSystem = new RainSystem(rainBounds);
    
    // Listen for season changes to control rain visibility
    this.seasonManager.onChange((newSeason, oldSeason) => {
      this.onSeasonChanged(newSeason, oldSeason);
    });
    
    // Set initial visibility based on current season
    this.updateVisibility();
  }

  onSeasonChanged(newSeason, oldSeason) {
    this.updateVisibility();
  }

  updateVisibility() {
    const isRainySeason = this.seasonManager.currentSeason === 'rainy';
    this.rainSystem.setVisible(isRainySeason);
  }

  update(delta, elapsedTime) {
    this.rainSystem.update(delta, elapsedTime);
  }
}