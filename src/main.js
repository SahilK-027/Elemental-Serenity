import Game from './Game/Game.class.js';
import ResourceLoader from './Game/Utils/ResourceLoader.class.js';
import SeasonManager from './Game/World/Managers/SeasonManager/SeasonManager.class.js';
import EnvironmentTimeManager from './Game/World/Managers/EnvironmentManager/EnvironmentManager.class.js';
import ASSETS from './config/assets.js';
import reveal from './reveal.js';
import ToastManager from './Game/UI/ToastManager.class.js';
import { Console } from './utils/consoleStylish.js';

const Haptics = {
  buttonTap() {
    if (navigator.haptic) {
      navigator.haptic([{ intensity: 0.7, sharpness: 0.1 }]);
    } else if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  },

  thunder() {
    if (navigator.haptic) {
      navigator.haptic('error');
    } else if (navigator.vibrate) {
      navigator.vibrate([50, 30, 100, 50, 200]);
    }
  },
};

const isDebugMode =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('mode') === 'debug';

Console.banner({
  title: 'Elemental Serenity',
  subtitle: 'Interactive 3D Nature Experience',
  version: '0.0.0',
});

Console.techTable([
  { Layer: 'Build', Technology: 'Vite 6.0', Details: 'ES Modules, HMR' },
  {
    Layer: '3D Engine',
    Technology: 'Three.js 0.182',
    Details: 'WebGLRenderer',
  },
  {
    Layer: 'Animation',
    Technology: 'GSAP 3.14.2',
    Details: 'Tweening & Timelines',
  },
  { Layer: 'Shaders', Technology: 'GLSL', Details: 'vite-plugin-glsl 1.3.1' },
  {
    Layer: 'Debug UI',
    Technology: 'lil-gui 0.21',
    Details: 'Runtime controls (?mode=debug)',
  },
  {
    Layer: 'Perf Monitor',
    Technology: 'three-perf 1.0.11',
    Details: 'FPS & draw calls',
  },
  { Layer: 'Styles', Technology: 'Sass 1.97', Details: 'SCSS preprocessing' },
]);

Console.divider('═', 60);
Console.info('LOADING', 'Preparing assets...');
Console.divider('═', 60);

const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const loaderText = document.getElementById('loader-text');
const exploreButtons = document.getElementById('explore-buttons');
const exploreWithMusic = document.getElementById('explore-with-music');
const exploreWithoutMusic = document.getElementById('explore-without-music');
const loaderTitle = document.querySelector('.loader-title');
const loaderProgress = document.querySelector('.loader-progress-bar');
const shaderCanvas = document.getElementById('shader-overlay');
const seasonMenu = document.getElementById('season-menu');
const seasonButtons = document.querySelectorAll('.season-button');
const dayNightToggle = document.getElementById('daynight-toggle');
const dayNightButtons = document.querySelectorAll('.daynight-button');
const controlPanel = document.getElementById('control-panel');
const pageTitle = document.getElementById('page-title');
const seasonManager = SeasonManager.getInstance();
const environmentTimeManager = EnvironmentTimeManager.getInstance();
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

      window.gameInstance = game;
      Console.logGameState(game);

      if (game.musicManager) {
        game.musicManager.on('trackChanged', (track) => {
          Console.logMusicChange('track', track.name);
        });
      }

      window.addEventListener('graphicsQualityChanged', (event) => {
        Console.logGraphicsChange(event.detail.quality);
      });

      shaderReveal.start();

      loader.classList.add('hidden');

      setTimeout(() => {
        loader.remove();

        setTimeout(() => {
          controlPanel.classList.add('show');
          pageTitle.classList.add('show');
          initializeSeasonUI();
          initializeDayNightUI();
        }, 500);
        document.dispatchEvent(new CustomEvent('gameStarted'));
      }, 500);
    }, 200);
  };

  exploreWithMusic.addEventListener('click', () => {
    Haptics.buttonTap();
    startGame(true);
  });
  exploreWithoutMusic.addEventListener('click', () => {
    Haptics.buttonTap();
    startGame(false);
  });
});

const seasonMapping = {
  spring: 'spring',
  autumn: 'autumn',
  winter: 'winter',
  rain: 'rainy',
};

const reverseSeasonMapping = {
  spring: 'spring',
  autumn: 'autumn',
  winter: 'winter',
  rainy: 'rain',
};

const toastManager = new ToastManager();

const handleSeasonToggle = (event) => {
  const clickedButton = event.currentTarget;
  const uiSeason = clickedButton.dataset.season;
  const managerSeason = seasonMapping[uiSeason];

  const currentSeason = seasonManager.currentSeason;

  if (currentSeason === managerSeason) {
    return;
  }

  Haptics.buttonTap();

  seasonButtons.forEach((button) => {
    button.classList.remove('active');
  });

  clickedButton.classList.add('active');

  seasonManager.setSeason(managerSeason);

  toastManager.showSeasonToast(managerSeason);
};

seasonButtons.forEach((button) => {
  button.addEventListener('click', handleSeasonToggle);
});

seasonManager.onChange((newSeason, oldSeason) => {
  const uiSeason = reverseSeasonMapping[newSeason];
  seasonButtons.forEach((button) => {
    button.classList.remove('active');
    if (button.dataset.season === uiSeason) {
      button.classList.add('active');
    }
  });

  Console.logSeasonChange(newSeason, oldSeason);

  window.dispatchEvent(
    new CustomEvent('seasonChange', {
      detail: {
        season: newSeason,
        oldSeason: oldSeason,
        config: seasonManager.getSeasonConfig(newSeason),
      },
    })
  );
});

const initializeSeasonUI = () => {
  const currentSeason = seasonManager.currentSeason;
  const uiSeason = reverseSeasonMapping[currentSeason];
  seasonButtons.forEach((button) => {
    button.classList.remove('active');
    if (button.dataset.season === uiSeason) {
      button.classList.add('active');
    }
  });
};

const handleDayNightToggle = (event) => {
  const clickedButton = event.currentTarget;
  const selectedTime = clickedButton.dataset.time;

  const currentTime = environmentTimeManager.envTime;

  if (currentTime === selectedTime) {
    return;
  }

  Haptics.buttonTap();

  dayNightButtons.forEach((button) => {
    button.classList.remove('active');
  });

  clickedButton.classList.add('active');

  environmentTimeManager.setTime(selectedTime);

  toastManager.showDayNightToast(selectedTime);
};

dayNightButtons.forEach((button) => {
  button.addEventListener('click', handleDayNightToggle);
});

environmentTimeManager.onChange((newTime, oldTime) => {
  dayNightButtons.forEach((button) => {
    button.classList.remove('active');
    if (button.dataset.time === newTime) {
      button.classList.add('active');
    }
  });

  Console.logTimeChange(newTime, oldTime);

  window.dispatchEvent(
    new CustomEvent('timeChange', {
      detail: {
        time: newTime,
        oldTime: oldTime,
      },
    })
  );
});

const initializeDayNightUI = () => {
  const currentTime = environmentTimeManager.envTime;
  dayNightButtons.forEach((button) => {
    button.classList.remove('active');
    if (button.dataset.time === currentTime) {
      button.classList.add('active');
    }
  });
};
