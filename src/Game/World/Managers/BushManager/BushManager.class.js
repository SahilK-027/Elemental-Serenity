import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import Game from '../../../Game.class';
import BushVertexShader from '../../../../Shaders/Materials/bush/vertex.glsl';
import * as MATH from '../../../Utils/Math.class';

export class BushManager {
  constructor({ material, samplerMesh, maxLeaves = 1000 }) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.material = material;
    this.samplerMesh = samplerMesh;
    this.maxLeaves = maxLeaves;

    const mulberry32 = (seed) => {
      return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };

    this.sampler = new MeshSurfaceSampler(samplerMesh)
      .setRandomGenerator(mulberry32(12345))
      .build();

    this.instancedMesh = new THREE.InstancedMesh(
      this.planeGeometry,
      material,
      maxLeaves
    );
    const depthUniforms = THREE.UniformsUtils.clone(this.material.uniforms);
    const depthFragment = `#include <packing>
varying vec2 vUv;
uniform sampler2D uAlphaMap;
void main() {
  float a = texture2D(uAlphaMap, vUv).a;
  if (a < 0.8) discard;
  gl_FragColor = packDepthToRGBA( gl_FragCoord.z );
}
`;
    const depthMaterial = new THREE.ShaderMaterial({
      vertexShader: BushVertexShader,
      fragmentShader: depthFragment,
      uniforms: depthUniforms,
      defines: { USE_INSTANCING: '' },
      side: THREE.DoubleSide,
    });
    this.instancedMesh.customDepthMaterial = depthMaterial;
    this.instancedMesh.customDistanceMaterial = depthMaterial;

    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;

    this.currentLeafIndex = 0;
    this.bushes = [];

    this.instanceNormals = new Float32Array(maxLeaves * 3);
    this.instanceShadowColors = new Float32Array(maxLeaves * 3);
    this.instanceMidColors = new Float32Array(maxLeaves * 3);
    this.instanceHighlightColors = new Float32Array(maxLeaves * 3);
    this.instanceColorMultiplier = new Float32Array(maxLeaves * 3);

    this.scene.add(this.instancedMesh);
  }

  addBush({
    position = new THREE.Vector3(0, 0.0, 0),
    leafCount = 25,
    scale = 1.0,
    randomSeed = null,
    shadowColor = new THREE.Color(0.01, 0.12, 0.01),
    midColor = new THREE.Color(0.0, 0.25, 0.015),
    highlightColor = new THREE.Color(0.25, 0.5, 0.007),
    colorMultiplier = new THREE.Color(0.73, 0.89, 0.62),
  }) {
    if (this.currentLeafIndex + leafCount > this.maxLeaves) {
      console.warn('BushManager: Maximum leaf count exceeded');
      return null;
    }

    const startIndex = this.currentLeafIndex;
    const dummy = new THREE.Object3D();
    const positionLocal = new THREE.Vector3();
    const normal = new THREE.Vector3();

    let sampler = this.sampler;
    if (randomSeed !== null) {
      const mulberry32 = (seed) => {
        return function () {
          let t = (seed += 0x6d2b79f5);
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      };
      sampler = new MeshSurfaceSampler(this.samplerMesh)
        .setRandomGenerator(mulberry32(randomSeed))
        .build();
    }

    for (let i = 0; i < leafCount; i++) {
      const instanceIndex = startIndex + i;

      sampler.sample(positionLocal, normal);

      dummy.position.copy(positionLocal).add(position);

      const s = MATH.random() * 0.5 + scale;
      dummy.scale.set(s, s, s);

      dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(instanceIndex, dummy.matrix);

      this.instanceNormals[instanceIndex * 3 + 0] = normal.x;
      this.instanceNormals[instanceIndex * 3 + 1] = normal.y;
      this.instanceNormals[instanceIndex * 3 + 2] = normal.z;

      this.instanceShadowColors[instanceIndex * 3 + 0] = shadowColor.r;
      this.instanceShadowColors[instanceIndex * 3 + 1] = shadowColor.g;
      this.instanceShadowColors[instanceIndex * 3 + 2] = shadowColor.b;

      this.instanceMidColors[instanceIndex * 3 + 0] = midColor.r;
      this.instanceMidColors[instanceIndex * 3 + 1] = midColor.g;
      this.instanceMidColors[instanceIndex * 3 + 2] = midColor.b;

      this.instanceHighlightColors[instanceIndex * 3 + 0] = highlightColor.r;
      this.instanceHighlightColors[instanceIndex * 3 + 1] = highlightColor.g;
      this.instanceHighlightColors[instanceIndex * 3 + 2] = highlightColor.b;

      this.instanceColorMultiplier[instanceIndex * 3 + 0] = colorMultiplier.r;
      this.instanceColorMultiplier[instanceIndex * 3 + 1] = colorMultiplier.g;
      this.instanceColorMultiplier[instanceIndex * 3 + 2] = colorMultiplier.b;
    }

    const bush = {
      position: position.clone(),
      startIndex,
      leafCount,
      scale,
      shadowColor: shadowColor.clone(),
      midColor: midColor.clone(),
      highlightColor: highlightColor.clone(),
    };
    this.bushes.push(bush);
    this.currentLeafIndex += leafCount;

    this.updateMesh();

    return bush;
  }

  updateMesh() {
    this.instancedMesh.geometry.setAttribute(
      'instanceNormal',
      new THREE.InstancedBufferAttribute(this.instanceNormals, 3)
    );
    this.instancedMesh.geometry.setAttribute(
      'instanceShadowColor',
      new THREE.InstancedBufferAttribute(this.instanceShadowColors, 3)
    );
    this.instancedMesh.geometry.setAttribute(
      'instanceMidColor',
      new THREE.InstancedBufferAttribute(this.instanceMidColors, 3)
    );
    this.instancedMesh.geometry.setAttribute(
      'instanceHighlightColor',
      new THREE.InstancedBufferAttribute(this.instanceHighlightColors, 3)
    );
    this.instancedMesh.geometry.setAttribute(
      'instanceColorMultiplier',
      new THREE.InstancedBufferAttribute(this.instanceColorMultiplier, 3)
    );

    this.instancedMesh.count = this.currentLeafIndex;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  updateBushPosition(bushIndex, newPosition) {
    if (bushIndex >= this.bushes.length) return;

    const bush = this.bushes[bushIndex];
    const offset = new THREE.Vector3().subVectors(newPosition, bush.position);

    const dummy = new THREE.Object3D();
    const matrix = new THREE.Matrix4();

    for (let i = 0; i < bush.leafCount; i++) {
      const instanceIndex = bush.startIndex + i;

      this.instancedMesh.getMatrixAt(instanceIndex, matrix);
      dummy.position.setFromMatrixPosition(matrix);
      dummy.position.add(offset);

      const scale = new THREE.Vector3();
      matrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);
      dummy.scale.copy(scale);

      dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(instanceIndex, dummy.matrix);
    }

    bush.position.copy(newPosition);
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  removeBush(bushIndex) {
    if (bushIndex >= this.bushes.length) return;

    const bush = this.bushes[bushIndex];
    const dummy = new THREE.Object3D();
    dummy.scale.set(0, 0, 0);

    for (let i = 0; i < bush.leafCount; i++) {
      const instanceIndex = bush.startIndex + i;
      dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(instanceIndex, dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.bushes.splice(bushIndex, 1);
  }

  getBushCount() {
    return this.bushes.length;
  }

  getTotalLeafCount() {
    return this.currentLeafIndex;
  }

  update() {
    if (this.instancedMesh && this.instancedMesh.customDepthMaterial) {
      this.instancedMesh.customDepthMaterial.uniforms.uTime.value =
        this.material.uniforms.uTime.value;
    }
  }

  dispose() {
    this.scene.remove(this.instancedMesh);
    this.instancedMesh.geometry.dispose();

    if (this.instancedMesh.customDepthMaterial) {
      this.instancedMesh.customDepthMaterial.dispose();
    }
  }
}
