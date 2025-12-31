#include <common>
uniform sampler2D uDensityMap;
uniform sampler2D uDisplacementMap;
uniform sampler2D uPerlinNoise;
uniform sampler2D uGroundRockMap;
uniform sampler2D uGroundRockAO;
uniform vec3 uGroundSize;
uniform vec3 uGroundColorLight;
uniform vec3 uGroundColorDark;
uniform vec3 uGroundColorBelowGrass;
uniform vec3 uRockColor;
uniform float uRockTiling;
uniform vec3 uWaterShallow;
uniform vec3 uWaterDeep;
uniform float uWaterDepthIntensity;
varying vec2 vUv;
