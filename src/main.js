import Game from './Game/Game.class.js';
import ResourceLoader from './Game/Utils/ResourceLoader.class.js';
import ASSETS from './config/assets.js';
import reveal from './reveal.js';

// Debug mode is enabled only when URL has ?mode=debug
const isDebugMode =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('mode') === 'debug';

const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const loaderText = document.getElementById('loader-text');
const exploreButtons = document.getElementById('explore-buttons');
const exploreWithMusic = document.getElementById('explore-with-music');
const exploreWithoutMusic = document.getElementById('explore-without-music');
const loaderTitle = document.querySelector('.loader-title');
const loaderProgress = document.querySelector('.loader-progress-bar');
const shaderCanvas = document.getElementById('shader-overlay');

const shaderReveal = new reveal(shaderCanvas);

const setProgressBarWidth = () => {
  const titleWidth = loaderTitle.offsetWidth;
  loaderProgress.style.width = `${titleWidth}px`;
};

window.addEventListener('load', setProgressBarWidth);
window.addEventListener('resize', () => {
  setProgressBarWidth();
  shaderReveal.resize();
});

const resources = new ResourceLoader(ASSETS);

const getLoadingMessage = (id, itemsLoaded, itemsTotal) => {
  const messages = [
    'Gathering elemental essence',
    'Weaving natural harmonies',
    'Awakening ancient spirits',
    "Channeling earth's energy",
    'Summoning peaceful winds',
    'Collecting forest whispers',
    'Brewing tranquil potions',
    'Painting serene landscapes',
    "Tuning nature's symphony",
    'Crafting mystical elements',
  ];

  const getAssetType = (assetId) => {
    if (assetId.includes('.gltf') || assetId.includes('.glb'))
      return '3D Model';
    if (
      assetId.includes('.jpg') ||
      assetId.includes('.png') ||
      assetId.includes('.webp')
    )
      return 'Texture';
    if (
      assetId.includes('.mp3') ||
      assetId.includes('.wav') ||
      assetId.includes('.ogg')
    )
      return 'Audio';
    if (assetId.includes('.json')) return 'Data';
    if (assetId.includes('.hdr')) return 'Environment';
    if (assetId.includes('.bin')) return 'Binary Data';
    return 'Asset';
  };

  const messageIndex = Math.floor(
    (itemsLoaded - 1) / Math.max(1, Math.floor(itemsTotal / messages.length))
  );
  const baseMessage = messages[messageIndex % messages.length];
  const assetType = getAssetType(id);
  const dots = '.'.repeat((itemsLoaded % 4) + 1);

  return `${baseMessage}${dots} ${assetType} (${itemsLoaded}/${itemsTotal})`;
};

resources.on('progress', ({ id, itemsLoaded, itemsTotal, percent }) => {
  progressBar.style.width = `${percent}%`;

  loaderText.innerHTML = getLoadingMessage(id, itemsLoaded, itemsTotal).replace(
    '\n',
    '<br>'
  );

  if (isDebugMode) {
    console.log(
      `Loaded asset: "${id}" (${itemsLoaded}/${itemsTotal} — ${percent.toFixed(
        1
      )}%)`
    );
  }
});

resources.on('error', ({ id, url, itemsLoaded, itemsTotal }) => {
  const assetType =
    id.includes('.gltf') || id.includes('.glb')
      ? '3D Model'
      : id.includes('.jpg') || id.includes('.png')
      ? 'Texture'
      : id.includes('.mp3') || id.includes('.wav')
      ? 'Audio'
      : 'Asset';

  loaderText.innerHTML = `⚠️ Elemental disruption detected...<br>${assetType} failed (${itemsLoaded}/${itemsTotal})`;
  console.error(
    `❌ Failed to load item named "${id}" at "${url}" (${itemsLoaded}/${itemsTotal} so far)`
  );
});

resources.on('loaded', () => {
  loaderText.textContent = 'Serenity achieved... Welcome to your sanctuary!';

  if (isDebugMode) {
    if (Object.keys(resources.items).length) {
      console.log('✅ All assets are loaded. Initializing game…!');
    } else {
      console.log('☑️ No asset to load. Initializing game…!');
    }
  }

  setTimeout(() => {
    exploreButtons.style.visibility = 'visible';
    setTimeout(() => {
      exploreButtons.classList.add('show');
    }, 100);
  }, 800);

  const startGame = (withMusic = true) => {
    exploreWithMusic.disabled = true;
    exploreWithoutMusic.disabled = true;

    setTimeout(() => {
      const game = new Game(
        document.getElementById('three'),
        resources,
        isDebugMode,
        withMusic
      );

      shaderReveal.start();

      loader.classList.add('hidden');

      setTimeout(() => {
        loader.remove();
      }, 500);
    }, 200);
  };

  exploreWithMusic.addEventListener('click', () => startGame(true));
  exploreWithoutMusic.addEventListener('click', () => startGame(false));
});
