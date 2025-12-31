varying vec3 vWorldPosition;
varying vec3 vViewDirection;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = normalize(worldPosition.xyz);
    vViewDirection = normalize(worldPosition.xyz - cameraPosition);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
