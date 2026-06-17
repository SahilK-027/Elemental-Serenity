import * as THREE from 'three';
import gsap from 'gsap';
import Game from '../../../Game.class';
import windLinesVertexShader from '../../../../Shaders/Materials/windLines/vertex.glsl';
import windLinesFragmentShader from '../../../../Shaders/Materials/windLines/fragment.glsl';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

class WindLine {
  constructor() {
    this.game = Game.getInstance();
    this.available = true;
    this.seasonManager = SeasonManager.getInstance();
    this.currentSeason = this.seasonManager.currentSeason;

    const geometry = this.createGeometry();

    const windColor = this.seasonManager.getColorConfig('windLines').color;
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uThickness: { value: 0.1 },
        uProgress: { value: 0.0 },
        uColor: { value: windColor.clone() },
        uTangent: { value: new THREE.Vector3(0, 1, -1).normalize() },
      },
      vertexShader: windLinesVertexShader,
      fragmentShader: windLinesFragmentShader,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.renderOrder = 1;
    this.mesh.position.y = 3;
    this.mesh.visible = false;

    this.game.scene.add(this.mesh);

    this.seasonManager.onChange((newSeason, oldSeason) => {
      this.onSeasonChanged(newSeason, oldSeason);
    });
  }

  onSeasonChanged(newSeason, oldSeason) {
    this.currentSeason = newSeason;
    const windColor = this.seasonManager.getColorConfig('windLines').color;
    this.material.uniforms.uColor.value.copy(windColor);
  }

  createGeometry(length = 11, handlesCount = 4, amplitude = 1, divisions = 30) {
    const geometry = new THREE.BufferGeometry();

    const halfExtent = length / 2;
    const handleSpan = length / (handlesCount - 1);
    const handles = [];

    for (let i = 0; i < handlesCount; i++) {
      handles.push(
        new THREE.Vector3(
          0,
          ((i % 2) - 0.5) * amplitude,
          -halfExtent + i * handleSpan
        )
      );
    }

    const curve = new THREE.CatmullRomCurve3(handles);
    const points = curve.getPoints(divisions);

    const vertices = [];
    const indices = [];
    const ratios = [];

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const ratio = i / (points.length - 1);

      vertices.push(point.x, point.y, point.z);
      vertices.push(point.x, point.y, point.z);

      ratios.push(ratio);
      ratios.push(ratio);

      if (i < points.length - 1) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute('ratio', new THREE.Float32BufferAttribute(ratios, 1));
    geometry.setIndex(indices);

    return geometry;
  }

  get thickness() {
    return this.material.uniforms.uThickness.value;
  }

  set thickness(value) {
    this.material.uniforms.uThickness.value = value;
  }

  get progress() {
    return this.material.uniforms.uProgress.value;
  }

  set progress(value) {
    this.material.uniforms.uProgress.value = value;
  }

  dispose() {
    this.seasonManager.offChange();
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.game.scene.remove(this.mesh);
  }
}

export default class WindLines {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;

    this.intervalRange = { min: 300, max: 2000 };
    this.duration = 4;
    this.translation = 1;
    this.thickness = 0.25;

    this.pool = [new WindLine(), new WindLine(), new WindLine()];

    this.startInterval();
  }

  startInterval() {
    const displayInterval = () => {
      this.display();

      const delay =
        this.intervalRange.min +
        Math.random() * (this.intervalRange.max - this.intervalRange.min);

      this.intervalTimeout = setTimeout(() => displayInterval(), delay);
    };

    displayInterval();
  }

  display() {
    const windLine = this.pool.find((wl) => wl.available);

    if (!windLine) return;

    const angle = this.getWindAngle();

    windLine.mesh.visible = true;
    windLine.available = false;
    windLine.thickness = this.thickness;

    const focusPoint = this.getFocusPoint();
    const radius = this.getOptimalRadius();

    windLine.mesh.position.x = focusPoint.x + (Math.random() - 0.5) * radius;
    windLine.mesh.position.z = focusPoint.z + (Math.random() - 0.5) * radius;
    windLine.mesh.rotation.y = angle;

    gsap.to(windLine.mesh.position, {
      x: windLine.mesh.position.x + Math.sin(angle) * this.translation,
      z: windLine.mesh.position.z + Math.cos(angle) * this.translation,
      duration: this.duration,
    });

    gsap.fromTo(
      windLine.material.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: this.duration,
        onComplete: () => {
          windLine.mesh.visible = false;
          windLine.available = true;
        },
      }
    );
  }

  getWindAngle() {
    return Math.PI;
  }

  getFocusPoint() {
    return new THREE.Vector3(0, 0, 0);
  }

  getOptimalRadius() {
    return 25;
  }

  dispose() {
    if (this.intervalTimeout) {
      clearTimeout(this.intervalTimeout);
      this.intervalTimeout = null;
    }
    this.pool.forEach((windLine) => windLine.dispose());
  }
}
