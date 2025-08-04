import { create } from 'zustand';

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
}

export const useViewerStore = create<ViewerState>((set) => ({
    currentNodeId: 'kawasan-1', // Changed back to match vanilla version
    minimapVisible: true,
    galleryVisible: false,
    controlsVisible: true,
    isFullscreen: false,
    navigationVisible: true,

    setCurrentNode: (nodeId) => set({ currentNodeId: nodeId }),
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
