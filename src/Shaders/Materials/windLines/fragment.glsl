uniform vec3 uColor;
varying float vAlpha;

void main() {
    gl_FragColor = vec4(uColor, vAlpha);
}
