import panoramaData from '../data/panorama-data.json';

// Types
export interface PanoramaData {
    id: string;
    panorama: string;
    thumbnail: string;
    name: string;
    caption: string;
    markers?: PanoramaMarker[];
    hotspots?: HotspotData[];
}

// Data source type
export type DataSource = 'json' | 'supabase';

export interface PanoramaMarker {
    nodeId: string;
    position: {
        textureX: number;
        textureY: number;
    } | {
        yaw: number;
        pitch: number;
    };
}

export interface HotspotData {
    id: string;
    panoramaId: string;
    position: {
        yaw: number;
        pitch: number;
    };
    type: 'info' | 'link' | 'custom' | string;
    title: string;
    content: string;
    isVisible: boolean;
    style?: {
        backgroundColor?: string;
        size?: number;
        icon?: string;
    };
    targetNodeId?: string;
}

export interface DataManagerState {
    // Data
    panoramas: PanoramaData[];
    currentPanoramaId: string;

    // Actions
    setCurrentPanorama: (id: string) => void;
    getCurrentPanorama: () => PanoramaData | undefined;
    getAllPanoramas: () => PanoramaData[];
    getPanoramaById: (id: string) => PanoramaData | undefined;
}

// Simple data manager tanpa memory management
class SimpleDataManager {
    private panoramas: PanoramaData[] = panoramaData;
    private currentPanoramaId: string = 'kawasan-1';

    constructor() {
        // Load from localStorage if available
        this.loadFromLocalStorage();
    }

    // Set current panorama
    setCurrentPanorama(id: string): void {
        // Skip validation for empty ID (will be set when data loads)
        if (!id) {
            console.log('Skipping panorama set for empty ID');
            return;
        }
        
        const panorama = this.panoramas.find(p => p.id === id);
        if (panorama) {
            this.currentPanoramaId = id;
            console.log('Current panorama set to:', id);
        } else {
            console.log('Panorama not found in local data:', id, '(this is expected when using database)');
        }
    }

    // Get current panorama
    getCurrentPanorama(): PanoramaData | undefined {
        return this.panoramas.find(p => p.id === this.currentPanoramaId);
    }

    // Get all panoramas
    getAllPanoramas(): PanoramaData[] {
        return this.panoramas;
    }

    // Get panorama by ID
    getPanoramaById(id: string): PanoramaData | undefined {
        return this.panoramas.find(p => p.id === id);
    }

    // Get current panorama ID
    getCurrentPanoramaId(): string {
        return this.currentPanoramaId;
    }

    // Get panorama names for navigation
    getPanoramaNames(): { id: string; name: string }[] {
        return this.panoramas.map(p => ({ id: p.id, name: p.name }));
    }

    // Get markers for panorama
    getMarkersForPanorama(panoramaId: string): PanoramaMarker[] {
        const panorama = this.getPanoramaById(panoramaId);
        return panorama?.markers || [];
    }

    // Get hotspots for panorama
    getHotspotsForPanorama(panoramaId: string): HotspotData[] {
        const panorama = this.getPanoramaById(panoramaId);
        return panorama?.hotspots || [];
    }

    // Add hotspot to panorama
    addHotspotToPanorama(panoramaId: string, hotspot: HotspotData): void {
        const panorama = this.getPanoramaById(panoramaId);
        if (panorama) {
            if (!panorama.hotspots) {
                panorama.hotspots = [];
            }
            panorama.hotspots.push(hotspot);
            console.log('Hotspot added to panorama:', panoramaId, hotspot.id);
        }
    }

    // Update hotspot in panorama
    updateHotspotInPanorama(panoramaId: string, hotspotId: string, updates: Partial<HotspotData>): void {
        const panorama = this.getPanoramaById(panoramaId);
        if (panorama && panorama.hotspots) {
            const hotspotIndex = panorama.hotspots.findIndex(h => h.id === hotspotId);
            if (hotspotIndex !== -1) {
                panorama.hotspots[hotspotIndex] = { ...panorama.hotspots[hotspotIndex], ...updates };
                console.log('Hotspot updated in panorama:', panoramaId, hotspotId);
            }
        }
    }

    // Delete hotspot from panorama
    deleteHotspotFromPanorama(panoramaId: string, hotspotId: string): void {
        const panorama = this.getPanoramaById(panoramaId);
        if (panorama && panorama.hotspots) {
            panorama.hotspots = panorama.hotspots.filter(h => h.id !== hotspotId);
            console.log('Hotspot deleted from panorama:', panoramaId, hotspotId);
        }
    }

    // Clear all hotspots from panorama
    clearHotspotsFromPanorama(panoramaId: string): void {
        const panorama = this.getPanoramaById(panoramaId);
                    if (panorama) {
            panorama.hotspots = [];
            console.log('All hotspots cleared from panorama:', panoramaId);
        }
    }

    // Save data to panorama-data.json
    async saveToFile(): Promise<void> {
        try {
            // Convert data to JSON string with proper formatting
            const jsonData = JSON.stringify(this.panoramas, null, 2);
            
            // Save to localStorage for real-time access
            localStorage.setItem('panorama-data-backup', jsonData);
            
            // Create a blob with the JSON data
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'panorama-data.json';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            console.log('Data saved to panorama-data.json and localStorage');
            alert('Data berhasil disimpan! File akan otomatis diupdate di viewer.');
        } catch (error) {
            console.error('Error saving data:', error);
            throw error;
        }
    }

    // Auto-save to localStorage
    autoSaveToLocalStorage(): void {
        try {
            const jsonData = JSON.stringify(this.panoramas, null, 2);
            localStorage.setItem('panorama-data-backup', jsonData);
            console.log('Data auto-saved to localStorage');
                    } catch (error) {
            console.error('Error auto-saving data:', error);
        }
    }

    // Load from localStorage if available
    loadFromLocalStorage(): void {
        try {
            const savedData = localStorage.getItem('panorama-data-backup');
            if (savedData) {
                const parsedData = JSON.parse(savedData) as PanoramaData[];
                this.panoramas = parsedData;
                            console.log('Data loaded from localStorage');
                        }
                    } catch (error) {
                        console.error('Error loading from localStorage:', error);
                    }
    }

    // Check if panoramas are linked
    arePanoramasLinked(sourceId: string, targetId: string): boolean {
        const panorama = this.getPanoramaById(sourceId);
        return panorama?.markers?.some(marker => marker.nodeId === targetId) || false;
    }

    // Convert markers to hotspots
    convertMarkersToHotspots(panoramaId: string): HotspotData[] {
        const panorama = this.getPanoramaById(panoramaId);
        if (!panorama?.markers) return [];

        return panorama.markers.map((marker, index) => {
            const targetPanorama = this.getPanoramaById(marker.nodeId);
            
            // Convert position to yaw/pitch format
            let position: { yaw: number; pitch: number };
            if ('textureX' in marker.position && 'textureY' in marker.position) {
                // Convert texture coordinates to spherical coordinates
                const textureX = marker.position.textureX;
                const textureY = marker.position.textureY;
                position = {
                    yaw: (textureX / 4096) * 2 * Math.PI - Math.PI,
                    pitch: (textureY / 2048) * Math.PI - Math.PI / 2
                };
            } else {
                position = marker.position as { yaw: number; pitch: number };
            }

            return {
                id: `marker-${panoramaId}-${marker.nodeId}-${index}`,
                panoramaId: panoramaId,
                position: position,
                type: 'link' as const,
                title: `Go to ${targetPanorama?.name || marker.nodeId}`,
                content: `Navigate to ${targetPanorama?.name || marker.nodeId}`,
                isVisible: true,
                targetNodeId: marker.nodeId,
                style: {
                    backgroundColor: '#3b82f6',
                    size: 24,
                    icon: 'link'
                }
            };
        });
    }

    // Add link hotspot
    addLinkHotspot(panoramaId: string, targetNodeId: string, position: { yaw: number; pitch: number }): void {
        const targetPanorama = this.getPanoramaById(targetNodeId);
        const hotspot: HotspotData = {
            id: `link-${panoramaId}-${targetNodeId}-${Date.now()}`,
            panoramaId: panoramaId,
            position: position,
            type: 'link',
            title: `Go to ${targetPanorama?.name || targetNodeId}`,
            content: `Navigate to ${targetPanorama?.name || targetNodeId}`,
            isVisible: true,
            targetNodeId: targetNodeId,
            style: {
                backgroundColor: '#3b82f6',
                size: 24,
                icon: 'link'
            }
        };
        this.addHotspotToPanorama(panoramaId, hotspot);
    }
}

// Create global instance
export const dataManager = new SimpleDataManager();

// Export helper functions
export const getPanoramaById = (id: string): PanoramaData | undefined => {
    return dataManager.getPanoramaById(id);
};

export const getAllPanoramaIds = (): string[] => {
    return dataManager.getAllPanoramas().map(p => p.id);
};

export const getPanoramaNames = (): { id: string; name: string }[] => {
    return dataManager.getPanoramaNames();
};

export const getMarkersForPanorama = (panoramaId: string): PanoramaMarker[] => {
    return dataManager.getMarkersForPanorama(panoramaId);
};

export const getHotspotsForPanorama = (panoramaId: string): HotspotData[] => {
    return dataManager.getHotspotsForPanorama(panoramaId);
};

export const addHotspotToPanorama = (panoramaId: string, hotspot: HotspotData): void => {
    return dataManager.addHotspotToPanorama(panoramaId, hotspot);
};

export const updateHotspotInPanorama = (panoramaId: string, hotspotId: string, updates: Partial<HotspotData>): void => {
    return dataManager.updateHotspotInPanorama(panoramaId, hotspotId, updates);
};

export const deleteHotspotFromPanorama = (panoramaId: string, hotspotId: string): void => {
    return dataManager.deleteHotspotFromPanorama(panoramaId, hotspotId);
};

export const clearHotspotsFromPanorama = (panoramaId: string): void => {
    return dataManager.clearHotspotsFromPanorama(panoramaId);
};

export const saveToFile = async (): Promise<void> => {
    return dataManager.saveToFile();
};

export const autoSaveToLocalStorage = (): void => {
    return dataManager.autoSaveToLocalStorage();
};

export const loadFromLocalStorage = (): void => {
    return dataManager.loadFromLocalStorage();
};

export const arePanoramasLinked = (sourceId: string, targetId: string): boolean => {
    return dataManager.arePanoramasLinked(sourceId, targetId);
};

export const convertMarkersToHotspots = (panoramaId: string): HotspotData[] => {
    return dataManager.convertMarkersToHotspots(panoramaId);
};

export const addLinkHotspot = (panoramaId: string, targetNodeId: string, position: { yaw: number; pitch: number }): void => {
    return dataManager.addLinkHotspot(panoramaId, targetNodeId, position);
};

// Image loading functions
export const loadImage = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const fileReader = new FileReader();

        return new Promise((resolve, reject) => {
            fileReader.onload = () => resolve(fileReader.result as string);
            fileReader.onerror = reject;
            fileReader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error loading image:', error);
        throw error;
    }
};

export const loadImageWithProgress = async (
    url: string, 
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        const reader = response.body?.getReader();
        
        if (!reader) {
            throw new Error('No reader available');
        }

        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            chunks.push(value);
            receivedLength += value.length;
            
            if (onProgress && total > 0) {
                const progress = (receivedLength / total) * 100;
                onProgress(progress);
            }
        }

        const blob = new Blob(chunks);
        const fileReader = new FileReader();

        return new Promise((resolve, reject) => {
            fileReader.onload = () => resolve(fileReader.result as string);
            fileReader.onerror = reject;
            fileReader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error loading image with progress:', error);
        throw error;
    }
};
