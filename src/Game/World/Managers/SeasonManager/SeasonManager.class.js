import EventEmitter from '../../../Utils/EventEmitter.class';
import * as THREE from 'three';

export default class SeasonManager extends EventEmitter {
  constructor(initialSeason = 'spring') {
    super();

    // Singleton pattern
    if (SeasonManager.instance) {
      return SeasonManager.instance;
    }
    SeasonManager.instance = this;

    this._currentSeason = initialSeason;
    this.availableSeasons = ['spring', 'winter', 'autumn', 'rainy'];
    
    this.seasonConfigs = this.createSeasonConfigs();
  }

  static getInstance() {
    if (!SeasonManager.instance) {
      SeasonManager.instance = new SeasonManager('spring');
    }
    return SeasonManager.instance;
  }

  createSeasonConfigs() {
    return {
      spring: {
        // Bush colors (day/night)
        bush: {
          day: {
            shadowColor: [0.003, 0.074, 0.003],
            midColor: [0.06, 0.23, 0],
            highlightColor: [0.44, 0.5, 0.0],
            colorMultiplier: [0.46, 0.65, 0.3],
            treeShadowColor: [0.03, 0.07, 0.003],
            treeColorMultiplier: [0.77, 0.71, 0.35],
            birchShadowColor: [0.09, 0.03, 0],
            birchMidColor: [0.2, 0.03, 0],
            birchHighlightColor: [1, 0.58, 0.1],
            birchColorMultiplier: [0.68, 0.56, 0.22],
          },
          night: {
            shadowColor: [0.001, 0.03, 0.02],
            midColor: [0.02, 0.08, 0.05],
            highlightColor: [0.15, 0.2, 0.15],
            colorMultiplier: [0.09, 0.13, 0.007],
            treeShadowColor: [0.01, 0.03, 0.001],
            treeColorMultiplier: [0.25, 0.24, 0.001],
            birchShadowColor: [0.03, 0.015, 0],
            birchMidColor: [0.08, 0.015, 0],
            birchHighlightColor: [0.3, 0.17, 0.03],
            birchColorMultiplier: [0.3, 0.2, 0.01],
          }
        },
        // Lighting colors (day/night)
        lighting: {
          day: {
            key: {
              color: 0xfff4e6,
              intensity: 2.0,
              position: [-15, 12, 8],
              castShadow: true,
            },
            fill: {
              color: 0x87ceeb,
              intensity: 0.6,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0xfff8f0,
              intensity: 0.4,
            },
            rim: {
              color: 0xffd7a3,
              intensity: 0.3,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.3,
              backgroundIntensity: 1.0,
              rotationY: 6.64,
              rotationX: 3.95,
              rotationZ: 6.27,
            },
            lamp: {
              color: 0xffe286,
              intensity: 0,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          },
          night: {
            key: {
              color: 0x3d5a7a,
              intensity: 1.25,
              position: [-10, 15, 5],
              castShadow: true,
            },
            fill: {
              color: 0x3d5a7a,
              intensity: 0.15,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0x4a5568,
              intensity: 0.08,
            },
            rim: {
              color: 0x7a8faa,
              intensity: 0.1,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.12,
              backgroundIntensity: 1.0,
              rotationY: 3.25,
              rotationX: 4.65,
              rotationZ: 4.67,
            },
            lamp: {
              color: 0xffe286,
              intensity: 5,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          }
        },
        // Ground colors (day/night)
        ground: {
          day: {
            uGroundColorLight: new THREE.Color(0.2784, 0.1372, 0.0235),
            uGroundColorDark: new THREE.Color(0.94, 0.58, 0.22),
            uGroundColorBelowGrass: new THREE.Color(0.12, 0.15, 0.03),
            uRockColor: new THREE.Color(1.0, 0.78, 0.47),
            uWaterShallow: new THREE.Color(1.0, 0.4, 0.0),
            uWaterDeep: new THREE.Color(0.06, 0.5, 0.51),
          },
          night: {
            uGroundColorLight: new THREE.Color(0.2, 0.1, 0.02),
            uGroundColorDark: new THREE.Color(0.804, 0.5411, 0.278),
            uGroundColorBelowGrass: new THREE.Color(0.08, 0.1, 0.02),
            uRockColor: new THREE.Color(0.7, 0.55, 0.33),
            uWaterShallow: new THREE.Color(0.52, 0.207, 0.0),
            uWaterDeep: new THREE.Color(0.03, 0.25, 0.3),
          }
        },
        // Grass colors (day/night)
        grass: {
          day: {
            shadow: new THREE.Color(0.01, 0.16, 0.0),
            dark: new THREE.Color(0.0, 0.29, 0.02),
            light: new THREE.Color(0.48, 0.68, 0.007),
            flowerVisibility: 1.0,
          },
          night: {
            shadow: new THREE.Color(0.0023, 0.04, 0.0),
            dark: new THREE.Color(0.0, 0.23, 0.015),
            light: new THREE.Color(0.227, 0.31, 0.027),
            flowerVisibility: 0.15,
          }
        },
        // Fire colors (same for all seasons)
        fire: {
          day: { smokeAlphaSecondStop: 0.1 },
          night: { smokeAlphaSecondStop: 0.05 }
        },
        // Falling leaves
        fallingLeaves: {
          color: new THREE.Color(0xff6f0d)
        },
        // Wind lines
        windLines: {
          color: new THREE.Color(0xffffff)
        },
        // Tent lamp
        tent: {
          lampColor: new THREE.Color(0xffe286)
        },
        // Rocks colors (day/night)
        rocks: {
          day: {
            uRockColor1: new THREE.Color(0.96, 0.86, 0.54),
            uRockColor2: new THREE.Color(0.97, 0.82, 0.42),
            uRockColor3: new THREE.Color(0.31, 0.24, 0.06),
            uMossColor1: new THREE.Color(0.97, 0.82, 0.42),
            uMossColor2: new THREE.Color(0.97, 0.82, 0.42),
            uMossColor3: new THREE.Color(0.14, 0.17, 0.003),
          },
          night: {
            uRockColor1: new THREE.Color(0.7, 0.6, 0.35),
            uRockColor2: new THREE.Color(0.65, 0.55, 0.28),
            uRockColor3: new THREE.Color(0.2, 0.15, 0.04),
            uMossColor1: new THREE.Color(0.65, 0.55, 0.28),
            uMossColor2: new THREE.Color(0.65, 0.55, 0.28),
            uMossColor3: new THREE.Color(0.08, 0.1, 0.001),
          }
        }
      },

      winter: {
        // Bush colors - winter theme (cooler, muted)
        bush: {
          day: {
            shadowColor: [0.001, 0.02, 0.04],
            midColor: [0.02, 0.08, 0.12],
            highlightColor: [0.25, 0.35, 0.45],
            colorMultiplier: [0.3, 0.4, 0.5],
            treeShadowColor: [0.01, 0.03, 0.05],
            treeColorMultiplier: [0.4, 0.45, 0.5],
            birchShadowColor: [0.05, 0.05, 0.08],
            birchMidColor: [0.1, 0.1, 0.15],
            birchHighlightColor: [0.6, 0.65, 0.8],
            birchColorMultiplier: [0.45, 0.5, 0.6],
          },
          night: {
            shadowColor: [0.0005, 0.01, 0.02],
            midColor: [0.01, 0.03, 0.06],
            highlightColor: [0.08, 0.12, 0.18],
            colorMultiplier: [0.05, 0.08, 0.12],
            treeShadowColor: [0.005, 0.01, 0.02],
            treeColorMultiplier: [0.15, 0.18, 0.22],
            birchShadowColor: [0.02, 0.02, 0.04],
            birchMidColor: [0.04, 0.04, 0.08],
            birchHighlightColor: [0.2, 0.22, 0.3],
            birchColorMultiplier: [0.2, 0.22, 0.28],
          }
        },
        lighting: {
          day: {
            key: {
              color: 0xe6f4ff,
              intensity: 1.8,
              position: [-15, 12, 8],
              castShadow: true,
            },
            fill: {
              color: 0xb8d4f0,
              intensity: 0.5,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0xf0f8ff,
              intensity: 0.35,
            },
            rim: {
              color: 0xc4d9f0,
              intensity: 0.25,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.25,
              backgroundIntensity: 1.0,
              rotationY: 6.64,
              rotationX: 3.95,
              rotationZ: 6.27,
            },
            lamp: {
              color: 0xffe286,
              intensity: 0,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          },
          night: {
            key: {
              color: 0x2a4a6a,
              intensity: 1.1,
              position: [-10, 15, 5],
              castShadow: true,
            },
            fill: {
              color: 0x2a4a6a,
              intensity: 0.12,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0x3a4a58,
              intensity: 0.06,
            },
            rim: {
              color: 0x5a7a9a,
              intensity: 0.08,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.1,
              backgroundIntensity: 1.0,
              rotationY: 3.25,
              rotationX: 4.65,
              rotationZ: 4.67,
            },
            lamp: {
              color: 0xffe286,
              intensity: 5,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          }
        },
        ground: {
          day: {
            uGroundColorLight: new THREE.Color(0.6, 0.65, 0.7),
            uGroundColorDark: new THREE.Color(0.7, 0.75, 0.8),
            uGroundColorBelowGrass: new THREE.Color(0.5, 0.55, 0.6),
            uRockColor: new THREE.Color(0.8, 0.85, 0.9),
            uWaterShallow: new THREE.Color(0.6, 0.7, 0.9),
            uWaterDeep: new THREE.Color(0.2, 0.3, 0.5),
          },
          night: {
            uGroundColorLight: new THREE.Color(0.4, 0.45, 0.5),
            uGroundColorDark: new THREE.Color(0.5, 0.55, 0.65),
            uGroundColorBelowGrass: new THREE.Color(0.3, 0.35, 0.4),
            uRockColor: new THREE.Color(0.6, 0.65, 0.75),
            uWaterShallow: new THREE.Color(0.3, 0.4, 0.6),
            uWaterDeep: new THREE.Color(0.1, 0.15, 0.3),
          }
        },
        grass: {
          day: {
            shadow: new THREE.Color(0.005, 0.08, 0.12),
            dark: new THREE.Color(0.02, 0.15, 0.2),
            light: new THREE.Color(0.3, 0.45, 0.55),
            flowerVisibility: 0.3,
          },
          night: {
            shadow: new THREE.Color(0.001, 0.02, 0.04),
            dark: new THREE.Color(0.01, 0.08, 0.12),
            light: new THREE.Color(0.15, 0.22, 0.3),
            flowerVisibility: 0.05,
          }
        },
        fire: {
          day: { smokeAlphaSecondStop: 0.15 },
          night: { smokeAlphaSecondStop: 0.08 }
        },
        fallingLeaves: {
          color: new THREE.Color(0xffffff) // Snow flakes
        },
        windLines: {
          color: new THREE.Color(0xe6f4ff)
        },
        tent: {
          lampColor: new THREE.Color(0xffe286)
        },
        // Rocks colors (day/night) - Winter theme
        rocks: {
          day: {
            uRockColor1: new THREE.Color(0.8, 0.85, 0.9),
            uRockColor2: new THREE.Color(0.75, 0.8, 0.85),
            uRockColor3: new THREE.Color(0.4, 0.45, 0.5),
            uMossColor1: new THREE.Color(0.6, 0.7, 0.8),
            uMossColor2: new THREE.Color(0.55, 0.65, 0.75),
            uMossColor3: new THREE.Color(0.2, 0.25, 0.3),
          },
          night: {
            uRockColor1: new THREE.Color(0.6, 0.65, 0.7),
            uRockColor2: new THREE.Color(0.55, 0.6, 0.65),
            uRockColor3: new THREE.Color(0.25, 0.3, 0.35),
            uMossColor1: new THREE.Color(0.4, 0.5, 0.6),
            uMossColor2: new THREE.Color(0.35, 0.45, 0.55),
            uMossColor3: new THREE.Color(0.1, 0.15, 0.2),
          }
        }
      },

      autumn: {
        // Bush colors - autumn theme (warm oranges, reds, browns)
        bush: {
          day: {
            shadowColor: [0.08, 0.02, 0.001],
            midColor: [0.25, 0.08, 0.02],
            highlightColor: [0.8, 0.4, 0.1],
            colorMultiplier: [0.7, 0.35, 0.15],
            treeShadowColor: [0.06, 0.03, 0.005],
            treeColorMultiplier: [0.85, 0.45, 0.2],
            birchShadowColor: [0.12, 0.06, 0.02],
            birchMidColor: [0.3, 0.15, 0.05],
            birchHighlightColor: [0.9, 0.6, 0.3],
            birchColorMultiplier: [0.8, 0.5, 0.25],
          },
          night: {
            shadowColor: [0.03, 0.01, 0.0005],
            midColor: [0.1, 0.04, 0.01],
            highlightColor: [0.3, 0.15, 0.05],
            colorMultiplier: [0.25, 0.12, 0.04],
            treeShadowColor: [0.02, 0.01, 0.002],
            treeColorMultiplier: [0.35, 0.18, 0.08],
            birchShadowColor: [0.05, 0.025, 0.008],
            birchMidColor: [0.12, 0.06, 0.02],
            birchHighlightColor: [0.4, 0.25, 0.12],
            birchColorMultiplier: [0.35, 0.2, 0.1],
          }
        },
        lighting: {
          day: {
            key: {
              color: 0xfff0e6,
              intensity: 2.2,
              position: [-15, 12, 8],
              castShadow: true,
            },
            fill: {
              color: 0xffb366,
              intensity: 0.7,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0xfff4e6,
              intensity: 0.45,
            },
            rim: {
              color: 0xffcc80,
              intensity: 0.35,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.35,
              backgroundIntensity: 1.0,
              rotationY: 6.64,
              rotationX: 3.95,
              rotationZ: 6.27,
            },
            lamp: {
              color: 0xffe286,
              intensity: 0,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          },
          night: {
            key: {
              color: 0x5a3d2a,
              intensity: 1.3,
              position: [-10, 15, 5],
              castShadow: true,
            },
            fill: {
              color: 0x5a3d2a,
              intensity: 0.18,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0x4a3528,
              intensity: 0.1,
            },
            rim: {
              color: 0x7a5a4a,
              intensity: 0.12,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.14,
              backgroundIntensity: 1.0,
              rotationY: 3.25,
              rotationX: 4.65,
              rotationZ: 4.67,
            },
            lamp: {
              color: 0xffe286,
              intensity: 5,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          }
        },
        ground: {
          day: {
            uGroundColorLight: new THREE.Color(0.35, 0.2, 0.1),
            uGroundColorDark: new THREE.Color(0.8, 0.5, 0.3),
            uGroundColorBelowGrass: new THREE.Color(0.2, 0.12, 0.06),
            uRockColor: new THREE.Color(0.9, 0.6, 0.4),
            uWaterShallow: new THREE.Color(0.9, 0.6, 0.3),
            uWaterDeep: new THREE.Color(0.4, 0.3, 0.2),
          },
          night: {
            uGroundColorLight: new THREE.Color(0.25, 0.15, 0.08),
            uGroundColorDark: new THREE.Color(0.6, 0.4, 0.25),
            uGroundColorBelowGrass: new THREE.Color(0.15, 0.09, 0.04),
            uRockColor: new THREE.Color(0.7, 0.45, 0.3),
            uWaterShallow: new THREE.Color(0.7, 0.45, 0.2),
            uWaterDeep: new THREE.Color(0.25, 0.18, 0.12),
          }
        },
        grass: {
          day: {
            shadow: new THREE.Color(0.08, 0.04, 0.01),
            dark: new THREE.Color(0.2, 0.12, 0.05),
            light: new THREE.Color(0.6, 0.4, 0.2),
            flowerVisibility: 0.8,
          },
          night: {
            shadow: new THREE.Color(0.03, 0.015, 0.005),
            dark: new THREE.Color(0.1, 0.06, 0.025),
            light: new THREE.Color(0.3, 0.2, 0.1),
            flowerVisibility: 0.2,
          }
        },
        fire: {
          day: { smokeAlphaSecondStop: 0.08 },
          night: { smokeAlphaSecondStop: 0.04 }
        },
        fallingLeaves: {
          color: new THREE.Color(0xd2691e) // Autumn orange
        },
        windLines: {
          color: new THREE.Color(0xfff0e6)
        },
        tent: {
          lampColor: new THREE.Color(0xffe286)
        },
        // Rocks colors (day/night) - Autumn theme
        rocks: {
          day: {
            uRockColor1: new THREE.Color(0.9, 0.7, 0.5),
            uRockColor2: new THREE.Color(0.85, 0.6, 0.4),
            uRockColor3: new THREE.Color(0.4, 0.25, 0.1),
            uMossColor1: new THREE.Color(0.8, 0.5, 0.2),
            uMossColor2: new THREE.Color(0.75, 0.45, 0.15),
            uMossColor3: new THREE.Color(0.2, 0.15, 0.05),
          },
          night: {
            uRockColor1: new THREE.Color(0.6, 0.45, 0.3),
            uRockColor2: new THREE.Color(0.55, 0.4, 0.25),
            uRockColor3: new THREE.Color(0.25, 0.15, 0.06),
            uMossColor1: new THREE.Color(0.5, 0.3, 0.12),
            uMossColor2: new THREE.Color(0.45, 0.25, 0.1),
            uMossColor3: new THREE.Color(0.12, 0.08, 0.03),
          }
        }
      },

      rainy: {
        // Bush colors - rainy theme (darker, more saturated greens)
        bush: {
          day: {
            shadowColor: [0.001, 0.05, 0.001],
            midColor: [0.02, 0.18, 0.02],
            highlightColor: [0.3, 0.6, 0.25],
            colorMultiplier: [0.35, 0.55, 0.3],
            treeShadowColor: [0.015, 0.06, 0.01],
            treeColorMultiplier: [0.6, 0.75, 0.4],
            birchShadowColor: [0.06, 0.08, 0.02],
            birchMidColor: [0.15, 0.2, 0.05],
            birchHighlightColor: [0.7, 0.8, 0.3],
            birchColorMultiplier: [0.5, 0.65, 0.3],
          },
          night: {
            shadowColor: [0.0005, 0.02, 0.001],
            midColor: [0.008, 0.07, 0.008],
            highlightColor: [0.1, 0.25, 0.1],
            colorMultiplier: [0.06, 0.15, 0.06],
            treeShadowColor: [0.005, 0.025, 0.003],
            treeColorMultiplier: [0.2, 0.3, 0.15],
            birchShadowColor: [0.02, 0.03, 0.008],
            birchMidColor: [0.05, 0.08, 0.02],
            birchHighlightColor: [0.25, 0.35, 0.15],
            birchColorMultiplier: [0.22, 0.3, 0.15],
          }
        },
        lighting: {
          day: {
            key: {
              color: 0xe6f0ff,
              intensity: 1.5,
              position: [-15, 12, 8],
              castShadow: true,
            },
            fill: {
              color: 0x99ccff,
              intensity: 0.8,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0xf0f4ff,
              intensity: 0.5,
            },
            rim: {
              color: 0xb3d9ff,
              intensity: 0.4,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.2,
              backgroundIntensity: 1.0,
              rotationY: 6.64,
              rotationX: 3.95,
              rotationZ: 6.27,
            },
            lamp: {
              color: 0xffe286,
              intensity: 0,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          },
          night: {
            key: {
              color: 0x1a2a4a,
              intensity: 1.0,
              position: [-10, 15, 5],
              castShadow: true,
            },
            fill: {
              color: 0x1a2a4a,
              intensity: 0.2,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0x2a3a4a,
              intensity: 0.12,
            },
            rim: {
              color: 0x4a6a8a,
              intensity: 0.15,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.08,
              backgroundIntensity: 1.0,
              rotationY: 3.25,
              rotationX: 4.65,
              rotationZ: 4.67,
            },
            lamp: {
              color: 0xffe286,
              intensity: 5,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          }
        },
        ground: {
          day: {
            uGroundColorLight: new THREE.Color(0.15, 0.1, 0.08),
            uGroundColorDark: new THREE.Color(0.4, 0.3, 0.2),
            uGroundColorBelowGrass: new THREE.Color(0.08, 0.12, 0.06),
            uRockColor: new THREE.Color(0.5, 0.4, 0.35),
            uWaterShallow: new THREE.Color(0.5, 0.6, 0.8),
            uWaterDeep: new THREE.Color(0.1, 0.3, 0.4),
          },
          night: {
            uGroundColorLight: new THREE.Color(0.1, 0.08, 0.06),
            uGroundColorDark: new THREE.Color(0.3, 0.25, 0.18),
            uGroundColorBelowGrass: new THREE.Color(0.05, 0.08, 0.04),
            uRockColor: new THREE.Color(0.35, 0.3, 0.25),
            uWaterShallow: new THREE.Color(0.2, 0.3, 0.5),
            uWaterDeep: new THREE.Color(0.05, 0.15, 0.25),
          }
        },
        grass: {
          day: {
            shadow: new THREE.Color(0.005, 0.12, 0.005),
            dark: new THREE.Color(0.02, 0.25, 0.04),
            light: new THREE.Color(0.4, 0.7, 0.3),
            flowerVisibility: 1.2,
          },
          night: {
            shadow: new THREE.Color(0.001, 0.04, 0.001),
            dark: new THREE.Color(0.008, 0.18, 0.02),
            light: new THREE.Color(0.18, 0.35, 0.15),
            flowerVisibility: 0.3,
          }
        },
        fire: {
          day: { smokeAlphaSecondStop: 0.12 },
          night: { smokeAlphaSecondStop: 0.06 }
        },
        fallingLeaves: {
          color: new THREE.Color(0x4169e1) // Rain drops (blue)
        },
        windLines: {
          color: new THREE.Color(0xe6f0ff)
        },
        tent: {
          lampColor: new THREE.Color(0xffe286)
        },
        // Rocks colors (day/night) - Rainy theme
        rocks: {
          day: {
            uRockColor1: new THREE.Color(0.5, 0.45, 0.4),
            uRockColor2: new THREE.Color(0.45, 0.4, 0.35),
            uRockColor3: new THREE.Color(0.2, 0.18, 0.15),
            uMossColor1: new THREE.Color(0.3, 0.6, 0.2),
            uMossColor2: new THREE.Color(0.25, 0.55, 0.15),
            uMossColor3: new THREE.Color(0.1, 0.25, 0.05),
          },
          night: {
            uRockColor1: new THREE.Color(0.3, 0.28, 0.25),
            uRockColor2: new THREE.Color(0.25, 0.23, 0.2),
            uRockColor3: new THREE.Color(0.12, 0.1, 0.08),
            uMossColor1: new THREE.Color(0.15, 0.35, 0.1),
            uMossColor2: new THREE.Color(0.12, 0.3, 0.08),
            uMossColor3: new THREE.Color(0.05, 0.15, 0.02),
          }
        }
      }
    };
  }

  get currentSeason() {
    return this._currentSeason;
  }

  set currentSeason(value) {
    if (!this.availableSeasons.includes(value)) {
      console.warn(
        `Invalid season value: ${value}. Must be one of:`,
        this.availableSeasons
      );
      return;
    }

    const oldValue = this._currentSeason;

    if (oldValue === value) {
      return;
    }

    this._currentSeason = value;
    this.trigger('seasonChanged', value, oldValue);
  }

  toggle() {
    const currentIndex = this.availableSeasons.indexOf(this._currentSeason);
    const nextIndex = (currentIndex + 1) % this.availableSeasons.length;
    this.currentSeason = this.availableSeasons[nextIndex];
  }

  setSeason(season) {
    this.currentSeason = season;
  }

  getSeasonConfig(season = this._currentSeason) {
    return this.seasonConfigs[season];
  }

  getColorConfig(component, timeOfDay, season = this._currentSeason) {
    const config = this.seasonConfigs[season];
    if (!config || !config[component]) {
      console.warn(`No config found for component: ${component} in season: ${season}`);
      return null;
    }

    if (timeOfDay && config[component][timeOfDay]) {
      return config[component][timeOfDay];
    }

    return config[component];
  }

  onChange(callback) {
    this.on('seasonChanged', callback);
    return this;
  }

  offChange(callback) {
    this.off('seasonChanged');
    return this;
  }

  reset() {
    this.currentSeason = 'spring';
  }
}