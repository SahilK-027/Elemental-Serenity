#include <color_fragment>

vec4 heightMap = texture2D(uDisplacementMap, vUv);
vec4 densityMap = texture2D(uDensityMap, vUv);
vec4 perlinNoise = texture2D(uPerlinNoise, vUv * 2.0);
vec4 rockMap = texture2D(uGroundRockMap, vUv * uRockTiling);
float rockAO = texture2D(uGroundRockAO, vUv * uRockTiling).r;

float densityMask = smoothstep(0.01, 1.25, densityMap.g);
vec3 X = mix(perlinNoise.rgb, vec3(1.0), smoothstep(0.9, 1.0, densityMap.g));
float rockMask = smoothstep(0.0, 0.55, X.r);

vec3 groundColor = mix(uGroundColorLight, uGroundColorDark, heightMap.r);
groundColor = mix(groundColor, uGroundColorBelowGrass, densityMask);

vec3 rockColor = rockMap.rgb * uRockColor * mix(1.0, rockAO, 2.0 * rockMask);
groundColor = mix(rockColor, groundColor, rockMask);

float waterMask = densityMap.b;

vec2 waterGrad = vec2(dFdx(waterMask), dFdy(waterMask));
float edgeStrength = length(waterGrad) * 5.0;
float edgeSoftness = smoothstep(0.0, 1.0, edgeStrength);

waterMask = mix(waterMask, waterMask * (1.0 - edgeSoftness * 0.7), min(edgeStrength, 1.0));

vec2 waterCenter = vec2(0.53, 0.535);
float distFromCenter = length(vUv - waterCenter);

float depthGradient = 1.0 - smoothstep(0.0, 0.3, distFromCenter);
depthGradient = pow(depthGradient, uWaterDepthIntensity);

vec3 waterColor = mix(uWaterShallow, uWaterDeep, depthGradient);

groundColor = mix(groundColor, waterColor, waterMask);

diffuseColor.rgb = groundColor;
