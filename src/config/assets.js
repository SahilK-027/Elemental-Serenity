const ASSETS = [
  {
    id: 'environmentMapDayTexture',
    type: 'cubeMap',
    path: [
      '/map/day/px.png',
      '/map/day/nx.png',
      '/map/day/py.png',
      '/map/day/ny.png',
      '/map/day/pz.png',
      '/map/day/nz.png',
    ],
  },
  {
    id: 'environmentMapNightTexture',
    type: 'cubeMap',
    path: [
      '/map/night/px.png',
      '/map/night/nx.png',
      '/map/night/py.png',
      '/map/night/ny.png',
      '/map/night/pz.png',
      '/map/night/nz.png',
    ],
  },
  {
    id: 'grassBladeModel',
    type: 'gltfModelCompressed',
    path: ['/models/grass_blade.glb'],
  },
  {
    id: 'grassPathDensityDataTexture',
    type: 'texture',
    path: ['/textures/grass/path_data_rgb_768x768.png'],
  },
  {
    id: 'displacedNormalMap',
    type: 'texture',
    path: ['/textures/grass/displaced_normals_256x256.png'],
  },
  {
    id: 'displacementMap',
    type: 'texture',
    path: ['/textures/grass/displacement_map_256x256.png'],
  },
  {
    id: 'displacementMapBlur',
    type: 'texture',
    path: ['/textures/grass/displacement_map_blur_256x256.png'],
  },
  {
    id: 'perlinNoise',
    type: 'texture',
    path: ['/textures/noises/perlin_noise_256x256.png'],
  },
  {
    id: 'groundRockMap',
    type: 'texture',
    path: ['/textures/ground/rocks_height_256x256.png'],
  },
  {
    id: 'groundRockAOMap',
    type: 'texture',
    path: ['/textures/ground/rocks_ao_256x256.png'],
  },
  {
    id: 'tentModel',
    type: 'gltfModelCompressed',
    path: ['/models/tent.glb'],
  },
  {
    id: 'bridgeModel',
    type: 'gltfModelCompressed',
    path: ['/models/bridge.glb'],
  },
  {
    id: 'waterDepthMap',
    type: 'texture',
    path: ['/textures/water/water_depth_map_256x256.png'],
  },
  {
    id: 'rocksModel',
    type: 'gltfModelCompressed',
    path: ['/models/rocks.glb'],
  },
  {
    id: 'leavesAlphaMap',
    type: 'texture',
    path: ['/textures/bush/leave_alpha_map_256x256.png'],
  },
  {
    id: 'BushEmitterModel',
    type: 'gltfModelCompressed',
    path: ['/models/bushEmitter.glb'],
  },
  {
    id: 'TreeTrunksModel',
    type: 'gltfModelCompressed',
    path: ['/models/treeTrunks.glb'],
  },
  {
    id: 'campModel',
    type: 'gltfModelCompressed',
    path: ['/models/camp.glb'],
  },
  {
    id: 'woodColorTexture',
    type: 'texture',
    path: ['/textures/wood/wood_color_256x256.png'],
  },
  {
    id: 'woodColorTextureR',
    type: 'texture',
    path: ['/textures/wood/wood_color_r_256x256.png'],
  },
  {
    id: 'woodNormalTexture',
    type: 'texture',
    path: ['/textures/wood/wood_normal_256x256.png'],
  },
  {
    id: 'woodAOTexture',
    type: 'texture',
    path: ['/textures/wood/wood_ao_256x256.png'],
  },
  {
    id: 'leafModel',
    type: 'gltfModelCompressed',
    path: ['/models/leaf.glb'],
  },
  {
    id: 'fireTexture',
    type: 'texture',
    path: ['/textures/fire/fire_256x256.png'],
  },
  {
    id: 'smokeTexture',
    type: 'texture',
    path: ['/textures/fire/smoke_256x256.png'],
  },
  {
    id: 'particleTexture',
    type: 'texture',
    path: ['/textures/particles/particle_alpha_map_256x256.png'],
  },
  {
    id: 'particleTextureNoAlpha',
    type: 'texture',
    path: ['/textures/particles/particle_256x256.jpg'],
  },
  {
    id: 'flowerTexture1',
    type: 'texture',
    path: ['/textures/flowers/flower_1_128x128.png'],
  },
  {
    id: 'flowerTexture2',
    type: 'texture',
    path: ['/textures/flowers/flower_2_128x128.png'],
  },

  {
    id: 'morningPetalsMusic',
    type: 'audio',
    path: ['/audio/musics/morning_petals.mp3'],
  },
  {
    id: 'windowLightMusic',
    type: 'audio',
    path: ['/audio/musics/window_light.mp3'],
  },
  {
    id: 'forestDreamsMusic',
    type: 'audio',
    path: ['/audio/musics/forest_dreams.mp3'],
  },

  {
    id: 'birds1Sound',
    type: 'audio',
    path: ['/audio/sounds/birds/birds_1.mp3'],
  },
  {
    id: 'birds2Sound',
    type: 'audio',
    path: ['/audio/sounds/birds/birds_2.mp3'],
  },
  {
    id: 'birds3Sound',
    type: 'audio',
    path: ['/audio/sounds/birds/birds_3.mp3'],
  },
  {
    id: 'birds4Sound',
    type: 'audio',
    path: ['/audio/sounds/birds/birds_4.mp3'],
  },
  {
    id: 'cricketsSound',
    type: 'audio',
    path: ['/audio/sounds/crickets/crickets.mp3'],
  },
  {
    id: 'fireBurningSound',
    type: 'audio',
    path: ['/audio/sounds/fire/fire_burning.mp3'],
  },
  {
    id: 'owlHowlingSound',
    type: 'audio',
    path: ['/audio/sounds/owl/owl_howling.mp3'],
  },
  {
    id: 'owlHootingSound',
    type: 'audio',
    path: ['/audio/sounds/owl/owl_hooting.mp3'],
  },
  {
    id: 'rainSound',
    type: 'audio',
    path: ['/audio/sounds/rain/rain.mp3'],
  },
  {
    id: 'lakeWavesSound',
    type: 'audio',
    path: ['/audio/sounds/waves/lake_waves.mp3'],
  },
  {
    id: 'wolfHowlingSound',
    type: 'audio',
    path: ['/audio/sounds/wolf/wolf_howling.mp3'],
  },
  {
    id: 'thunderDistantSound',
    type: 'audio',
    path: ['/audio/sounds/thunder/distant/thunder_distant.mp3'],
  },
  {
    id: 'thunderStrikeSound',
    type: 'audio',
    path: ['/audio/sounds/thunder/near/thunder_strike.mp3'],
  },

  {
    id: 'clickSound',
    type: 'audio',
    path: ['/audio/sounds/ui_interactions/click.mp3'],
  },
  {
    id: 'hoverSound',
    type: 'audio',
    path: ['/audio/sounds/ui_interactions/hover.mp3'],
  },
];

export default ASSETS;
