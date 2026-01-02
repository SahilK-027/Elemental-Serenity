uniform vec3 uZenithColor;
uniform vec3 uHorizonColor;
uniform vec3 uGroundColor;
uniform vec3 uSunPosition;
uniform vec3 uSunColor;
uniform vec3 uSunGlowColor;
uniform float uSunSize;
uniform float uSunGlowSize;
uniform float uSunRayCount;
uniform float uSunRayLength;
uniform float uSunRaySharpness;
uniform vec3 uMoonPosition;
uniform vec3 uMoonColor;
uniform vec3 uMoonGlowColor;
uniform float uMoonSize;
uniform float uMoonGlowSize;
uniform vec3 uStarColor;
uniform float uStarDensity;
uniform float uStarBrightness;
uniform float uTime;
uniform float uIsNight;
uniform float uSeason;
uniform float uAtmosphereIntensity;

varying vec3 vWorldPosition;
varying vec3 vViewDirection;

float hash(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
}

vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

vec3 animeSun(
    vec3 direction,
    vec3 sunDir,
    vec3 sunColor,
    vec3 glowColor,
    float sunSize,
    float glowSize,
    float rayCount,
    float rayLength,
    float raySharpness
) {
    float sunDot = dot(direction, sunDir);

    if(sunDot < 0.85) {
        float distFromSun = acos(clamp(sunDot, -1.0, 1.0));
        float outerGlow = smoothstep(glowSize * 2.0, 0.0, distFromSun);
        return glowColor * (outerGlow * outerGlow * 0.3) * vec3(1.0, 0.8, 0.6);
    }

    float distFromSun = acos(sunDot);
    vec3 result = vec3(0.0);

    vec3 sunRight = normalize(cross(sunDir, vec3(0.0, 1.0, 0.0)));
    vec3 sunUp = normalize(cross(sunRight, sunDir));
    float sunX = dot(direction - sunDir * sunDot, sunRight);
    float sunY = dot(direction - sunDir * sunDot, sunUp);
    float angle = atan(sunY, sunX);

    float outerGlow = smoothstep(glowSize * 2.0, 0.0, distFromSun);
    result += glowColor * (outerGlow * outerGlow * 0.3) * vec3(1.0, 0.8, 0.6);

    float rayPattern = cos(angle * rayCount) * 0.5 + 0.5;
    rayPattern = pow(rayPattern, raySharpness);
    float rayStart = sunSize * 0.8;
    float rayEnd = sunSize + rayLength;
    float rayMask = smoothstep(rayEnd, rayStart, distFromSun) *
        smoothstep(sunSize * 0.5, rayStart, distFromSun);
    result += mix(sunColor, glowColor, 0.5) * (rayPattern * rayMask * 0.8);

    float midGlow = smoothstep(glowSize, sunSize * 0.5, distFromSun) *
        smoothstep(sunSize * 0.3, sunSize * 0.8, distFromSun);
    float innerGlow = smoothstep(sunSize * 1.5, sunSize * 0.9, distFromSun);
    innerGlow *= innerGlow;

    result += glowColor * midGlow * 0.6;
    result += mix(glowColor, sunColor, 0.7) * innerGlow * 0.5;

    float discMask = smoothstep(sunSize, sunSize * 0.85, distFromSun);
    float discGradient = smoothstep(sunSize, 0.0, distFromSun);
    vec3 discColor = mix(sunColor * 0.95, sunColor * 1.2, discGradient) +
        vec3(0.1, 0.05, 0.0) * (1.0 - discGradient);

    result = mix(result, discColor, discMask);

    float centerHighlight = smoothstep(sunSize * 0.4, 0.0, distFromSun);
    result += vec3(1.0, 0.98, 0.9) * (centerHighlight * centerHighlight * 0.3);

    return result;
}

float stars(vec2 uv, float density) {
    vec2 starUv = uv * 30.0;
    vec2 starId = floor(starUv);
    vec2 starPos = fract(starUv);

    float star = 0.0;

    for(int x = 0; x <= 1; x++) {
        for(int y = 0; y <= 1; y++) {
            vec2 cellId = starId + vec2(float(x), float(y));

            float cellHash = hash(cellId);

            if(cellHash < density * 0.12) {
                vec2 starCenter = fract(sin(cellId * vec2(12.9898, 78.233)) * 43758.5453) * 0.8 + 0.1;
                vec2 starLocalPos = starPos - vec2(float(x), float(y)) - starCenter;
                float dist = length(starLocalPos);

                float brightness = cellHash * 0.5 + 0.5;
                float starSize = 0.025 + brightness * 0.015;

                float starIntensity = max(0.0, 1.0 - dist * (1.0 / starSize));
                star += brightness * starIntensity * starIntensity;
            }
        }
    }

    return min(star, 1.0);
}

void main() {
    vec3 direction = normalize(vWorldPosition);

    float altitude = direction.y;

    vec3 skyColor;

    if(altitude > 0.0) {
        float factor = altitude * altitude * sqrt(altitude);
        skyColor = mix(uHorizonColor, uZenithColor, factor);
    } else {
        float factor = altitude * altitude * altitude;
        skyColor = mix(uHorizonColor, uGroundColor, -factor);
    }

    vec3 finalColor = skyColor;

    if(uIsNight < 0.5) {
        bool showSun = uSeason < 0.5 || (uSeason > 1.5 && uSeason < 2.5);

        if(showSun) {
            vec3 sunDir = normalize(uSunPosition);
            vec3 sunContribution = animeSun(direction, sunDir, uSunColor, uSunGlowColor, uSunSize, uSunGlowSize, uSunRayCount, uSunRayLength, uSunRaySharpness);

            finalColor += sunContribution;
        }
    } else {
        vec3 moonDir = normalize(uMoonPosition);
        float moonDot = dot(direction, moonDir);
        float distFromMoon = acos(clamp(moonDot, -1.0, 1.0));

        float outerGlowRadius = uMoonGlowSize * 3.0;
        float outerGlow = smoothstep(outerGlowRadius, 0.0, distFromMoon);
        outerGlow = outerGlow * outerGlow * outerGlow;
        finalColor += uMoonGlowColor * outerGlow * 0.15;

        float midGlowRadius = uMoonGlowSize * 1.5;
        float midGlow = smoothstep(midGlowRadius, uMoonSize * 0.5, distFromMoon);
        midGlow = midGlow * midGlow;
        finalColor += uMoonGlowColor * midGlow * 0.25;

        float innerHaloStart = uMoonSize * 1.8;
        float innerHaloEnd = uMoonSize * 0.95;
        float innerHalo = smoothstep(innerHaloStart, innerHaloEnd, distFromMoon);
        innerHalo *= smoothstep(uMoonSize * 0.7, uMoonSize * 0.95, distFromMoon);
        vec3 haloColor = mix(uMoonGlowColor, uMoonColor, 0.5);
        finalColor += haloColor * innerHalo * 0.4;

        if(distFromMoon < uMoonSize) {
            float moonMask = smoothstep(uMoonSize, uMoonSize * 0.85, distFromMoon);

            vec2 moonUv = (direction.xy - moonDir.xy) * 20.0;
            float craters = noise(moonUv * 5.0) * 0.3;

            float discGradient = smoothstep(uMoonSize, 0.0, distFromMoon);
            vec3 moonSurface = uMoonColor * (0.75 + craters + discGradient * 0.15);

            finalColor = mix(finalColor, moonSurface, moonMask);

            float centerHighlight = smoothstep(uMoonSize * 0.4, 0.0, distFromMoon);
            centerHighlight = centerHighlight * centerHighlight;
            finalColor += vec3(1.0, 1.0, 0.98) * centerHighlight * 0.15;
        }

        float starVisibility = smoothstep(-0.3, 0.2, direction.y);

        if(starVisibility > 0.01) {
            vec2 starUv = vec2(atan(direction.z, direction.x) * 0.15915 + 0.5, acos(clamp(direction.y, -1.0, 1.0)) * 0.31831);

            float starField = stars(starUv, uStarDensity);
            finalColor += uStarColor * starField * uStarBrightness * starVisibility;
        }
    }

    float atmosphereGlow = 1.0 - abs(altitude);
    atmosphereGlow = atmosphereGlow * atmosphereGlow * atmosphereGlow;
    finalColor += vec3(0.5, 0.7, 1.0) * (atmosphereGlow * 0.1 * uAtmosphereIntensity);

    float timeVariation = sin(uTime * 0.1) * 0.01;
    finalColor += vec3(timeVariation, timeVariation * 0.5, timeVariation * 0.3);

    gl_FragColor = vec4(finalColor, 1.0);
}
