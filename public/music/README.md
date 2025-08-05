# Music Folder

This folder contains background music for the VR Panorama Tour.

## File Structure

```
public/music/
├── README.md
└── bg-music.mp3 (add your music file here)
```

## How to Add Background Music

1. **Add your music file**: Place your background music file in this folder
2. **File format**: Use MP3 format for best compatibility
3. **File name**: Name it `bg-music.mp3` to match the code
4. **File size**: Keep it under 5MB for better loading performance

## Supported Formats

- MP3 (recommended)
- WAV
- OGG

## Features

- **Single Instance**: Only one audio instance to prevent double music
- **Autoplay**: Music starts automatically when the page loads
- **Smart Autoplay**: If browser blocks autoplay, music starts on first user interaction
- **Loop**: Music loops continuously
- **Volume**: Set to 30% by default
- **Controls**: Use the music button in the control bar or press 'M' key
- **Pause/Play**: Toggle music on/off

## Implementation Details

### Single Audio Instance

The app uses a global audio instance to prevent multiple audio elements:

```javascript
// Global audio instance to prevent multiple instances
let globalAudio: HTMLAudioElement | null = null;
```

### Autoplay Strategy

1. **Immediate Play**: Tries to play music immediately when page loads
2. **User Interaction Fallback**: If autoplay fails, music starts on first user interaction
3. **Multiple Event Listeners**: Listens for various user interactions (click, keydown, touchstart, mousedown)
4. **Automatic Cleanup**: Removes event listeners after successful play

### State Management

- Uses React state to track playing status
- Syncs with global audio instance
- Updates UI based on audio events

## Browser Autoplay Policy

Due to browser autoplay policies, music may not start automatically on first visit. The app handles this by:

- Trying immediate autoplay first
- Falling back to user interaction triggers
- Using multiple interaction types (click, keydown, touchstart, mousedown)
- Providing manual controls via button and keyboard shortcut

## Customization

To change the music file or settings, edit:

### File Path

- **ControlBar**: `src/components/viewer/ControlBar.tsx` (line with `new Audio('/music/bg-music.mp3')`)

### Volume Settings

- Change `globalAudio.volume = 0.3` to your preferred volume (0.0 to 1.0)

### Loop Settings

- Set `globalAudio.loop = true` to `false` if you don't want looping

### Keyboard Shortcut

- Change the 'M' key in `src/hooks/useKeyboard.tsx` to another key if needed

## Troubleshooting

### Music Not Playing

1. Check if the file exists at `/music/bg-music.mp3`
2. Try clicking anywhere on the page to trigger user interaction
3. Check browser console for error messages
4. Ensure browser allows autoplay (check browser settings)

### Double Music Issue (Fixed)

- The app now uses a single global audio instance
- No more multiple audio elements created
- Music controls work consistently

### Volume Too Loud/Quiet

Edit the volume setting in `ControlBar.tsx`:

```javascript
globalAudio.volume = 0.3; // Change this value (0.0 to 1.0)
```

## Technical Notes

- **Global Instance**: Single audio instance prevents memory leaks
- **Event Listeners**: Proper cleanup prevents memory issues
- **Error Handling**: Graceful fallbacks for autoplay failures
- **State Sync**: UI stays in sync with audio state
