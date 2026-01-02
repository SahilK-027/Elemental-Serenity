import SeasonManager from '../World/Managers/SeasonManager/SeasonManager.class';

export default class LightningButtonUI {
  constructor(lightning) {
    this.lightning = lightning;
    this.seasonManager = SeasonManager.getInstance();
    this.wrapper = null;
    this.button = null;
    this.isVisible = false;

    this.init();
    this.setupSeasonListener();
  }

  init() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'lightning-btn-wrapper';

    this.button = document.createElement('button');
    this.button.id = 'lightning-strike';
    this.button.className = 'lightning-btn';
    this.button.title = 'Strike Lightning';
    this.button.innerHTML = '<i class="fas fa-bolt"></i>';

    const arcs = document.createElement('div');
    arcs.className = 'electric-arcs';
    arcs.innerHTML = `
      <span class="arc arc-1"></span>
      <span class="arc arc-2"></span>
      <span class="arc arc-3"></span>
      <span class="arc arc-4"></span>
    `;

    this.wrapper.appendChild(this.button);
    this.wrapper.appendChild(arcs);

    const controlPanel = document.getElementById('control-panel');
    if (controlPanel) {
      const musicControl = document.getElementById('music-control');
      if (musicControl) {
        controlPanel.insertBefore(this.wrapper, musicControl);
      } else {
        controlPanel.appendChild(this.wrapper);
      }
    }

    this.handleClick = this.handleClick.bind(this);
    this.button.addEventListener('click', this.handleClick);

    this.updateVisibility(this.seasonManager.currentSeason);
  }

  setupSeasonListener() {
    this.handleSeasonChange = this.handleSeasonChange.bind(this);
    this.seasonManager.on('seasonChanged', this.handleSeasonChange);
  }

  handleSeasonChange(newSeason) {
    this.updateVisibility(newSeason);
  }

  updateVisibility(season) {
    const shouldShow = season === 'rainy';

    if (shouldShow && !this.isVisible) {
      this.show();
    } else if (!shouldShow && this.isVisible) {
      this.hide();
    }
  }

  show() {
    if (this.wrapper) {
      this.isVisible = true;
      this.wrapper.classList.add('show');
    }
  }

  hide() {
    if (this.wrapper) {
      this.isVisible = false;
      this.wrapper.classList.remove('show');
    }
  }

  handleClick() {
    if (this.lightning) {
      if (navigator.haptic) {
        navigator.haptic('error');
      } else if (navigator.vibrate) {
        navigator.vibrate([50, 30, 100, 50, 200]);
      }

      this.wrapper.classList.add('striking');
      setTimeout(() => {
        this.wrapper.classList.remove('striking');
      }, 400);

      this.lightning.manualStrike();
    }
  }

  destroy() {
    if (this.button) {
      this.button.removeEventListener('click', this.handleClick);
    }
    if (this.wrapper) {
      this.wrapper.remove();
    }
    this.seasonManager.off('seasonChanged', this.handleSeasonChange);
  }
}
