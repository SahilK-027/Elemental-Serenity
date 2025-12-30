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
            treeMidColor: [0.06, 0.23, 0.0],
            treeHighlightColor: [0.45, 0.55, 0.002],
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
            treeMidColor: [0.04, 0.1, 0.005],
            treeHighlightColor: [0.2, 0.25, 0.05],
            treeColorMultiplier: [0.25, 0.24, 0.001],
            birchShadowColor: [0.03, 0.015, 0],
            birchMidColor: [0.08, 0.015, 0],
            birchHighlightColor: [0.3, 0.17, 0.03],
            birchColorMultiplier: [0.3, 0.2, 0.01],
          },
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
              intensity: 10,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          },
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
          },
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
          },
        },
        // Fire colors (same for all seasons)
        fire: {
          day: { smokeAlphaSecondStop: 0.1 },
          night: { smokeAlphaSecondStop: 0.05 },
        },
        // Falling leaves
        fallingLeaves: {
          color: new THREE.Color(0xff6f0d),
        },
        // Wind lines
        windLines: {
          color: new THREE.Color(0xffffff),
        },
        // Tent lamp
        tent: {
          lampColor: new THREE.Color(0xffe286),
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
          },
        },
      },

      winter: {
        bush: {
          day: {
            shadowColor: [0.002, 0.04, 0.08],
            midColor: [0.01, 0.25, 0.16],
            highlightColor: [0.8, 0.8, 0.8],
            colorMultiplier: [1, 1, 1],
            treeShadowColor: [0.01, 0.13, 0.26],
            treeMidColor: [0.015, 0.28, 0.27],
            treeHighlightColor: [0.73, 0.75, 0.78],
            treeColorMultiplier: [0.8, 0.8, 0.8],
            birchShadowColor: [0.2, 0.09, 0.0],
            birchMidColor: [0.4, 0.2, 0.0],
            birchHighlightColor: [0.8, 0.85, 0.9],
            birchColorMultiplier: [0.7, 0.7, 0.7],
          },
          night: {
            shadowColor: [0.001, 0.02, 0.04],
            midColor: [0.02, 0.06, 0.12],
            highlightColor: [0.15, 0.22, 0.35],
            colorMultiplier: [0.1, 0.15, 0.25],
            treeShadowColor: [0.01, 0.02, 0.04],
            treeMidColor: [0.04, 0.08, 0.15],
            treeHighlightColor: [0.2, 0.3, 0.4],
            treeColorMultiplier: [0.25, 0.3, 0.4],
            birchShadowColor: [0.04, 0.05, 0.08],
            birchMidColor: [0.08, 0.1, 0.15],
            birchHighlightColor: [0.35, 0.4, 0.5],
            birchColorMultiplier: [0.3, 0.35, 0.45],
          },
        },
        lighting: {
          day: {
            key: {
              color: 0xf0f8ff,
              intensity: 2.0,
              position: [-15, 12, 8],
              castShadow: true,
            },
            fill: {
              color: 0xd6e8ff,
              intensity: 0.6,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0xf5faff,
              intensity: 0.4,
            },
            rim: {
              color: 0xe6f2ff,
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
              color: 0x1a3a5a,
              intensity: 1.2,
              position: [-10, 15, 5],
              castShadow: true,
            },
            fill: {
              color: 0x2a4a6a,
              intensity: 0.15,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0x3a4a5a,
              intensity: 0.08,
            },
            rim: {
              color: 0x6a8aaa,
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
              intensity: 10,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          },
        },
        ground: {
          day: {
            uGroundColorLight: new THREE.Color(0.11, 0.39, 0.62),
            uGroundColorDark: new THREE.Color(0.85, 0.9, 0.95),
            uGroundColorBelowGrass: new THREE.Color(0.65, 0.7, 0.75),
            uRockColor: new THREE.Color(0.9, 0.95, 1.0),
            uWaterShallow: new THREE.Color(0.7, 0.8, 0.95),
            uWaterDeep: new THREE.Color(0.05, 0.28, 0.5),
          },
          night: {
            uGroundColorLight: new THREE.Color(0.5, 0.55, 0.6),
            uGroundColorDark: new THREE.Color(0.6, 0.65, 0.75),
            uGroundColorBelowGrass: new THREE.Color(0.4, 0.45, 0.5),
            uRockColor: new THREE.Color(0.7, 0.75, 0.85),
            uWaterShallow: new THREE.Color(0.4, 0.5, 0.7),
            uWaterDeep: new THREE.Color(0.15, 0.2, 0.4),
          },
        },
        grass: {
          day: {
            shadow: new THREE.Color(0.2, 0.25, 0.29),
            dark: new THREE.Color(0.9, 0.9, 0.9),
            light: new THREE.Color(0.13, 0.32, 0.53),
            flowerVisibility: 0.2,
          },
          night: {
            shadow: new THREE.Color(0.005, 0.04, 0.08),
            dark: new THREE.Color(0.02, 0.15, 0.25),
            light: new THREE.Color(0.2, 0.35, 0.5),
            flowerVisibility: 0.05,
          },
        },
        fire: {
          day: { smokeAlphaSecondStop: 0.15 },
          night: { smokeAlphaSecondStop: 0.08 },
        },
        fallingLeaves: {
          color: new THREE.Color(0xfd950c),
        },
        windLines: {
          color: new THREE.Color(0xf0f8ff),
        },
        tent: {
          lampColor: new THREE.Color(0xffe286),
        },
        rocks: {
          day: {
            uRockColor1: new THREE.Color(0.9, 0.95, 1.0),
            uRockColor2: new THREE.Color(0.85, 0.9, 0.95),
            uRockColor3: new THREE.Color(0.5, 0.55, 0.6),
            uMossColor1: new THREE.Color(0.7, 0.8, 0.9),
            uMossColor2: new THREE.Color(0.65, 0.75, 0.85),
            uMossColor3: new THREE.Color(0.3, 0.35, 0.4),
          },
          night: {
            uRockColor1: new THREE.Color(0.7, 0.75, 0.8),
            uRockColor2: new THREE.Color(0.65, 0.7, 0.75),
            uRockColor3: new THREE.Color(0.35, 0.4, 0.45),
            uMossColor1: new THREE.Color(0.5, 0.6, 0.7),
            uMossColor2: new THREE.Color(0.45, 0.55, 0.65),
            uMossColor3: new THREE.Color(0.2, 0.25, 0.3),
          },
        },
      },

      autumn: {
        bush: {
          day: {
            shadowColor: [0.12, 0.04, 0.001],
            midColor: [0.35, 0.15, 0.03],
            highlightColor: [0.95, 0.6, 0.2],
            colorMultiplier: [0.85, 0.5, 0.25],
            treeShadowColor: [0.08, 0.05, 0.01],
            treeMidColor: [0.33, 0.05, 0.004],
            treeHighlightColor: [0.85, 0.63, 0.0],
            treeColorMultiplier: [0.9, 0.6, 0.3],
            birchShadowColor: [0.09, 0.003, 0.004],
            birchMidColor: [0.21, 0.01, 0.0],
            birchHighlightColor: [0.8, 0.317, 0.058],
            birchColorMultiplier: [0.9, 0.3, 0.2],
          },
          night: {
            shadowColor: [0.0384, 0.0128, 0.00032],
            midColor: [0.112, 0.048, 0.0096],
            highlightColor: [0.304, 0.192, 0.064],
            colorMultiplier: [0.272, 0.16, 0.08],
            treeShadowColor: [0.0256, 0.016, 0.0032],
            treeMidColor: [0.1056, 0.016, 0.00128],
            treeHighlightColor: [0.272, 0.2016, 0.0],
            treeColorMultiplier: [0.288, 0.192, 0.096],
            birchShadowColor: [0.0288, 0.00096, 0.00128],
            birchMidColor: [0.0672, 0.0032, 0.0],
            birchHighlightColor: [0.256, 0.10144, 0.01856],
            birchColorMultiplier: [0.288, 0.096, 0.064],
          },
        },
        lighting: {
          day: {
            key: {
              color: 0xffead6,
              intensity: 2.4,
              position: [-15, 12, 8],
              castShadow: true,
            },
            fill: {
              color: 0xff9966,
              intensity: 0.8,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0xfff2e6,
              intensity: 0.5,
            },
            rim: {
              color: 0xffb366,
              intensity: 0.4,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.4,
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
              color: 0x6b4423,
              intensity: 0.3,
              position: [-10, 15, 5],
              castShadow: true,
            },
            fill: {
              color: 0x5a3d2a,
              intensity: 0.22,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0x4d3a2b,
              intensity: 0.12,
            },
            rim: {
              color: 0x8b6f47,
              intensity: 0.15,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.05,
              backgroundIntensity: 1.0,
              rotationY: 3.25,
              rotationX: 4.65,
              rotationZ: 4.67,
            },
            lamp: {
              color: 0xffe286,
              intensity: 10,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          },
        },
        ground: {
          day: {
            uGroundColorLight: new THREE.Color(0.45, 0.28, 0.15),
            uGroundColorDark: new THREE.Color(0.9, 0.65, 0.4),
            uGroundColorBelowGrass: new THREE.Color(0.3, 0.2, 0.1),
            uRockColor: new THREE.Color(0.95, 0.7, 0.5),
            uWaterShallow: new THREE.Color(1.0, 0.49, 0.16),
            uWaterDeep: new THREE.Color(0.07, 0.64, 0.72),
          },
          night: {
            uGroundColorLight: new THREE.Color(0.3, 0.2, 0.12),
            uGroundColorDark: new THREE.Color(0.7, 0.5, 0.35),
            uGroundColorBelowGrass: new THREE.Color(0.2, 0.15, 0.08),
            uRockColor: new THREE.Color(0.75, 0.55, 0.4),
            uWaterShallow: new THREE.Color(0.58, 0.23, 0.0),
            uWaterDeep: new THREE.Color(0.18, 0.83, 0.86),
          },
        },
        grass: {
          day: {
            shadow: new THREE.Color(0.13, 0.062, 0.0039),
            dark: new THREE.Color(0.278, 0.019, 0.0),
            light: new THREE.Color(0.67, 0.498, 0.003),
            flowerVisibility: 0.9,
          },
          night: {
            shadow: new THREE.Color(0.05, 0.025, 0.01),
            dark: new THREE.Color(0.15, 0.1, 0.04),
            light: new THREE.Color(0.4, 0.3, 0.15),
            flowerVisibility: 0.15,
          },
        },
        fire: {
          day: { smokeAlphaSecondStop: 0.08 },
          night: { smokeAlphaSecondStop: 0.04 },
        },
        fallingLeaves: {
          color: new THREE.Color(0xff6347),
        },
        windLines: {
          color: new THREE.Color(0xffead6),
        },
        tent: {
          lampColor: new THREE.Color(0xffe286),
        },
        rocks: {
          day: {
            uRockColor1: new THREE.Color(0.95, 0.75, 0.55),
            uRockColor2: new THREE.Color(0.9, 0.7, 0.5),
            uRockColor3: new THREE.Color(0.5, 0.35, 0.2),
            uMossColor1: new THREE.Color(0.85, 0.6, 0.3),
            uMossColor2: new THREE.Color(0.8, 0.55, 0.25),
            uMossColor3: new THREE.Color(0.3, 0.2, 0.1),
          },
          night: {
            uRockColor1: new THREE.Color(0.7, 0.55, 0.4),
            uRockColor2: new THREE.Color(0.65, 0.5, 0.35),
            uRockColor3: new THREE.Color(0.35, 0.25, 0.15),
            uMossColor1: new THREE.Color(0.6, 0.4, 0.2),
            uMossColor2: new THREE.Color(0.55, 0.35, 0.18),
            uMossColor3: new THREE.Color(0.2, 0.15, 0.08),
          },
        },
      },

      rainy: {
        bush: {
          day: {
            shadowColor: [0.0, 0.019, 0.019],
            midColor: [0.011, 0.05, 0.007],
            highlightColor: [0.102, 0.2, 0.019],
            colorMultiplier: [0.148, 0.405, 0.094],
            treeShadowColor: [0.0, 0.019, 0.019],
            treeMidColor: [0.011, 0.05, 0.007],
            treeHighlightColor: [0.102, 0.2, 0.019],
            treeColorMultiplier: [0.148, 0.405, 0.094],
            birchShadowColor: [0.029, 0.027, 0.0],
            birchMidColor: [0.061, 0.027, 0.0],
            birchHighlightColor: [0.19, 0.2, 0.01],
            birchColorMultiplier: [0.68, 0.56, 0.22],
          },
          night: {
            shadowColor: [0.0, 0.017, 0.005],
            midColor: [0.004, 0.046, 0.013],
            highlightColor: [0.029, 0.114, 0.04],
            colorMultiplier: [0.018, 0.074, 0.002],
            treeShadowColor: [0.002, 0.017, 0.0],
            treeMidColor: [0.008, 0.057, 0.002],
            treeHighlightColor: [0.038, 0.143, 0.013],
            treeColorMultiplier: [0.048, 0.137, 0.0],
            birchShadowColor: [0.006, 0.009, 0.0],
            birchMidColor: [0.015, 0.009, 0.0],
            birchHighlightColor: [0.14, 0.15, 0],
            birchColorMultiplier: [0.48, 0.36, 0.02],
          },
        },
        lighting: {
          day: {
            key: {
              color: 0x24638a,
              intensity: 0.15,
              position: [-15, 12, 8],
              castShadow: true,
            },
            fill: {
              color: 0xb3d9ff,
              intensity: 0.1,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0x243c5c,
              intensity: 1.5,
            },
            rim: {
              color: 0x255088,
              intensity: 0.3,
              position: [5, 10, -12],
              castShadow: false,
            },
            environment: {
              intensity: 0.15,
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
              color: 0x0f1f3f,
              intensity: 1.1,
              position: [-10, 15, 5],
              castShadow: true,
            },
            fill: {
              color: 0x1a2a4a,
              intensity: 0.25,
              position: [10, 5, -6],
              castShadow: false,
            },
            ambient: {
              color: 0x2a3a4a,
              intensity: 0.15,
            },
            rim: {
              color: 0x5a7a9a,
              intensity: 0.18,
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
              intensity: 10,
              distance: 20,
              decay: 1.5,
              position: [2.9, 4.6, -5.5],
              castShadow: false,
            },
          },
        },
        ground: {
          day: {
            uGroundColorLight: new THREE.Color(0.12, 0.054, 0.0),
            uGroundColorDark: new THREE.Color(0.93, 0.57, 0.21),
            uGroundColorBelowGrass: new THREE.Color(0.039, 0.018, 0.0),
            uRockColor: new THREE.Color(0.6, 0.5, 0.45),
            uWaterShallow: new THREE.Color(0.47, 0.25, 0.07),
            uWaterDeep: new THREE.Color(0.058, 0.39, 0.5),
          },
          night: {
            uGroundColorLight: new THREE.Color(0.15, 0.12, 0.1),
            uGroundColorDark: new THREE.Color(0.4, 0.35, 0.25),
            uGroundColorBelowGrass: new THREE.Color(0.08, 0.12, 0.06),
            uRockColor: new THREE.Color(0.45, 0.4, 0.35),
            uWaterShallow: new THREE.Color(0.3, 0.4, 0.6),
            uWaterDeep: new THREE.Color(0.08, 0.2, 0.3),
          },
        },
        grass: {
          day: {
            shadow: new THREE.Color(0.039, 0.018, 0.01),
            dark: new THREE.Color(0.015, 0.12, 0.0),
            light: new THREE.Color(0, 0.2, 0.031),
            flowerVisibility: 0.6,
          },
          night: {
            shadow: new THREE.Color(0.002, 0.06, 0.002),
            dark: new THREE.Color(0.015, 0.25, 0.03),
            light: new THREE.Color(0.25, 0.45, 0.2),
            flowerVisibility: 0.2,
          },
        },
        fire: {
          day: { smokeAlphaSecondStop: 0.12 },
          night: { smokeAlphaSecondStop: 0.06 },
        },
        fallingLeaves: {
          color: new THREE.Color(0x00591c),
        },
        windLines: {
          color: new THREE.Color(0xf0f4ff),
        },
        tent: {
          lampColor: new THREE.Color(0xffe286),
        },
        rocks: {
          day: {
            uRockColor1: new THREE.Color(0.6, 0.55, 0.5),
            uRockColor2: new THREE.Color(0.55, 0.5, 0.45),
            uRockColor3: new THREE.Color(0.25, 0.22, 0.2),
            uMossColor1: new THREE.Color(0.039, 0.078, 0.0),
            uMossColor2: new THREE.Color(0.16, 0.25, 0.0),
            uMossColor3: new THREE.Color(0.0039, 0.19, 0.035),
          },
          night: {
            uRockColor1: new THREE.Color(0.4, 0.38, 0.35),
            uRockColor2: new THREE.Color(0.35, 0.33, 0.3),
            uRockColor3: new THREE.Color(0.18, 0.15, 0.12),
            uMossColor1: new THREE.Color(0.2, 0.45, 0.15),
            uMossColor2: new THREE.Color(0.18, 0.4, 0.12),
            uMossColor3: new THREE.Color(0.08, 0.2, 0.05),
          },
        },
      },
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
      console.warn(
        `No config found for component: ${component} in season: ${season}`
      );
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
