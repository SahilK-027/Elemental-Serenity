import * as THREE from 'three';
import EventEmitter from './EventEmitter.class';

export default class AudioManager extends EventEmitter {
  constructor(resourceLoader) {
    super();
    
    this.resources = resourceLoader;
    this.listener = new THREE.AudioListener();
    this.sounds = {};
    this.currentMusic = null;
    this.masterVolume = 1.0;
    this.musicVolume = 0.7;
    this.soundVolume = 0.8;
    
    this.init();
  }

  init() {
    // Create audio objects for all loaded audio files
    this.createAudioObjects();
  }

  createAudioObjects() {
    const audioAssets = [
      // Music
      'morningPetalsMusic',
      'windowLightMusic',
      'forestDreamsMusic',
      // Nature sounds
      'birds1Sound', 'birds2Sound', 'birds3Sound', 'birds4Sound',
      'cricketsSound', 'fireBurningSound', 'owlHowlingSound',
      'rainSound', 'lakeWavesSound', 'wolfHowlingSound',
      'thunderDistantSound', 'thunderStrikeSound',
      // UI sounds
      'clickSound', 'hoverSound'
    ];

    audioAssets.forEach(assetId => {
      if (this.resources.items[assetId]) {
        const audio = new THREE.Audio(this.listener);
        audio.setBuffer(this.resources.items[assetId]);
        
        // Set default volumes based on type
        if (assetId.includes('Music')) {
          audio.setVolume(this.musicVolume * this.masterVolume);
        } else {
          audio.setVolume(this.soundVolume * this.masterVolume);
        }
        
        this.sounds[assetId] = audio;
      }
    });
  }

  // Music controls
  playMusic(musicId, fadeIn = true, fadeDuration = 2000) {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.stopMusic(true, fadeDuration / 2);
    }

    const music = this.sounds[musicId];
    if (!music) {
      console.warn(`Music ${musicId} not found`);
      return;
    }

    this.currentMusic = music;
    music.setLoop(true);
    
    if (fadeIn) {
      music.setVolume(0);
      music.play();
      this.fadeVolume(music, this.musicVolume * this.masterVolume, fadeDuration);
    } else {
      music.setVolume(this.musicVolume * this.masterVolume);
      music.play();
    }
  }

  stopMusic(fadeOut = true, fadeDuration = 1000) {
    if (!this.currentMusic || !this.currentMusic.isPlaying) return;

    if (fadeOut) {
      const musicToStop = this.currentMusic; // Store reference
      this.fadeVolume(this.currentMusic, 0, fadeDuration, () => {
        if (musicToStop && musicToStop.isPlaying) {
          musicToStop.stop();
        }
        if (this.currentMusic === musicToStop) {
          this.currentMusic = null;
        }
      });
    } else {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  // Force stop all music regardless of state
  forceStopAllMusic() {
    // Stop current music without checks
    if (this.currentMusic) {
      try {
        this.currentMusic.stop();
      } catch (e) {
        console.warn('Error stopping current music:', e);
      }
      this.currentMusic = null;
    }
    
    // Stop all music sounds directly
    Object.keys(this.sounds).forEach(soundId => {
      if (soundId.includes('Music')) {
        const sound = this.sounds[soundId];
        if (sound && sound.isPlaying) {
          try {
            sound.stop();
          } catch (e) {
            console.warn(`Error stopping ${soundId}:`, e);
          }
        }
      }
    });
  }

  // Sound effects
  playSound(soundId, volume = null, loop = false) {
    const sound = this.sounds[soundId];
    if (!sound) {
      console.warn(`Sound ${soundId} not found`);
      return;
    }

    // Stop if already playing
    if (sound.isPlaying) {
      sound.stop();
    }

    sound.setLoop(loop);
    sound.setVolume(volume !== null ? volume * this.masterVolume : this.soundVolume * this.masterVolume);
    sound.play();
    
    return sound;
  }

  stopSound(soundId) {
    const sound = this.sounds[soundId];
    if (sound && sound.isPlaying) {
      sound.stop();
    }
  }

  // Volume controls
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume * this.masterVolume);
    }
  }

  setSoundVolume(volume) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  updateAllVolumes() {
    Object.keys(this.sounds).forEach(soundId => {
      const sound = this.sounds[soundId];
      if (soundId.includes('Music')) {
        sound.setVolume(this.musicVolume * this.masterVolume);
      } else {
        sound.setVolume(this.soundVolume * this.masterVolume);
      }
    });
  }

  // Utility methods
  fadeVolume(audio, targetVolume, duration, onComplete = null) {
    const startVolume = audio.getVolume();
    const volumeDiff = targetVolume - startVolume;
    const startTime = performance.now();

    const fade = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentVolume = startVolume + (volumeDiff * progress);
      audio.setVolume(currentVolume);

      if (progress < 1) {
        requestAnimationFrame(fade);
      } else if (onComplete) {
        onComplete();
      }
    };

    fade();
  }

  // Add listener to camera for positional audio
  addListenerToCamera(camera) {
    camera.cameraInstance.add(this.listener);
  }

  // Get random bird sound
  getRandomBirdSound() {
    const birdSounds = ['birds1Sound', 'birds2Sound', 'birds3Sound', 'birds4Sound'];
    return birdSounds[Math.floor(Math.random() * birdSounds.length)];
  }

  // Cleanup
  dispose() {
    Object.values(this.sounds).forEach(sound => {
      if (sound.isPlaying) {
        sound.stop();
      }
    });
    this.sounds = {};
    this.currentMusic = null;
  }
}