uniform float uTime;
uniform float uStartTime;
uniform float uDuration;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uIntensity;

varying vec2 vUv;
varying float vProgress;

void main() {
    float localTime = uTime - uStartTime;
    float timeProgress = clamp(localTime / uDuration, 0.0, 1.0);

    float alpha = 1.0 - timeProgress;

    vec3 mixedColor = mix(uColorA, uColorB, vProgress);

    vec3 finalColor = mixedColor * uIntensity;

    gl_FragColor = vec4(finalColor * 1.3, alpha);
}
