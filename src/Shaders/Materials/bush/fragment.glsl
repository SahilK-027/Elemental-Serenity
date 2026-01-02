#include <common>
#include <fog_pars_fragment>

precision highp float;

varying vec3 vInstanceNormal;
varying vec2 vUv;
varying float vWorldY;
varying vec3 vDebugColor;
varying vec3 vInstanceShadowColor;
varying vec3 vInstanceMidColor;
varying vec3 vInstanceHighlightColor;
varying vec3 vInstanceColorMultiplier;

uniform vec3 uLightDirection;
uniform sampler2D uAlphaMap;
uniform vec3 uShadowColor;
uniform vec3 uMidColor;
uniform vec3 uHighlightColor;

vec3 ambientLight(vec3 lightColor, float lightIntensity) {
    return lightColor * lightIntensity;
}

vec3 colorRamp(float t, vec3 shadowColor, vec3 midColor, vec3 highlightColor) {
    if(t < 0.5) {
        return mix(shadowColor, midColor, t * 2.0);
    } else {
        return mix(midColor, highlightColor, (t - 0.5) * 2.0);
    }
}

vec3 colorRampDEBUG(float t) {
    if(t < 0.5) {
        return mix(uShadowColor, uMidColor, t * 2.0);
    } else {
        return mix(uMidColor, uHighlightColor, (t - 0.5) * 2.0);
    }
}

void main() {
    vec3 shadowColor = vInstanceShadowColor;
    vec3 midColor = vInstanceMidColor;
    vec3 highlightColor = vInstanceHighlightColor;

    float alpha = texture2D(uAlphaMap, vUv).a;
    float a = smoothstep(0.4, 0.6, alpha);
    if(a < 0.01) {
        discard;
    }

    vec3 normal = normalize(vInstanceNormal);
    float ndl = dot(normal, normalize(uLightDirection));
    ndl = ndl * 0.6 + 0.4;

    float t = clamp(vWorldY * 0.1 + ndl, 0.0, 1.0);

    vec3 color = colorRamp(t, shadowColor, midColor, highlightColor);
    color *= vInstanceColorMultiplier;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
}
