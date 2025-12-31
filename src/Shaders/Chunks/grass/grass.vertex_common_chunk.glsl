#include <common>

attribute float aBaseScale;
attribute vec2 aWorldPosition;

uniform float uTime;
uniform sampler2D uDensityMap;
uniform sampler2D uTerrainNormalMap;
uniform float uGroundSize;
uniform float uNormalStrength;
uniform float uTerrainNormalScale;
uniform float uWindSpeed;
uniform float uWindAmplitude;
uniform float uWindWaveTiling;
uniform float uWindWaveStrength;
uniform float uWindBaseTiling;
uniform float uWindBaseStrength;
uniform float uBladeModelMinY;
uniform float uBladeModelHeight;
uniform float uDensityThreshold;

varying float vBladeMask;

vec2 rotateUV(vec2 uv, float angle, vec2 center) {
    float s = sin(angle);
    float c = cos(angle);
    uv -= center;
    uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
    uv += center;
    return uv;
}

float noise2D(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float smoothNoise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = noise2D(i);
    float b = noise2D(i + vec2(1.0, 0.0));
    float c = noise2D(i + vec2(0.0, 1.0));
    float d = noise2D(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, float lacunarity) {
    float value = 0.0;
    float amplitude = 0.5;
    for(int i = 0; i < 1; i++) {
        value += amplitude * smoothNoise2D(p);
        p *= lacunarity;
        amplitude *= 0.5;
    }
    return value;
}

vec2 calculateWindVector(vec3 worldPos) {
    vec2 windWavePos = worldPos.xz * uWindWaveTiling;
    float windWaveTime = uTime * uWindSpeed;
    float wave1 = fbm(windWavePos - vec2(windWaveTime * 0.35, windWaveTime), 3.0);
    float wave2 = fbm(windWavePos - vec2(0.0, windWaveTime * 0.35), 2.0);
    float primaryWave = (wave1 + wave2) * 0.5 * uWindWaveStrength;

    vec2 windBasePos = worldPos.xz * uWindBaseTiling;
    float baseWaveTime = uTime * (uWindSpeed * 0.93);
    float baseWave = fbm(windBasePos - vec2(baseWaveTime, 0.0), 2.0) * uWindBaseStrength;

    float windStrength = (primaryWave + baseWave) * uWindAmplitude;
    vec2 windDir;
    windDir.x = windStrength;
    windDir.y = windStrength * 0.3 * sin(windWaveTime * 0.5);
    return windDir;
}

mat3 rotateAxis(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat3(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c);
}

varying vec2 vGrassUv;
