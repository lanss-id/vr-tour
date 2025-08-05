import { useEffect, useCallback } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { KEYBOARD_SHORTCUTS, FEATURES } from '../utils/constants';
import panoramaData from '../data/panorama-data.json';

export const useKeyboard = () => {
    const {
        currentNodeId,
        setCurrentNode,
        toggleGallery,
        toggleMinimap,
        toggleNavigation,
        hideAllOverlays,
        toggleAllOverlays,
        toggleInfoBlock,
        toggleFullscreen,
        clearStoredState
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
            case 'i':
                event.preventDefault();
                toggleInfoBlock();
                break;
            case 'escape':
                event.preventDefault();
                // Close info block if open, otherwise toggle all overlays
                const { infoBlockVisible } = useViewerStore.getState();
                if (infoBlockVisible) {
                    toggleInfoBlock();
                } else {
                    toggleAllOverlays();
                }
                break;
            case 'r':
                // Reset state with confirmation
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    if (confirm('Reset panorama state? This will clear any stored state and return to the first panorama.')) {
                        clearStoredState();
                    }
                }
                break;
            case 'arrowleft':
            case 'a':
                event.preventDefault();
                // Previous panorama
                const currentIndex = panoramaData.findIndex(node => node.id === currentNodeId);
                if (currentIndex > 0) {
                    const previousNode = panoramaData[currentIndex - 1];
                    setCurrentNode(previousNode.id);
                } else {
                    // Wrap to last panorama
                    const lastNode = panoramaData[panoramaData.length - 1];
                    setCurrentNode(lastNode.id);
                }
                break;
            case 'arrowright':
            case 'd':
                event.preventDefault();
                // Next panorama
                const nextIndex = panoramaData.findIndex(node => node.id === currentNodeId);
                if (nextIndex < panoramaData.length - 1) {
                    const nextNode = panoramaData[nextIndex + 1];
                    setCurrentNode(nextNode.id);
                } else {
                    // Wrap to 'kawasan-1' as default
                    setCurrentNode('kawasan-1');
                }
                break;
            case 'm':
                event.preventDefault();
                // Toggle music using global audio instance
                const audioElements = document.querySelectorAll('audio');
                if (audioElements.length > 0) {
                    // Use the first audio element (should be our global instance)
                    const audio = audioElements[0] as HTMLAudioElement;
                    if (audio.paused) {
                        audio.play().catch(err => console.warn('Failed to play music:', err));
                    } else {
                        audio.pause();
                    }
                }
                break;
            default:
                // Handle hide all shortcuts (excluding escape which is handled above)
                if (KEYBOARD_SHORTCUTS.HIDE_ALL.includes(key) && key !== 'escape') {
                    event.preventDefault();
                    toggleAllOverlays();
                }
                break;
        }
    }, [currentNodeId, setCurrentNode, toggleGallery, toggleMinimap, toggleNavigation, hideAllOverlays, toggleAllOverlays, toggleInfoBlock, toggleFullscreen, clearStoredState]);

    useEffect(() => {
        if (!FEATURES.KEYBOARD_SHORTCUTS) return;

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};
