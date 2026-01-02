import * as THREE from 'three';
import Game from '../../../Game.class';
import { BiomeManager } from '../../Managers/BiomeManager/BiomeManager.class';
import { GrassManager } from '../../Managers/GrassManager/GrassManager.class';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';
import groundVertexCommonChunk from '../../../../Shaders/Chunks/ground/ground.vertex_common_chunk.glsl';
import groundVertexBeginChunk from '../../../../Shaders/Chunks/ground/ground.vertex_begin_chunk.glsl';
import groundFragmentCommonChunk from '../../../../Shaders/Chunks/ground/ground.fragment_common_chunk.glsl';
import groundFragmentColorChunk from '../../../../Shaders/Chunks/ground/ground.fragment_color_chunk.glsl';
import waterVertexCommonChunk from '../../../../Shaders/Chunks/water/water.vertex_common_chunk.glsl';
import waterVertexBeginChunk from '../../../../Shaders/Chunks/water/water.vertex_begin_chunk.glsl';
import waterFragmentCommonChunk from '../../../../Shaders/Chunks/water/water.fragment_common_chunk.glsl';
import waterFragmentColorChunk from '../../../../Shaders/Chunks/water/water.fragment_color_chunk.glsl';

export default class Ground {
  constructor({
    groundSize = 11,
    gridCols = 3,
    gridRows = 3,
    gridSpacing = null,
    gridY = 0.0,
  } = {}) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.GROUND_SIZE = groundSize;
    this.gridCols = gridCols;
    this.gridRows = gridRows;
    this.gridSpacing = gridSpacing ?? this.GROUND_SIZE;
    this.gridY = gridY;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;
    this.currentSeason = this.seasonManager.currentSeason;

    this.colorConfig = this.seasonManager.getColorConfig('ground');

    this.debugGUI = this.game.debug;

    this.WORLD_SIZE = this.gridCols * this.GROUND_SIZE;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.biomeManager = new BiomeManager(this.game, this.WORLD_SIZE);

    this.grassManager = new GrassManager(
      this.game,
      this.biomeManager,
      this.WORLD_SIZE,
      this.GROUND_SIZE,
      this.gridCols,
      this.gridRows,
      this.gridSpacing
    );

    this.setGrid();
    this.addWaterRipples();

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

  setGrid() {
    const segments = 1;
    this.gridGeometry = new THREE.PlaneGeometry(
      this.GROUND_SIZE,
      this.GROUND_SIZE,
      segments,
      segments
    );

    this.groundMaterial = new THREE.MeshStandardMaterial({
      roughness: 1.0,
      metalness: 0.0,
    });

    const biomeTexture = this.game.resources.items.grassPathDensityDataTexture;
    biomeTexture.wrapS = biomeTexture.wrapT = THREE.ClampToEdgeWrapping;

    const displacementTexture = this.game.resources.items.displacementMap;
    displacementTexture.wrapS = displacementTexture.wrapT =
      THREE.RepeatWrapping;
    const perlinNoise = this.game.resources.items.perlinNoise;
    perlinNoise.wrapS = perlinNoise.wrapT = THREE.RepeatWrapping;

    const groundRockMap = this.game.resources.items.groundRockMap;
    groundRockMap.wrapS = groundRockMap.wrapT = THREE.RepeatWrapping;

    const groundRockAO = this.game.resources.items.groundRockAOMap;
    groundRockAO.wrapS = groundRockAO.wrapT = THREE.RepeatWrapping;

    const colors = this.colorConfig[this.envTime];

    this.customGroundUniforms = {
      uDensityMap: { value: biomeTexture },
      uGroundSize: {
        value: new THREE.Vector3(this.WORLD_SIZE, 0, this.WORLD_SIZE),
      },
      uDisplacementMap: { value: displacementTexture },
      uPerlinNoise: { value: perlinNoise },
      uGroundRockMap: { value: groundRockMap },
      uGroundRockAO: { value: groundRockAO },
      uGroundColorLight: { value: colors.uGroundColorLight.clone() },
      uGroundColorDark: { value: colors.uGroundColorDark.clone() },
      uGroundColorBelowGrass: { value: colors.uGroundColorBelowGrass.clone() },
      uRockColor: { value: colors.uRockColor.clone() },
      uHeightMap: { value: groundRockMap },
      uRockTiling: { value: 6.0 },
      uWaterShallow: { value: colors.uWaterShallow.clone() },
      uWaterDeep: { value: colors.uWaterDeep.clone() },
      uWaterDepthIntensity: { value: 1.0 },
    };

    const configureTexture = (texture, repeat = 1) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(repeat, repeat);
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy =
        this.game.renderer.rendererInstance.capabilities.getMaxAnisotropy();
      texture.generateMipmaps = true;
    };

    configureTexture(displacementTexture);
    configureTexture(perlinNoise);
    configureTexture(
      groundRockMap,
      this.customGroundUniforms.uRockTiling.value
    );
    configureTexture(groundRockAO, this.customGroundUniforms.uRockTiling.value);

    this.groundMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = { ...shader.uniforms, ...this.customGroundUniforms };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        groundVertexCommonChunk
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        groundVertexBeginChunk
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        groundFragmentCommonChunk
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        groundFragmentColorChunk
      );
    };

    const geometries = [];
    const cols = 5;
    const rows = 5;
    const spacing = this.gridSpacing;
    const startX = -((cols - 1) / 2) * spacing;
    const startZ = -((rows - 1) / 2) * spacing;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = startX + i * spacing;
        const z = startZ + j * spacing;

        let geo = this.gridGeometry.clone();
        geo.rotateX(-Math.PI / 2);
        geo.translate(x, this.gridY, z);
        geometries.push(geo);
      }
    }

    const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
    geometries.forEach((g) => g.dispose());
    mergedGeometry.computeVertexNormals();

    const groundMesh = new THREE.Mesh(mergedGeometry, this.groundMaterial);
    groundMesh.receiveShadow = true;
    this.group.add(groundMesh);
  }

  onEnvTimeChanged(newValue, oldValue) {
    this.envTime = newValue;
    this.updateColors();
  }

  onSeasonChanged(newSeason, oldSeason) {
    this.currentSeason = newSeason;
    this.colorConfig = this.seasonManager.getColorConfig('ground');
    this.updateColors();
  }

  updateColors() {
    if (!this.customGroundUniforms) return;

    const colors = this.colorConfig[this.envTime];

    this.customGroundUniforms.uGroundColorLight.value.copy(
      colors.uGroundColorLight
    );
    this.customGroundUniforms.uGroundColorDark.value.copy(
      colors.uGroundColorDark
    );
    this.customGroundUniforms.uGroundColorBelowGrass.value.copy(
      colors.uGroundColorBelowGrass
    );
    this.customGroundUniforms.uRockColor.value.copy(colors.uRockColor);
    this.customGroundUniforms.uWaterShallow.value.copy(colors.uWaterShallow);
    this.customGroundUniforms.uWaterDeep.value.copy(colors.uWaterDeep);
  }

  addWaterRipples() {
    this.waterRipplesGeo = new THREE.PlaneGeometry(
      this.GROUND_SIZE + 0.5,
      this.GROUND_SIZE + 2,
      1,
      1
    );
    this.waterRipplesMat = new THREE.MeshStandardMaterial({
      color: 'black',
      transparent: true,
    });

    const biomeTexture = this.game.resources.items.grassPathDensityDataTexture;
    biomeTexture.wrapS = biomeTexture.wrapT = THREE.ClampToEdgeWrapping;

    const waterDepthTexture = this.game.resources.items.waterDepthMap;
    waterDepthTexture.wrapS = waterDepthTexture.wrapT = THREE.RepeatWrapping;

    const perlinNoise = this.game.resources.items.perlinNoise;
    perlinNoise.wrapS = perlinNoise.wrapT = THREE.RepeatWrapping;

    this.customWaterRipplesUniforms = {
      uTime: { value: 0 },
      uDensityMap: { value: biomeTexture },
      uGroundSize: {
        value: new THREE.Vector3(this.WORLD_SIZE, 0, this.WORLD_SIZE),
      },
      uPerlinNoise: { value: perlinNoise },
      uWaterDepthTexture: { value: waterDepthTexture },
      uRipplesRatio: { value: 0.0 },
      uDensityMaskMin: { value: 0.05 },
      uDensityMaskMax: { value: 0.15 },
      uShoreMaskThreshold: { value: 0.4 },
      uNoiseScale1: { value: 3.0 },
      uNoiseScale2: { value: 5.0 },
      uNoiseSpeed1: { value: 0.5 },
      uNoiseSpeed2: { value: 0.3 },
      uNoiseMix1: { value: 0.6 },
      uNoiseMix2: { value: 0.4 },
      uNoiseDepthInfluence: { value: 0.3 },
      uRippleFrequency: { value: 12.0 },
      uRippleInnerEdge: { value: 0.05 },
      uRippleOuterEdge: { value: 0.4 },
      uBreakupMin: { value: 0.2 },
      uBreakupMax: { value: 0.75 },
      uWaterDepthFade: { value: 0.1 },
      uDiscardThreshold: { value: 0.45 },
      uRippleOpacity: { value: 2.5 },
      uSplashesRatio: { value: 0.0 },
      uSplashesNoiseFrequency: { value: 0.33 },
      uSplashesTimeFrequency: { value: 6.0 },
      uSplashesThickness: { value: 0.3 },
      uSplashesEdgeAttenuationLow: { value: 0.14 },
      uSplashesEdgeAttenuationHigh: { value: 1.0 },
      uSplashesCenterMin: { value: 0.0 },
      uSplashesCenterMax: { value: 0.5 },
      uIceRatio: { value: 0.0 },
      uIceNoiseFrequency: { value: 0.3 },
      uIceColor: { value: new THREE.Color(0.9, 0.95, 1.0) },
    };

    this.waterRipplesMat.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        ...this.customWaterRipplesUniforms,
      };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        waterVertexCommonChunk
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        waterVertexBeginChunk
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        waterFragmentCommonChunk
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        waterFragmentColorChunk
      );
    };

    this.ripples = new THREE.Mesh(this.waterRipplesGeo, this.waterRipplesMat);
    this.ripples.rotateX(-Math.PI / 2);
    this.ripples.position.set(-0.2, 0.1, 1.3);
    this.scene.add(this.ripples);
  }

  initGUI() {
    this.debugGUI.add(
      this.customGroundUniforms.uGroundColorLight,
      'value',
      { type: 'color', label: 'Ground Color Light' },
      'Ground'
    );
    this.debugGUI.add(
      this.customGroundUniforms.uGroundColorDark,
      'value',
      { type: 'color', label: 'Ground Color Dark' },
      'Ground'
    );
    this.debugGUI.add(
      this.customGroundUniforms.uGroundColorBelowGrass,
      'value',
      { type: 'color', label: 'Ground Color Below Grass' },
      'Ground'
    );
    this.debugGUI.add(
      this.customGroundUniforms.uRockColor,
      'value',
      { type: 'color', label: 'Ground Rock' },
      'Ground'
    );

    this.debugGUI.add(
      this.customGroundUniforms.uWaterShallow,
      'value',
      { type: 'color', label: 'Water Shallow' },
      'Water'
    );
    this.debugGUI.add(
      this.customGroundUniforms.uWaterDeep,
      'value',
      { type: 'color', label: 'Water Deep' },
      'Water'
    );
    this.debugGUI.add(
      this.customGroundUniforms.uWaterDepthIntensity,
      'value',
      { min: 0.5, max: 3.0, step: 0.1, label: 'Water Depth Intensity' },
      'Water'
    );

    this.debugGUI.add(
      this.customWaterRipplesUniforms.uRipplesRatio,
      'value',
      { min: 0.0, max: 1.0, step: 0.01, label: 'Ripples Ratio' },
      'Water'
    );
    this.debugGUI.add(
      this.customWaterRipplesUniforms.uShoreMaskThreshold,
      'value',
      { min: 0.0, max: 1.0, step: 0.01, label: 'Ripple Shore Mask Threshold' },
      'Water'
    );
    this.debugGUI.add(
      this.customWaterRipplesUniforms.uRippleFrequency,
      'value',
      { min: 1.0, max: 30.0, step: 0.5, label: 'Ripple Frequency' },
      'Water'
    );
    this.debugGUI.add(
      this.customWaterRipplesUniforms.uRippleOpacity,
      'value',
      { min: 0.0, max: 5.0, step: 0.1, label: 'Ripple Opacity' },
      'Water'
    );

    this.debugGUI.add(
      this.customWaterRipplesUniforms.uSplashesRatio,
      'value',
      { min: 0.0, max: 1.0, step: 0.01, label: 'Splashes Ratio' },
      'Water Effects'
    );
    this.debugGUI.add(
      this.customWaterRipplesUniforms.uSplashesNoiseFrequency,
      'value',
      { min: 0.1, max: 2.0, step: 0.01, label: 'Splash Noise Frequency' },
      'Water Effects'
    );
    this.debugGUI.add(
      this.customWaterRipplesUniforms.uSplashesTimeFrequency,
      'value',
      { min: 0.0, max: 20.0, step: 0.1, label: 'Splash Time Frequency' },
      'Water Effects'
    );
    this.debugGUI.add(
      this.customWaterRipplesUniforms.uSplashesCenterMin,
      'value',
      { min: 0.0, max: 1.0, step: 0.01, label: 'Splash Center Min' },
      'Water Effects'
    );
    this.debugGUI.add(
      this.customWaterRipplesUniforms.uSplashesCenterMax,
      'value',
      { min: 0.0, max: 1.0, step: 0.01, label: 'Splash Center Max' },
      'Water Effects'
    );

    this.debugGUI.add(
      this.customWaterRipplesUniforms.uIceRatio,
      'value',
      { min: 0.0, max: 1.0, step: 0.01, label: 'Ice Ratio' },
      'Water Effects'
    );
    this.debugGUI.add(
      this.customWaterRipplesUniforms.uIceNoiseFrequency,
      'value',
      { min: 0.1, max: 2.0, step: 0.01, label: 'Ice Noise Frequency' },
      'Water Effects'
    );
    this.debugGUI.add(
      this.customWaterRipplesUniforms.uIceColor,
      'value',
      { type: 'color', label: 'Ice Color' },
      'Water Effects'
    );
  }

  update() {
    if (this.grassManager) {
      this.grassManager.update();
    }

    this.customWaterRipplesUniforms.uTime.value += 0.001;

    const currentSeason = this.seasonManager.currentSeason;

    if (currentSeason === 'rainy') {
      this.customWaterRipplesUniforms.uRipplesRatio.value =
        THREE.MathUtils.lerp(
          this.customWaterRipplesUniforms.uRipplesRatio.value,
          1.0,
          0.05
        );
      this.customWaterRipplesUniforms.uSplashesRatio.value =
        THREE.MathUtils.lerp(
          this.customWaterRipplesUniforms.uSplashesRatio.value,
          1.0,
          0.05
        );
      this.customWaterRipplesUniforms.uIceRatio.value = THREE.MathUtils.lerp(
        this.customWaterRipplesUniforms.uIceRatio.value,
        0.0,
        0.02
      );
    } else if (currentSeason === 'winter') {
      this.customWaterRipplesUniforms.uRipplesRatio.value =
        THREE.MathUtils.lerp(
          this.customWaterRipplesUniforms.uRipplesRatio.value,
          0.0,
          0.05
        );
      this.customWaterRipplesUniforms.uSplashesRatio.value =
        THREE.MathUtils.lerp(
          this.customWaterRipplesUniforms.uSplashesRatio.value,
          0.0,
          0.05
        );
      this.customWaterRipplesUniforms.uIceRatio.value = THREE.MathUtils.lerp(
        this.customWaterRipplesUniforms.uIceRatio.value,
        1.0,
        0.05
      );
    } else {
      this.customWaterRipplesUniforms.uRipplesRatio.value =
        THREE.MathUtils.lerp(
          this.customWaterRipplesUniforms.uRipplesRatio.value,
          1.0,
          0.05
        );
      this.customWaterRipplesUniforms.uSplashesRatio.value =
        THREE.MathUtils.lerp(
          this.customWaterRipplesUniforms.uSplashesRatio.value,
          0.0,
          0.05
        );
      this.customWaterRipplesUniforms.uIceRatio.value = THREE.MathUtils.lerp(
        this.customWaterRipplesUniforms.uIceRatio.value,
        0.0,
        0.05
      );
    }
  }

  dispose() {
    this.environmentTimeManager.offChange();
    this.seasonManager.offChange();

    if (this.grassManager) {
      this.grassManager.dispose();
    }
  }
}
