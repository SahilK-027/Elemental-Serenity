import * as THREE from 'three';
import Game from '../../../Game.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class Skydome {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;
    this.currentSeason = this.seasonManager.currentSeason;
    this.debugGUI = this.game.debug;

    this.skydome = null;
    this.skydomeMaterial = null;

    this.skyColors = this.createSkyColorPresets();

    this.initialize();

    // Listen for environment and season changes
    this.environmentTimeManager.onChange((newValue) => {
      this.onEnvTimeChanged(newValue);
    });

    this.seasonManager.onChange((newSeason) => {
      this.onSeasonChanged(newSeason);
    });
  }

  createSkyColorPresets() {
    return {
      spring: {
        day: {
          zenithColor: new THREE.Color(0.0, 0.35, 0.82), // Deep sky blue at zenith
          horizonColor: new THREE.Color(0.46, 0.74, 0.93), // Light blue-white at horizon
          groundColor: new THREE.Color(0.04, 0.55, 0.65), // Warm white near ground
          sunColor: new THREE.Color(0.82, 0.4, 0.17), // Warm yellow sun
          sunGlowColor: new THREE.Color(1, 0.88, 0.47), // Orange sun glow
        },
        night: {
          zenithColor: new THREE.Color(0.02, 0.05, 0.15), // Deep night blue
          horizonColor: new THREE.Color(0.05, 0.1, 0.25), // Horizon glow
          groundColor: new THREE.Color(0.1, 0.15, 0.3), // Ground reflection
          moonColor: new THREE.Color(0.95, 0.95, 1.0), // Cool white moon
          moonGlowColor: new THREE.Color(0.7, 0.8, 1.0), // Blue moon glow
          starColor: new THREE.Color(1.0, 1.0, 1.0), // Bright white stars
        },
      },
      winter: {
        day: {
          zenithColor: new THREE.Color(0.4, 0.6, 0.9), // Cold blue
          horizonColor: new THREE.Color(0.8, 0.85, 0.95), // Icy white
          groundColor: new THREE.Color(0.9, 0.92, 0.98), // Snow reflection
          sunColor: new THREE.Color(0.95, 0.95, 1.0), // Pale sun
          sunGlowColor: new THREE.Color(0.8, 0.9, 1.0), // Cool glow
        },
        night: {
          zenithColor: new THREE.Color(0.01, 0.03, 0.12), // Arctic night
          horizonColor: new THREE.Color(0.03, 0.08, 0.2), // Aurora hint
          groundColor: new THREE.Color(0.08, 0.12, 0.25), // Snow glow
          moonColor: new THREE.Color(1.0, 1.0, 1.0), // Bright moon
          moonGlowColor: new THREE.Color(0.8, 0.9, 1.0), // Ice blue glow
          starColor: new THREE.Color(0.9, 0.95, 1.0), // Crystal stars
        },
      },
      autumn: {
        day: {
          zenithColor: new THREE.Color(0.6, 0.4, 0.2), // Warm brown-orange
          horizonColor: new THREE.Color(0.68, 0.4, 0.14), // Golden horizon
          groundColor: new THREE.Color(1.0, 0.7, 0.4), // Warm gold
          sunColor: new THREE.Color(1.0, 0.7, 0.3), // Orange sun
          sunGlowColor: new THREE.Color(1.0, 0.5, 0.2), // Deep orange glow
        },
        night: {
          zenithColor: new THREE.Color(0.08, 0.04, 0.08), // Dark purple
          horizonColor: new THREE.Color(0.15, 0.08, 0.12), // Warm dark
          groundColor: new THREE.Color(0.25, 0.15, 0.2), // Earth tones
          moonColor: new THREE.Color(1.0, 0.85, 0.7), // Harvest moon
          moonGlowColor: new THREE.Color(1.0, 0.7, 0.5), // Warm glow
          starColor: new THREE.Color(1.0, 0.9, 0.8), // Warm stars
        },
      },
      rainy: {
        day: {
          zenithColor: new THREE.Color(0.25, 0.3, 0.4), // Storm clouds
          horizonColor: new THREE.Color(0.4, 0.5, 0.6), // Gray horizon
          groundColor: new THREE.Color(0.5, 0.6, 0.7), // Misty bottom
          sunColor: new THREE.Color(0.7, 0.7, 0.8), // Dim sun
          sunGlowColor: new THREE.Color(0.6, 0.6, 0.7), // Muted glow
        },
        night: {
          zenithColor: new THREE.Color(0.03, 0.05, 0.08), // Storm night
          horizonColor: new THREE.Color(0.06, 0.1, 0.15), // Lightning hint
          groundColor: new THREE.Color(0.1, 0.15, 0.2), // Wet ground
          moonColor: new THREE.Color(0.6, 0.7, 0.8), // Dim moon
          moonGlowColor: new THREE.Color(0.5, 0.6, 0.8), // Muted glow
          starColor: new THREE.Color(0.7, 0.8, 0.9), // Dim stars
        },
      },
    };
  }

  initialize() {
    this.createSkydome();

    // Apply colors after creation
    setTimeout(() => {
      this.updateSkyColors();
    }, 0);
  }

  createSkydome() {
    // Reduced geometry complexity for better performance
    const geometry = new THREE.SphereGeometry(150, 32, 16); // Reduced from 64x32

    // Create shader material with everything built-in
    this.skydomeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        // Sky gradient colors
        uZenithColor: { value: new THREE.Color(0.2, 0.5, 0.9) },
        uHorizonColor: { value: new THREE.Color(0.7, 0.85, 0.95) },
        uGroundColor: { value: new THREE.Color(0.95, 0.9, 0.85) },

        // Sun properties
        uSunPosition: { value: new THREE.Vector3(-0.846, -0.05, -1.0) }, // Normalized direction
        uSunColor: { value: new THREE.Color(0.82, 0.4, 0.17) },
        uSunGlowColor: { value: new THREE.Color(1, 0.88, 0.47) },
        uSunSize: { value: 0.0003 },
        uSunGlowSize: { value: 0.003 },

        // Moon properties
        uMoonPosition: { value: new THREE.Vector3(-0.4, -0.05, -1.0) }, // Normalized direction
        uMoonColor: { value: new THREE.Color(0.95, 0.95, 1.0) },
        uMoonGlowColor: { value: new THREE.Color(0.7, 0.8, 1.0) },
        uMoonSize: { value: 0.00081 },
        uMoonGlowSize: { value: 0.007682 },

        // Stars properties - more stars, no twinkling
        uStarColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
        uStarDensity: { value: 10.0 }, // Increased for more stars
        uStarBrightness: { value: 2.5 }, // Increased brightness

        // Animation and control
        uTime: { value: 0 },
        uIsNight: { value: 0.0 },
        uSeason: { value: 0.0 }, // 0=spring, 1=winter, 2=autumn, 3=rainy
        uAtmosphereIntensity: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vViewDirection;
        
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = normalize(worldPosition.xyz);
          vViewDirection = normalize(worldPosition.xyz - cameraPosition);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uZenithColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uGroundColor;
        
        uniform vec3 uSunPosition;
        uniform vec3 uSunColor;
        uniform vec3 uSunGlowColor;
        uniform float uSunSize;
        uniform float uSunGlowSize;
        
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
        
        // Noise functions for stars and atmosphere
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        
        vec2 hash2(vec2 p) {
          return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453123);
        }
        
        // Optimized noise function
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          // Simplified smoothstep
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }
        
        // Enhanced star generation for more stars
        float stars(vec2 uv, float density) {
          vec2 starUv = uv * 40.0; // Increased scale for more stars
          vec2 starId = floor(starUv);
          vec2 starPos = fract(starUv);
          
          float star = 0.0;
          
          // Expanded loop for more star coverage
          for(int x = -1; x <= 1; x++) {
            for(int y = -1; y <= 1; y++) {
              vec2 offset = vec2(float(x), float(y));
              vec2 cellId = starId + offset;
              
              // Higher density threshold for more stars
              if(hash(cellId) < density * 0.15) {
                vec2 starCenter = hash2(cellId) * 0.8 + 0.1;
                vec2 starLocalPos = starPos - offset - starCenter;
                float dist = length(starLocalPos);
                
                // Variable star brightness
                float brightness = hash(cellId + vec2(50.0, 100.0)) * 0.7 + 0.3;
                
                // Different star sizes for variety
                float starSize = 0.02 + brightness * 0.02;
                float starIntensity = max(0.0, 1.0 - dist / starSize);
                starIntensity *= starIntensity;
                
                star += brightness * starIntensity;
              }
            }
          }
          
          return min(star, 1.0);
        }
        
        void main() {
          vec3 direction = normalize(vWorldPosition);
          
          // Calculate altitude angle (0 = horizon, 1 = zenith, -1 = nadir)
          float altitude = direction.y;
          
          // Optimized base sky gradient
          vec3 skyColor;
          
          if (altitude > 0.0) {
            // Above horizon - optimized power calculation
            float factor = altitude * altitude * sqrt(altitude); // Equivalent to pow(altitude, 2.5) but faster
            skyColor = mix(uHorizonColor, uZenithColor, factor);
          } else {
            // Below horizon - optimized power calculation  
            float factor = altitude * altitude * altitude; // Equivalent to pow(-altitude, 3.0) but faster
            skyColor = mix(uHorizonColor, uGroundColor, -factor);
          }
          
          vec3 finalColor = skyColor;
          
          if (uIsNight < 0.5) {
            // DAY TIME - Add sun (but hide in winter and rainy seasons)
            bool showSun = uSeason < 0.5 || (uSeason > 1.5 && uSeason < 2.5); // Only show in spring (0) and autumn (2)
            
            if (showSun) {
              // Optimized sun calculations
              float sunDot = dot(direction, normalize(uSunPosition));
              
              // Sun disk - simplified
              float sunMask = smoothstep(1.0 - uSunSize, 1.0 - uSunSize * 0.9, sunDot);
              finalColor = mix(finalColor, uSunColor, sunMask);
              
              // Combined sun glow and scattering for performance
              float sunEffect = max(0.0, sunDot);
              float sunGlow = sunEffect * sunEffect * sunEffect * sunEffect; // Faster than pow(x, 4.0)
              float glowMask = smoothstep(1.0 - uSunGlowSize, 1.0 - uSunSize, sunDot);
              
              finalColor += uSunGlowColor * (glowMask * 0.3);
              finalColor += vec3(1.0, 0.7, 0.4) * (sunGlow * 0.2);
            }
            
          } else {
            // NIGHT TIME - Add moon and stars
            
            // Moon
            float moonDot = dot(direction, normalize(uMoonPosition));
            
            // Moon disk with craters
            if (moonDot > 1.0 - uMoonSize) {
              float moonMask = smoothstep(1.0 - uMoonSize, 1.0 - uMoonSize * 0.8, moonDot);
              
              // Add crater texture
              vec2 moonUv = (direction.xy - normalize(uMoonPosition).xy) * 20.0;
              float craters = noise(moonUv * 5.0) * 0.3;
              vec3 moonSurface = uMoonColor * (0.7 + craters);
              
              finalColor = mix(finalColor, moonSurface, moonMask);
            }
            
            // Moon glow
            if (moonDot > 1.0 - uMoonGlowSize) {
              float glowIntensity = smoothstep(1.0 - uMoonGlowSize, 1.0 - uMoonSize, moonDot) * 0.2;
              finalColor += uMoonGlowColor * glowIntensity;
            }
            
            // Dense starry sky without twinkling - mostly above horizon with few below
            // Show stars above horizon and fade out just below
            float starVisibility = 0.0;
            if (direction.y > -0.3) {
              // Fade stars in smoothly from just below horizon up
              starVisibility = smoothstep(-0.3, 0.2, direction.y);
              
              vec2 starUv = vec2(
                atan(direction.z, direction.x) * 0.15915 + 0.5,
                acos(clamp(direction.y, -1.0, 1.0)) * 0.31831
              );
              
              float starField = stars(starUv, uStarDensity);
              
              // No twinkling - steady stars for a more realistic look
              finalColor += uStarColor * starField * uStarBrightness * starVisibility;
            }
          }
          
          // Optimized atmospheric effects
          float atmosphereGlow = 1.0 - abs(altitude);
          atmosphereGlow = atmosphereGlow * atmosphereGlow * atmosphereGlow; // Faster than pow(x, 3.0)
          finalColor += vec3(0.5, 0.7, 1.0) * (atmosphereGlow * 0.1 * uAtmosphereIntensity);
          
          // Simplified time-based variations
          float timeVariation = sin(uTime * 0.1) * 0.01;
          finalColor += vec3(timeVariation, timeVariation * 0.5, timeVariation * 0.3);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.BackSide,
    });

    this.skydome = new THREE.Mesh(geometry, this.skydomeMaterial);
    this.scene.add(this.skydome);

    console.log(
      'Shader-only skydome created with enhanced stars and textured moon'
    );

    // Initialize GUI after shader material is ready
    if (this.game.isDebugMode) {
      this.initGUI();
    }
  }

  onEnvTimeChanged(newValue) {
    this.envTime = newValue;
    this.updateSkyColors();
  }

  onSeasonChanged(newSeason) {
    this.currentSeason = newSeason;
    this.updateSkyColors();
  }

  updateSkyColors() {
    const colors = this.skyColors[this.currentSeason][this.envTime];

    console.log('Updating sky colors:', {
      season: this.currentSeason,
      time: this.envTime,
      colors: colors,
    });

    if (this.skydomeMaterial && this.skydomeMaterial.uniforms) {
      // Update sky gradient colors
      this.skydomeMaterial.uniforms.uZenithColor.value.copy(colors.zenithColor);
      this.skydomeMaterial.uniforms.uHorizonColor.value.copy(
        colors.horizonColor
      );
      this.skydomeMaterial.uniforms.uGroundColor.value.copy(colors.groundColor);

      // Update day/night mode
      this.skydomeMaterial.uniforms.uIsNight.value =
        this.envTime === 'night' ? 1.0 : 0.0;

      // Update season uniform (0=spring, 1=winter, 2=autumn, 3=rainy)
      const seasonMap = { spring: 0, winter: 1, autumn: 2, rainy: 3 };
      this.skydomeMaterial.uniforms.uSeason.value =
        seasonMap[this.currentSeason] || 0;

      // Update celestial object colors
      if (this.envTime === 'day') {
        this.skydomeMaterial.uniforms.uSunColor.value.copy(colors.sunColor);
        this.skydomeMaterial.uniforms.uSunGlowColor.value.copy(
          colors.sunGlowColor
        );
      } else {
        this.skydomeMaterial.uniforms.uMoonColor.value.copy(colors.moonColor);
        this.skydomeMaterial.uniforms.uMoonGlowColor.value.copy(
          colors.moonGlowColor
        );
        this.skydomeMaterial.uniforms.uStarColor.value.copy(colors.starColor);
      }

      console.log('Sky uniforms updated');
    }
  }

  update(elapsedTime) {
    // Update shader time uniform for animations
    if (this.skydomeMaterial && this.skydomeMaterial.uniforms) {
      this.skydomeMaterial.uniforms.uTime.value = elapsedTime;
    }
  }

  initGUI() {
    if (
      !this.debugGUI ||
      !this.skydomeMaterial ||
      !this.skydomeMaterial.uniforms
    )
      return;

    const skyFolder = this.debugGUI.addFolder('Skydome');

    // Sky gradient colors
    skyFolder
      .addColor(this.skydomeMaterial.uniforms.uZenithColor, 'value')
      .name('Zenith Color');
    skyFolder
      .addColor(this.skydomeMaterial.uniforms.uHorizonColor, 'value')
      .name('Horizon Color');
    skyFolder
      .addColor(this.skydomeMaterial.uniforms.uGroundColor, 'value')
      .name('Ground Color');

    // Day/Night toggle
    skyFolder
      .add(this.skydomeMaterial.uniforms.uIsNight, 'value', 0, 1)
      .name('Night Mode');
    skyFolder
      .add(this.skydomeMaterial.uniforms.uSeason, 'value', 0, 3)
      .name('Season (0=Spring, 1=Winter, 2=Autumn, 3=Rainy)');
    skyFolder
      .add(this.skydomeMaterial.uniforms.uAtmosphereIntensity, 'value', 0, 3.0)
      .name('Atmosphere');

    // Sun controls
    const sunFolder = skyFolder.addFolder('Sun');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunPosition.value, 'x', -1, 1)
      .name('Sun X');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunPosition.value, 'y', -1, 1)
      .name('Sun Y');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunPosition.value, 'z', -1, 1)
      .name('Sun Z');
    sunFolder
      .addColor(this.skydomeMaterial.uniforms.uSunColor, 'value')
      .name('Sun Color');
    sunFolder
      .addColor(this.skydomeMaterial.uniforms.uSunGlowColor, 'value')
      .name('Sun Glow');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunSize, 'value', 0.0001, 0.1)
      .name('Sun Size');
    sunFolder
      .add(this.skydomeMaterial.uniforms.uSunGlowSize, 'value', 0.0005, 0.3)
      .name('Sun Glow Size');

    // Moon controls
    const moonFolder = skyFolder.addFolder('Moon');
    moonFolder
      .add(this.skydomeMaterial.uniforms.uMoonPosition.value, 'x', -1, 1)
      .name('Moon X');
    moonFolder
      .add(this.skydomeMaterial.uniforms.uMoonPosition.value, 'y', -1, 1)
      .name('Moon Y');
    moonFolder
      .add(this.skydomeMaterial.uniforms.uMoonPosition.value, 'z', -1, 1)
      .name('Moon Z');
    moonFolder
      .addColor(this.skydomeMaterial.uniforms.uMoonColor, 'value')
      .name('Moon Color');
    moonFolder
      .addColor(this.skydomeMaterial.uniforms.uMoonGlowColor, 'value')
      .name('Moon Glow');
    moonFolder
      .add(this.skydomeMaterial.uniforms.uMoonSize, 'value', 0.0001, 0.08)
      .name('Moon Size');
    moonFolder
      .add(this.skydomeMaterial.uniforms.uMoonGlowSize, 'value', 0.0005, 0.2)
      .name('Moon Glow Size');

    // Stars controls
    const starsFolder = skyFolder.addFolder('Stars');
    starsFolder
      .addColor(this.skydomeMaterial.uniforms.uStarColor, 'value')
      .name('Star Color');
    starsFolder
      .add(this.skydomeMaterial.uniforms.uStarDensity, 'value', 0.01, 10.0)
      .name('Star Density');
    starsFolder
      .add(this.skydomeMaterial.uniforms.uStarBrightness, 'value', 0.1, 10.0)
      .name('Star Brightness');
  }

  dispose() {
    this.environmentTimeManager.offChange();
    this.seasonManager.offChange();

    if (this.skydome) {
      this.scene.remove(this.skydome);
      this.skydome.geometry.dispose();
      this.skydomeMaterial.dispose();
    }
  }
}
