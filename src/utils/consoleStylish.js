const pad = (n) => String(n).padStart(2, '0');

function timeStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const css = (obj) =>
  Object.entries(obj)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');

function styled(level, label, message) {
  const colors = {
    info: { fg: '#0c4a6e', bg: '#7dd3fc', border: '#38bdf8' },
    success: { fg: '#14532d', bg: '#86efac', border: '#22c55e' },
    warn: { fg: '#713f12', bg: '#fde047', border: '#eab308' },
    error: { fg: '#7f1d1d', bg: '#fca5a5', border: '#ef4444' },
    debug: { fg: '#581c87', bg: '#d8b4fe', border: '#a855f7' },
    perf: { fg: '#164e63', bg: '#67e8f9', border: '#06b6d4' },
  };
  const c = colors[level] || colors.info;
  const tagStyle = css({
    background: `linear-gradient(135deg, ${c.bg} 0%, ${c.border} 100%)`,
    color: c.fg,
    padding: '3px 10px',
    'border-radius': '4px',
    'font-weight': '700',
    'font-size': '11px',
    'text-transform': 'uppercase',
    'letter-spacing': '0.5px',
  });
  const metaStyle = css({
    color: '#64748b',
    'font-size': '10px',
    padding: '0 8px',
    'font-family': 'monospace',
  });
  const msgStyle = css({
    color: '#e2e8f0',
    'font-size': '12px',
    'font-weight': '500',
  });
  console.log(
    `%c${label}%c ${timeStamp()} %c${message}`,
    tagStyle,
    metaStyle,
    msgStyle
  );
}

function asciiArt() {
  const art = `
%c███████╗██╗     ███████╗███╗   ███╗███████╗███╗   ██╗████████╗ █████╗ ██╗
%c██╔════╝██║     ██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔══██╗██║
%c█████╗  ██║     █████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ███████║██║
%c██╔══╝  ██║     ██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ██╔══██║██║
%c███████╗███████╗███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ██║  ██║███████╗
%c╚══════╝╚══════╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚══════╝

%c███████╗███████╗██████╗ ███████╗███╗   ██╗██╗████████╗██╗   ██╗
%c██╔════╝██╔════╝██╔══██╗██╔════╝████╗  ██║██║╚══██╔══╝╚██╗ ██╔╝
%c███████╗█████╗  ██████╔╝█████╗  ██╔██╗ ██║██║   ██║    ╚████╔╝
%c╚════██║██╔══╝  ██╔══██╗██╔══╝  ██║╚██╗██║██║   ██║     ╚██╔╝
%c███████║███████╗██║  ██║███████╗██║ ╚████║██║   ██║      ██║
%c╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝   ╚═╝      ╚═╝
`;

  const gradient = [
    'color: #22d3ee; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #2dd4bf; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #34d399; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #4ade80; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #a3e635; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #facc15; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #fb923c; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #f87171; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #fb7185; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #e879f9; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #c084fc; font-weight: bold; font-size: 10px; line-height: 1.2;',
    'color: #a78bfa; font-weight: bold; font-size: 10px; line-height: 1.2;',
  ];

  console.log(art, ...gradient);
}

function banner({
  title = 'Elemental Serenity',
  subtitle = 'Interactive 3D Nature Experience',
  version = '1.0.0',
  github = 'https://github.com/SahilK-027/elemental-serenity',
} = {}) {
  console.clear();

  asciiArt();

  console.log(
    `%c✨ ${subtitle} %c v${version}`,
    css({
      color: '#94a3b8',
      'font-size': '14px',
      'font-weight': '400',
      'padding-left': '4px',
    }),
    css({
      color: '#475569',
      'font-size': '12px',
      background: '#1e293b',
      padding: '2px 8px',
      'border-radius': '4px',
      'margin-left': '8px',
    })
  );

  console.log(
    `%c%c Code on GitHub %c ${github} %c →`,
    css({
      padding: '4px',
    }),
    css({
      background: 'linear-gradient(135deg, #6e5494 0%, #24292e 100%)',
      color: '#ffffff',
      'font-size': '12px',
      'font-weight': '700',
      padding: '6px 12px',
      'border-radius': '6px 0 0 6px',
      'text-shadow': '0 1px 2px rgba(0,0,0,0.3)',
    }),
    css({
      background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
      color: '#58a6ff',
      'font-size': '11px',
      'font-weight': '500',
      padding: '6px 14px',
      'border-radius': '0',
      'border-top': '1px solid #30363d',
      'border-bottom': '1px solid #30363d',
    }),
    css({
      background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
      color: '#ffffff',
      'font-size': '12px',
      'font-weight': '700',
      padding: '6px 10px',
      'border-radius': '0 6px 6px 0',
    })
  );

  console.log('');
}

function section(title, icon = '◆') {
  console.log(
    `\n%c ${icon} ${title.toUpperCase()} `,
    css({
      background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
      color: '#38bdf8',
      'font-size': '12px',
      'font-weight': '700',
      padding: '6px 16px',
      'border-radius': '4px',
      'border-left': '3px solid #38bdf8',
      'letter-spacing': '1px',
    })
  );
}

function techTable(techObjectOrArray) {
  section('Tech Stack', '⚡');
  console.table(techObjectOrArray);
}

function groupOpen(title, icon = '') {
  console.group(
    `%c ${title}`,
    css({
      color: '#f8fafc',
      'font-weight': '700',
      'font-size': '12px',
      background: 'linear-gradient(90deg, #1e3a5f 0%, #0f172a 100%)',
      padding: '6px 14px',
      'border-radius': '4px',
      'border-left': '3px solid #3b82f6',
    })
  );
}

function group(title, callback, icon = '📁') {
  console.groupCollapsed(
    `%c ${icon} ${title}`,
    css({
      color: '#cbd5e1',
      'font-weight': '600',
      'font-size': '11px',
      background: '#1e293b',
      padding: '4px 12px',
      'border-radius': '4px',
    })
  );
  try {
    callback();
  } finally {
    console.groupEnd();
  }
}

function groupEnd() {
  console.groupEnd();
}

function divider(char = '─', length = 50) {
  console.log(
    `%c${char.repeat(length)}`,
    css({ color: '#334155', 'font-size': '10px' })
  );
}

function keyValue(key, value, color = '#67e8f9') {
  console.log(
    `%c  ${key}: %c${value}`,
    css({ color: '#94a3b8', 'font-size': '11px', 'font-weight': '500' }),
    css({ color, 'font-size': '11px', 'font-weight': '700' })
  );
}

function credits(links = []) {
  section('Links & Credits', '🔗');
  links.forEach(({ label, url }) => {
    console.log(
      `%c  ${label}: %c${url}`,
      css({ color: '#94a3b8', 'font-size': '11px' }),
      css({
        color: '#60a5fa',
        'font-size': '11px',
        'text-decoration': 'underline',
      })
    );
  });
}

function perf(label, value, unit = 'ms') {
  styled('perf', 'PERF', `${label}: ${value}${unit}`);
}

function logGameState(game) {
  const renderer = game.renderer?.rendererInstance;
  const seasonManager = game.seasonManager;
  const envTimeManager = game.environmentTimeManager;
  const audioManager = game.audioManager;
  const musicManager = game.musicManager;

  section('Current State', '📊');

  groupOpen('🖥️ Graphics Settings');

  const storedQuality = localStorage.getItem('graphicsQuality') || 'medium';
  const storedPixelRatio = localStorage.getItem('graphicsPixelRatioCap') || '2';
  const storedShadowMap =
    localStorage.getItem('graphicsShadowMapType') || 'PCFShadowMap';
  const storedAntialias = localStorage.getItem('graphicsAntialias') || 'false';

  keyValue('Quality Preset', storedQuality.toUpperCase(), '#facc15');
  keyValue(
    'Pixel Ratio',
    `${
      renderer?.getPixelRatio()?.toFixed(1) || storedPixelRatio
    } (cap: ${storedPixelRatio})`,
    '#67e8f9'
  );
  keyValue('Shadow Map', storedShadowMap, '#c084fc');
  keyValue(
    'Antialias',
    storedAntialias === 'true' ? 'ON' : 'OFF',
    storedAntialias === 'true' ? '#4ade80' : '#94a3b8'
  );
  keyValue('Power Preference', 'high-performance', '#4ade80');

  if (renderer) {
    const toneMap = renderer.toneMapping;
    const toneMapNames = {
      0: 'None',
      1: 'Linear',
      2: 'Reinhard',
      3: 'Cineon',
      4: 'ACESFilmic',
      6: 'AgX',
      7: 'Neutral',
    };
    keyValue('Tone Mapping', toneMapNames[toneMap] || toneMap, '#fb7185');
    keyValue('Exposure', renderer.toneMappingExposure?.toFixed(2), '#67e8f9');
  }
  groupEnd();

  groupOpen('🌍 World State');
  const currentSeason = seasonManager?.currentSeason || 'unknown';
  const currentTime = envTimeManager?.envTime || 'unknown';
  const seasonColors = {
    spring: '#86efac',
    autumn: '#fdba74',
    winter: '#93c5fd',
    rainy: '#7dd3fc',
  };
  const timeColors = { day: '#fde047', night: '#a78bfa' };

  keyValue(
    'Season',
    currentSeason.toUpperCase(),
    seasonColors[currentSeason] || '#94a3b8'
  );
  keyValue(
    'Time of Day',
    currentTime.toUpperCase(),
    timeColors[currentTime] || '#94a3b8'
  );
  groupEnd();

  groupOpen('🔊 Audio State');
  const musicEnabled = game.withMusic;
  const masterVol = audioManager?.masterVolume ?? 1;
  const musicVol = audioManager?.musicVolume ?? 0.5;
  const soundVol = audioManager?.soundVolume ?? 0.7;

  keyValue(
    'Music',
    musicEnabled ? 'ENABLED' : 'DISABLED',
    musicEnabled ? '#4ade80' : '#f87171'
  );
  keyValue('Master Volume', `${Math.round(masterVol * 100)}%`, '#facc15');
  keyValue('Music Volume', `${Math.round(musicVol * 100)}%`, '#67e8f9');
  keyValue('Sound Volume', `${Math.round(soundVol * 100)}%`, '#c084fc');

  if (musicManager?.currentTrack) {
    keyValue(
      'Now Playing',
      musicManager.currentTrack.name || 'Unknown',
      '#4ade80'
    );
  }
  groupEnd();

  groupOpen('💻 Viewport');
  keyValue('Window', `${window.innerWidth} × ${window.innerHeight}`, '#67e8f9');
  keyValue('Device Pixel Ratio', `${window.devicePixelRatio}x`, '#facc15');
  keyValue(
    'Touch Support',
    navigator.maxTouchPoints > 0 ? 'YES' : 'NO',
    '#c084fc'
  );
  groupEnd();

  divider('─', 60);
  const debugHintStyle = css({
    color: '#94a3b8',
    'font-size': '11px',
    'font-style': 'italic',
  });
  const debugLinkStyle = css({
    color: '#60a5fa',
    'font-size': '11px',
    'font-weight': '700',
  });
  console.log(
    `%c💡 Tip: Add %c?mode=debug%c to URL for debug GUI with full controls`,
    debugHintStyle,
    debugLinkStyle,
    debugHintStyle
  );
  divider('═', 60);
}

function logSeasonChange(newSeason, oldSeason) {
  const seasonEmojis = {
    spring: '🌸',
    autumn: '🍂',
    winter: '❄️',
    rainy: '🌧️',
  };
  const seasonColors = {
    spring: '#86efac',
    autumn: '#fdba74',
    winter: '#93c5fd',
    rainy: '#7dd3fc',
  };
  const emoji = seasonEmojis[newSeason] || '🌍';
  const color = seasonColors[newSeason] || '#94a3b8';

  console.log(
    `%c${emoji} SEASON%c ${
      oldSeason?.toUpperCase() || '?'
    } → ${newSeason.toUpperCase()}`,
    css({
      background: color,
      color: '#0f172a',
      padding: '3px 10px',
      'border-radius': '4px',
      'font-weight': '700',
      'font-size': '11px',
    }),
    css({
      color: color,
      'font-size': '12px',
      'font-weight': '600',
      'padding-left': '8px',
    })
  );
}

function logTimeChange(newTime, oldTime) {
  const timeEmojis = { day: '☀️', night: '🌙' };
  const timeColors = { day: '#fde047', night: '#a78bfa' };
  const emoji = timeEmojis[newTime] || '🕐';
  const color = timeColors[newTime] || '#94a3b8';

  console.log(
    `%c${emoji} TIME%c ${
      oldTime?.toUpperCase() || '?'
    } → ${newTime.toUpperCase()}`,
    css({
      background: color,
      color: '#0f172a',
      padding: '3px 10px',
      'border-radius': '4px',
      'font-weight': '700',
      'font-size': '11px',
    }),
    css({
      color: color,
      'font-size': '12px',
      'font-weight': '600',
      'padding-left': '8px',
    })
  );
}

function logMusicChange(action, trackName = null) {
  const actions = {
    play: { emoji: '▶️', label: 'PLAYING', color: '#4ade80' },
    pause: { emoji: '⏸️', label: 'PAUSED', color: '#facc15' },
    stop: { emoji: '⏹️', label: 'STOPPED', color: '#f87171' },
    skip: { emoji: '⏭️', label: 'SKIPPED', color: '#67e8f9' },
    track: { emoji: '🎵', label: 'TRACK', color: '#c084fc' },
  };
  const { emoji, label, color } = actions[action] || actions.track;

  const msg = trackName ? `${label}: ${trackName}` : label;

  console.log(
    `%c${emoji} MUSIC%c ${msg}`,
    css({
      background: color,
      color: '#0f172a',
      padding: '3px 10px',
      'border-radius': '4px',
      'font-weight': '700',
      'font-size': '11px',
    }),
    css({
      color: color,
      'font-size': '12px',
      'font-weight': '600',
      'padding-left': '8px',
    })
  );
}

function logAudioToggle(enabled) {
  const emoji = enabled ? '🔊' : '🔇';
  const label = enabled ? 'UNMUTED' : 'MUTED';
  const color = enabled ? '#4ade80' : '#f87171';

  console.log(
    `%c${emoji} AUDIO%c ${label}`,
    css({
      background: color,
      color: '#0f172a',
      padding: '3px 10px',
      'border-radius': '4px',
      'font-weight': '700',
      'font-size': '11px',
    }),
    css({
      color: color,
      'font-size': '12px',
      'font-weight': '600',
      'padding-left': '8px',
    })
  );
}

function logGraphicsChange(quality) {
  const qualityColors = {
    low: '#f87171',
    medium: '#facc15',
    high: '#4ade80',
    ultra: '#c084fc',
  };
  const color = qualityColors[quality] || '#94a3b8';

  console.log(
    `%c⚙️ GRAPHICS%c Quality set to ${quality.toUpperCase()}`,
    css({
      background: color,
      color: '#0f172a',
      padding: '3px 10px',
      'border-radius': '4px',
      'font-weight': '700',
      'font-size': '11px',
    }),
    css({
      color: color,
      'font-size': '12px',
      'font-weight': '600',
      'padding-left': '8px',
    })
  );
}

export const Console = {
  banner,
  section,
  info: (label, msg) => styled('info', label, msg),
  success: (label, msg) => styled('success', label, msg),
  warn: (label, msg) => styled('warn', label, msg),
  error: (label, msg) => styled('error', label, msg),
  debug: (label, msg) => styled('debug', label, msg),
  perf,
  techTable,
  group,
  groupOpen,
  groupEnd,
  divider,
  keyValue,
  credits,
  timeStamp,
  logGameState,
  logSeasonChange,
  logTimeChange,
  logMusicChange,
  logAudioToggle,
  logGraphicsChange,
};
