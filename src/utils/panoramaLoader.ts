import panoramaData from '../data/panorama-data.json';

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

export interface PanoramaNode {
    id: string;
    panorama: string;
    thumbnail: string;
    name: string;
    caption: string;
    links: PanoramaLink[];
    sphereCorrection?: { pan: string };
}

// Load panorama data
export const loadPanoramaData = (): PanoramaNode[] => {
    return panoramaData as PanoramaNode[];
};

// Get panorama by ID
export const getPanoramaById = (id: string): PanoramaNode | undefined => {
    return panoramaData.find(node => node.id === id) as PanoramaNode | undefined;
};

// Get all panorama IDs
export const getAllPanoramaIds = (): string[] => {
    return panoramaData.map(node => node.id);
};

// Get panorama names for dropdown
export const getPanoramaNames = (): { id: string; name: string }[] => {
    return panoramaData.map(node => ({ id: node.id, name: node.name }));
};

// Add link to panorama - IMPROVED VERSION
export const addLinkToPanorama = (sourcePanoramaId: string, targetPanoramaId: string, position?: {
    textureX: number;
    textureY: number;
} | {
    yaw: number;
    pitch: number;
}): boolean => {
    try {
        const panorama = getPanoramaById(sourcePanoramaId);
        if (!panorama) {
            console.warn(`Source panorama not found: ${sourcePanoramaId}`);
            return false;
        }

        const targetPanorama = getPanoramaById(targetPanoramaId);
        if (!targetPanorama) {
            console.warn(`Target panorama not found: ${targetPanoramaId}`);
            return false;
        }

        // Check if link already exists
        const existingLink = panorama.links.find(link => link.nodeId === targetPanoramaId);
        if (existingLink) {
            console.log(`Link already exists from ${sourcePanoramaId} to ${targetPanoramaId}`);
            // Update position if provided
            if (position) {
                existingLink.position = position;
            }
            return true;
        }

        // Add new link
        panorama.links.push({
            nodeId: targetPanoramaId,
            position: position
        });

        console.log(`Link added from ${sourcePanoramaId} to ${targetPanoramaId}`);
        return true;
    } catch (error) {
        console.error('Error adding link to panorama:', error);
        return false;
    }
};

// Remove link from panorama - IMPROVED VERSION
export const removeLinkFromPanorama = (sourcePanoramaId: string, targetPanoramaId: string): boolean => {
    try {
        const panorama = getPanoramaById(sourcePanoramaId);
        if (!panorama) {
            console.warn(`Source panorama not found: ${sourcePanoramaId}`);
            return false;
        }

        const linkIndex = panorama.links.findIndex(link => link.nodeId === targetPanoramaId);
        if (linkIndex === -1) {
            console.warn(`Link not found from ${sourcePanoramaId} to ${targetPanoramaId}`);
            return false;
        }

        panorama.links.splice(linkIndex, 1);
        console.log(`Link removed from ${sourcePanoramaId} to ${targetPanoramaId}`);
        return true;
    } catch (error) {
        console.error('Error removing link from panorama:', error);
        return false;
    }
};

// Update link position - IMPROVED VERSION
export const updateLinkPosition = (sourcePanoramaId: string, targetPanoramaId: string, position: {
    textureX: number;
    textureY: number;
} | {
    yaw: number;
    pitch: number;
}): boolean => {
    try {
        const panorama = getPanoramaById(sourcePanoramaId);
        if (!panorama) {
            console.warn(`Source panorama not found: ${sourcePanoramaId}`);
            return false;
        }

        const link = panorama.links.find(link => link.nodeId === targetPanoramaId);
        if (!link) {
            console.warn(`Link not found from ${sourcePanoramaId} to ${targetPanoramaId}`);
            return false;
        }

        link.position = position;
        console.log(`Link position updated from ${sourcePanoramaId} to ${targetPanoramaId}`);
        return true;
    } catch (error) {
        console.error('Error updating link position:', error);
        return false;
    }
};

// Get links for panorama
export const getLinksForPanorama = (panoramaId: string): PanoramaLink[] => {
    const panorama = getPanoramaById(panoramaId);
    return panorama?.links || [];
};

// Check if two panoramas are linked
export const arePanoramasLinked = (sourceId: string, targetId: string): boolean => {
    const panorama = getPanoramaById(sourceId);
    return panorama?.links.some(link => link.nodeId === targetId) || false;
};

// Get all links in the system
export const getAllLinks = (): {
    sourceId: string; targetId: string; position?: {
        textureX: number;
        textureY: number;
    } | {
        yaw: number;
        pitch: number;
    }
}[] => {
    const links: {
        sourceId: string; targetId: string; position?: {
            textureX: number;
            textureY: number;
        } | {
            yaw: number;
            pitch: number;
        }
    }[] = [];

    panoramaData.forEach(panorama => {
        panorama.links.forEach(link => {
            links.push({
                sourceId: panorama.id,
                targetId: link.nodeId,
                position: link.position
            });
        });
    });

    return links;
};

// Convert texture coordinates to spherical coordinates
export const textureToSpherical = (textureX: number, textureY: number, textureWidth: number = 4096, textureHeight: number = 2048): { yaw: number; pitch: number } => {
    const yaw = (textureX / textureWidth) * 2 * Math.PI - Math.PI;
    const pitch = (textureY / textureHeight) * Math.PI - Math.PI / 2;
    return { yaw, pitch };
};

// Convert spherical coordinates to texture coordinates
export const sphericalToTexture = (yaw: number, pitch: number, textureWidth: number = 4096, textureHeight: number = 2048): { textureX: number; textureY: number } => {
    const textureX = ((yaw + Math.PI) / (2 * Math.PI)) * textureWidth;
    const textureY = ((pitch + Math.PI / 2) / Math.PI) * textureHeight;
    return { textureX, textureY };
};

// Export panorama data to JSON
export const exportPanoramaData = (): string => {
    return JSON.stringify(panoramaData, null, 2);
};

// Export modified panorama data to file
export const exportPanoramaDataToFile = (): void => {
    try {
        const data = JSON.stringify(panoramaData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'panorama-data-updated.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Panorama data exported successfully');
    } catch (error) {
        console.error('Error exporting panorama data:', error);
    }
};

// Import panorama data from JSON
export const importPanoramaData = (jsonData: string): boolean => {
    try {
        const data = JSON.parse(jsonData);
        // Validate data structure
        if (!Array.isArray(data)) return false;

        // Update panorama data (in a real app, this would save to file)
        console.log('Panorama data imported:', data);
        return true;
    } catch (error) {
        console.error('Error importing panorama data:', error);
        return false;
    }
};

// Sync hotspots with panorama links - IMPROVED VERSION
export const syncHotspotsWithLinks = (hotspots: any[]): void => {
    try {
        console.log('Syncing hotspots with panorama links...');

        // Clear all existing links
        panoramaData.forEach(panorama => {
            panorama.links = [];
        });

        // Add links from hotspots
        let addedLinks = 0;
        hotspots.forEach(hotspot => {
            if (hotspot.type === 'link' && hotspot.targetNodeId) {
                const success = addLinkToPanorama(hotspot.panoramaId, hotspot.targetNodeId, hotspot.position);
                if (success) {
                    addedLinks++;
                }
            }
        });

        console.log(`Hotspots synced with panorama links. Added ${addedLinks} links.`);
    } catch (error) {
        console.error('Error syncing hotspots with links:', error);
    }
};

// Get all links from hotspots
export const getLinksFromHotspots = (hotspots: any[]): {
    sourceId: string; targetId: string; position?: {
        textureX: number;
        textureY: number;
    } | {
        yaw: number;
        pitch: number;
    }
}[] => {
    return hotspots
        .filter(hotspot => hotspot.type === 'link' && hotspot.targetNodeId)
        .map(hotspot => ({
            sourceId: hotspot.panoramaId,
            targetId: hotspot.targetNodeId,
            position: hotspot.position
        }));
};

// Validate panorama data structure
export const validatePanoramaData = (): boolean => {
    try {
        if (!Array.isArray(panoramaData)) {
            console.error('Panorama data is not an array');
            return false;
        }

        for (const node of panoramaData) {
            if (!node.id || !node.panorama || !node.name) {
                console.error('Invalid panorama node:', node);
                return false;
            }
        }

        console.log('Panorama data validation passed');
        return true;
    } catch (error) {
        console.error('Error validating panorama data:', error);
        return false;
    }
};

// Save panorama data to file
export const savePanoramaData = async (): Promise<boolean> => {
    try {
        // In a real application, this would save to a file
        // For now, we'll just log the data and return success
        console.log('Saving panorama data:', panoramaData);

        // Try to use File System Access API if available (modern browsers)
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: 'panorama-data.json',
                    types: [{
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json'],
                        },
                    }],
                });

                const writable = await handle.createWritable();
                await writable.write(JSON.stringify(panoramaData, null, 2));
                await writable.close();

                console.log('Panorama data saved to file successfully');
                return true;
            } catch (error) {
                console.warn('File System Access API not available, falling back to download:', error);
            }
        }

        // Fallback: Create a download link
        const dataStr = JSON.stringify(panoramaData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'panorama-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('Panorama data downloaded successfully');
        return true;
    } catch (error) {
        console.error('Error saving panorama data:', error);
        return false;
    }
};

// Auto-save function with debouncing
let autoSaveTimeout: NodeJS.Timeout | null = null;
export const autoSavePanoramaData = (delay: number = 2000): void => {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    autoSaveTimeout = setTimeout(async () => {
        try {
            await savePanoramaData();
            console.log('Auto-saved panorama data');
        } catch (error) {
            console.error('Error auto-saving panorama data:', error);
        }
    }, delay);
};

// Force save function
export const forceSavePanoramaData = async (): Promise<boolean> => {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    return await savePanoramaData();
};

// Convert markers from panorama-data.json to editable hotspots
export const convertMarkersToHotspots = (panoramaId: string): any[] => {
    try {
        const panorama = getPanoramaById(panoramaId);
        if (!panorama || !panorama.markers) {
            return [];
        }

        return panorama.markers.map((marker: any, index: number) => {
            const targetPanorama = getPanoramaById(marker.nodeId);
            return {
                id: `hotspot-${panoramaId}-${index}`,
                panoramaId: panoramaId,
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
            };
        });
    } catch (error) {
        console.error('Error converting markers to hotspots:', error);
        return [];
    }
};

// Get all hotspots for a panorama (from store + converted from markers)
export const getAllHotspotsForPanorama = (panoramaId: string, storeHotspots: any[] = []): any[] => {
    try {
        // Get hotspots from store
        const storeHotspotsForPanorama = storeHotspots.filter(h => h.panoramaId === panoramaId);

        // Convert markers to hotspots
        const markerHotspots = convertMarkersToHotspots(panoramaId);

        // Combine and deduplicate
        const allHotspots = [...storeHotspotsForPanorama, ...markerHotspots];

        // Remove duplicates based on targetNodeId for link hotspots
        const uniqueHotspots = allHotspots.filter((hotspot, index, self) => {
            if (hotspot.type === 'link' && hotspot.targetNodeId) {
                return self.findIndex(h => h.type === 'link' && h.targetNodeId === hotspot.targetNodeId) === index;
            }
            return true;
        });

        return uniqueHotspots;
    } catch (error) {
        console.error('Error getting all hotspots for panorama:', error);
        return [];
    }
};

// Update marker in panorama-data.json
export const updateMarkerInPanoramaData = async (panoramaId: string, markerIndex: number, updates: any) => {
    try {
        const panorama = getPanoramaById(panoramaId);
        if (!panorama || !panorama.markers) {
            console.error('Panorama or markers not found:', panoramaId);
            return false;
        }

        // Update the marker
        panorama.markers[markerIndex] = { ...panorama.markers[markerIndex], ...updates };

        // Save to panorama-data.json
        await savePanoramaData();

        console.log('Marker updated in panorama-data.json:', panoramaId, markerIndex, updates);
        return true;
    } catch (error) {
        console.error('Error updating marker in panorama-data.json:', error);
        return false;
    }
};

// Add new marker to panorama-data.json
export const addMarkerToPanoramaData = async (panoramaId: string, marker: any) => {
    try {
        const panorama = getPanoramaById(panoramaId);
        if (!panorama) {
            console.error('Panorama not found:', panoramaId);
            return false;
        }

        // Initialize markers array if it doesn't exist
        if (!panorama.markers) {
            panorama.markers = [];
        }

        // Add new marker
        panorama.markers.push(marker);

        // Save to panorama-data.json
        await savePanoramaData();

        console.log('Marker added to panorama-data.json:', panoramaId, marker);
        return true;
    } catch (error) {
        console.error('Error adding marker to panorama-data.json:', error);
        return false;
    }
};

// Remove marker from panorama-data.json
export const removeMarkerFromPanoramaData = async (panoramaId: string, markerIndex: number) => {
    try {
        const panorama = getPanoramaById(panoramaId);
        if (!panorama || !panorama.markers) {
            console.error('Panorama or markers not found:', panoramaId);
            return false;
        }

        // Remove the marker
        panorama.markers.splice(markerIndex, 1);

        // Save to panorama-data.json
        await savePanoramaData();

        console.log('Marker removed from panorama-data.json:', panoramaId, markerIndex);
        return true;
    } catch (error) {
        console.error('Error removing marker from panorama-data.json:', error);
        return false;
    }
};

// Get marker index by hotspot ID
export const getMarkerIndexFromHotspotId = (hotspotId: string): { panoramaId: string; markerIndex: number } | null => {
    try {
        // Parse hotspot ID format: "hotspot-{panoramaId}-{index}"
        const match = hotspotId.match(/^hotspot-([^-]+)-(\d+)$/);
        if (!match) {
            return null;
        }

        const panoramaId = match[1];
        const markerIndex = parseInt(match[2]);

        return { panoramaId, markerIndex };
    } catch (error) {
        console.error('Error parsing hotspot ID:', error);
        return null;
    }
};
