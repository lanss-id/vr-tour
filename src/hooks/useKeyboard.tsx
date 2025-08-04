import { useEffect, useCallback } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { KEYBOARD_SHORTCUTS, FEATURES } from '../utils/constants';

export const useKeyboard = () => {
    const {
        toggleGallery,
        toggleMinimap,
        toggleNavigation,
        hideAllOverlays,
        toggleFullscreen
    } = useViewerStore();

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Ignore if user is typing in an input
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        const key = event.key.toLowerCase();

        switch (key) {
            case KEYBOARD_SHORTCUTS.GALLERY:
                event.preventDefault();
                toggleGallery();
                break;
            case KEYBOARD_SHORTCUTS.MINIMAP:
                event.preventDefault();
                toggleMinimap();
                break;
            case KEYBOARD_SHORTCUTS.NAVIGATION:
                event.preventDefault();
                toggleNavigation();
                break;
            case KEYBOARD_SHORTCUTS.FULLSCREEN:
                event.preventDefault();
                toggleFullscreen();
                break;
            default:
                // Handle hide all shortcuts
                if (KEYBOARD_SHORTCUTS.HIDE_ALL.includes(key)) {
                    event.preventDefault();
                    hideAllOverlays();
                }
                break;
        }
    }, [toggleGallery, toggleMinimap, toggleNavigation, hideAllOverlays, toggleFullscreen]);

    useEffect(() => {
        if (!FEATURES.KEYBOARD_SHORTCUTS) return;

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};
