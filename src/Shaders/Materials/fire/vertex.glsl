attribute vec2 particleData;

uniform sampler2D uSizeOverLife;
uniform sampler2D uColorOverLife;
uniform sampler2D uTwinkleOverLife;
uniform float uTime;

varying float vAngle;
varying vec4 vColour;

void main() {
    float life = particleData.x;
    float id = particleData.y;

    float sizeSample = texture2D(uSizeOverLife, vec2(life, 0.5)).r;
    vec4 colorSample = texture2D(uColorOverLife, vec2(life, 0.5));
    float twinkleSample = texture2D(uTwinkleOverLife, vec2(life, 0.5)).r;
    float twinkle = mix(1.0, sin(uTime * 20.0 + id * 6.28) * 0.5 + 0.5, twinkleSample);

    vec3 mvPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * vec4(mvPosition, 1.0);
    gl_PointSize = (sizeSample * 4000.0 / -mvPosition.z);

    vAngle = 0.0;
    vColour = colorSample;
    vColour.a *= twinkle;
}
