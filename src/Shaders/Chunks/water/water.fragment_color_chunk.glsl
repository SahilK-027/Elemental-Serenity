#include <color_fragment>

vec4 densityMap = texture2D(uDensityMap, vUv);
vec4 waterDepthMap = texture2D(uWaterDepthTexture, vUv);

float waterDensityMask = smoothstep(uDensityMaskMin, uDensityMaskMax, densityMap.b);
float waterDepth = waterDepthMap.b;

float finalAlpha = 0.0;
vec3 finalColor = vec3(1.0);

float shoreMask = smoothstep(uShoreMaskThreshold, 0.0, waterDepth);
float centerMask = smoothstep(uSplashesCenterMin, uSplashesCenterMax, waterDepth);


if ( uRipplesRatio > 0.001 ) {
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

finalAlpha = max(finalAlpha, rippleRing*waterDensityMask*uRippleOpacity*uRipplesRatio);
}


if ( uSplashesRatio > 0.001 ) {
vec2 splashUv = vWorldPosition.xz * uSplashesNoiseFrequency;


vec3 splashesVoronoi = voronoi(splashUv, 8.0);
float splashPerlin = texture2D(uPerlinNoise, splashUv * 0.25).r;


float splash = splashesVoronoi.r;


float splashTimeRandom = hash2(vec2(splashesVoronoi.b * 123456.0)) + splashPerlin;
float splashTime = uTime * uSplashesTimeFrequency + splashTimeRandom;
splash = fract(splash-splashTime);


float edgeMultiplier = smoothstep(uSplashesEdgeAttenuationLow, uSplashesEdgeAttenuationHigh, splashesVoronoi.g);
float thickness = uSplashesThickness * edgeMultiplier;
splash = 1.0 - step(thickness, splash);


float splashVisibilityRandom = hash2(vec2(splashesVoronoi.b * 654321.0));
float visible = fract(splashVisibilityRandom + splashPerlin);
visible = step(visible, uSplashesRatio);
splash *= visible;


splash *= centerMask;

finalAlpha = max(finalAlpha, splash*waterDensityMask);


if ( splash > 0.01 ) {
finalColor = mix(finalColor, vec3(1.0), splash*0.8);
}
}


if ( uIceRatio > 0.001 ) {
vec2 iceUv = vWorldPosition.xz * uIceNoiseFrequency;


float iceVoronoi = voronoi(iceUv, 8.0).g;


float iceMask = smoothstep(0.0, uIceRatio, waterDepth);
float ice = step(iceMask, iceVoronoi);

finalAlpha = max(finalAlpha, ice*waterDensityMask*0.9);


if ( ice > 0.01 ) {
vec3 iceColor = uIceColor;
finalColor = mix(finalColor, iceColor, ice*0.7);
}
}


if ( finalAlpha < uDiscardThreshold ) {
discard ;
}

diffuseColor.rgb = finalColor;
diffuseColor.a = finalAlpha;
