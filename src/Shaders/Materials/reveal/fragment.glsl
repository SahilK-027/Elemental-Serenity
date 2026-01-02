precision mediump float;

uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;

    for(int i = 0; i < 3; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 st = vUv;

    float time = uTime * 0.3;
    float n1 = fbm(st * 4.0 + time);
    float n2 = fbm(st * 8.0 - time * 0.7);

    vec2 center = vec2(0.5, 0.5);
    float dist = distance(st, center);

    float radial = 1.0 - smoothstep(0.0, 0.8, dist);

    float pattern = mix(n1, n2, 0.5) * 0.4;
    float reveal = uProgress * 1.2 + pattern - dist * 0.6;

    reveal = smoothstep(0.0, 0.3, reveal);

    float alpha = 1.0 - reveal;
    alpha = smoothstep(0.0, 0.05, alpha);

    vec3 color = vec3(0.929, 0.910, 0.894);

    gl_FragColor = vec4(color, alpha);
}
