#include <color_fragment>

vec4 displacement = texture2D(uDisplacementMap, vUv);
vec4 perlinNoise = texture2D(uPerlinNoise, vUv * 2.0);

vec3 color1 = mix(uRockColor1, uRockColor2, displacement.r);
vec3 color = mix(color1, uRockColor3, perlinNoise.r);
color *= 0.9 + (perlinNoise.r * 0.2);

float upwardFacing = max(0.0, vWorldSpaceNormal.y);
vec3 mossColor1 = mix(uMossColor1, uMossColor2, displacement.r);
vec3 mossColor = mix(mossColor1, uMossColor3, displacement.r);
color = mix(color, mossColor, upwardFacing * (perlinNoise.r / uMossNoiseFactor) * uMossVisibility);

diffuseColor.rgb = color;
