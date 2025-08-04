import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { EditorState, Hotspot, ProjectData } from '../types/editor';
import { PanoramaNode, Category, MinimapData, MinimapMarker } from '../types/panorama';
import panoramaData from '../data/panorama-data.json';

// Mock data untuk development
const mockCategories: Category[] = [
    { id: 'drone', name: 'Drone View', icon: 'drone', order: 1, color: '#3b82f6' },
    { id: 'entrance', name: 'Main Gate', icon: 'gate', order: 2, color: '#10b981' },
    { id: 'unit-type', name: 'Unit Types', icon: 'building', order: 3, color: '#8b5cf6' },
];

const mockMinimapData: MinimapData = {
    backgroundImage: '/minimap/sideplan.jpeg',
    markers: panoramaData.map((node, index) => ({
        id: node.id,
        nodeId: node.id,
        x: 20 + (index * 15) % 60,
        y: 20 + Math.floor(index / 3) * 20,
        label: node.name,
    })),
};

const mockHotspots: Hotspot[] = [
    {
        id: 'hotspot-1',
        panoramaId: 'kawasan-1',
        position: { yaw: 0, pitch: 0 },
        type: 'info',
        title: 'Welcome Point',
        content: 'Welcome to our virtual tour!',
        isVisible: true,
    },
];

export const useEditorStore = create<EditorState>()(
    devtools(
        persist(
            (set, get) => ({
                // State
                editMode: 'panorama',
                selectedPanorama: null,
                selectedCategory: null,
                selectedHotspot: null,
                isDirty: false,
                isPreviewMode: false,
                isFullscreen: false,

                // Data
                panoramas: panoramaData,
                categories: mockCategories,
                hotspots: mockHotspots,
                minimapData: mockMinimapData,

                // Actions
                setEditMode: (mode) => set({ editMode: mode }),
                setSelectedPanorama: (id) => set({ selectedPanorama: id }),
                setSelectedCategory: (id) => set({ selectedCategory: id }),
                setSelectedHotspot: (id) => set({ selectedHotspot: id }),
                setDirty: (dirty) => set({ isDirty: dirty }),
                togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
                toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

                // Panorama CRUD
                addPanorama: (panorama) => {
                    set((state) => ({
                        panoramas: [...state.panoramas, panorama],
                        isDirty: true,
                    }));
                },

                updatePanorama: (id, updates) => {
                    set((state) => ({
                        panoramas: state.panoramas.map((p) =>
                            p.id === id ? { ...p, ...updates } : p
                        ),
                        isDirty: true,
                    }));
                },

                deletePanorama: (id) => {
                    set((state) => ({
                        panoramas: state.panoramas.filter((p) => p.id !== id),
                        hotspots: state.hotspots.filter((h) => h.panoramaId !== id),
                        isDirty: true,
                    }));
                },

                duplicatePanorama: (id) => {
                    const panorama = get().panoramas.find((p) => p.id === id);
                    if (panorama) {
                        const duplicated = {
                            ...panorama,
                            id: `${panorama.id}-copy`,
                            name: `${panorama.name} (Copy)`,
                        };
                        set((state) => ({
                            panoramas: [...state.panoramas, duplicated],
                            isDirty: true,
                        }));
                    }
                },

                // Category CRUD
                addCategory: (category) => {
                    set((state) => ({
                        categories: [...state.categories, category],
                        isDirty: true,
                    }));
                },

                updateCategory: (id, updates) => {
                    set((state) => ({
                        categories: state.categories.map((c) =>
                            c.id === id ? { ...c, ...updates } : c
                        ),
                        isDirty: true,
                    }));
                },

                deleteCategory: (id) => {
                    set((state) => ({
                        categories: state.categories.filter((c) => c.id !== id),
                        isDirty: true,
                    }));
                },

                // Hotspot CRUD
                addHotspot: (hotspot) => {
                    set((state) => ({
                        hotspots: [...state.hotspots, hotspot],
                        isDirty: true,
                    }));
                },

                updateHotspot: (id, updates) => {
                    set((state) => ({
                        hotspots: state.hotspots.map((h) =>
                            h.id === id ? { ...h, ...updates } : h
                        ),
                        isDirty: true,
                    }));
                },

                deleteHotspot: (id) => {
                    set((state) => ({
                        hotspots: state.hotspots.filter((h) => h.id !== id),
                        isDirty: true,
                    }));
                },

                moveHotspot: (id, position) => {
                    set((state) => ({
                        hotspots: state.hotspots.map((h) =>
                            h.id === id ? { ...h, position } : h
                        ),
                        isDirty: true,
                    }));
                },

                // Minimap CRUD
                updateMinimapData: (data) => {
                    set((state) => ({
                        minimapData: { ...state.minimapData, ...data },
                        isDirty: true,
                    }));
                },

                addMinimapMarker: (marker) => {
                    set((state) => ({
                        minimapData: {
                            ...state.minimapData,
                            markers: [...state.minimapData.markers, marker],
                        },
                        isDirty: true,
                    }));
                },

                updateMinimapMarker: (id, updates) => {
                    set((state) => ({
                        minimapData: {
                            ...state.minimapData,
                            markers: state.minimapData.markers.map((m) =>
                                m.id === id ? { ...m, ...updates } : m
                            ),
                        },
                        isDirty: true,
                    }));
                },

                deleteMinimapMarker: (id) => {
                    set((state) => ({
                        minimapData: {
                            ...state.minimapData,
                            markers: state.minimapData.markers.filter((m) => m.id !== id),
                        },
                        isDirty: true,
                    }));
                },

                moveMinimapMarker: (id, position) => {
                    set((state) => ({
                        minimapData: {
                            ...state.minimapData,
                            markers: state.minimapData.markers.map((m) =>
                                m.id === id ? { ...m, ...position } : m
                            ),
                        },
                        isDirty: true,
                    }));
                },

                // File operations
                uploadPanorama: async (file) => {
                    // Simulate file upload
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            const url = URL.createObjectURL(file);
                            resolve(url);
                        }, 1000);
                    });
                },

                uploadMinimap: async (file) => {
                    // Simulate file upload
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            const url = URL.createObjectURL(file);
                            resolve(url);
                        }, 1000);
                    });
                },

                exportProject: () => {
                    const state = get();
                    const projectData: ProjectData = {
                        panoramas: state.panoramas,
                        categories: state.categories,
                        hotspots: state.hotspots,
                        minimapData: state.minimapData,
                        metadata: {
                            name: 'VR Panorama Project',
                            version: '1.0.0',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                    };

                    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
                        type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'panorama-project.json';
                    a.click();
                    URL.revokeObjectURL(url);
                },

                importProject: (data) => {
                    set({
                        panoramas: data.panoramas,
                        categories: data.categories,
                        hotspots: data.hotspots,
                        minimapData: data.minimapData,
                        isDirty: false,
                    });
                },

                saveProject: () => {
                    const state = get();
                    localStorage.setItem('panorama-project', JSON.stringify({
                        panoramas: state.panoramas,
                        categories: state.categories,
                        hotspots: state.hotspots,
                        minimapData: state.minimapData,
                    }));
                    set({ isDirty: false });
                },

                loadProject: () => {
                    const saved = localStorage.getItem('panorama-project');
                    if (saved) {
                        const data = JSON.parse(saved);
                        set({
                            panoramas: data.panoramas,
                            categories: data.categories,
                            hotspots: data.hotspots,
                            minimapData: data.minimapData,
                            isDirty: false,
                        });
                    }
                },
            }),
            {
                name: 'editor-store',
                partialize: (state) => ({
                    panoramas: state.panoramas,
                    categories: state.categories,
                    hotspots: state.hotspots,
                    minimapData: state.minimapData,
                }),
            }
        )
    )
);
