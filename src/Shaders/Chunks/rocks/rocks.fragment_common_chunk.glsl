#include <common>
uniform sampler2D uDisplacementMap;
uniform sampler2D uPerlinNoise;
uniform vec3 uRockColor1;
uniform vec3 uRockColor2;
uniform vec3 uRockColor3;
uniform vec3 uMossColor1;
uniform vec3 uMossColor2;
uniform vec3 uMossColor3;
uniform float uMossNoiseFactor;
uniform float uMossVisibility;

varying vec2 vUv;
varying vec3 vWorldSpaceNormal;
