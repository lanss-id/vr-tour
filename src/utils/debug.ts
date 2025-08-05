// Debug utilities for development
export const debug = {
    log: (message: string, data?: any) => {
        if (import.meta.env.DEV) {
            console.log(`[DEBUG] ${message}`, data || '');
        }
    },

    error: (message: string, error?: any) => {
        if (import.meta.env.DEV) {
            console.error(`[ERROR] ${message}`, error || '');
        }
    },

    warn: (message: string, data?: any) => {
        if (import.meta.env.DEV) {
            console.warn(`[WARN] ${message}`, data || '');
        }
    },

    info: (message: string, data?: any) => {
        if (import.meta.env.DEV) {
            console.info(`[INFO] ${message}`, data || '');
        }
    }
};

// Check if panorama images exist
export const checkPanoramaImages = async (panoramaData: any[]) => {
    const results = await Promise.allSettled(
        panoramaData.map(async (node) => {
            try {
                const response = await fetch(node.panorama, { method: 'HEAD' });
                return {
                    id: node.id,
                    exists: response.ok,
                    status: response.status,
                    url: node.panorama
                };
            } catch (error) {
                return {
                    id: node.id,
                    exists: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    url: node.panorama
                };
            }
        })
    );

    debug.info('Panorama image check results:', results);
    return results;
};

// Validate panorama data structure
export const validatePanoramaData = (data: any[]) => {
    const errors: string[] = [];

    data.forEach((node, index) => {
        if (!node.id) errors.push(`Node ${index}: Missing ID`);
        if (!node.panorama) errors.push(`Node ${index}: Missing panorama path`);
        if (!node.name) errors.push(`Node ${index}: Missing name`);
        if (!node.links || !Array.isArray(node.links)) {
            errors.push(`Node ${index}: Invalid links array`);
        }
        if (!node.gps || !Array.isArray(node.gps) || node.gps.length !== 2) {
            errors.push(`Node ${index}: Invalid GPS coordinates`);
        }
    });

    if (errors.length > 0) {
        debug.error('Panorama data validation errors:', errors);
    } else {
        debug.info('Panorama data validation passed');
    }

    return errors;
};

export const debugNavigationMenu = () => {
    const saved = localStorage.getItem('vr-panorama-tour');
    if (saved) {
        const data = JSON.parse(saved);
        console.log('Saved navigation menu:', data.navigationMenu);
        return data.navigationMenu;
    }
    console.log('No saved data found');
    return null;
};

export const clearSavedData = () => {
    localStorage.removeItem('vr-panorama-tour');
    console.log('Saved data cleared');
};

export const testSaveNavigationMenu = () => {
    const testData = {
        categories: [
            {
                id: 'test-category',
                title: 'Test Category',
                subtitle: 'Test Subtitle',
                icon: 'building',
                order: 1,
                isVisible: true,
                items: [
                    {
                        id: 'test-item',
                        title: 'Test Item',
                        subtitle: 'Test Item Subtitle',
                        thumbnail: '/test-thumbnail.jpg',
                        panoramaId: 'kawasan-1',
                        order: 0,
                        isVisible: true,
                    }
                ]
            }
        ],
        layout: 'cards',
        theme: 'light',
        showThumbnails: true,
        showSubtitles: true,
        maxItemsPerRow: 3,
    };

    localStorage.setItem('vr-panorama-tour', JSON.stringify({
        navigationMenu: testData,
        panoramas: [],
        categories: [],
        hotspots: [],
        minimapData: { backgroundImage: '', markers: [] }
    }));

    console.log('Test navigation menu saved:', testData);
};
