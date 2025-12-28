import * as THREE from 'three';

export class BiomeManager {
  constructor(game, worldSize) {
    this.game = game;
    this.WORLD_SIZE = worldSize;
    this.biomeTexture = null;
    this.biomeData = null;
    this.loadBiomeTexture();
  }

  loadBiomeTexture() {
    this.biomeTexture = this.game.resources.items.grassPathDensityDataTexture;
    this.biomeTexture.minFilter = THREE.NearestFilter;
    this.biomeTexture.magFilter = THREE.NearestFilter;
    this.biomeTexture.generateMipmaps = false;
    this.cacheBiomeData();
  }

  cacheBiomeData() {
    const img = this.biomeTexture.image;
    if (!img || img.naturalWidth === 0) {
      console.warn('Biome texture not loaded yet');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.biomeData = {
      data: imageData.data,
      width: canvas.width,
      height: canvas.height,
    };
  }

  getGrassDensity(worldX, worldZ) {
    if (!this.biomeData) return 1.0;

    const u = worldX / this.WORLD_SIZE + 0.5;
    const v = worldZ / this.WORLD_SIZE + 0.5;

    const pixelX = Math.floor(u * this.biomeData.width);
    const pixelY = Math.floor((1 - v) * this.biomeData.height);

    const clampedX = Math.max(0, Math.min(this.biomeData.width - 1, pixelX));
    const clampedY = Math.max(0, Math.min(this.biomeData.height - 1, pixelY));

    const idx = (clampedY * this.biomeData.width + clampedX) * 4;
    const greenChannelValue = this.biomeData.data[idx + 1];
    return greenChannelValue / 255;
  }
}
