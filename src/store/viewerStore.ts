import { create } from 'zustand';

interface ViewerState {
    currentNodeId: string;
    minimapVisible: boolean;
    galleryVisible: boolean;
    controlsVisible: boolean;
    isFullscreen: boolean;
    navigationVisible: boolean;
    allOverlaysHidden: boolean;
    infoBlockVisible: boolean;

    // Actions
    setCurrentNode: (nodeId: string) => void;
    toggleMinimap: () => void;
    toggleGallery: () => void;
    toggleControls: () => void;
    toggleFullscreen: () => void;
    toggleNavigation: () => void;
    hideAllOverlays: () => void;
    toggleAllOverlays: () => void;
    toggleInfoBlock: () => void;
    validateAndSetCurrentNode: (nodeId: string, panoramas?: any[]) => void;
    resetToDefault: (panoramas?: any[]) => void;
}

// Helper function to validate node ID
const validateNodeId = (nodeId: string, panoramas?: any[]): string => {
    if (panoramas && panoramas.length > 0) {
        const validNode = panoramas.find(p => p.id === nodeId);
        if (validNode) {
            return nodeId;
        }
        // Return first panorama as default if invalid
        return panoramas[0].id;
    }
    
    // If no panoramas available, return empty string
    return '';
};

// Get default node ID
const getDefaultNodeId = (panoramas?: any[]): string => {
    if (panoramas && panoramas.length > 0) {
        return panoramas[0].id;
    }
    return '';
};

export const useViewerStore = create<ViewerState>((set, get) => ({
    // Initialize with empty string - will be set when panoramas load
    currentNodeId: '',
    minimapVisible: true,
    galleryVisible: false,
    controlsVisible: true,
    isFullscreen: false,
    navigationVisible: false,
    allOverlaysHidden: false,
    infoBlockVisible: false,

    setCurrentNode: (nodeId) => {
        console.log('Setting current node to:', nodeId);
        set({ currentNodeId: nodeId });
    },

    validateAndSetCurrentNode: (nodeId, panoramas) => {
        const validatedNodeId = validateNodeId(nodeId, panoramas);
        if (validatedNodeId !== get().currentNodeId) {
            console.log('Validating and setting current node to:', validatedNodeId);
            set({ currentNodeId: validatedNodeId });
        }
    },

    resetToDefault: (panoramas) => {
        const defaultNodeId = getDefaultNodeId(panoramas);
        console.log('Resetting to default node:', defaultNodeId);
        set({
            currentNodeId: defaultNodeId,
            minimapVisible: true,
            galleryVisible: false,
            controlsVisible: true,
            isFullscreen: false,
            navigationVisible: false,
            allOverlaysHidden: false,
            infoBlockVisible: false
        });
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
    toggleAllOverlays: () => set((state) => ({ allOverlaysHidden: !state.allOverlaysHidden })),
    toggleInfoBlock: () => set((state) => ({ infoBlockVisible: !state.infoBlockVisible })),
}));
