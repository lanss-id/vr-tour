import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { EditorState, NavigationMenuData, NavigationCategory, NavigationItem } from '../types/editor';
import { PanoramaNode, Category, MinimapMarker, MinimapData } from '../types/panorama';
import { useDataManager, getPanoramaById, getAllPanoramaIds } from '../utils/dataManager';

// Convert panorama data to PanoramaNode format
const getMockPanoramas = (): PanoramaNode[] => {
    const panoramas = useDataManager.getState().panoramas;
    return panoramas.map((node: any) => ({
        id: node.id,
        panorama: node.panorama,
        thumbnail: node.thumbnail,
        name: node.name,
        caption: node.caption,
        links: node.links || [],
        gps: [0, 0], // Default GPS coordinates
    }));
};

const mockCategories: Category[] = [
    { id: 'drone', name: 'Drone View', icon: 'map-pin', order: 1, color: '#3b82f6' },
    { id: 'entrance', name: 'Main Gate', icon: 'home', order: 2, color: '#10b981' },
    { id: 'unit-types', name: 'Unit Types', icon: 'building', order: 3, color: '#8b5cf6' },
];

// Initialize hotspots from data manager
const initializeHotspots = () => {
    const allHotspots: any[] = [];
    const panoramas = useDataManager.getState().panoramas;

    panoramas.forEach((panorama: any) => {
        if (panorama.markers) {
            panorama.markers.forEach((marker: any, index: number) => {
                const targetPanorama = getPanoramaById(marker.nodeId);
                allHotspots.push({
                    id: `hotspot-${panorama.id}-${index}`,
                    panoramaId: panorama.id,
                    title: `Navigate to ${targetPanorama?.name || marker.nodeId}`,
                    content: `Click to navigate to ${targetPanorama?.name || marker.nodeId}`,
                    type: 'link' as const,
                    targetNodeId: marker.nodeId,
                    position: marker.position,
                    isVisible: true,
                    style: {
                        size: 32,
                        icon: '/icon/door-open.svg',
                        opacity: 1,
                    },
                });
            });
        }
    });

    return allHotspots;
};

const getMockMinimapData = (): MinimapData => {
    const panoramas = useDataManager.getState().panoramas;
    return {
        backgroundImage: '/minimap/sideplan.jpeg',
        markers: panoramas.map((node, index) => ({
            id: `marker-${node.id}`,
            nodeId: node.id,
            x: 20 + (index * 15) % 60,
            y: 20 + Math.floor(index / 3) * 20,
            label: node.name,
        })),
    };
};

// Mock navigation menu data based on the image structure
const getMockNavigationMenu = (): NavigationMenuData => {
    const panoramas = useDataManager.getState().panoramas;

    return {
        categories: [
            {
                id: 'main-gate',
                title: 'Main Gate',
                subtitle: 'Property entrance',
                icon: 'home',
                order: 1,
                isVisible: true,
                items: [
                    {
                        id: 'nav-main-gate',
                        title: 'Main Gate',
                        subtitle: 'Property entrance',
                        thumbnail: '/panoramas/kawasan/Panorama 1.png',
                        panoramaId: 'kawasan-1',
                        order: 0,
                        isVisible: true,
                    },
                ],
            },
            {
                id: 'drone-view',
                title: 'Drone View',
                subtitle: 'Aerial perspective of the property',
                icon: 'map-pin',
                order: 2,
                isVisible: true,
                items: panoramas
                    .filter((node: any) => node.id.startsWith('kawasan'))
                    .map((node: any, index) => ({
                        id: `nav-${node.id}`,
                        title: node.name,
                        subtitle: 'Drone view',
                        thumbnail: node.thumbnail,
                        panoramaId: node.id,
                        order: index,
                        isVisible: true,
                    })),
            },
            {
                id: 'unit-types',
                title: 'Tipe Unit',
                subtitle: 'Available unit types',
                icon: 'building',
                order: 3,
                isVisible: true,
                items: [
                    {
                        id: 'nav-type-swan',
                        title: 'Livia 35',
                        subtitle: '35 sqm',
                        thumbnail: '/panoramas/type_35/vr interior 35 1.png',
                        panoramaId: 'type35-1',
                        order: 0,
                        isVisible: true,
                    },
                    {
                        id: 'nav-type-osprey',
                        title: 'Salvia 45',
                        subtitle: '45 sqm',
                        thumbnail: '/panoramas/type_45/BEDROOM 1.png',
                        panoramaId: 'type45-bedroom1',
                        order: 1,
                        isVisible: true,
                    },
                    {
                        id: 'nav-type-albatros',
                        title: 'Viola 60',
                        subtitle: '60 sqm',
                        thumbnail: '/panoramas/type_60/1st Floor DINING ROOM.png',
                        panoramaId: 'type60-dining',
                        order: 2,
                        isVisible: true,
                    },
                ],
            },
        ],
        layout: 'cards',
        theme: 'light',
        showThumbnails: true,
        showSubtitles: true,
        maxItemsPerRow: 3,
        style: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            textColor: '#1f2937',
            borderColor: '#e5e7eb',
            borderRadius: '12px',
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
    };
};

export const useEditorStore = create<EditorState>()(
    devtools(
        persist(
            (set, get) => ({
                // State
                currentPanoramaId: 'kawasan-1',
                hotspots: initializeHotspots(),
                isDirty: false,
                isEditing: false,
                selectedHotspotId: null,

                // Actions
                setCurrentPanorama: (panoramaId: string) => {
                    set({ currentPanoramaId: panoramaId });
                    // Sync with data manager
                    useDataManager.getState().setCurrentPanorama(panoramaId);
                },

                addHotspot: (hotspot: any) => {
                    set((state) => ({
                        hotspots: [...state.hotspots, hotspot],
                        isDirty: true,
                    }));

                    // Sync with data manager if it's a link hotspot
                    if (hotspot.type === 'link' && hotspot.targetNodeId) {
                        useDataManager.getState().addLink(hotspot.panoramaId, {
                            nodeId: hotspot.targetNodeId,
                            position: hotspot.position
                        });
                    }

                    console.log('Hotspot added:', hotspot);
                },

                updateHotspot: (id: string, updates: any) => {
                    set((state) => ({
                        hotspots: state.hotspots.map((h) =>
                            h.id === id ? { ...h, ...updates } : h
                        ),
                        isDirty: true,
                    }));

                    // Sync with data manager if it's a link hotspot
                    const hotspot = get().hotspots.find(h => h.id === id);
                    if (hotspot && hotspot.type === 'link' && hotspot.targetNodeId && updates.position) {
                        useDataManager.getState().updateLink(hotspot.panoramaId, hotspot.targetNodeId, {
                            position: updates.position
                        });
                    }

                    console.log('Hotspot updated:', id, updates);
                },

                deleteHotspot: (id: string) => {
                    const hotspot = get().hotspots.find(h => h.id === id);

                    set((state) => ({
                        hotspots: state.hotspots.filter((h) => h.id !== id),
                        isDirty: true,
                    }));

                    // Sync with data manager if it's a link hotspot
                    if (hotspot && hotspot.type === 'link' && hotspot.targetNodeId) {
                        useDataManager.getState().deleteLink(hotspot.panoramaId, hotspot.targetNodeId);
                    }

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

                // Additional data for backward compatibility
                panoramas: getMockPanoramas(),
                categories: mockCategories,
                minimapData: getMockMinimapData(),
                navigationMenu: getMockNavigationMenu(),

                // Additional actions for backward compatibility
                setEditMode: (mode: string) => set({}),
                setSelectedPanorama: (id: string | null) => {
                    const panoramaId = id || 'kawasan-1';
                    set({ currentPanoramaId: panoramaId });
                    useDataManager.getState().setCurrentPanorama(panoramaId);
                },
                setSelectedCategory: (id: string | null) => set({}),
                togglePreviewMode: () => set({}),
                toggleFullscreen: () => set({}),
                addPanorama: (panorama: any) => {
                    useDataManager.getState().addPanorama(panorama);
                },
                updatePanorama: (id: string, updates: any) => {
                    useDataManager.getState().updatePanorama(id, updates);
                },
                deletePanorama: (id: string) => {
                    useDataManager.getState().deletePanorama(id);
                },
                duplicatePanorama: (id: string) => set({}),
                addCategory: (category: any) => set({}),
                updateCategory: (id: string, updates: any) => set({}),
                deleteCategory: (id: string) => set({}),
                moveHotspot: (id: string, position: any) => set({}),
                updateMinimapData: (data: any) => set({}),
                addMinimapMarker: (marker: any) => set({}),
                updateMinimapMarker: (id: string, updates: any) => set({}),
                deleteMinimapMarker: (id: string) => set({}),
                moveMinimapMarker: (id: string, position: any) => set({}),
                addNavigationCategory: (category: any) => set({}),
                updateNavigationCategory: (id: string, updates: any) => set({}),
                deleteNavigationCategory: (id: string) => set({}),
                addNavigationItem: (categoryId: string, item: any) => set({}),
                updateNavigationItem: (categoryId: string, itemId: string, updates: any) => set({}),
                deleteNavigationItem: (categoryId: string, itemId: string) => set({}),
                reorderNavigationItems: (categoryId: string, itemIds: string[]) => set({}),
                updateNavigationMenu: (updates: any) => set({}),
                uploadPanorama: async (file: File) => Promise.resolve(''),
                uploadMinimap: async (file: File) => Promise.resolve(''),
                exportProject: () => {
                    return useDataManager.getState().exportData();
                },
                importProject: (data: any) => {
                    useDataManager.getState().importData(data);
                },
                saveProject: () => {
                    useDataManager.getState().saveToStorage();
                    set({ isDirty: false });
                },
                loadProject: () => {
                    useDataManager.getState().loadFromStorage();
                },
                initializeStore: () => set({}),
            }),
            {
                name: 'editor-store',
                partialize: (state) => ({
                    currentPanoramaId: state.currentPanoramaId,
                    hotspots: state.hotspots,
                    isDirty: state.isDirty,
                    isEditing: state.isEditing,
                    selectedHotspotId: state.selectedHotspotId,
                }),
            }
        )
    )
);
