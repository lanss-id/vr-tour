// App Configuration
export const APP_CONFIG = {
  TITLE: 'VR Panorama Tour',
  VERSION: '1.0.0',
  DEBUG_MODE: import.meta.env.DEV,
} as const;

// Photo Sphere Viewer Configuration
export const PSV_CONFIG = {
  DEFAULT_ZOOM: 50,
  MAX_ZOOM: 120,
  MIN_ZOOM: 30,
  DEFAULT_YAW: '0deg',
  POSITION_MODE: 'gps' as const,
  RENDER_MODE: '3d' as const,
} as const;

// Feature Flags
export const FEATURES = {
  KEYBOARD_SHORTCUTS: true,
  FULLSCREEN: true,
  GALLERY: true,
  MINIMAP: true,
  NAVIGATION: true,
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  GALLERY: 'g',
  MINIMAP: 'm',
  NAVIGATION: 'n',
  FULLSCREEN: 'f',
  HIDE_ALL: ['h', 'escape'],
} as const;

// UI Constants
export const UI = {
  Z_INDEX: {
    OVERLAY: 10,
    MODAL: 50,
    TOOLTIP: 100,
  },
  ANIMATION: {
    DURATION: 200,
    EASING: 'ease-out',
  },
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
  },
} as const;

// Default Panorama Data
export const DEFAULT_PANORAMA = {
  ID: 'kawasan-1',
  GPS: [106.8470, -6.2100] as [number, number],
} as const;
