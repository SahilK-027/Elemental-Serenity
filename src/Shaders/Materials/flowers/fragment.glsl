#include <common>
#include <fog_pars_fragment>
uniform sampler2D uFlowerAtlas;
uniform float uTimeColorAlpha;
varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(uFlowerAtlas, vUv);

    if(texColor.a < 0.5)
        discard;
    texColor.a *= uTimeColorAlpha;
    gl_FragColor = texColor;

    #include <fog_fragment>
}
