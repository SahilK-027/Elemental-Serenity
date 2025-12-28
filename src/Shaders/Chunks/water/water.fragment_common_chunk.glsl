#include <common>
uniform sampler2D uDensityMap;
uniform sampler2D uPerlinNoise;
uniform sampler2D uWaterDepthTexture;
uniform float uTime;
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

varying vec2 vUv;