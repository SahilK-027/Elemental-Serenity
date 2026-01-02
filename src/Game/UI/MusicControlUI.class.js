import { Console } from '../../utils/consoleStylish';

export default class MusicControlUI {
  constructor(musicManager, toastManager) {
    this.musicManager = musicManager;
    this.toastManager = toastManager;
    this.button = null;
    this.icon = null;
    this.isMusicEnabled = true;
    this.wasPlayingBeforeHide = false;

    this.init();
    this.setupVisibilityHandlers();
  }

  init() {
    this.button = document.getElementById('music-control');
    this.icon = this.button.querySelector('i');

    if (!this.button || !this.icon) {
      console.error('Music control button not found in DOM');
      return;
    }

    this.toggleMusic = this.toggleMusic.bind(this);

    this.button.addEventListener('click', this.toggleMusic);

    setTimeout(() => {
      this.show();
    }, 1000);
  }

  show() {
    if (this.button) {
      this.button.classList.add('show');
    }
  }

  hide() {
    if (this.button) {
      this.button.classList.remove('show');
    }
  }

  toggleMusic() {
    if (navigator.haptic) {
      navigator.haptic([{ intensity: 0.7, sharpness: 0.1 }]);
    } else if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    this.isMusicEnabled = !this.isMusicEnabled;

    Console.logAudioToggle(this.isMusicEnabled);

    if (this.isMusicEnabled) {
      this.enableMusic();
    } else {
      this.disableMusic();
    }

    this.updateButtonState();
  }

  enableMusic() {
    this.musicManager.resumeMusic();
  }

  disableMusic() {
    this.musicManager.pauseMusic();

    this.toastManager.showToast('Music disabled', 'info', 2000);
  }

  updateButtonState() {
    if (!this.button || !this.icon) return;

    if (this.isMusicEnabled) {
      this.button.classList.remove('muted');
      this.button.title = 'Disable Music';
      this.icon.className = 'fas fa-music';
    } else {
      this.button.classList.add('muted');
      this.button.title = 'Enable Music';
      this.icon.className = 'fas fa-volume-mute';
    }
  }

  setupVisibilityHandlers() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
    this.handleWindowFocus = this.handleWindowFocus.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handlePageHide = this.handlePageHide.bind(this);
    this.handleUnload = this.handleUnload.bind(this);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    window.addEventListener('pagehide', this.handlePageHide);
    window.addEventListener('unload', this.handleUnload);
  }

  handleVisibilityChange() {
    if (document.hidden) {
      if (this.isMusicEnabled && this.musicManager.isPlaying) {
        this.wasPlayingBeforeHide = true;
        this.musicManager.pauseMusic();
      }
      this.musicManager.audioManager.forceStopAllMusic();
    } else {
      if (this.isMusicEnabled && this.wasPlayingBeforeHide) {
        this.wasPlayingBeforeHide = false;
        setTimeout(() => {
          this.musicManager.resumeMusic();
        }, 500);
      }
    }
  }

  handleWindowBlur() {
    if (this.isMusicEnabled && this.musicManager.isPlaying) {
      this.wasPlayingBeforeHide = true;
      this.musicManager.pauseMusic();
    }
    this.musicManager.audioManager.forceStopAllMusic();
  }

  handleWindowFocus() {
    if (this.isMusicEnabled && this.wasPlayingBeforeHide) {
      this.wasPlayingBeforeHide = false;
      setTimeout(() => {
        this.musicManager.resumeMusic();
      }, 500);
    }
  }

  handleBeforeUnload() {
    this.musicManager.audioManager.forceStopAllMusic();
    this.musicManager.stopMusic();
  }

  handlePageHide() {
    this.musicManager.audioManager.forceStopAllMusic();
    this.musicManager.stopMusic();
  }

  handleUnload() {
    this.musicManager.audioManager.forceStopAllMusic();
  }

  setInitialState(musicEnabled) {
    this.isMusicEnabled = musicEnabled;
    this.updateButtonState();
  }

  isMusicPlaying() {
    return this.isMusicEnabled && this.musicManager.isPlaying;
  }

  destroy() {
    if (this.button) {
      this.button.removeEventListener('click', this.toggleMusic);
    }

    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('pagehide', this.handlePageHide);
    window.removeEventListener('unload', this.handleUnload);
  }
}
