vec2 world_Pos_UVs = (aWorldPosition / uGroundSize + 0.5);
vGrassUv = world_Pos_UVs;

float density = texture2D(uDensityMap, world_Pos_UVs).g;

vec2 scaledNormalUVs = world_Pos_UVs * uTerrainNormalScale;
vec3 tangentNormal = (texture2D(uTerrainNormalMap, scaledNormalUVs).rgb * 2.0 - 1.0);

vec3 worldNormal = vec3(0.0, 1.0, 0.0);
vec3 worldTangent = vec3(1.0, 0.0, 0.0);
vec3 worldBitangent = normalize(cross(worldNormal, worldTangent));

mat3 TBN = mat3(worldTangent, worldBitangent, worldNormal);
vec3 terrainNormal = normalize(TBN * tangentNormal);
terrainNormal = normalize(mix(vec3(0.0, 1.0, 0.0), terrainNormal, uNormalStrength));

vec4 baseWorldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
vec2 windVector = calculateWindVector(baseWorldPos.xyz);

float windMagnitude = length(windVector);
vec3 windDir3D = normalize(vec3(windVector.x, 0.0, windVector.y));
vec3 rotationAxis = cross(windDir3D, vec3(0.0, 1.0, 0.0));

float heightFactor = position.y;
float bendAngle = windMagnitude * heightFactor * heightFactor * 2.0;

if(windMagnitude > 0.001) {
  mat3 bendRotation = rotateAxis(rotationAxis, bendAngle);
  terrainNormal = bendRotation * terrainNormal;
}

#include <beginnormal_vertex>

objectNormal = terrainNormal;
