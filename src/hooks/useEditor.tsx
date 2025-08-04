import { useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useViewerStore } from '../store/viewerStore';
import { Hotspot, EditorTool } from '../types/editor';
import { PanoramaNode } from '../types/panorama';

export const useEditor = () => {
    const {
        editMode,
        selectedPanorama,
        selectedHotspot,
        isPreviewMode,
        panoramas,
        hotspots,
        setEditMode,
        setSelectedPanorama,
        setSelectedHotspot,
        togglePreviewMode,
        addHotspot,
        updateHotspot,
        deleteHotspot,
        moveHotspot,
    } = useEditorStore();

    const { setCurrentNode } = useViewerStore();
    const viewerRef = useRef<any>(null);

    // Editor tools configuration
    const editorTools: EditorTool[] = [
        {
            id: 'panorama',
            name: 'Panorama',
            icon: 'image',
            shortcut: '1',
            description: 'Edit panorama settings',
            isActive: editMode === 'panorama',
        },
        {
            id: 'hotspot',
            name: 'Hotspot',
            icon: 'target',
            shortcut: '2',
            description: 'Add and edit hotspots',
            isActive: editMode === 'hotspot',
        },
        {
            id: 'minimap',
            name: 'Minimap',
            icon: 'map',
            shortcut: '3',
            description: 'Edit minimap markers',
            isActive: editMode === 'minimap',
        },
        {
            id: 'gallery',
            name: 'Gallery',
            icon: 'grid',
            shortcut: '4',
            description: 'Manage panorama gallery',
            isActive: editMode === 'gallery',
        },
        {
            id: 'navigation',
            name: 'Navigation',
            icon: 'menu',
            shortcut: '5',
            description: 'Edit navigation menu',
            isActive: editMode === 'navigation',
        },
    ];

    // Switch to panorama in viewer when selected
    useEffect(() => {
        if (selectedPanorama && !isPreviewMode) {
            setCurrentNode(selectedPanorama);
        }
    }, [selectedPanorama, isPreviewMode, setCurrentNode]);

    // Handle keyboard shortcuts for editor
    const handleEditorKeyboard = useCallback((event: KeyboardEvent) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        const key = event.key;

        // Tool switching
        if (key >= '1' && key <= '5') {
            const toolIndex = parseInt(key) - 1;
            if (toolIndex < editorTools.length) {
                event.preventDefault();
                setEditMode(editorTools[toolIndex].id as any);
            }
        }

        // Preview mode toggle
        if (key === 'p' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            togglePreviewMode();
        }

        // Save project
        if (key === 's' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            useEditorStore.getState().saveProject();
        }

        // Delete selected item
        if (key === 'Delete' || key === 'Backspace') {
            if (selectedHotspot) {
                event.preventDefault();
                deleteHotspot(selectedHotspot);
                setSelectedHotspot(null);
            }
        }

        // Escape to clear selection
        if (key === 'Escape') {
            setSelectedHotspot(null);
            setSelectedPanorama(null);
        }
    }, [selectedHotspot, editorTools, setEditMode, togglePreviewMode, deleteHotspot, setSelectedHotspot, setSelectedPanorama]);

    // Add keyboard event listener
    useEffect(() => {
        document.addEventListener('keydown', handleEditorKeyboard);
        return () => document.removeEventListener('keydown', handleEditorKeyboard);
    }, [handleEditorKeyboard]);

    // Hotspot management functions
    const addHotspotAtCenter = useCallback(() => {
        if (!selectedPanorama || !viewerRef.current) return;

        const viewer = viewerRef.current;
        const position = viewer.getPosition();

        const newHotspot: Hotspot = {
            id: `hotspot-${Date.now()}`,
            panoramaId: selectedPanorama,
            position: {
                yaw: position.yaw,
                pitch: position.pitch,
            },
            type: 'info',
            title: 'New Hotspot',
            content: 'Add your content here',
            isVisible: true,
        };

        addHotspot(newHotspot);
        setSelectedHotspot(newHotspot.id);
    }, [selectedPanorama, addHotspot, setSelectedHotspot]);

    const updateHotspotPosition = useCallback((hotspotId: string, position: { yaw: number; pitch: number }) => {
        moveHotspot(hotspotId, position);
    }, [moveHotspot]);

    const getHotspotsForPanorama = useCallback((panoramaId: string) => {
        return hotspots.filter(h => h.panoramaId === panoramaId);
    }, [hotspots]);

    const getSelectedPanoramaData = useCallback(() => {
        return panoramas.find(p => p.id === selectedPanorama);
    }, [panoramas, selectedPanorama]);

    const getSelectedHotspotData = useCallback(() => {
        return hotspots.find(h => h.id === selectedHotspot);
    }, [hotspots, selectedHotspot]);

    // File operations
    const handleFileUpload = useCallback(async (file: File, type: 'panorama' | 'minimap') => {
        try {
            const uploadFunction = type === 'panorama'
                ? useEditorStore.getState().uploadPanorama
                : useEditorStore.getState().uploadMinimap;

            const url = await uploadFunction(file);
            return url;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    }, []);

    const handleExportProject = useCallback(() => {
        useEditorStore.getState().exportProject();
    }, []);

    const handleImportProject = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                useEditorStore.getState().importProject(data);
            } catch (error) {
                console.error('Import failed:', error);
            }
        };
        reader.readAsText(file);
    }, []);

    return {
        // State
        editMode,
        selectedPanorama,
        selectedHotspot,
        isPreviewMode,
        editorTools,

        // Actions
        setEditMode,
        setSelectedPanorama,
        setSelectedHotspot,
        togglePreviewMode,

        // Hotspot management
        addHotspotAtCenter,
        updateHotspotPosition,
        getHotspotsForPanorama,
        getSelectedPanoramaData,
        getSelectedHotspotData,

        // File operations
        handleFileUpload,
        handleExportProject,
        handleImportProject,

        // Viewer reference
        setViewerRef: (ref: any) => {
            viewerRef.current = ref;
        },
    };
};
