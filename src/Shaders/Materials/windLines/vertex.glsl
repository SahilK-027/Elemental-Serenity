attribute float ratio;
uniform float uThickness;
uniform float uProgress;
uniform vec3 uTangent;

varying float vAlpha;

void main() {
    float baseThickness = smoothstep(0.0, 1.0, 1.0 - abs(ratio - 0.5) * 2.0);

    float remapedProgress = uProgress * 3.0 - 1.0;
    float progressThickness = smoothstep(0.0, 1.0, 1.0 - abs(ratio - remapedProgress));

    float finalThickness = uThickness * baseThickness * progressThickness;

    float side = mod(float(gl_VertexID), 2.0) - 0.5;

    vec3 offset = uTangent * side * finalThickness;
    vec3 worldPosition = position + offset;

    vAlpha = baseThickness * progressThickness;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPosition, 1.0);
}
