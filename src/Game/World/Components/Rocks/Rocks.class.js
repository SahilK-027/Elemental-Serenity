import Game from '../../../Game.class';
import * as THREE from 'three';
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

    this.addRocks();

    this.isDebugMode = this.game.isDebugMode;
    if (this.isDebugMode) {
      this.initGUI();
    }
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

    this.customRockUniforms = {
      uDisplacementMap: { value: displacementTexture },
      uPerlinNoise: { value: perlinNoise },
      uRockColor1: { value: new THREE.Color(0.96, 0.86, 0.54) },
      uRockColor2: { value: new THREE.Color(0.97, 0.82, 0.42) },
      uRockColor3: { value: new THREE.Color(0.31, 0.24, 0.06) },
      uMossColor1: { value: new THREE.Color(0.97, 0.82, 0.42) },
      uMossColor2: { value: new THREE.Color(0.97, 0.82, 0.42) },
      uMossColor3: { value: new THREE.Color(0.14, 0.17, 0.003) },
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
}
