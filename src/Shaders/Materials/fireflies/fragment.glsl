uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying float vColorMix;

void main() {
    vec2 uv = gl_PointCoord;

    vec4 particlesTexture = texture2D(uTexture, uv);

    float colorMix = vColorMix;

    vec3 color1 = vec3(1.0, 0.67, 0.21);
    vec3 color2 = vec3(0.99, 0.43, 0.0);

    vec3 starColor = mix(color1, color2, colorMix);

    float speed = 20.0;
    float sharpness = 4.0;
    float baseline = 0.7;
    float intensity = 1.8;

    float phase = particlesTexture.g * 6.28318530718;

    float flicker = 0.5 + 0.5 * sin(uTime * speed + phase);

    float brightness = mix(baseline, 1.0, pow(flicker, sharpness)) * intensity;

    starColor *= brightness;

    gl_FragColor = vec4(starColor, particlesTexture.r);
}
