import SnowSystem from './SnowSystem.class';
import Game from '../../../Game.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class SnowFall {
  constructor() {
    this.game = Game.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    
    // Create snow system with bounds covering the entire scene
    const snowBounds = {
      yMin: 15.0,
      yMax: 20.0,
      xRange: 40.0,
      zRange: 30.0,
      originX: 0.0,
      originZ: 0.0,
    };
    
    this.snowSystem = new SnowSystem(snowBounds);
    
    // Listen for season changes to control snow visibility
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
    const isWinterSeason = this.seasonManager.currentSeason === 'winter';
    this.snowSystem.setVisible(isWinterSeason);
  }

  update(delta, elapsedTime) {
    this.snowSystem.update(delta, elapsedTime);
  }
}