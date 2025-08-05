import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
export interface PanoramaData {
    id: string;
    panorama: string;
    thumbnail: string;
    name: string;
    caption: string;
    markers?: PanoramaMarker[];
    links?: PanoramaLink[];
}

export interface PanoramaMarker {
    id: string;
    nodeId: string;
    position: {
        textureX: number;
        textureY: number;
    } | {
        yaw: number;
        pitch: number;
    };
    tooltip?: string;
    content?: string;
}

export interface PanoramaLink {
    nodeId: string;
    position?: {
        textureX: number;
        textureY: number;
    } | {
        yaw: number;
        pitch: number;
    };
}

export interface CachedImage {
    url: string;
    data: string; // base64
    timestamp: number;
    size: number;
}

export interface DataManagerState {
    // Data
    panoramas: PanoramaData[];
    currentPanoramaId: string;
    imageCache: Map<string, CachedImage>;

    // Cache settings
    cacheExpiry: number; // 24 hours in milliseconds
    maxCacheSize: number; // 50MB in bytes

    // Actions
    setCurrentPanorama: (id: string) => void;
    updatePanorama: (id: string, updates: Partial<PanoramaData>) => void;
    addPanorama: (panorama: PanoramaData) => void;
    deletePanorama: (id: string) => void;

    // Marker/Link management
    addMarker: (panoramaId: string, marker: PanoramaMarker) => void;
    updateMarker: (panoramaId: string, markerId: string, updates: Partial<PanoramaMarker>) => void;
    deleteMarker: (panoramaId: string, markerId: string) => void;

    addLink: (panoramaId: string, link: PanoramaLink) => void;
    updateLink: (panoramaId: string, targetNodeId: string, updates: Partial<PanoramaLink>) => void;
    deleteLink: (panoramaId: string, targetNodeId: string) => void;

    // Image cache management
    cacheImage: (url: string, data: string) => void;
    getCachedImage: (url: string) => CachedImage | null;
    clearExpiredCache: () => void;
    clearAllCache: () => void;

    // Data persistence
    saveToStorage: () => void;
    loadFromStorage: () => void;
    exportData: () => string;
    importData: (jsonData: string) => boolean;
}

// Default panorama data
const defaultPanoramas: PanoramaData[] = [
    {
        id: "kawasan-1",
        panorama: "/panoramas/kawasan/Panorama 1.png",
        thumbnail: "/panoramas/kawasan/Panorama 1.png",
        name: "Kawasan - Panorama 1",
        caption: "Kawasan - Panorama 1",
        markers: [
            {
                id: "lighthouse-marker",
                nodeId: "kawasan-2",
                position: { textureX: 2500, textureY: 1200 }
            }
        ],
        links: [
            { nodeId: "kawasan-2", position: { textureX: 1500, textureY: 780 } },
            { nodeId: "kawasan-3", position: { textureX: 3000, textureY: 780 } }
        ]
    },
    {
        id: "kawasan-2",
        panorama: "/panoramas/kawasan/Panorama 2.png",
        thumbnail: "/panoramas/kawasan/Panorama 2.png",
        name: "Kawasan - Panorama 2",
        caption: "Kawasan - Panorama 2",
        markers: [
            {
                id: "building-marker",
                nodeId: "kawasan-3",
                position: { textureX: 1500, textureY: 800 }
            }
        ],
        links: [
            { nodeId: "kawasan-3", position: { textureX: 1200, textureY: 600 } },
            { nodeId: "kawasan-1", position: { textureX: 2800, textureY: 900 } },
            { nodeId: "type35-1", position: { textureX: 800, textureY: 1200 } }
        ]
    },
    {
        id: "kawasan-3",
        panorama: "/panoramas/kawasan/Panorama 3.png",
        thumbnail: "/panoramas/kawasan/Panorama 3.png",
        name: "Kawasan - Panorama 3",
        caption: "Kawasan - Panorama 3",
        markers: [
            {
                id: "park-marker",
                nodeId: "kawasan-2",
                position: { textureX: 2000, textureY: 1000 }
            }
        ],
        links: [
            { nodeId: "kawasan-2", position: { textureX: 1600, textureY: 800 } }
        ]
    },
    {
        id: "type35-1",
        panorama: "/panoramas/type_35/vr interior 35 1.png",
        thumbnail: "/panoramas/type_35/vr interior 35 1.png",
        name: "Type 35 - Interior 1",
        caption: "Type 35 - Interior VR 1",
        markers: [
            {
                id: "furniture-marker",
                nodeId: "type35-2",
                position: { textureX: 1500, textureY: 780 }
            }
        ],
        links: [
            { nodeId: "type35-2", position: { textureX: 1500, textureY: 780 } },
            { nodeId: "type35-3", position: { textureX: 1000, textureY: 980 } }
        ]
    },
    {
        id: "type35-2",
        panorama: "/panoramas/type_35/vr interior 35 2.png",
        thumbnail: "/panoramas/type_35/vr interior 35 2.png",
        name: "Type 35 - Interior 2",
        caption: "Type 35 - Interior VR 2",
        markers: [
            {
                id: "window-marker",
                nodeId: "type35-3",
                position: { textureX: 1200, textureY: 600 }
            }
        ],
        links: [
            { nodeId: "type35-3", position: { textureX: 1200, textureY: 600 } },
            { nodeId: "type35-1", position: { textureX: 2800, textureY: 900 } },
            { nodeId: "type35-4", position: { textureX: 800, textureY: 1200 } }
        ]
    },
    {
        id: "type35-3",
        panorama: "/panoramas/type_35/vr interior 35 3.png",
        thumbnail: "/panoramas/type_35/vr interior 35 3.png",
        name: "Type 35 - Interior 3",
        caption: "Type 35 - Interior VR 3",
        markers: [
            {
                id: "lighting-marker",
                nodeId: "type35-4",
                position: { textureX: 1600, textureY: 800 }
            }
        ],
        links: [
            { nodeId: "type35-4", position: { textureX: 1600, textureY: 800 } },
            { nodeId: "type35-2", position: { textureX: 2400, textureY: 700 } },
            { nodeId: "type35-5", position: { textureX: 400, textureY: 1000 } }
        ]
    },
    {
        id: "type35-4",
        panorama: "/panoramas/type_35/vr interior 35 4.png",
        thumbnail: "/panoramas/type_35/vr interior 35 4.png",
        name: "Type 35 - Interior 4",
        caption: "Type 35 - Interior VR 4",
        markers: [
            {
                id: "storage-marker",
                nodeId: "type35-5",
                position: { textureX: 1800, textureY: 600 }
            }
        ],
        links: [
            { nodeId: "type35-5", position: { textureX: 1800, textureY: 600 } },
            { nodeId: "type35-3", position: { textureX: 2200, textureY: 900 } }
        ]
    },
    {
        id: "type35-5",
        panorama: "/panoramas/type_35/vr interior 35 5.png",
        thumbnail: "/panoramas/type_35/vr interior 35 5.png",
        name: "Type 35 - Interior 5",
        caption: "Type 35 - Interior VR 5",
        markers: [
            {
                id: "entrance-marker",
                nodeId: "type35-4",
                position: { textureX: 2000, textureY: 800 }
            }
        ],
        links: [
            { nodeId: "type35-4", position: { textureX: 2000, textureY: 800 } }
        ]
    },
    {
        id: "type45-bedroom1",
        panorama: "/panoramas/type_45/BEDROOM 1.png",
        thumbnail: "/panoramas/type_45/BEDROOM 1.png",
        name: "Type 45 - Bedroom 1",
        caption: "Type 45 - Bedroom 1",
        markers: [
            {
                id: "bed-marker",
                nodeId: "type45-bedroom2",
                position: { textureX: 1400, textureY: 700 }
            }
        ],
        links: [
            { nodeId: "type45-bedroom2", position: { textureX: 1400, textureY: 700 } },
            { nodeId: "type45-livingroom", position: { textureX: 2600, textureY: 800 } }
        ]
    },
    {
        id: "type45-bedroom2",
        panorama: "/panoramas/type_45/BEDROOM 2.png",
        thumbnail: "/panoramas/type_45/BEDROOM 2.png",
        name: "Type 45 - Bedroom 2",
        caption: "Type 45 - Bedroom 2",
        markers: [
            {
                id: "closet-marker",
                nodeId: "type45-livingroom",
                position: { textureX: 1200, textureY: 600 }
            }
        ],
        links: [
            { nodeId: "type45-livingroom", position: { textureX: 1200, textureY: 600 } },
            { nodeId: "type45-bedroom1", position: { textureX: 2800, textureY: 900 } },
            { nodeId: "type45-masterbed", position: { textureX: 800, textureY: 1200 } }
        ]
    },
    {
        id: "type45-livingroom",
        panorama: "/panoramas/type_45/LIVING ROOM.png",
        thumbnail: "/panoramas/type_45/LIVING ROOM.png",
        name: "Type 45 - Living Room",
        caption: "Type 45 - Living Room",
        markers: [
            {
                id: "sofa-marker",
                nodeId: "type45-masterbed",
                position: { textureX: 1600, textureY: 800 }
            }
        ],
        links: [
            { nodeId: "type45-masterbed", position: { textureX: 1600, textureY: 800 } },
            { nodeId: "type45-bedroom2", position: { textureX: 2400, textureY: 700 } }
        ]
    },
    {
        id: "type45-masterbed",
        panorama: "/panoramas/type_45/MASTER BED.png",
        thumbnail: "/panoramas/type_45/MASTER BED.png",
        name: "Type 45 - Master Bed",
        caption: "Type 45 - Master Bed",
        markers: [
            {
                id: "master-bed-marker",
                nodeId: "type45-livingroom",
                position: { textureX: 1800, textureY: 600 }
            }
        ],
        links: [
            { nodeId: "type45-livingroom", position: { textureX: 1800, textureY: 600 } }
        ]
    },
    {
        id: "type60-dining",
        panorama: "/panoramas/type_60/1st Floor DINING ROOM.png",
        thumbnail: "/panoramas/type_60/1st Floor DINING ROOM.png",
        name: "Type 60 - Dining Room",
        caption: "Type 60 - 1st Floor Dining Room",
        markers: [
            {
                id: "dining-table-marker",
                nodeId: "type60-livingroom",
                position: { textureX: 1500, textureY: 780 }
            }
        ],
        links: [
            { nodeId: "type60-livingroom", position: { textureX: 1500, textureY: 780 } }
        ]
    },
    {
        id: "type60-livingroom",
        panorama: "/panoramas/type_60/1st Floor LIVINGROOM.png",
        thumbnail: "/panoramas/type_60/1st Floor LIVINGROOM.png",
        name: "Type 60 - Living Room",
        caption: "Type 60 - 1st Floor Living Room",
        markers: [
            {
                id: "living-area-marker",
                nodeId: "type60-bedroom1",
                position: { textureX: 1200, textureY: 600 }
            }
        ],
        links: [
            { nodeId: "type60-bedroom1", position: { textureX: 1200, textureY: 600 } },
            { nodeId: "type60-dining", position: { textureX: 2800, textureY: 900 } }
        ]
    },
    {
        id: "type60-bedroom1",
        panorama: "/panoramas/type_60/2nd Floor Bedroom 1.png",
        thumbnail: "/panoramas/type_60/2nd Floor Bedroom 1.png",
        name: "Type 60 - Bedroom 1",
        caption: "Type 60 - 2nd Floor Bedroom 1",
        markers: [
            {
                id: "bedroom1-marker",
                nodeId: "type60-bedroom2",
                position: { textureX: 1600, textureY: 800 }
            }
        ],
        links: [
            { nodeId: "type60-bedroom2", position: { textureX: 1600, textureY: 800 } },
            { nodeId: "type60-livingroom", position: { textureX: 2400, textureY: 700 } }
        ]
    },
    {
        id: "type60-bedroom2",
        panorama: "/panoramas/type_60/2nd Floor Bedroom 2.png",
        thumbnail: "/panoramas/type_60/2nd Floor Bedroom 2.png",
        name: "Type 60 - Bedroom 2",
        caption: "Type 60 - 2nd Floor Bedroom 2",
        markers: [
            {
                id: "bedroom2-marker",
                nodeId: "type60-masterbed",
                position: { textureX: 1800, textureY: 600 }
            }
        ],
        links: [
            { nodeId: "type60-masterbed", position: { textureX: 1800, textureY: 600 } },
            { nodeId: "type60-bedroom1", position: { textureX: 2200, textureY: 900 } }
        ]
    },
    {
        id: "type60-masterbed",
        panorama: "/panoramas/type_60/2nd Floor Masterbed.png",
        thumbnail: "/panoramas/type_60/2nd Floor Masterbed.png",
        name: "Type 60 - Master Bed",
        caption: "Type 60 - 2nd Floor Master Bed",
        markers: [
            {
                id: "master-bedroom-marker",
                nodeId: "type60-wic",
                position: { textureX: 2000, textureY: 800 }
            }
        ],
        links: [
            { nodeId: "type60-wic", position: { textureX: 2000, textureY: 800 } },
            { nodeId: "type60-bedroom2", position: { textureX: 1200, textureY: 1000 } }
        ]
    },
    {
        id: "type60-wic",
        panorama: "/panoramas/type_60/WIC.png",
        thumbnail: "/panoramas/type_60/WIC.png",
        name: "Type 60 - WIC",
        caption: "Type 60 - Walk In Closet",
        markers: [
            {
                id: "closet-marker",
                nodeId: "type60-masterbed",
                position: { textureX: 1800, textureY: 600 }
            }
        ],
        links: [
            { nodeId: "type60-masterbed", position: { textureX: 1800, textureY: 600 } }
        ]
    }
];

// Helper functions
const convertMapToObject = (map: Map<string, CachedImage>) => {
    const obj: Record<string, CachedImage> = {};
    map.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
};

const convertObjectToMap = (obj: Record<string, CachedImage>): Map<string, CachedImage> => {
    const map = new Map<string, CachedImage>();
    Object.entries(obj).forEach(([key, value]) => {
        map.set(key, value);
    });
    return map;
};

// Create the data manager store
export const useDataManager = create<DataManagerState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                panoramas: defaultPanoramas,
                currentPanoramaId: 'kawasan-1',
                imageCache: new Map<string, CachedImage>(),
                cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
                maxCacheSize: 50 * 1024 * 1024, // 50MB

                // Panorama management
                setCurrentPanorama: (id: string) => {
                    const panorama = get().panoramas.find(p => p.id === id);
                    if (panorama) {
                        set({ currentPanoramaId: id });
                        console.log('Current panorama set to:', id);
                    } else {
                        console.warn('Panorama not found:', id);
                    }
                },

                updatePanorama: (id: string, updates: Partial<PanoramaData>) => {
                    set((state) => ({
                        panoramas: state.panoramas.map(p =>
                            p.id === id ? { ...p, ...updates } : p
                        )
                    }));
                    console.log('Panorama updated:', id, updates);
                },

                addPanorama: (panorama: PanoramaData) => {
                    set((state) => ({
                        panoramas: [...state.panoramas, panorama]
                    }));
                    console.log('Panorama added:', panorama.id);
                },

                deletePanorama: (id: string) => {
                    set((state) => ({
                        panoramas: state.panoramas.filter(p => p.id !== id)
                    }));
                    console.log('Panorama deleted:', id);
                },

                // Marker management
                addMarker: (panoramaId: string, marker: PanoramaMarker) => {
                    set((state) => ({
                        panoramas: state.panoramas.map(p => {
                            if (p.id === panoramaId) {
                                return {
                                    ...p,
                                    markers: [...(p.markers || []), marker]
                                };
                            }
                            return p;
                        })
                    }));
                    console.log('Marker added to panorama:', panoramaId, marker.id);
                },

                updateMarker: (panoramaId: string, markerId: string, updates: Partial<PanoramaMarker>) => {
                    set((state) => ({
                        panoramas: state.panoramas.map(p => {
                            if (p.id === panoramaId) {
                                return {
                                    ...p,
                                    markers: p.markers?.map(m =>
                                        m.id === markerId ? { ...m, ...updates } : m
                                    ) || []
                                };
                            }
                            return p;
                        })
                    }));
                    console.log('Marker updated:', panoramaId, markerId, updates);
                },

                deleteMarker: (panoramaId: string, markerId: string) => {
                    set((state) => ({
                        panoramas: state.panoramas.map(p => {
                            if (p.id === panoramaId) {
                                return {
                                    ...p,
                                    markers: p.markers?.filter(m => m.id !== markerId) || []
                                };
                            }
                            return p;
                        })
                    }));
                    console.log('Marker deleted:', panoramaId, markerId);
                },

                // Link management
                addLink: (panoramaId: string, link: PanoramaLink) => {
                    set((state) => ({
                        panoramas: state.panoramas.map(p => {
                            if (p.id === panoramaId) {
                                return {
                                    ...p,
                                    links: [...(p.links || []), link]
                                };
                            }
                            return p;
                        })
                    }));
                    console.log('Link added to panorama:', panoramaId, link.nodeId);
                },

                updateLink: (panoramaId: string, targetNodeId: string, updates: Partial<PanoramaLink>) => {
                    set((state) => ({
                        panoramas: state.panoramas.map(p => {
                            if (p.id === panoramaId) {
                                return {
                                    ...p,
                                    links: p.links?.map(l =>
                                        l.nodeId === targetNodeId ? { ...l, ...updates } : l
                                    ) || []
                                };
                            }
                            return p;
                        })
                    }));
                    console.log('Link updated:', panoramaId, targetNodeId, updates);
                },

                deleteLink: (panoramaId: string, targetNodeId: string) => {
                    set((state) => ({
                        panoramas: state.panoramas.map(p => {
                            if (p.id === panoramaId) {
                                return {
                                    ...p,
                                    links: p.links?.filter(l => l.nodeId !== targetNodeId) || []
                                };
                            }
                            return p;
                        })
                    }));
                    console.log('Link deleted:', panoramaId, targetNodeId);
                },

                // Image cache management
                cacheImage: (url: string, data: string) => {
                    const state = get();
                    const now = Date.now();
                    const size = new Blob([data]).size;

                    // Check if adding this image would exceed cache size
                    let currentSize = 0;
                    state.imageCache.forEach(cached => {
                        currentSize += cached.size;
                    });

                    if (currentSize + size > state.maxCacheSize) {
                        // Remove oldest entries until we have space
                        const sortedEntries = Array.from(state.imageCache.entries())
                            .sort((a, b) => a[1].timestamp - b[1].timestamp);

                        for (const [key, cached] of sortedEntries) {
                            if (currentSize + size <= state.maxCacheSize) break;
                            state.imageCache.delete(key);
                            currentSize -= cached.size;
                        }
                    }

                    const cachedImage: CachedImage = {
                        url,
                        data,
                        timestamp: now,
                        size
                    };

                    set((state) => ({
                        imageCache: new Map(state.imageCache).set(url, cachedImage)
                    }));

                    console.log('Image cached:', url, 'Size:', size);
                },

                getCachedImage: (url: string) => {
                    const state = get();
                    const cached = state.imageCache.get(url);

                    if (!cached) return null;

                    // Check if cache is expired
                    const now = Date.now();
                    if (now - cached.timestamp > state.cacheExpiry) {
                        state.imageCache.delete(url);
                        console.log('Cached image expired:', url);
                        return null;
                    }

                    return cached;
                },

                clearExpiredCache: () => {
                    const state = get();
                    const now = Date.now();
                    let clearedCount = 0;

                    state.imageCache.forEach((cached, url) => {
                        if (now - cached.timestamp > state.cacheExpiry) {
                            state.imageCache.delete(url);
                            clearedCount++;
                        }
                    });

                    if (clearedCount > 0) {
                        console.log(`Cleared ${clearedCount} expired cache entries`);
                    }
                },

                clearAllCache: () => {
                    set({ imageCache: new Map() });
                    console.log('All image cache cleared');
                },

                // Data persistence
                saveToStorage: () => {
                    const state = get();
                    try {
                        localStorage.setItem('panorama-data', JSON.stringify(state.panoramas));
                        console.log('Data saved to localStorage');
                    } catch (error) {
                        console.error('Error saving to localStorage:', error);
                    }
                },

                loadFromStorage: () => {
                    try {
                        const stored = localStorage.getItem('panorama-data');
                        if (stored) {
                            const panoramas = JSON.parse(stored);
                            set({ panoramas });
                            console.log('Data loaded from localStorage');
                        }
                    } catch (error) {
                        console.error('Error loading from localStorage:', error);
                    }
                },

                exportData: () => {
                    const state = get();
                    return JSON.stringify(state.panoramas, null, 2);
                },

                importData: (jsonData: string) => {
                    try {
                        const panoramas = JSON.parse(jsonData);
                        if (Array.isArray(panoramas)) {
                            set({ panoramas });
                            console.log('Data imported successfully');
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('Error importing data:', error);
                        return false;
                    }
                }
            }),
            {
                name: 'data-manager',
                partialize: (state) => ({
                    panoramas: state.panoramas,
                    currentPanoramaId: state.currentPanoramaId,
                    imageCache: convertMapToObject(state.imageCache)
                }),
                onRehydrateStorage: () => (state) => {
                    if (state) {
                        // Convert image cache back to Map
                        if (state.imageCache && typeof state.imageCache === 'object') {
                            state.imageCache = convertObjectToMap(state.imageCache as any);
                        }

                        // Clear expired cache on rehydration
                        setTimeout(() => {
                            state.clearExpiredCache();
                        }, 1000);
                    }
                }
            }
        )
    )
);

// Auto-cleanup expired cache every hour
setInterval(() => {
    const state = useDataManager.getState();
    state.clearExpiredCache();
}, 60 * 60 * 1000); // 1 hour

// Export helper functions
export const getPanoramaById = (id: string): PanoramaData | undefined => {
    return useDataManager.getState().panoramas.find(p => p.id === id);
};

export const getAllPanoramaIds = (): string[] => {
    return useDataManager.getState().panoramas.map(p => p.id);
};

export const getPanoramaNames = (): { id: string; name: string }[] => {
    return useDataManager.getState().panoramas.map(p => ({ id: p.id, name: p.name }));
};

export const getLinksForPanorama = (panoramaId: string): PanoramaLink[] => {
    const panorama = getPanoramaById(panoramaId);
    return panorama?.links || [];
};

export const arePanoramasLinked = (sourceId: string, targetId: string): boolean => {
    const panorama = getPanoramaById(sourceId);
    return panorama?.links?.some(link => link.nodeId === targetId) || false;
};

// Image loading with cache
export const loadImageWithCache = async (url: string): Promise<string> => {
    const state = useDataManager.getState();

    // Check cache first
    const cached = state.getCachedImage(url);
    if (cached) {
        console.log('Image loaded from cache:', url);
        return cached.data;
    }

    // Load from network
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = () => {
                const data = reader.result as string;
                state.cacheImage(url, data);
                resolve(data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error loading image:', url, error);
        throw error;
    }
};
