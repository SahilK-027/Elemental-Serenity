import * as THREE from 'three';
import EnvironmentTimeManager from '../EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../SeasonManager/SeasonManager.class';
import gsap from 'gsap';
import * as MATH from '../../../Utils/Math.class';
import grassVertexCommonChunk from '../../../../Shaders/Chunks/grass/grass.vertex_common_chunk.glsl';
import grassVertexBeginNormalChunk from '../../../../Shaders/Chunks/grass/grass.vertex_begin_normal_chunk.glsl';
import grassVertexBeginChunk from '../../../../Shaders/Chunks/grass/grass.vertex_begin_chunk.glsl';
import grassFragmentCommonChunk from '../../../../Shaders/Chunks/grass/grass.fragment_common_chunk.glsl';
import grassFragmentColorChunk from '../../../../Shaders/Chunks/grass/grass.fragment_color_chunk.glsl';
import flowersVertexShader from '../../../../Shaders/Materials/flowers/vertex.glsl';
import flowersFragmentShader from '../../../../Shaders/Materials/flowers/fragment.glsl';

export class GrassManager {
  constructor(
    game,
    biomeManager,
    worldSize,
    tileSize,
    gridCols,
    gridRows,
    gridSpacing
  ) {
    this.game = game;
    this.scene = game.scene;
    this.biomeManager = biomeManager;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;
    this.currentSeason = this.seasonManager.currentSeason;
    this.debugGUI = this.game.debug;

    this.WORLD_SIZE = worldSize;
    this.TILE_SIZE = tileSize;
    this.gridCols = gridCols;
    this.gridRows = gridRows;
    this.gridSpacing = gridSpacing;
    this.grassSize = 1.185;


    this.GRASS_PER_TILE = this.getInitialGrassDensity();

    this.FLOWERS_PER_TILE = 20;
    this.flowerInstancedMesh = null;
    this.flowerMaterial = null;

    this.sharedGeometry = null;
    this.sharedMaterial = null;
    this.sharedUniforms = null;
    this.grassInstancedMesh = null;

    this.colorConfig = this.seasonManager.getColorConfig('grass');

    this.init();

    this.isDebugMode = this.game.isDebugMode;
    if (this.isDebugMode) {
      this.initGUI();
    }
    this.environmentTimeManager.onChange((newValue, oldValue) => {
      this.onEnvTimeChanged(newValue, oldValue);
    });

    this.seasonManager.onChange((newSeason, oldSeason) => {
      this.onSeasonChanged(newSeason, oldSeason);
    });
  }

  init() {
    this.loadSharedResources();
    this.createAllGrassInSingleMesh();
    this.createFlowers();
  }


  getInitialGrassDensity() {
    const defaultDensity = 12500;

    try {
      const savedSettings = localStorage.getItem('gameSettings');
      if (!savedSettings) return defaultDensity;

      const settings = JSON.parse(savedSettings);
      const quality = settings.graphicsQuality || 'medium';


      if (quality === 'custom') {
        return settings.customGrass || defaultDensity;
      }


      const presetDensities = {
        low: 10000,
        medium: 12500,
        high: 25000,
        ultra: 50000,
      };

      return presetDensities[quality] || defaultDensity;
    } catch (error) {
      console.warn('Failed to load grass density from localStorage:', error);
      return defaultDensity;
    }
  }

  loadSharedResources() {
    const grassBlade = this.game.resources.items.grassBladeModel;
    grassBlade.scene.traverse((child) => {
      if (child.isMesh) {
        this.sharedGeometry = child.geometry;
        this.sharedGeometry.computeBoundingBox();
      }
    });

    const biomeTexture = this.game.resources.items.grassPathDensityDataTexture;
    const normalTexture = this.game.resources.items.displacedNormalMap;
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    const displacementTexture = this.game.resources.items.displacementMap;
    displacementTexture.wrapS = displacementTexture.wrapT =
      THREE.RepeatWrapping;

    const bb = this.sharedGeometry.boundingBox;
    const bladeMinY = bb ? bb.min.y : 0.0;
    const bladeHeight = bb ? bb.max.y - bb.min.y : 1.0;

    const colors = this.colorConfig[this.envTime];

    this.sharedUniforms = {
      uTime: { value: 0 },
      uDensityMap: { value: biomeTexture },
      uTerrainNormalMap: { value: normalTexture },
      uDisplacementMap: { value: displacementTexture },
      uGroundSize: { value: this.WORLD_SIZE },
      uNormalStrength: { value: 0.3 },
      uTerrainNormalScale: { value: 1.0 },
      uGrassColorDark: { value: colors.dark.clone() },
      uGrassColorLight: { value: colors.light.clone() },
      uShadowColor: { value: colors.shadow.clone() },
      uWindSpeed: { value: 1.5 },
      uWindAmplitude: { value: 1.5 },
      uWindWaveTiling: { value: 1.0 },
      uWindWaveStrength: { value: -0.5 },
      uWindBaseTiling: { value: 0.3 },
      uWindBaseStrength: { value: 1.0 },
      uBladeModelMinY: { value: bladeMinY },
      uBladeModelHeight: { value: Math.max(bladeHeight, 1e-4) },
      uDensityThreshold: { value: 0.9 },
    };

    this.sharedMaterial = this.createGrassMaterial();
  }

  onEnvTimeChanged(newValue, oldValue) {
    this.envTime = newValue;
    this.updateColors();
  }

  onSeasonChanged(newSeason, oldSeason) {
    this.currentSeason = newSeason;
    this.colorConfig = this.seasonManager.getColorConfig('grass');
    this.updateColors();
  }

  updateColors() {
    if (!this.sharedUniforms) return;

    const colors = this.colorConfig[this.envTime];

    gsap.to(this.sharedUniforms.uShadowColor.value, {
      r: colors.shadow.r,
      g: colors.shadow.g,
      b: colors.shadow.b,
      duration: 1,
      ease: 'power2.Out',
    });

    gsap.to(this.sharedUniforms.uGrassColorDark.value, {
      r: colors.dark.r,
      g: colors.dark.g,
      b: colors.dark.b,
      duration: 1,
      ease: 'power2.Out',
    });

    gsap.to(this.sharedUniforms.uGrassColorLight.value, {
      r: colors.light.r,
      g: colors.light.g,
      b: colors.light.b,
      duration: 1,
      ease: 'power2.Out',
    });

    if (this.flowerMaterial) {
      this.flowerMaterial.uniforms.uTimeColorAlpha.value =
        colors.flowerVisibility;
    }
  }

  createGrassMaterial() {
    const material = new THREE.MeshStandardMaterial();

    material.onBeforeCompile = (shader) => {
      shader.uniforms = { ...shader.uniforms, ...this.sharedUniforms };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        grassVertexCommonChunk
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        grassVertexBeginNormalChunk
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        grassVertexBeginChunk
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        grassFragmentCommonChunk
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        grassFragmentColorChunk
      );
    };

    return material;
  }

  createAllGrassInSingleMesh() {
    const cols = this.gridCols;
    const rows = this.gridRows;
    const spacing = this.gridSpacing;

    const startX = -((cols - 1) / 2) * spacing;
    const startZ = -((rows - 1) / 2) * spacing;

    const allPositions = [];
    const allScales = [];

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const tileX = startX + i * spacing;
        const tileZ = startZ + j * spacing;

        let tileGrassCount = 0;

        for (let g = 0; g < this.GRASS_PER_TILE; g++) {
          const localX = MATH.random() * this.TILE_SIZE;
          const localZ = MATH.random() * this.TILE_SIZE;

          const worldX = tileX - this.TILE_SIZE / 2 + localX;
          const worldZ = tileZ - this.TILE_SIZE / 2 + localZ;

          const density = this.biomeManager.getGrassDensity(worldX, worldZ);

          if (density >= 0.9) {
            allPositions.push({ worldX, worldZ });
            allScales.push(this.grassSize + MATH.random() * 0.5);
            tileGrassCount++;
          }
        }
      }
    }

    const totalCount = allPositions.length;
    if (totalCount === 0) {
      console.warn('❌ No grass accepted! Check density threshold.');
      return;
    }

    this.grassInstancedMesh = new THREE.InstancedMesh(
      this.sharedGeometry,
      this.sharedMaterial,
      totalCount
    );
    this.grassInstancedMesh.receiveShadow = true;
    this.grassInstancedMesh.frustumCulled = false;
    this.grassInstancedMesh.castShadow = false;

    const baseScales = new Float32Array(totalCount);
    const worldPositions = new Float32Array(totalCount * 2);

    const dummy = new THREE.Object3D();

    for (let i = 0; i < totalCount; i++) {
      const { worldX, worldZ } = allPositions[i];
      const scale = allScales[i];

      baseScales[i] = scale;
      worldPositions[i * 2] = worldX;
      worldPositions[i * 2 + 1] = worldZ;

      dummy.position.set(worldX, 0, worldZ);
      dummy.rotation.y = MATH.random() * Math.PI;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      this.grassInstancedMesh.setMatrixAt(i, dummy.matrix);
    }

    this.grassInstancedMesh.instanceMatrix.needsUpdate = true;
    this.grassInstancedMesh.position.set(0, -0.3, 0);

    this.sharedGeometry.setAttribute(
      'aBaseScale',
      new THREE.InstancedBufferAttribute(baseScales, 1)
    );
    this.sharedGeometry.setAttribute(
      'aWorldPosition',
      new THREE.InstancedBufferAttribute(worldPositions, 2)
    );

    this.scene.add(this.grassInstancedMesh);
  }

  createFlowers() {
    const texturesArray = [
      this.game.resources.items.flowerTexture1,
      this.game.resources.items.flowerTexture2,
    ];

    if (!texturesArray || texturesArray.length === 0) {
      console.warn('⚠️ Flower textures not found, skipping flowers');
      return;
    }

    const atlasCanvas = document.createElement('canvas');
    const texSize = 256;
    atlasCanvas.width = texSize * 2;
    atlasCanvas.height = texSize;
    const ctx = atlasCanvas.getContext('2d');

    const promises = texturesArray.map((texture, i) => {
      return new Promise((resolve) => {
        const img = texture.image;
        if (img && img.complete) {
          ctx.drawImage(img, i * texSize, 0, texSize, texSize);
          resolve();
        } else if (img) {
          img.onload = () => {
            ctx.drawImage(img, i * texSize, 0, texSize, texSize);
            resolve();
          };
        }
      });
    });

    Promise.all(promises).then(() => {
      const atlasTexture = new THREE.CanvasTexture(atlasCanvas);
      atlasTexture.needsUpdate = true;
      this.createFlowersWithAtlas(atlasTexture);
    });
  }

  createFlowersWithAtlas(atlasTexture) {
    const cols = this.gridCols;
    const rows = this.gridRows;
    const spacing = this.gridSpacing;

    const startX = -((cols - 1) / 2) * spacing;
    const startZ = -((rows - 1) / 2) * spacing;

    const flowerPositions = [];

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const tileX = startX + i * spacing;
        const tileZ = startZ + j * spacing;

        for (let f = 0; f < this.FLOWERS_PER_TILE; f++) {
          const localX = MATH.random() * this.TILE_SIZE;
          const localZ = MATH.random() * this.TILE_SIZE;

          const worldX = tileX - this.TILE_SIZE / 2 + localX;
          const worldZ = tileZ - this.TILE_SIZE / 2 + localZ;

          const density = this.biomeManager.getGrassDensity(worldX, worldZ);
          if (density >= 0.9) {
            flowerPositions.push({ worldX, worldZ });
          }
        }
      }
    }

    const totalFlowers = flowerPositions.length;
    if (totalFlowers === 0) {
      console.warn('❌ No flowers placed!');
      return;
    }

    const alpha = this.colorConfig[this.envTime];
    const fogUniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['fog']]);
    this.flowerMaterial = new THREE.ShaderMaterial({
      fog: true,
      uniforms: {
        ...fogUniforms,
        uTime: { value: 0 },
        uFlowerAtlas: { value: atlasTexture },
        uWindSpeed: { value: 1.5 },
        uWindAmplitude: { value: 0.3 },
        uTimeColorAlpha: { value: alpha.flowerVisibility },
      },
      vertexShader: flowersVertexShader,
      fragmentShader: flowersFragmentShader,
      side: THREE.FrontSide,
      alphaTest: 0.5,
      depthWrite: false,
      depthTest: true,
      transparent: true,
    });

    const flowerGeometry = new THREE.PlaneGeometry(0.4, 0.4);

    this.flowerInstancedMesh = new THREE.InstancedMesh(
      flowerGeometry,
      this.flowerMaterial,
      totalFlowers
    );

    this.flowerInstancedMesh.castShadow = true;
    this.flowerInstancedMesh.receiveShadow = true;

    const texOffsets = new Float32Array(totalFlowers * 2);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < totalFlowers; i++) {
      const { worldX, worldZ } = flowerPositions[i];

      const texIndex = Math.floor(MATH.random() * 3);

      texOffsets[i * 2] = texIndex * 0.5;
      texOffsets[i * 2 + 1] = 0.0;

      const scale = 0.6 + MATH.random() * 0.4;
      const yOffset = MATH.random() * 0.2;

      dummy.position.set(worldX, 0.7 + yOffset, worldZ);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();

      this.flowerInstancedMesh.setMatrixAt(i, dummy.matrix);
    }

    flowerGeometry.setAttribute(
      'aTexOffset',
      new THREE.InstancedBufferAttribute(texOffsets, 2)
    );

    this.flowerInstancedMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.flowerInstancedMesh);
  }

  update() {
    if (this.sharedUniforms) {
      this.sharedUniforms.uTime.value += 0.012;
    }

    if (this.flowerMaterial) {
      this.flowerMaterial.uniforms.uTime.value += 0.016;
    }
  }

  dispose() {
    this.environmentTimeManager.offChange();
    this.seasonManager.offChange();

    if (this.grassInstancedMesh) {
      this.scene.remove(this.grassInstancedMesh);
      this.grassInstancedMesh.dispose();
    }

    if (this.flowerInstancedMesh) {
      this.scene.remove(this.flowerInstancedMesh);
      this.flowerInstancedMesh.dispose();
    }

    if (this.flowerMaterial) {
      this.flowerMaterial.dispose();
    }

    if (this.sharedGeometry) {
      this.sharedGeometry.dispose();
    }

    if (this.sharedMaterial) {
      this.sharedMaterial.dispose();
    }
  }


  regenerateGrass() {


    if (this.grassInstancedMesh) {
      this.scene.remove(this.grassInstancedMesh);
      this.grassInstancedMesh.dispose();
      this.grassInstancedMesh = null;
    }


    if (this.flowerInstancedMesh) {
      this.scene.remove(this.flowerInstancedMesh);
      this.flowerInstancedMesh.dispose();
      this.flowerInstancedMesh = null;
    }


    this.createAllGrassInSingleMesh();
    this.createFlowers();
  }

  initGUI() {
    this.debugGUI.add(
      this.sharedUniforms.uNormalStrength,
      'value',
      { min: 0, max: 5, step: 0.1, label: 'Normal Strength' },
      'Grass'
    );
    this.debugGUI.add(
      this.sharedUniforms.uShadowColor,
      'value',
      { type: 'color', label: 'Shadow Color' },
      'Grass'
    );
    this.debugGUI.add(
      this.sharedUniforms.uGrassColorDark,
      'value',
      { type: 'color', label: 'Grass Color Dark' },
      'Grass'
    );
    this.debugGUI.add(
      this.sharedUniforms.uGrassColorLight,
      'value',
      { type: 'color', label: 'Grass Color Light' },
      'Grass'
    );
    this.debugGUI.add(
      this.sharedUniforms.uTerrainNormalScale,
      'value',
      { min: 0, max: 5, step: 0.1, label: 'Terrain Normal Scale' },
      'Grass'
    );
    this.debugGUI.add(
      this.sharedUniforms.uWindSpeed,
      'value',
      { min: 0, max: 50, step: 0.1, label: 'Wind Speed' },
      'Grass'
    );
    this.debugGUI.add(
      this.sharedUniforms.uWindAmplitude,
      'value',
      { min: 0, max: 50, step: 0.1, label: 'Wind Amplitude' },
      'Grass'
    );
    this.debugGUI.add(
      this.sharedUniforms.uWindWaveTiling,
      'value',
      { min: 0, max: 50, step: 0.1, label: 'Wind Wave Tiling' },
      'Grass'
    );
    this.debugGUI.add(
      this.sharedUniforms.uWindWaveStrength,
      'value',
      { min: -5, max: 5, step: 0.1, label: 'Wind Wave Strength' },
      'Grass'
    );
    this.debugGUI.add(
      this.sharedUniforms.uWindBaseTiling,
      'value',
      { min: 0, max: 5, step: 0.1, label: 'Wind Base Tiling' },
      'Grass'
    );
    this.debugGUI.add(
      this.sharedUniforms.uWindBaseStrength,
      'value',
      { min: 0, max: 5, step: 0.1, label: 'Wind Base Strength' },
      'Grass'
    );
  }
}
