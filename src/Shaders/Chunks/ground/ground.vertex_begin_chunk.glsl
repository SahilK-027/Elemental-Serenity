#include <begin_vertex>

vec4 worldPos = modelMatrix * vec4(position, 1.0);
vec2 heightUv = (worldPos.xz + uGroundSize.xz * 0.5) / uGroundSize.xz;

vUv = heightUv;
