varying vec2 vUv;
varying float vProgress;

void main() {
    vUv = uv;
    vProgress = position.y / 15.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
