varying vec2 vUv;
varying float vProgress;

void main() {
    vUv = uv;
    // Use the Y position (0 to 1) as progress along the arc
    vProgress = position.y / 15.0; // height is 15

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
