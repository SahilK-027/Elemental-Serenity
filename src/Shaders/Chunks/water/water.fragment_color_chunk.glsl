#include <color_fragment>

vec4 densityMap = texture2D(uDensityMap, vUv);
vec4 perlinNoise = texture2D(uPerlinNoise, vUv * 2.0);
vec4 waterDepthMap = texture2D(uWaterDepthTexture, vUv);

float waterDensityMask = smoothstep(uDensityMaskMin, uDensityMaskMax, densityMap.b);
float waterDepth = waterDepthMap.b;

float shoreMask = smoothstep(uShoreMaskThreshold, 0.0, waterDepth);

float noise1 = texture2D(uPerlinNoise, vUv * uNoiseScale1 + uTime * uNoiseSpeed1).r;
float noise2 = texture2D(uPerlinNoise, vUv * uNoiseScale2 - uTime * uNoiseSpeed2).g;

float combinedNoise = noise1 * uNoiseMix1 + noise2 * uNoiseMix2;
float noisyDepth = waterDepth + combinedNoise * uNoiseDepthInfluence;

float ripplePattern = fract((noisyDepth + uTime) * uRippleFrequency);

float rippleRing = smoothstep(0.0, uRippleInnerEdge, ripplePattern) *
        smoothstep(uRippleOuterEdge, uRippleInnerEdge, ripplePattern);

float breakupMask = smoothstep(uBreakupMin, uBreakupMax, combinedNoise);

rippleRing *= shoreMask * breakupMask;
rippleRing *= smoothstep(0.0, uWaterDepthFade, waterDepth);

if(rippleRing < uDiscardThreshold) {
discard;
}

diffuseColor.rgb = vec3(1.0);
diffuseColor.a = rippleRing * waterDensityMask * uRippleOpacity;