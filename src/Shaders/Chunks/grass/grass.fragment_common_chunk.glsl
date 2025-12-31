#include <common>

uniform sampler2D uDisplacementMap;
uniform vec3 uGrassColorDark;
uniform vec3 uGrassColorLight;
uniform vec3 uShadowColor;
uniform float uTerrainNormalScale;

varying vec2 vGrassUv;
varying float vBladeMask;
