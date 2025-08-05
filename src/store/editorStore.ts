import { create } from 'zustand';
import { dataManager } from '../utils/dataManager';

interface EditorState {
    currentPanoramaId: string;
    hotspots: any[];
    isDirty: boolean;
    isEditing: boolean;
    selectedHotspotId: string | null;
    editMode: 'hotspot' | 'minimap' | 'navigation' | 'supabase' | 'settings';
    navigationMenu: {
        categories: any[];
        layout: 'grid' | 'list' | 'cards';
        theme: 'light' | 'dark' | 'auto';
        showThumbnails: boolean;
        showSubtitles: boolean;
        maxItemsPerRow: number;
        style?: {
            backgroundColor?: string;
            textColor?: string;
            borderColor?: string;
            borderRadius?: string;
            shadow?: string;
        };
    };

    // Actions
    setCurrentPanorama: (panoramaId: string) => void;
    addHotspot: (hotspot: any) => void;
    updateHotspot: (id: string, updates: any) => void;
    deleteHotspot: (id: string) => void;
    duplicateHotspot: (id: string) => void;
    setSelectedHotspot: (id: string | null) => void;
    setIsEditing: (isEditing: boolean) => void;
    setIsDirty: (isDirty: boolean) => void;
    clearHotspots: () => void;
    updateNavigationMenu: (updates: any) => void;
    setEditMode: (mode: 'hotspot' | 'minimap' | 'navigation' | 'supabase' | 'settings') => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    // State
    currentPanoramaId: 'kawasan-1',
    hotspots: [],
    isDirty: false,
    isEditing: false,
    selectedHotspotId: null,
    editMode: 'hotspot',
    navigationMenu: {
        categories: [
            {
                id: 'type35',
                title: 'Type 35',
                subtitle: 'Interior VR Tour',
                icon: 'building',
                order: 1,
                isVisible: true,
                items: [
                    {
                        id: 'type35-1',
                        title: 'Interior 1',
                        subtitle: 'Type 35 - Interior VR 1',
                        thumbnail: '/panoramas/type_35/vr interior 35 1.png',
                        panoramaId: 'type35-1',
                        order: 1,
                        isVisible: true
                    },
                    {
                        id: 'type35-2',
                        title: 'Interior 2',
                        subtitle: 'Type 35 - Interior VR 2',
                        thumbnail: '/panoramas/type_35/vr interior 35 2.png',
                        panoramaId: 'type35-2',
                        order: 2,
                        isVisible: true
                    },
                    {
                        id: 'type35-3',
                        title: 'Interior 3',
                        subtitle: 'Type 35 - Interior VR 3',
                        thumbnail: '/panoramas/type_35/vr interior 35 3.png',
                        panoramaId: 'type35-3',
                        order: 3,
                        isVisible: true
                    },
                    {
                        id: 'type35-4',
                        title: 'Interior 4',
                        subtitle: 'Type 35 - Interior VR 4',
                        thumbnail: '/panoramas/type_35/vr interior 35 4.png',
                        panoramaId: 'type35-4',
                        order: 4,
                        isVisible: true
                    },
                    {
                        id: 'type35-5',
                        title: 'Interior 5',
                        subtitle: 'Type 35 - Interior VR 5',
                        thumbnail: '/panoramas/type_35/vr interior 35 5.png',
                        panoramaId: 'type35-5',
                        order: 5,
                        isVisible: true
                    }
                ]
            },
            {
                id: 'type45',
                title: 'Type 45',
                subtitle: 'Interior VR Tour',
                icon: 'building',
                order: 2,
                isVisible: true,
                items: [
                    {
                        id: 'type45-1',
                        title: 'Bedroom 1',
                        subtitle: 'Type 45 - Bedroom 1',
                        thumbnail: '/panoramas/type_45/BEDROOM 1.png',
                        panoramaId: 'type45-1',
                        order: 1,
                        isVisible: true
                    },
                    {
                        id: 'type45-2',
                        title: 'Bedroom 2',
                        subtitle: 'Type 45 - Bedroom 2',
                        thumbnail: '/panoramas/type_45/BEDROOM 2.png',
                        panoramaId: 'type45-2',
                        order: 2,
                        isVisible: true
                    },
                    {
                        id: 'type45-3',
                        title: 'Living Room',
                        subtitle: 'Type 45 - Living Room',
                        thumbnail: '/panoramas/type_45/LIVING ROOM.png',
                        panoramaId: 'type45-3',
                        order: 3,
                        isVisible: true
                    },
                    {
                        id: 'type45-4',
                        title: 'Master Bed',
                        subtitle: 'Type 45 - Master Bed',
                        thumbnail: '/panoramas/type_45/MASTER BED.png',
                        panoramaId: 'type45-4',
                        order: 4,
                        isVisible: true
                    }
                ]
            },
            {
                id: 'type60',
                title: 'Type 60',
                subtitle: 'Interior VR Tour',
                icon: 'building',
                order: 3,
                isVisible: true,
                items: [
                    {
                        id: 'type60-1',
                        title: '1st Floor Dining Room',
                        subtitle: 'Type 60 - 1st Floor Dining Room',
                        thumbnail: '/panoramas/type_60/1st Floor DINING ROOM.png',
                        panoramaId: 'type60-1',
                        order: 1,
                        isVisible: true
                    },
                    {
                        id: 'type60-2',
                        title: '1st Floor Living Room',
                        subtitle: 'Type 60 - 1st Floor Living Room',
                        thumbnail: '/panoramas/type_60/1st Floor LIVINGROOM.png',
                        panoramaId: 'type60-2',
                        order: 2,
                        isVisible: true
                    },
                    {
                        id: 'type60-3',
                        title: '2nd Floor Bedroom 1',
                        subtitle: 'Type 60 - 2nd Floor Bedroom 1',
                        thumbnail: '/panoramas/type_60/2nd Floor Bedroom 1.png',
                        panoramaId: 'type60-3',
                        order: 3,
                        isVisible: true
                    },
                    {
                        id: 'type60-4',
                        title: '2nd Floor Bedroom 2',
                        subtitle: 'Type 60 - 2nd Floor Bedroom 2',
                        thumbnail: '/panoramas/type_60/2nd Floor Bedroom 2.png',
                        panoramaId: 'type60-4',
                        order: 4,
                        isVisible: true
                    },
                    {
                        id: 'type60-5',
                        title: '2nd Floor Master Bed',
                        subtitle: 'Type 60 - 2nd Floor Master Bed',
                        thumbnail: '/panoramas/type_60/2nd Floor Masterbed.png',
                        panoramaId: 'type60-5',
                        order: 5,
                        isVisible: true
                    },
                    {
                        id: 'type60-6',
                        title: 'WIC',
                        subtitle: 'Type 60 - WIC',
                        thumbnail: '/panoramas/type_60/WIC.png',
                        panoramaId: 'type60-6',
                        order: 6,
                        isVisible: true
                    }
                ]
            },
            {
                id: 'kawasan',
                title: 'Kawasan',
                subtitle: 'Area VR Tour',
                icon: 'map-pin',
                order: 4,
                isVisible: true,
                items: [
                    {
                        id: 'kawasan-1',
                        title: 'Panorama 1',
                        subtitle: 'Kawasan - Panorama 1',
                        thumbnail: '/panoramas/kawasan/Panorama 1.png',
                        panoramaId: 'kawasan-1',
                        order: 1,
                        isVisible: true
                    },
                    {
                        id: 'kawasan-2',
                        title: 'Panorama 2',
                        subtitle: 'Kawasan - Panorama 2',
                        thumbnail: '/panoramas/kawasan/Panorama 2.png',
                        panoramaId: 'kawasan-2',
                        order: 2,
                        isVisible: true
                    },
                    {
                        id: 'kawasan-3',
                        title: 'Panorama 3',
                        subtitle: 'Kawasan - Panorama 3',
                        thumbnail: '/panoramas/kawasan/Panorama 3.png',
                        panoramaId: 'kawasan-3',
                        order: 3,
                        isVisible: true
                    }
                ]
            }
        ],
        layout: 'grid',
        theme: 'light',
        showThumbnails: true,
        showSubtitles: true,
        maxItemsPerRow: 3,
        style: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            textColor: '#1f2937',
            borderColor: '#e5e7eb',
            borderRadius: '12px',
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }
    },

    // Actions
    setCurrentPanorama: (panoramaId: string) => {
        set({ currentPanoramaId: panoramaId });
        dataManager.setCurrentPanorama(panoramaId);
    },

    addHotspot: (hotspot: any) => {
        set((state) => ({
            hotspots: [...state.hotspots, hotspot],
            isDirty: true,
        }));
        console.log('Hotspot added:', hotspot);
    },

    updateHotspot: (id: string, updates: any) => {
        set((state) => ({
            hotspots: state.hotspots.map((h) =>
                h.id === id ? { ...h, ...updates } : h
            ),
            isDirty: true,
        }));
        console.log('Hotspot updated:', id, updates);
    },

    deleteHotspot: (id: string) => {
        set((state) => ({
            hotspots: state.hotspots.filter((h) => h.id !== id),
            isDirty: true,
        }));
        console.log('Hotspot deleted:', id);
    },

    duplicateHotspot: (id: string) => {
        const hotspot = get().hotspots.find((h) => h.id === id);
        if (hotspot) {
            const duplicated = {
                ...hotspot,
                id: `${hotspot.id}-copy-${Date.now()}`,
                title: `${hotspot.title} (Copy)`,
            };
            set((state) => ({
                hotspots: [...state.hotspots, duplicated],
                isDirty: true,
            }));
        }
    },

    setSelectedHotspot: (id: string | null) => set({ selectedHotspotId: id }),
    setIsEditing: (isEditing: boolean) => set({ isEditing }),
    setIsDirty: (isDirty: boolean) => set({ isDirty }),
    clearHotspots: () => set({ hotspots: [] }),
    updateNavigationMenu: (updates: any) => {
        set((state) => ({
            navigationMenu: { ...state.navigationMenu, ...updates }
        }));
    },
    setEditMode: (mode) => set({ editMode: mode }),
}));

// Helper functions untuk akses data panorama
export const getPanoramas = () => dataManager.getAllPanoramas();
export const getCurrentPanorama = () => dataManager.getCurrentPanorama();
export const getPanoramaNames = () => dataManager.getPanoramaNames();
