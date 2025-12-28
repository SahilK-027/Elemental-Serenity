const ASSETS = [
  {
    id: 'environmentMapDayTexture',
    type: 'cubeMap',
    path: [
      '/map/day2/px.png',
      '/map/day2/nx.png',
      '/map/day2/py.png',
      '/map/day2/ny.png',
      '/map/day2/pz.png',
      '/map/day2/nz.png',
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
];

export default ASSETS;
