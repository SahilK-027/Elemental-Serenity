#include <common>
#include <fog_pars_vertex>

precision highp float;

attribute vec3 instanceNormal;
attribute vec3 instanceShadowColor;
attribute vec3 instanceMidColor;
attribute vec3 instanceHighlightColor;
attribute vec3 instanceColorMultiplier;

varying vec3 vInstanceShadowColor;
varying vec3 vInstanceMidColor;
varying vec3 vInstanceHighlightColor;
varying vec3 vInstanceColorMultiplier;
varying vec3 vInstanceNormal;
varying vec2 vUv;
varying float vWorldY;
varying vec3 vDebugColor;

uniform float uTime;
uniform float uBreezeSpeed;
uniform float uBreezeScale;
uniform float uBreezeStrength;
uniform float uSquallSpeed;
uniform float uSquallScale;
uniform float uSquallStrength;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
    #include <begin_vertex>
    #include <project_vertex>
    mat4 m = modelMatrix;

    #ifdef USE_INSTANCING
    m = instanceMatrix;
    #endif

    vec3 worldPosition = m[3].xyz;

    float scaleX = length(m[0].xyz);
    float scaleY = length(m[1].xyz);

    vec3 cameraRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);

    vec3 cameraUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);

    float heightMask = clamp(position.y + 0.5, 0.0, 1.0);
    heightMask = pow(heightMask, 1.5);

    vec2 windPos = worldPosition.xz + position.xz;

    float Breeze = noise(windPos * uBreezeScale + uTime * uBreezeSpeed) - 0.5;
    float Squall = noise(windPos * uSquallScale * 0.5 + uTime * uSquallSpeed) - 0.5;

    float wind = (Breeze * uBreezeStrength + Squall * uSquallStrength) * heightMask;

    vec3 windOffset = cameraRight * wind * 0.25 + cameraUp * wind * 0.1;

    vec3 billboardPosition = worldPosition + (cameraRight * position.x * scaleX) + (cameraUp * position.y * scaleY) + windOffset;

    gl_Position = projectionMatrix * viewMatrix * vec4(billboardPosition, 1.0);

    vInstanceNormal = instanceNormal;
    vUv = uv;
    vWorldY = billboardPosition.y;
    vDebugColor = windOffset;
    vInstanceShadowColor = instanceShadowColor;
    vInstanceMidColor = instanceMidColor;
    vInstanceHighlightColor = instanceHighlightColor;
    vInstanceColorMultiplier = instanceColorMultiplier;

    #include <fog_vertex>
}
