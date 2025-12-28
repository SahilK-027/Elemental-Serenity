import MersenneTwister from 'mersennetwister';
import * as THREE from 'three';

const MT_ = new MersenneTwister(7);

function saturate(v) {
  return Math.min(1, Math.max(0, v));
}

function inverseLerp(a, b, v) {
  return saturate((v - a) / (b - a));
}

function remap(a, b, c, d, v) {
  return c + (d - c) * inverseLerp(a, b, v);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function random() {
  return MT_.random();
}

class Interpolant {
  frames = null;
  interpolator = null;
  resultBuffer = null;

  constructor(frames, stride) {
    this.frames = frames;
    const times = [];
    const values = [];
    for (let i = 0; i < frames.length; i++) {
      times.push(frames[i].time);
      values.push(...frames[i].value);
    }
    this.resultBuffer = new Float32Array(stride);
    this.interpolator = new THREE.LinearInterpolant(
      times,
      values,
      stride,
      this.resultBuffer
    );
  }

  evaluate(time) {
    this.interpolator.evaluate(time);
    return this.onEvaluate(this.resultBuffer);
  }

  onEvaluate(result) {
    return result;
  }
}

class Vec3Interpolat extends Interpolant {
  constructor(frames) {
    super(frames, 3);
  }

  onEvaluate(result) {
    return new THREE.Vector3(result[0], result[1], result[2]);
  }
}

class FloatInterpolat extends Interpolant {
  constructor(frames) {
    for (let i = 0; i < frames.length; i++) {
      frames[i].value = [frames[i].value];
    }
    super(frames, 1);
  }

  onEvaluate(result) {
    return result[0];
  }

  toTexture() {
    const frames = this.frames;
    const maxFrameTime = frames[frames.length - 1].time;

    let smallestStep = 0.5;
    for (let i = 1; i < frames.length; i++) {
      const stepSize = (frames[i].time - frames[i - 1].time) / maxFrameTime;
      smallestStep = Math.min(smallestStep, stepSize);
    }
    const recommendedSize = Math.ceil(1 / smallestStep);

    const width = recommendedSize + 1;

    const data = new Uint8Array(width * 4);

    for (let i = 0; i < width; i++) {
      const t = i / (width - 1);
      const value = this.evaluate(t * maxFrameTime);

      const byteValue = Math.max(0, Math.min(255, Math.floor(value * 255)));
      data[i * 4 + 0] = byteValue;
      data[i * 4 + 1] = byteValue;
      data[i * 4 + 2] = byteValue;
      data[i * 4 + 3] = 255;
    }

    const dt = new THREE.DataTexture(
      data,
      width,
      1,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    dt.minFilter = THREE.LinearFilter;
    dt.magFilter = THREE.LinearFilter;
    dt.wrapS = THREE.ClampToEdgeWrapping;
    dt.wrapT = THREE.ClampToEdgeWrapping;
    dt.generateMipmaps = false;
    dt.needsUpdate = true;

    return dt;
  }
}

class ColorInterpolat extends Interpolant {
  constructor(frames) {
    for (let i = 0; i < frames.length; i++) {
      frames[i].value = [
        frames[i].value.r,
        frames[i].value.g,
        frames[i].value.b,
      ];
    }
    super(frames, 3);
  }

  onEvaluate(result) {
    return new THREE.Color(result[0], result[1], result[2]);
  }

  toTexture(alphaInterpolant) {
    const frames = this.frames;
    const alphaFrames = alphaInterpolant.frames;

    const maxFrameTime = Math.max(
      frames[frames.length - 1].time,
      alphaFrames[alphaFrames.length - 1].time
    );

    let smallestStep = 0.5;
    for (let i = 1; i < frames.length; i++) {
      const stepSize = (frames[i].time - frames[i - 1].time) / maxFrameTime;
      smallestStep = Math.min(smallestStep, stepSize);
    }
    for (let i = 1; i < alphaFrames.length; i++) {
      const stepSize =
        (alphaFrames[i].time - alphaFrames[i - 1].time) / maxFrameTime;
      smallestStep = Math.min(smallestStep, stepSize);
    }
    const recommendedSize = Math.ceil(1 / smallestStep);

    const width = recommendedSize + 1;

    const data = new Uint8Array(width * 4);

    for (let i = 0; i < width; i++) {
      const t = i / (width - 1);
      const color = this.evaluate(t * maxFrameTime);
      const alpha = alphaInterpolant.evaluate(t * maxFrameTime);

      data[i * 4 + 0] = Math.max(0, Math.min(255, Math.floor(color.r * 255)));
      data[i * 4 + 1] = Math.max(0, Math.min(255, Math.floor(color.g * 255)));
      data[i * 4 + 2] = Math.max(0, Math.min(255, Math.floor(color.b * 255)));
      data[i * 4 + 3] = Math.max(0, Math.min(255, Math.floor(alpha * 255)));
    }

    const dt = new THREE.DataTexture(
      data,
      width,
      1,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    dt.minFilter = THREE.LinearFilter;
    dt.magFilter = THREE.LinearFilter;
    dt.wrapS = THREE.ClampToEdgeWrapping;
    dt.wrapT = THREE.ClampToEdgeWrapping;
    dt.generateMipmaps = false;
    dt.needsUpdate = true;

    return dt;
  }
}

export {
  saturate,
  inverseLerp,
  clamp,
  remap,
  lerp,
  random,
  Vec3Interpolat,
  FloatInterpolat,
  ColorInterpolat,
};
