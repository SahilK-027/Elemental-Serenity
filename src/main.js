import Game from './Game/Game.class.js';
import ResourceLoader from './Game/Utils/ResourceLoader.class.js';
import SeasonManager from './Game/World/Managers/SeasonManager/SeasonManager.class.js';
import EnvironmentTimeManager from './Game/World/Managers/EnvironmentManager/EnvironmentManager.class.js';
import ASSETS from './config/assets.js';
import reveal from './reveal.js';
import ToastManager from './Game/UI/ToastManager.class.js';

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
const seasonMenu = document.getElementById('season-menu');
const seasonButtons = document.querySelectorAll('.season-button');
const dayNightToggle = document.getElementById('daynight-toggle');
const dayNightButtons = document.querySelectorAll('.daynight-button');
const controlPanel = document.getElementById('control-panel');
const pageTitle = document.getElementById('page-title');

// Initialize Season Manager
const seasonManager = SeasonManager.getInstance();
// Initialize Environment Time Manager
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

      shaderReveal.start();

      loader.classList.add('hidden');

      setTimeout(() => {
        loader.remove();
        // Show control panel after loader is removed
        setTimeout(() => {
          controlPanel.classList.add('show');
          pageTitle.classList.add('show');
          // Initialize season UI with current season
          initializeSeasonUI();
          // Initialize day/night UI with current time
          initializeDayNightUI();
        }, 500);
        // Dispatch game started event
        document.dispatchEvent(new CustomEvent('gameStarted'));
      }, 500);
    }, 200);
  };

  exploreWithMusic.addEventListener('click', () => startGame(true));
  exploreWithoutMusic.addEventListener('click', () => startGame(false));
});

// Season Toggle Functionality
// Map UI season names to SeasonManager season names
const seasonMapping = {
  spring: 'spring',
  autumn: 'autumn',
  winter: 'winter',
  rain: 'rainy',
};

// Reverse mapping for UI updates
const reverseSeasonMapping = {
  spring: 'spring',
  autumn: 'autumn',
  winter: 'winter',
  rainy: 'rain',
};

const toastManager = new ToastManager();

// Season toggle handler
const handleSeasonToggle = (event) => {
  const clickedButton = event.currentTarget;
  const uiSeason = clickedButton.dataset.season;
  const managerSeason = seasonMapping[uiSeason];

  // Remove active class from all buttons
  seasonButtons.forEach((button) => {
    button.classList.remove('active');
  });

  // Add active class to clicked button
  clickedButton.classList.add('active');

  // Update season manager
  seasonManager.setSeason(managerSeason);

  toastManager.showSeasonToast(managerSeason);

  console.log(`Season changed to: ${managerSeason} (UI: ${uiSeason})`);
};

// Add event listeners to season buttons
seasonButtons.forEach((button) => {
  button.addEventListener('click', handleSeasonToggle);
});

// Listen to season manager changes and update UI
seasonManager.onChange((newSeason, oldSeason) => {
  console.log(`Season Manager: Changed from ${oldSeason} to ${newSeason}`);

  // Update UI to reflect the current season
  const uiSeason = reverseSeasonMapping[newSeason];
  seasonButtons.forEach((button) => {
    button.classList.remove('active');
    if (button.dataset.season === uiSeason) {
      button.classList.add('active');
    }
  });

  // Dispatch custom event for other parts of the game to listen to
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

// Initialize UI with current season
const initializeSeasonUI = () => {
  const currentSeason = seasonManager.currentSeason;
  const uiSeason = reverseSeasonMapping[currentSeason];
  console.log(
    `Initializing season UI: Manager season = ${currentSeason}, UI season = ${uiSeason}`
  );
  seasonButtons.forEach((button) => {
    button.classList.remove('active');
    if (button.dataset.season === uiSeason) {
      button.classList.add('active');
      console.log(`Set ${uiSeason} button as active`);
    }
  });
};

// Day/Night Toggle Functionality
// Day/Night toggle handler
const handleDayNightToggle = (event) => {
  const clickedButton = event.currentTarget;
  const selectedTime = clickedButton.dataset.time;

  // Remove active class from all buttons
  dayNightButtons.forEach((button) => {
    button.classList.remove('active');
  });

  // Add active class to clicked button
  clickedButton.classList.add('active');

  // Update environment time manager
  environmentTimeManager.setTime(selectedTime);

  toastManager.showDayNightToast(selectedTime);

  console.log(`Time changed to: ${selectedTime}`);
};

// Add event listeners to day/night buttons
dayNightButtons.forEach((button) => {
  button.addEventListener('click', handleDayNightToggle);
});

// Listen to environment time manager changes and update UI
environmentTimeManager.onChange((newTime, oldTime) => {
  console.log(
    `Environment Time Manager: Changed from ${oldTime} to ${newTime}`
  );

  // Update UI to reflect the current time
  dayNightButtons.forEach((button) => {
    button.classList.remove('active');
    if (button.dataset.time === newTime) {
      button.classList.add('active');
    }
  });

  // Dispatch custom event for other parts of the game to listen to
  window.dispatchEvent(
    new CustomEvent('timeChange', {
      detail: {
        time: newTime,
        oldTime: oldTime,
      },
    })
  );
});

// Initialize UI with current time
const initializeDayNightUI = () => {
  const currentTime = environmentTimeManager.envTime;
  console.log(`Initializing day/night UI: Current time = ${currentTime}`);
  dayNightButtons.forEach((button) => {
    button.classList.remove('active');
    if (button.dataset.time === currentTime) {
      button.classList.add('active');
      console.log(`Set ${currentTime} button as active`);
    }
  });
};
