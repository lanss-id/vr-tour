import { create } from 'zustand';
import { useDataManager, getPanoramaById } from '../utils/dataManager';

interface ViewerState {
    currentNodeId: string;
    minimapVisible: boolean;
    galleryVisible: boolean;
    controlsVisible: boolean;
    isFullscreen: boolean;
    navigationVisible: boolean;

    // Actions
    setCurrentNode: (nodeId: string) => void;
    toggleMinimap: () => void;
    toggleGallery: () => void;
    toggleControls: () => void;
    toggleFullscreen: () => void;
    toggleNavigation: () => void;
    hideAllOverlays: () => void;
    validateAndSetCurrentNode: (nodeId: string) => void;
    resetToDefault: () => void;
    clearStoredState: () => void;
}

// Helper function to validate node ID
const validateNodeId = (nodeId: string): string => {
    const validNode = getPanoramaById(nodeId);
    if (validNode) {
        return nodeId;
    }
    // Return 'kawasan-1' as default if invalid
    return 'kawasan-1';
};

// Get default node ID - always use 'kawasan-1' as default
const getDefaultNodeId = (): string => {
    return 'kawasan-1';
};

// Clear any stored state from localStorage
const clearStoredViewerState = () => {
    try {
        // Remove any stored viewer state
        localStorage.removeItem('viewer-store');
        localStorage.removeItem('panorama-viewer-state');
        console.log('Cleared stored viewer state');
    } catch (error) {
        console.warn('Error clearing stored state:', error);
    }
};

export const useViewerStore = create<ViewerState>((set, get) => ({
    // Initialize with first panorama instead of hardcoded 'kawasan-1'
    currentNodeId: getDefaultNodeId(),
    minimapVisible: true,
    galleryVisible: false,
    controlsVisible: true,
    isFullscreen: false,
    navigationVisible: false,

    setCurrentNode: (nodeId) => {
        const validatedNodeId = validateNodeId(nodeId);
        console.log('Setting current node to:', validatedNodeId);
        set({ currentNodeId: validatedNodeId });

        // Sync with data manager
        useDataManager.getState().setCurrentPanorama(validatedNodeId);
    },

    validateAndSetCurrentNode: (nodeId) => {
        const validatedNodeId = validateNodeId(nodeId);
        if (validatedNodeId !== get().currentNodeId) {
            console.log('Validating and setting current node to:', validatedNodeId);
            set({ currentNodeId: validatedNodeId });

            // Sync with data manager
            useDataManager.getState().setCurrentPanorama(validatedNodeId);
        }
    },

    resetToDefault: () => {
        const defaultNodeId = getDefaultNodeId();
        console.log('Resetting to default node:', defaultNodeId);
        set({
            currentNodeId: defaultNodeId,
            minimapVisible: true,
            galleryVisible: false,
            controlsVisible: true,
            isFullscreen: false,
            navigationVisible: false
        });

        // Sync with data manager
        useDataManager.getState().setCurrentPanorama(defaultNodeId);
    },

    clearStoredState: () => {
        clearStoredViewerState();
        const defaultNodeId = getDefaultNodeId();
        console.log('Clearing stored state and resetting to:', defaultNodeId);
        set({
            currentNodeId: defaultNodeId,
            minimapVisible: true,
            galleryVisible: false,
            controlsVisible: true,
            isFullscreen: false,
            navigationVisible: false
        });

        // Sync with data manager
        useDataManager.getState().setCurrentPanorama(defaultNodeId);
    },

    toggleMinimap: () => set((state) => ({ minimapVisible: !state.minimapVisible })),
    toggleGallery: () => set((state) => ({ galleryVisible: !state.galleryVisible })),
    toggleControls: () => set((state) => ({ controlsVisible: !state.controlsVisible })),
    toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
    toggleNavigation: () => set((state) => ({ navigationVisible: !state.navigationVisible })),
    hideAllOverlays: () => set({
        minimapVisible: false,
        galleryVisible: false,
        navigationVisible: false
    }),
}));
