#include <common>
uniform sampler2D uDensityMap;
uniform sampler2D uPerlinNoise;
uniform sampler2D uWaterDepthTexture;
uniform float uTime;
uniform float uRipplesRatio;
uniform float uDensityMaskMin;
uniform float uDensityMaskMax;
uniform float uShoreMaskThreshold;
uniform float uNoiseScale1;
uniform float uNoiseScale2;
uniform float uNoiseSpeed1;
uniform float uNoiseSpeed2;
uniform float uNoiseMix1;
uniform float uNoiseMix2;
uniform float uNoiseDepthInfluence;
uniform float uRippleFrequency;
uniform float uRippleInnerEdge;
uniform float uRippleOuterEdge;
uniform float uBreakupMin;
uniform float uBreakupMax;
uniform float uWaterDepthFade;
uniform float uDiscardThreshold;
uniform float uRippleOpacity;
uniform float uSplashesRatio;
uniform float uSplashesNoiseFrequency;
uniform float uSplashesTimeFrequency;
uniform float uSplashesThickness;
uniform float uSplashesEdgeAttenuationLow;
uniform float uSplashesEdgeAttenuationHigh;
uniform float uSplashesCenterMin;
uniform float uSplashesCenterMax;
uniform float uIceRatio;
uniform float uIceNoiseFrequency;
uniform vec3 uIceColor;

varying vec2 vUv;
varying vec3 vWorldPosition;


float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
}

vec3 voronoi(vec2 uv, float repeat) {
    vec2 cellId = vec2(0.0);
    uv *= repeat;
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    float minDist = 1.0;
    float minEdge = 1.0;
    vec2 bestId = vec2(0.0);

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 cell = mod(i + neighbor, repeat);
            vec2 point = hash22(cell);
            vec2 diff = neighbor + point - f;
            float dist = length(diff);

            if (dist < minDist) {
                minEdge = minDist;
                minDist = dist;
                bestId = i + neighbor;
            } else if (dist < minEdge) {
                minEdge = dist;
            }
        }
    }

    cellId = fract(bestId / repeat);
    return vec3(minDist, minEdge - minDist, hash22(cellId).x);
}
