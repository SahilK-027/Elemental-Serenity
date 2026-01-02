import * as THREE from 'three';
import EventEmitter from './EventEmitter.class';

export default class AudioManager extends EventEmitter {
  constructor(resourceLoader) {
    super();

    this.resources = resourceLoader;
    this.listener = new THREE.AudioListener();
    this.sounds = {};
    this.currentMusic = null;
    this.masterVolume = 0.5;
    this.musicVolume = 0.5;
    this.soundVolume = 0.5;

    this.init();
  }

  init() {
    this.createAudioObjects();
  }

  createAudioObjects() {
    const audioAssets = [
      'morningPetalsMusic',
      'windowLightMusic',
      'forestDreamsMusic',

      'birds1Sound',
      'birds2Sound',
      'birds3Sound',
      'birds4Sound',
      'cricketsSound',
      'fireBurningSound',
      'owlHowlingSound',
      'owlHootingSound',
      'rainSound',
      'lakeWavesSound',
      'wolfHowlingSound',
      'thunderDistantSound',
      'thunderStrikeSound',

      'clickSound',
      'hoverSound',
    ];

    audioAssets.forEach((assetId) => {
      if (this.resources.items[assetId]) {
        const audio = new THREE.Audio(this.listener);
        audio.setBuffer(this.resources.items[assetId]);

        if (assetId.includes('Music')) {
          audio.setVolume(this.musicVolume * this.masterVolume);
        } else {
          audio.setVolume(this.soundVolume * this.masterVolume);
        }

        this.sounds[assetId] = audio;
      }
    });
  }

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
      this.fadeVolume(
        music,
        this.musicVolume * this.masterVolume,
        fadeDuration
      );
    } else {
      music.setVolume(this.musicVolume * this.masterVolume);
      music.play();
    }
  }

  stopMusic(fadeOut = true, fadeDuration = 1000) {
    if (!this.currentMusic || !this.currentMusic.isPlaying) return;

    if (fadeOut) {
      const musicToStop = this.currentMusic;
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

  forceStopAllMusic() {
    if (this.currentMusic) {
      try {
        this.currentMusic.stop();
      } catch (e) {
        console.warn('Error stopping current music:', e);
      }
      this.currentMusic = null;
    }

    Object.keys(this.sounds).forEach((soundId) => {
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

  playSound(soundId, volume = null, loop = false) {
    const sound = this.sounds[soundId];
    if (!sound) {
      console.warn(`Sound ${soundId} not found`);
      return;
    }

    if (sound.isPlaying) {
      sound.stop();
    }

    sound.setLoop(loop);
    sound.setVolume(
      volume !== null
        ? volume * this.masterVolume
        : this.soundVolume * this.masterVolume
    );
    sound.play();

    return sound;
  }

  stopSound(soundId) {
    const sound = this.sounds[soundId];
    if (sound && sound.isPlaying) {
      sound.stop();
    }
  }

  stopAllAmbientSounds() {
    const ambientSoundIds = [
      'birds1Sound',
      'birds2Sound',
      'birds3Sound',
      'birds4Sound',
      'cricketsSound',
      'owlHowlingSound',
      'owlHootingSound',
      'rainSound',
      'wolfHowlingSound',
      'thunderDistantSound',
      'fireBurningSound',
      'lakeWavesSound',
    ];

    ambientSoundIds.forEach((soundId) => {
      this.stopSound(soundId);
    });
  }

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
    Object.keys(this.sounds).forEach((soundId) => {
      const sound = this.sounds[soundId];
      if (soundId.includes('Music')) {
        sound.setVolume(this.musicVolume * this.masterVolume);
      } else {
        sound.setVolume(this.soundVolume * this.masterVolume);
      }
    });
  }

  fadeVolume(audio, targetVolume, duration, onComplete = null) {
    const startVolume = audio.getVolume();
    const volumeDiff = targetVolume - startVolume;
    const startTime = performance.now();

    const fade = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentVolume = startVolume + volumeDiff * progress;
      audio.setVolume(currentVolume);

      if (progress < 1) {
        requestAnimationFrame(fade);
      } else if (onComplete) {
        onComplete();
      }
    };

    fade();
  }

  addListenerToCamera(camera) {
    camera.cameraInstance.add(this.listener);
  }

  getRandomBirdSound() {
    const birdSounds = [
      'birds1Sound',
      'birds2Sound',
      'birds3Sound',
      'birds4Sound',
    ];
    return birdSounds[Math.floor(Math.random() * birdSounds.length)];
  }

  dispose() {
    Object.values(this.sounds).forEach((sound) => {
      if (sound.isPlaying) {
        sound.stop();
      }
    });
    this.sounds = {};
    this.currentMusic = null;
  }
}
