#include <begin_vertex>

float angleToCamera = atan(baseWorldPos.z - cameraPosition.z, baseWorldPos.x - cameraPosition.x) - 1.5707963267948966;
transformed.xz = rotateUV(transformed.xz, angleToCamera, vec2(0.0));

float densityCull = step(uDensityThreshold, density);
float finalScale = aBaseScale * densityCull;
transformed *= finalScale;

float localY = position.y;
vBladeMask = clamp((localY - uBladeModelMinY) / uBladeModelHeight, 0.0, 1.0);

if(windMagnitude > 0.001) {
    mat3 bendRotation = rotateAxis(rotationAxis, bendAngle);
    transformed = bendRotation * transformed;
}
