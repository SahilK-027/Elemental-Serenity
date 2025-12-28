import Game from '../../../Game.class';
import * as THREE from 'three';
import BushVertexShader from '../../../../Shaders/Materials/bush/vertex.glsl';
import BushFragmentShader from '../../../../Shaders/Materials/bush/fragment.glsl';
import { BushManager } from '../../Managers/BushManager/BushManager.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';

export default class Bush {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.debugGUI = this.game.debug;
    this.keyLight = this.scene.getObjectByName('keyLight');
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.currentEnvTime = this.environmentTimeManager.envTime;
    this.isDebugMode = this.game.isDebugMode;

    this.COLOR_PRESETS = {
      day: {
        shadowColor: [0.003, 0.074, 0.003],
        midColor: [0.06, 0.23, 0],
        highlightColor: [0.44, 0.5, 0.0],
        colorMultiplier: [0.46, 0.65, 0.3],
        // Tree leaves colors
        treeShadowColor: [0.03, 0.07, 0.003],
        treeColorMultiplier: [0.77, 0.71, 0.35],
        // Birch colors
        birchShadowColor: [0.09, 0.03, 0],
        birchMidColor: [0.2, 0.03, 0],
        birchHighlightColor: [1, 0.58, 0.1],
        birchColorMultiplier: [0.68, 0.56, 0.22],
      },
      night: {
        shadowColor: [0.001, 0.03, 0.02],
        midColor: [0.02, 0.08, 0.05],
        highlightColor: [0.15, 0.2, 0.15],
        colorMultiplier: [0.09, 0.13, 0.007],
        // Tree leaves colors at night
        treeShadowColor: [0.01, 0.03, 0.001],
        treeColorMultiplier: [0.25, 0.24, 0.001],
        // Birch colors at night
        birchShadowColor: [0.03, 0.015, 0],
        birchMidColor: [0.08, 0.015, 0],
        birchHighlightColor: [0.3, 0.17, 0.03],
        birchColorMultiplier: [0.3, 0.2, 0.01],
      },
    };

    this.BUSH_DEFINITIONS = [
      // bottom right cluster
      { position: [7.3, 1.0, 3], scale: 1.2 },
      { position: [9, 0.2, 4.1], scale: 0.6 },
      { position: [10, 0.3, 0.0], scale: 0.6 },
      { position: [11, 0.1, 1.5], scale: 0.8 },

      // top left near bridge
      { position: [-10, 0.7, -5.5], scale: 1.2 },
      { position: [-12, 1.0, -5.5], scale: 2.0 },
      { position: [-11, 0.2, -8.5], scale: 0.7 },

      // top left near tent
      { position: [-2, 0.2, -7.5] },

      // top right near tent
      { position: [8, 0.5, -9.5], scale: 0.6 },

      // bottom left near rocks
      { position: [-4.0, 0.5, 10.5], scale: 0.7 },
      { position: [0.0, 0.5, 11.5], scale: 0.5 },
      { position: [1.8, 0.2, 9.5], scale: 0.5 },

      // other clusters
      { position: [-4, 0.0, -15.5] },
      { position: [-6, 0.0, -15], scale: 0.9 },

      // top-left rocks
      { position: [-9.8, 0.5, 4.5], leafCount: 30, scale: 1.2 },
      { position: [-8.8, 0.5, 8.5], leafCount: 30 },
      { position: [-6.5, 0.1, 8.5], leafCount: 30, scale: 0.8 },

      // tree leaves (bottom right tree)
      { position: [12.0, 5.0, -0.2], scale: 0.6, bushType: 'tree' },
      { position: [12.0, 7.0, 1.5], scale: 0.7, bushType: 'tree' },
      { position: [12.5, 5.0, 3.2], scale: 0.7, bushType: 'tree' },
      { position: [13.5, 5.0, 0.5], scale: 0.6, bushType: 'tree' },
      { position: [11.0, 6.0, 2.5], scale: 0.6, bushType: 'tree' },

      // birch-like clusters (top right)
      { position: [8.1, 6.5, -5.5], scale: 1.0, bushType: 'birch' },
      { position: [8.5, 7.5, -8.5], scale: 1.0, bushType: 'birch' },
      { position: [6.0, 7.5, -7.5], scale: 1.0, bushType: 'birch' },

      // more clusters
      { position: [-10.5, 4.5, 0.0], scale: 1.0, bushType: 'tree' },
      { position: [-9.5, 5.0, -2.5], scale: 1.0, bushType: 'tree' },
      { position: [-8, 4.0, -2.5], scale: 1.0, bushType: 'tree' },
      { position: [-7, 3.7, -9.0], scale: 1.0, bushType: 'tree' },
      { position: [-7, 5.0, -11.0], scale: 1.0, bushType: 'tree' },
      { position: [-5, 3.7, -11.0], scale: 1.0, bushType: 'tree' },

      { position: [-10, 6.0, 7.0], scale: 1.0, bushType: 'tree' },
      { position: [-11, 6.0, 5.0], scale: 1.0, bushType: 'tree' },
      { position: [-12, 4.0, 4.0], scale: 1.0, bushType: 'tree' },
      { position: [-12, 6.0, 6.0], scale: 1.0, bushType: 'tree' },
      { position: [-12, 4.0, 7.0], scale: 1.0, bushType: 'tree' },

      // mid-left birch cluster
      { position: [-3.1, 8.0, 10.5], scale: 1.0, bushType: 'birch' },
      { position: [-3.0, 6.0, 10.5], scale: 1.5, bushType: 'birch' },
      { position: [-5.0, 7.5, 11.5], scale: 1.0, bushType: 'birch' },
      { position: [-4.0, 6.0, 12.5], scale: 1.0, bushType: 'birch' },
    ];

    this.init();

    this.environmentTimeManager.onChange((newValue, oldValue) => {
      this.onEnvTimeChanged(newValue, oldValue);
    });
  }

  v3(arr) {
    return new THREE.Vector3(arr[0], arr[1], arr[2]);
  }
  col(arr) {
    return new THREE.Color(arr[0], arr[1], arr[2]);
  }

  getColorMultiplierForType(bushType, envTime) {
    const preset = this.COLOR_PRESETS[envTime];

    if (bushType === 'tree') {
      return preset.treeColorMultiplier;
    } else if (bushType === 'birch') {
      return preset.birchColorMultiplier;
    } else {
      return preset.colorMultiplier;
    }
  }

  getColorsForBushType(bushType, envTime) {
    const preset = this.COLOR_PRESETS[envTime];

    if (bushType === 'tree') {
      return {
        shadowColor: this.col(preset.treeShadowColor),
      };
    } else if (bushType === 'birch') {
      return {
        shadowColor: this.col(preset.birchShadowColor),
        midColor: this.col(preset.birchMidColor),
        highlightColor: this.col(preset.birchHighlightColor),
      };
    } else {
      return {
        shadowColor: this.col(preset.shadowColor),
        midColor: this.col(preset.midColor),
        highlightColor: this.col(preset.highlightColor),
      };
    }
  }

  getDefaults() {
    const preset = this.COLOR_PRESETS[this.currentEnvTime];
    return {
      leafCount: 45,
      scale: 1.0,
      colorMultiplier: preset.colorMultiplier,
      shadowColor: preset.shadowColor,
      midColor: preset.midColor,
      highlightColor: preset.highlightColor,
    };
  }

  init() {
    this.createMaterial();
    this.samplerMesh = this.prepareSamplerMesh();
    this.bushManager = new BushManager({
      material: this.material,
      samplerMesh: this.samplerMesh,
      maxLeaves: 1755,
    });

    this.spawnFromDefinitions();
    if (this.isDebugMode) {
      this.initGUI();
    }
  }

  createMaterial() {
    const leavesAlphaMap = this.resources.items.leavesAlphaMap;
    const preset = this.COLOR_PRESETS[this.currentEnvTime];
    const fogUniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['fog']]);

    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      fog: true,
      uniforms: {
        ...fogUniforms,
        uTime: { value: 0.0 },
        uLightDirection: {
          value: this.keyLight ? this.keyLight.position : new THREE.Vector3(),
        },
        uAlphaMap: { value: leavesAlphaMap },
        uShadowColor: { value: this.col(preset.shadowColor) },
        uMidColor: { value: this.col(preset.midColor) },
        uHighlightColor: { value: this.col(preset.highlightColor) },

        uBreezeSpeed: { value: 16.25 },
        uBreezeScale: { value: 6.2 },
        uBreezeStrength: { value: 2.5 },
        uSquallSpeed: { value: 4.02 },
        uSquallScale: { value: 4.3 },
        uSquallStrength: { value: 0.5 },
      },
      vertexShader: BushVertexShader,
      fragmentShader: BushFragmentShader,
      depthTest: true,
      depthWrite: true,
      transparent: false,
      alphaTest: 0.8,
    });
  }

  prepareSamplerMesh() {
    const model = this.resources.items.BushEmitterModel;
    if (!model) {
      console.warn('BushEmitterModel not found in resources');
      return new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial()
      );
    }

    const emitterMesh = model.scene.children[0];
    emitterMesh.updateMatrixWorld(true);

    const samplerGeometry = emitterMesh.geometry.clone();
    samplerGeometry.applyMatrix4(emitterMesh.matrixWorld);
    const nonIndexed = samplerGeometry.toNonIndexed();

    return new THREE.Mesh(nonIndexed, new THREE.MeshBasicMaterial());
  }

  spawnFromDefinitions() {
    const d = this.getDefaults();

    this.BUSH_DEFINITIONS.forEach((def) => {
      const bushType = def.bushType || 'default';
      const colors = this.getColorsForBushType(bushType, this.currentEnvTime);

      const colorMultiplier = this.getColorMultiplierForType(
        bushType,
        this.currentEnvTime
      );

      const cfg = {
        position: this.v3(def.position),
        leafCount: def.leafCount ?? d.leafCount,
        scale: def.scale ?? d.scale,
        colorMultiplier: this.col(colorMultiplier),
        shadowColor: colors.shadowColor,
        midColor: colors.midColor || this.col(d.midColor),
        highlightColor: colors.highlightColor || this.col(d.highlightColor),
      };

      this.bushManager.addBush(cfg);
    });
  }

  onEnvTimeChanged(newValue, oldValue) {
    this.currentEnvTime = newValue;
    const preset = this.COLOR_PRESETS[newValue];

    this.material.uniforms.uShadowColor.value.setRGB(
      preset.shadowColor[0],
      preset.shadowColor[1],
      preset.shadowColor[2]
    );
    this.material.uniforms.uMidColor.value.setRGB(
      preset.midColor[0],
      preset.midColor[1],
      preset.midColor[2]
    );
    this.material.uniforms.uHighlightColor.value.setRGB(
      preset.highlightColor[0],
      preset.highlightColor[1],
      preset.highlightColor[2]
    );

    this.rebuildBushes();
  }

  rebuildBushes() {
    if (!this.bushManager) return;

    if (typeof this.bushManager.dispose === 'function') {
      this.bushManager.dispose();
    } else if (typeof this.bushManager.clear === 'function') {
      this.bushManager.clear();
    } else {
      console.warn(
        '[Bush] BushManager has no dispose/clear method, attempting manual cleanup'
      );

      const bushMeshesToRemove = [];
      this.scene.traverse((child) => {
        if (child.material === this.material) {
          bushMeshesToRemove.push(child);
        }
      });

      bushMeshesToRemove.forEach((mesh) => {
        this.scene.remove(mesh);
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
      });
    }

    this.bushManager = new BushManager({
      material: this.material,
      samplerMesh: this.samplerMesh,
      maxLeaves: 1755,
    });

    this.spawnFromDefinitions();
  }

  initGUI() {
    if (!this.debugGUI) return;

    const controls = [
      { uniform: 'uShadowColor', label: 'Bush Color Shadow', type: 'color' },
      { uniform: 'uMidColor', label: 'Bush Color Mid', type: 'color' },
      { uniform: 'uHighlightColor', label: 'Bush Color Light', type: 'color' },

      {
        uniform: 'uBreezeSpeed',
        label: 'Breeze Speed',
        options: { min: 0, max: 20, step: 0.01 },
      },
      {
        uniform: 'uBreezeScale',
        label: 'Breeze Scale',
        options: { min: 0, max: 20, step: 0.01 },
      },
      {
        uniform: 'uBreezeStrength',
        label: 'Breeze Strength',
        options: { min: 0, max: 20, step: 0.01 },
      },

      {
        uniform: 'uSquallSpeed',
        label: 'Squall Speed',
        options: { min: 0, max: 20, step: 0.01 },
      },
      {
        uniform: 'uSquallScale',
        label: 'Squall Scale',
        options: { min: 0, max: 20, step: 0.01 },
      },
      {
        uniform: 'uSquallStrength',
        label: 'Squall Strength',
        options: { min: 0, max: 20, step: 0.01 },
      },
    ];

    controls.forEach((c) => {
      const uniformObj = this.material.uniforms[c.uniform];
      if (!uniformObj) return;

      const guiArgs =
        c.type === 'color'
          ? [uniformObj, 'value', { type: 'color', label: c.label }, 'Bush']
          : [uniformObj, 'value', { ...c.options, label: c.label }, 'Bush'];

      this.debugGUI.add(...guiArgs);
    });
  }

  update() {
    this.material.uniforms.uTime.value += 0.001;
    if (this.bushManager && typeof this.bushManager.update === 'function') {
      this.bushManager.update();
    }
  }

  dispose() {
    this.environmentTimeManager.offChange();

    if (this.bushManager && typeof this.bushManager.dispose === 'function') {
      this.bushManager.dispose();
    }

    if (this.material) {
      this.material.dispose();
    }
  }
}
