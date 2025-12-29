import EventEmitter from './EventEmitter.class';

export default class MusicManager extends EventEmitter {
  constructor(audioManager) {
    super();
    
    this.audioManager = audioManager;
    this.musicTracks = [
      { id: 'morningPetalsMusic', name: 'Morning Petals' },
      { id: 'windowLightMusic', name: 'Window Light' },
      { id: 'forestDreamsMusic', name: 'Forest Dreams' }
    ];
    
    this.currentTrackIndex = -1;
    this.isPlaying = false;
    this.fadeInDuration = 2000;
    this.fadeOutDuration = 1000;
    this.trackCheckInterval = null;
    
    this.init();
  }

  init() {
    // We'll monitor track progress manually since Three.js Audio events can be unreliable
  }

  startRandomMusic() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.playNextRandomTrack();
  }

  stopMusic() {
    this.isPlaying = false;
    this.audioManager.stopMusic(true, this.fadeOutDuration);
    this.currentTrackIndex = -1;
    
    if (this.trackCheckInterval) {
      clearInterval(this.trackCheckInterval);
      this.trackCheckInterval = null;
    }
  }

  playNextRandomTrack() {
    if (!this.isPlaying) return;
    
    // Get a random track different from the current one
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * this.musicTracks.length);
    } while (nextIndex === this.currentTrackIndex && this.musicTracks.length > 1);
    
    this.currentTrackIndex = nextIndex;
    const track = this.musicTracks[this.currentTrackIndex];
    
    // Play the track without loop
    this.playTrackWithoutLoop(track);
    
    // Emit event for toast notification
    this.trigger('trackChanged', {
      name: track.name,
      id: track.id
    });
    
    // Start monitoring for track end
    this.startTrackMonitoring(track.id);
  }

  playTrackWithoutLoop(track) {
    // Stop current music first
    if (this.audioManager.currentMusic && this.audioManager.currentMusic.isPlaying) {
      this.audioManager.stopMusic(false);
    }

    const music = this.audioManager.sounds[track.id];
    if (!music) {
      console.warn(`Music ${track.id} not found`);
      return;
    }

    // Set as current music
    this.audioManager.currentMusic = music;
    music.setLoop(false); // Important: no loop for random playlist
    
    // Fade in
    music.setVolume(0);
    music.play();
    this.audioManager.fadeVolume(music, this.audioManager.musicVolume * this.audioManager.masterVolume, this.fadeInDuration);
  }

  startTrackMonitoring(trackId) {
    if (this.trackCheckInterval) {
      clearInterval(this.trackCheckInterval);
    }

    const audio = this.audioManager.sounds[trackId];
    if (!audio) return;

    // Get the audio buffer duration
    const duration = audio.buffer ? audio.buffer.duration : 0;
    let startTime = performance.now();
    
    this.trackCheckInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(this.trackCheckInterval);
        return;
      }

      const elapsed = (performance.now() - startTime) / 1000;
      
      // Check if track should have ended (with some buffer time)
      if (elapsed >= duration - 0.5 || !audio.isPlaying) {
        clearInterval(this.trackCheckInterval);
        this.trackCheckInterval = null;
        
        // Wait a moment then play next track
        setTimeout(() => {
          if (this.isPlaying) {
            this.playNextRandomTrack();
          }
        }, 1000);
      }
    }, 1000); // Check every second
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
    this.musicTracks = this.musicTracks.filter(track => track.id !== id);
  }
}