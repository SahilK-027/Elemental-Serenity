import Game from './Game/Game.class.js';
import ResourceLoader from './Game/Utils/ResourceLoader.class.js';
import ASSETS from './config/assets.js';

// Debug mode is enabled only when URL has ?mode=debug
const isDebugMode =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('mode') === 'debug';

const resources = new ResourceLoader(ASSETS);

resources.on('progress', ({ id, itemsLoaded, itemsTotal, percent }) => {
  if (isDebugMode) {
    console.log(
      `Loaded asset: "${id}" (${itemsLoaded}/${itemsTotal} — ${percent.toFixed(
        1
      )}%)`
    );
  }
});

resources.on('error', ({ id, url, itemsLoaded, itemsTotal }) => {
  console.error(
    `❌ Failed to load item named "${id}" at "${url}" (${itemsLoaded}/${itemsTotal} so far)`
  );
});

resources.on('loaded', () => {
  if (isDebugMode) {
    if (Object.keys(resources.items).length) {
      console.log('✅ All assets are loaded. Initializing game…!');
    } else {
      console.log('☑️ No asset to load. Initializing game…!');
    }
  }

  new Game(document.getElementById('three'), resources, isDebugMode);
});
