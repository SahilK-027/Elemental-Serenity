uniform float uTime;
uniform vec2 uResolution;
uniform float uPixelRatio;
uniform float uSize;

attribute float aScale;

varying float vColorMix;

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 10.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float cnoise(vec3 P) {
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

mat3 rotation3dY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

vec3 fbm_vec3(vec3 p, float frequency, float offset) {
    return vec3(cnoise((p + vec3(offset)) * frequency), cnoise((p + vec3(offset + 20.0)) * frequency), cnoise((p + vec3(offset - 30.0)) * frequency));
}

float hash1(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}

vec3 curlNoise(vec3 p) {
    float e = 0.0125;
    vec3 F = fbm_vec3(p, 1.0, 0.0);
    vec3 Fx = fbm_vec3(p + vec3(e, 0.0, 0.0), 1.0, 0.0);
    vec3 Fy = fbm_vec3(p + vec3(0.0, e, 0.0), 1.0, 0.0);
    vec3 Fz = fbm_vec3(p + vec3(0.0, 0.0, e), 1.0, 0.0);

    vec3 dFdx = (Fx - F) / e;
    vec3 dFdy = (Fy - F) / e;
    vec3 dFdz = (Fz - F) / e;

    vec3 curl = vec3(dFdz.y - dFdy.z, dFdx.z - dFdz.x, dFdy.x - dFdx.y);
    return curl;
}

vec3 rotateAroundAxis(vec3 v, vec3 axis, float angle) {
    axis = normalize(axis + 1e-6);
    float c = cos(angle);
    float s = sin(angle);
    return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}

void main() {
    float flowSpeed = 0.2;
    float flowAmplitude = 0.15;
    float driftMagnitude = 1.20;
    float jitterMagnitude = 0.05;

    vec3 pos = position;

    float colorMix = cnoise(pos * 0.3) * 0.5 + 0.5;
    vColorMix = colorMix;

    float phase = hash1(pos) * 6.28318530718;
    float baseSize = (cnoise(pos * 0.45) * 0.5 + 0.5);
    float particleSize = baseSize * 1.1;

    vec3 flowSamplePoint = pos + vec3(uTime * flowSpeed);
    vec3 localFlow = curlNoise(flowSamplePoint);
    vec3 advectedCenter = pos + localFlow * (flowAmplitude * (0.5 + 0.5 * baseSize));

    vec3 seedVec = fbm_vec3(pos * 0.35, 1.0, 10.0);
    float seed = hash1(pos + vec3(7.0));
    vec3 driftDir = normalize(seedVec + vec3(0.001));
    float driftFreq = 0.06 + 0.12 * seed;
    vec3 drift = driftDir * sin(uTime * driftFreq + phase * 0.5) * (driftMagnitude * baseSize);

    vec3 jitterNoise = fbm_vec3(pos * 4.0 + vec3(uTime * 0.45), 2.0, 3.0);
    vec3 jitter = (jitterNoise - 0.5) * (jitterMagnitude * baseSize);

    vec3 particleWorld = advectedCenter + drift + jitter;

    vec4 viewPosition = viewMatrix * vec4((modelMatrix * vec4(particleWorld, 1.0)).xyz, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    float finalSize = uSize * particleSize * aScale * uPixelRatio * 100.0;
    gl_PointSize = finalSize * (1.0 / -viewPosition.z);
}
