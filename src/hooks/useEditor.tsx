import { useCallback, useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useEditorStore } from '../store/editorStore';
import { useViewerStore } from '../store/viewerStore';
import { EditorTool } from '../types/editor';

export const useEditor = () => {
    const {
        currentPanoramaId,
        hotspots,
        selectedHotspotId,
        setCurrentPanorama,
        setSelectedHotspot,
        addHotspot,
        updateHotspot,
        deleteHotspot,
    } = useEditorStore();

    const { setCurrentNode } = useViewerStore();

    const viewerRef = useRef<Viewer | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Editor tools configuration
    const editorTools: EditorTool[] = [
        {
            id: 'panorama',
            name: 'Panorama',
            icon: 'image',
            shortcut: '1',
            description: 'Edit panorama properties and settings',
            isActive: true,
        },
        {
            id: 'hotspot',
            name: 'Hotspot',
            icon: 'target',
            shortcut: '2',
            description: 'Add and edit hotspots on panoramas',
            isActive: true,
        },
        {
            id: 'minimap',
            name: 'Minimap',
            icon: 'map',
            shortcut: '3',
            description: 'Edit minimap markers and layout',
            isActive: true,
        },
        {
            id: 'gallery',
            name: 'Gallery',
            icon: 'grid',
            shortcut: '4',
            description: 'Configure gallery settings',
            isActive: true,
        },
        {
            id: 'navigation',
            name: 'Navigation',
            icon: 'menu',
            shortcut: '5',
            description: 'Customize navigation menu structure',
            isActive: true,
        },
    ];

    // Set viewer reference
    const setViewerRef = useCallback((viewer: Viewer | null) => {
        viewerRef.current = viewer;
    }, []);

    // Get hotspots for current panorama
    const getHotspotsForPanorama = useCallback((panoramaId: string) => {
        return hotspots.filter(h => h.panoramaId === panoramaId);
    }, [hotspots]);

    // Update hotspot position
    const updateHotspotPosition = useCallback((hotspotId: string, position: { yaw: number; pitch: number }) => {
        updateHotspot(hotspotId, { position });
    }, [updateHotspot]);

    // Add hotspot at center of view
    const addHotspotAtCenter = useCallback(() => {
        if (!viewerRef.current || !currentPanoramaId) return;

        const position = viewerRef.current.getPosition();
        const newHotspot = {
            id: `hotspot-${Date.now()}`,
            panoramaId: currentPanoramaId,
            position: { yaw: position.yaw, pitch: position.pitch },
            type: 'info' as const,
            title: 'New Hotspot',
            content: 'Add your content here',
            isVisible: true,
            style: {
                backgroundColor: '#3b82f6',
                borderColor: '#ffffff',
                size: 24,
            },
        };

        addHotspot(newHotspot);
        console.warn('New hotspot added at center:', newHotspot);
    }, [currentPanoramaId, addHotspot]);

    // Force reload panorama data
    const reloadPanoramaData = useCallback(() => {
        // Trigger a page reload to get fresh data from panorama-data.json
        window.location.reload();
    }, []);

    // Auto-save and reload function
    const saveAndReload = useCallback(async () => {
        try {
            // Wait a bit for any pending saves
            await new Promise(resolve => setTimeout(resolve, 100));
            reloadPanoramaData();
        } catch (error) {
            console.error('Error saving and reloading:', error);
        }
    }, [reloadPanoramaData]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Handle Ctrl+S for save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                try {
                    console.log('Save triggered via keyboard shortcut');
                } catch (error) {
                    console.error('Error saving project via keyboard shortcut:', error);
                }
                return;
            }

            if (e.ctrlKey || e.metaKey) return; // Ignore other modifier key combinations

            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    setSelectedHotspot(null);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            try {
                window.removeEventListener('keydown', handleKeyDown);
            } catch (error) {
                console.warn('Error removing keyboard event listener:', error);
            }
        };
    }, [setSelectedHotspot]);

    // Handle file operations
    const handleExportProject = useCallback(() => {
        try {
            console.log('Export project triggered');
        } catch (error) {
            console.error('Error exporting project:', error);
        }
    }, []);

    const handleImportProject = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                console.log('Import project data:', data);
            } catch (error) {
                console.error('Failed to import project:', error);
                alert('Failed to import project. Please check the file format.');
            }
        };
        reader.onerror = () => {
            console.error('Failed to read file');
            alert('Failed to read file. Please try again.');
        };
        reader.readAsText(file);
    }, []);

    return {
        currentPanoramaId,
        selectedHotspotId,
        editorTools,
        setCurrentPanorama,
        setSelectedHotspot,
        setViewerRef,
        getHotspotsForPanorama,
        updateHotspotPosition,
        addHotspotAtCenter,
        handleExportProject,
        handleImportProject,
        reloadPanoramaData,
        saveAndReload,
    };
};
