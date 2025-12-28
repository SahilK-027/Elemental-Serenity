uniform sampler2D uParticleTexture;

varying float vAngle;
varying vec4 vColour;

void main() {
    vec2 uv = gl_PointCoord.xy;
    float c = cos(vAngle);
    float s = sin(vAngle);
    mat2 r = mat2(c, s, -s, c);
    uv = (uv - 0.5) * r + 0.5;

    vec4 particleTexture = texture2D(uParticleTexture, uv);
    gl_FragColor = particleTexture * vColour;
}
