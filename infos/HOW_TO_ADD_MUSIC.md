# 🎵 How to Add New Music to Your Project

## Quick Steps

### 1. **Add Music File**
Place your `.mp3` file in: `public/audio/musics/your_song.mp3`

### 2. **Register in Assets** (`src/config/assets.js`)
Add to the Music section:
```javascript
{
  id: 'yourSongMusic',
  type: 'audio',
  path: ['/audio/musics/your_song.mp3'],
},
```

### 3. **Add to AudioManager** (`src/Game/Utils/AudioManager.class.js`)
Add to the `audioAssets` array:
```javascript
const audioAssets = [
  // Music
  'morningPetalsMusic',
  'windowLightMusic',
  'yourSongMusic',  // Add here
  // ...
];
```

### 4. **Add to MusicManager** (`src/Game/Utils/MusicManager.class.js`)
Add to the `musicTracks` array:
```javascript
this.musicTracks = [
  { id: 'morningPetalsMusic', name: 'Morning Petals' },
  { id: 'windowLightMusic', name: 'Window Light' },
  { id: 'yourSongMusic', name: 'Your Song Name' }  // Add here
];
```

### 5. **Optional: Add Debug Control** (`src/Game/Game.class.js`)
Add to audioControls object:
```javascript
playYourSong: () => this.audioManager.playMusic('yourSongMusic'),
```

And add the debug button:
```javascript
this.debug.add(audioControls, 'playYourSong', { label: 'Play Your Song' }, 'Audio');
```

## 🎯 **Important Notes**

- **File Format**: Use `.mp3` files for best compatibility
- **Naming Convention**: Use camelCase for IDs (e.g., `forestDreamsMusic`)
- **Display Names**: Use readable names for the toast notifications
- **File Size**: Keep files reasonable size for web loading
- **No Restart Required**: Changes will hot-reload automatically

## 🔄 **Automatic Features**

Once added, your new music will automatically:
- ✅ Be included in the random playlist
- ✅ Show toast notifications when playing
- ✅ Fade in/out smoothly
- ✅ Never repeat consecutively
- ✅ Work with all volume controls

## 📁 **File Structure Example**
```
public/audio/musics/
├── morning_petals.mp3
├── window_light.mp3
└── your_new_song.mp3  ← Add here
```

That's it! Your new music will be part of the random background music system! 🎶