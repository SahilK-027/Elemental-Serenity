# Lightning System

## Overview
The Lightning system creates realistic lightning strikes with arc geometry and explosion particles. Strikes only occur during the rainy season unless manually triggered from the debug panel.

## Features
- **Arc Mesh**: Orange line geometry representing the lightning bolt (3 second duration)
- **Explosion Particles**: Orange particles that burst outward with gravity using ParticleSystem (4 second duration)
- **Season-Based Triggering**: Lightning only strikes automatically during rainy season
- **Manual Trigger**: Debug UI button to trigger strikes at scene center
- **Camera Shake**: Applies a camera shake effect when lightning strikes
- **Thunder Sound**: Plays the `thunderStrikeSound` audio with proper pause/resume support
- **Pause/Resume Support**: Lightning respects the game's pause/resume logic

## How It Works

### Strike Sequence
Each lightning strike follows this sequence:

1. **Arc Phase** (3s):
   - Orange line geometry forms a jagged path (15 random points)
   - Represents the lightning bolt
   - Randomly rotated for variety
   - Height: 15 units

2. **Explosion Phase** (4s):
   - 128 orange particles burst outward using the ParticleSystem
   - Particles have velocity and gravity applied
   - Fade out over duration

### Particle Details

**Arc Mesh**:
- Geometry: Line with 15 random points
- Color: Orange (#ff4c00)
- Height: 15 units
- Duration: 3 seconds
- Randomly rotated

**Explosion Particles** (ParticleSystem):
- Count: 128
- Color: Orange (#ff4c00)
- Velocity: 15-23 units/second
- Physics: Gravity enabled (0.09 units/frame²)
- Duration: 4 seconds
- Uses EmitterParams with PointShape

### Camera Shake
- **Duration**: 0.5 seconds
- **Intensity**: 0.3 units maximum displacement
- **Easing**: Linear fade-out over duration

### Audio Pause/Resume
The lightning sound respects the game's pause/resume system:
- Listens to `musicManager` pause/resume events
- Stops triggering new strikes when paused
- Resumes when game is unpaused
- Volume respects master and sound volume settings

## Integration

The Lightning system is integrated into the World class:
```javascript
this.particleSystem = new ParticleSystem();
this.lightning = new Lightning(this.particleSystem);
```

And updated each frame:
```javascript
this.particleSystem.update(delta, elapsedTime);
this.lightning.update(delta);
```

## Debug Controls
A "Strike Lightning" button is available in the debug panel under the "Lightning" folder. This triggers a lightning strike at the scene center (0, 0, 0) regardless of season or pause state.

## Audio Requirements
Ensure the following audio asset is loaded:
- `thunderStrikeSound` - The thunder strike sound effect

## Customization

You can adjust lightning behavior by modifying these properties in `Lightning.class.js`:
- `cameraShakeDuration` - How long the shake lasts (seconds)
- `cameraShakeIntensity` - How intense the shake is (units)
- `colorA` - Orange color for arc and explosion (#ff4c00)
- `colorB` - Blue color (reserved for future use)
- `getRandomDelay()` - Modify the 10-20 second range
- `setupArc()` - Adjust arc duration
- `setupExplosionParticles()` - Adjust particle count, velocity, and duration
