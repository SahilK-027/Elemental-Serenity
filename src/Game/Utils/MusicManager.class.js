import EventEmitter from './EventEmitter.class';

export default class MusicManager extends EventEmitter {
  constructor(audioManager) {
    super();

    this.audioManager = audioManager;
    this.musicTracks = [
      { id: 'morningPetalsMusic', name: 'Morning Petals' },
      { id: 'windowLightMusic', name: 'Window Light' },
      { id: 'forestDreamsMusic', name: 'Forest Dreams' },
    ];

    this.currentTrackIndex = -1;
    this.isPlaying = false;
    this.isPaused = false;
    this.fadeInDuration = 2000;
    this.fadeOutDuration = 1000;
    this.trackCheckInterval = null;
    this.pausedTrackId = null;

    this.init();
  }

  init() {}

  startRandomMusic() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.isPaused = false;
    this.playNextRandomTrack();
  }

  pauseMusic() {
    if (!this.isPlaying) return;

    this.isPaused = true;
    this.isPlaying = false;

    if (
      this.audioManager.currentMusic &&
      this.audioManager.currentMusic.isPlaying
    ) {
      this.pausedTrackId = this.getCurrentTrack()?.id;
      this.audioManager.stopMusic(true, this.fadeOutDuration);
    }

    if (this.trackCheckInterval) {
      clearInterval(this.trackCheckInterval);
      this.trackCheckInterval = null;
    }
  }

  resumeMusic() {
    if (!this.isPaused) {
      this.startRandomMusic();
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;

    if (this.pausedTrackId && this.currentTrackIndex >= 0) {
      const track = this.musicTracks[this.currentTrackIndex];
      if (track && track.id === this.pausedTrackId) {
        this.playTrackWithoutLoop(track);
        this.startTrackMonitoring(track.id);
        return;
      }
    }

    this.playNextRandomTrack();
  }

  stopMusic() {
    this.isPlaying = false;
    this.isPaused = false;
    this.pausedTrackId = null;
    this.audioManager.stopMusic(true, this.fadeOutDuration);
    this.currentTrackIndex = -1;

    if (this.trackCheckInterval) {
      clearInterval(this.trackCheckInterval);
      this.trackCheckInterval = null;
    }
  }

  playNextRandomTrack() {
    if (!this.isPlaying) return;

    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * this.musicTracks.length);
    } while (
      nextIndex === this.currentTrackIndex &&
      this.musicTracks.length > 1
    );

    this.currentTrackIndex = nextIndex;
    const track = this.musicTracks[this.currentTrackIndex];

    this.playTrackWithoutLoop(track);

    this.trigger('trackChanged', {
      name: track.name,
      id: track.id,
    });

    this.startTrackMonitoring(track.id);
  }

  playTrackWithoutLoop(track) {
    if (
      this.audioManager.currentMusic &&
      this.audioManager.currentMusic.isPlaying
    ) {
      this.audioManager.stopMusic(false);
    }

    const music = this.audioManager.sounds[track.id];
    if (!music) {
      console.warn(`Music ${track.id} not found`);
      return;
    }

    this.audioManager.currentMusic = music;
    music.setLoop(false);

    music.setVolume(0);
    music.play();
    this.audioManager.fadeVolume(
      music,
      this.audioManager.musicVolume * this.audioManager.masterVolume,
      this.fadeInDuration
    );
  }

  startTrackMonitoring(trackId) {
    if (this.trackCheckInterval) {
      clearInterval(this.trackCheckInterval);
    }

    const audio = this.audioManager.sounds[trackId];
    if (!audio) return;

    const duration = audio.buffer ? audio.buffer.duration : 0;
    let startTime = performance.now();

    this.trackCheckInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(this.trackCheckInterval);
        return;
      }

      const elapsed = (performance.now() - startTime) / 1000;

      if (elapsed >= duration - 0.5 || !audio.isPlaying) {
        clearInterval(this.trackCheckInterval);
        this.trackCheckInterval = null;

        setTimeout(() => {
          if (this.isPlaying) {
            this.playNextRandomTrack();
          }
        }, 1000);
      }
    }, 1000);
  }

  getCurrentTrack() {
    if (this.currentTrackIndex >= 0) {
      return this.musicTracks[this.currentTrackIndex];
    }
    return null;
  }

  addTrack(id, name) {
    this.musicTracks.push({ id, name });
  }

  removeTrack(id) {
    this.musicTracks = this.musicTracks.filter((track) => track.id !== id);
  }
}
