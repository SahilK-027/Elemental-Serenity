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

    // Bind the toggle method to preserve 'this' context
    this.toggleMusic = this.toggleMusic.bind(this);

    // Set up click handler
    this.button.addEventListener('click', this.toggleMusic);

    // Show the button after a delay
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
    this.isMusicEnabled = !this.isMusicEnabled;
    
    if (this.isMusicEnabled) {
      this.enableMusic();
    } else {
      this.disableMusic();
    }
    
    this.updateButtonState();
  }

  enableMusic() {
    // Start the music system
    this.musicManager.startRandomMusic();
    
    // Show toast notification
    this.toastManager.showToast('Music enabled', 'success', 2000);
  }

  disableMusic() {
    // Stop the music system
    this.musicManager.stopMusic();
    
    // Show toast notification
    this.toastManager.showToast('Music disabled', 'info', 2000);
  }

  updateButtonState() {
    if (!this.button || !this.icon) return;

    if (this.isMusicEnabled) {
      // Music is enabled
      this.button.classList.remove('muted');
      this.button.title = 'Disable Music';
      this.icon.className = 'fas fa-music';
    } else {
      // Music is disabled
      this.button.classList.add('muted');
      this.button.title = 'Enable Music';
      this.icon.className = 'fas fa-volume-mute';
    }
  }

  setupVisibilityHandlers() {
    // Bind methods to preserve 'this' context
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
    this.handleWindowFocus = this.handleWindowFocus.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handlePageHide = this.handlePageHide.bind(this);

    // Handle page visibility changes (user switching tabs, minimizing window, etc.)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Handle window focus/blur events as backup
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);

    // Handle beforeunload (user leaving the page)
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    // Handle pagehide (more reliable for mobile)
    window.addEventListener('pagehide', this.handlePageHide);
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden - pause music if it's playing
      if (this.isMusicEnabled && this.musicManager.isPlaying) {
        this.wasPlayingBeforeHide = true;
        this.musicManager.stopMusic();
      }
    } else {
      // Page is visible again - resume music if it was playing before
      if (this.isMusicEnabled && this.wasPlayingBeforeHide) {
        this.wasPlayingBeforeHide = false;
        // Small delay to ensure smooth transition
        setTimeout(() => {
          this.musicManager.startRandomMusic();
        }, 500);
      }
    }
  }

  handleWindowBlur() {
    if (this.isMusicEnabled && this.musicManager.isPlaying) {
      this.wasPlayingBeforeHide = true;
      this.musicManager.stopMusic();
    }
  }

  handleWindowFocus() {
    if (this.isMusicEnabled && this.wasPlayingBeforeHide) {
      this.wasPlayingBeforeHide = false;
      setTimeout(() => {
        this.musicManager.startRandomMusic();
      }, 500);
    }
  }

  handleBeforeUnload() {
    if (this.musicManager.isPlaying) {
      this.musicManager.stopMusic();
    }
  }

  handlePageHide() {
    if (this.musicManager.isPlaying) {
      this.musicManager.stopMusic();
    }
  }

  // Set initial state based on whether music was enabled at startup
  setInitialState(musicEnabled) {
    this.isMusicEnabled = musicEnabled;
    this.updateButtonState();
  }

  // Get current music state
  isMusicPlaying() {
    return this.isMusicEnabled && this.musicManager.isPlaying;
  }

  // Cleanup
  destroy() {
    if (this.button) {
      this.button.removeEventListener('click', this.toggleMusic);
    }
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('pagehide', this.handlePageHide);
  }
}