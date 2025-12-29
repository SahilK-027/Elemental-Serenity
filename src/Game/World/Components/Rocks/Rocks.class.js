import Game from '../../../Game.class';
import * as THREE from 'three';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';
import rocksVertexCommonChunk from '../../../../Shaders/Chunks/rocks/rocks.vertex_common_chunk.glsl';
import rocksVertexBeginChunk from '../../../../Shaders/Chunks/rocks/rocks.vertex_begin_chunk.glsl';
import rocksFragmentCommonChunk from '../../../../Shaders/Chunks/rocks/rocks.fragment_common_chunk.glsl';
import rocksFragmentColorChunk from '../../../../Shaders/Chunks/rocks/rocks.fragment_color_chunk.glsl';

export default class Rocks {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.debugGUI = this.game.debug;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;
    this.currentSeason = this.seasonManager.currentSeason;

    this.addRocks();

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

  onEnvTimeChanged(newValue, oldValue) {
    this.envTime = newValue;
    this.updateColors();
  }

  onSeasonChanged(newSeason, oldSeason) {
    this.currentSeason = newSeason;
    this.updateColors();
  }

  updateColors() {
    const colors = this.seasonManager.getColorConfig('rocks', this.envTime);
    if (!colors || !this.customRockUniforms) return;

    this.customRockUniforms.uRockColor1.value.copy(colors.uRockColor1);
    this.customRockUniforms.uRockColor2.value.copy(colors.uRockColor2);
    this.customRockUniforms.uRockColor3.value.copy(colors.uRockColor3);
    this.customRockUniforms.uMossColor1.value.copy(colors.uMossColor1);
    this.customRockUniforms.uMossColor2.value.copy(colors.uMossColor2);
    this.customRockUniforms.uMossColor3.value.copy(colors.uMossColor3);
  }

  addRocks() {
    this.rocksModel = this.resources.items.rocksModel.scene;
    this.scene.add(this.rocksModel);
    this.rocksMaterial = new THREE.MeshStandardMaterial({
      roughness: 1.0,
      metalness: 0,
    });

    this.rocksModel.traverse((child) => {
      if (child.isMesh) {
        child.material = this.rocksMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const displacementTexture = this.game.resources.items.displacementMapBlur;
    displacementTexture.wrapS = displacementTexture.wrapT =
      THREE.RepeatWrapping;
    const perlinNoise = this.game.resources.items.perlinNoise;
    perlinNoise.wrapS = perlinNoise.wrapT = THREE.RepeatWrapping;

    const colors = this.seasonManager.getColorConfig('rocks', this.envTime);

    this.customRockUniforms = {
      uDisplacementMap: { value: displacementTexture },
      uPerlinNoise: { value: perlinNoise },
      uRockColor1: { value: colors.uRockColor1.clone() },
      uRockColor2: { value: colors.uRockColor2.clone() },
      uRockColor3: { value: colors.uRockColor3.clone() },
      uMossColor1: { value: colors.uMossColor1.clone() },
      uMossColor2: { value: colors.uMossColor2.clone() },
      uMossColor3: { value: colors.uMossColor3.clone() },
      uMossNoiseFactor: { value: 1.2 },
      uMossVisibility: { value: 3.0 },
    };

    this.rocksMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = { ...shader.uniforms, ...this.customRockUniforms };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        rocksVertexCommonChunk
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        rocksVertexBeginChunk
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        rocksFragmentCommonChunk
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        rocksFragmentColorChunk
      );
    };
  }

  initGUI() {
    this.debugGUI.add(
      this.customRockUniforms.uRockColor1,
      'value',
      { type: 'color', label: 'Rock Color Light' },
      'Rock'
    );
    this.debugGUI.add(
      this.customRockUniforms.uRockColor2,
      'value',
      { type: 'color', label: 'Rock Color Dark' },
      'Rock'
    );
    this.debugGUI.add(
      this.customRockUniforms.uRockColor3,
      'value',
      { type: 'color', label: 'Rock Color Dark Crevices' },
      'Rock'
    );
    this.debugGUI.add(
      this.customRockUniforms.uMossColor1,
      'value',
      { type: 'color', label: 'Rock Moss Color' },
      'Rock'
    );
    this.debugGUI.add(
      this.customRockUniforms.uMossColor2,
      'value',
      { type: 'color', label: 'Rock Moss Color2' },
      'Rock'
    );
    this.debugGUI.add(
      this.customRockUniforms.uMossColor3,
      'value',
      { type: 'color', label: 'Rock Moss Color3' },
      'Rock'
    );
    this.debugGUI.add(
      this.customRockUniforms.uMossNoiseFactor,
      'value',
      { min: 0.1, max: 100.0, step: 0.01, label: 'Rock Moss Noise Factor' },
      'Rock'
    );
    this.debugGUI.add(
      this.customRockUniforms.uMossVisibility,
      'value',
      { min: 0.0, max: 5.0, step: 0.01, label: 'Rock Moss Noise Visibility' },
      'Rock'
    );
  }

  dispose() {
    this.environmentTimeManager.offChange();
    this.seasonManager.offChange();
  }
}
