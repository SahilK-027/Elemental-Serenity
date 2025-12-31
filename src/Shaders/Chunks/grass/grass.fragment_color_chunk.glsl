#include <color_fragment>

vec4 heightMap = texture2D(uDisplacementMap, vGrassUv * uTerrainNormalScale);
vec3 grassColor = mix(uGrassColorDark, uGrassColorLight, heightMap.r);

float mask = smoothstep(0.2, 0.98, vBladeMask);
mask = pow(mask, 0.5);
float finalMask = clamp(mask, 0.0, 1.0);

grassColor = mix(uShadowColor, grassColor, finalMask);
diffuseColor.rgb = grassColor;
