export interface EditorState {
    editMode: 'panorama' | 'minimap' | 'gallery' | 'navigation' | 'hotspot';
    selectedPanorama: string | null;
    selectedCategory: string | null;
    selectedHotspot: string | null;
    isDirty: boolean;
    isPreviewMode: boolean;
    isFullscreen: boolean;

    // CRUD operations
    panoramas: PanoramaNode[];
    categories: Category[];
    hotspots: Hotspot[];
    minimapData: MinimapData;

    // Actions
    setEditMode: (mode: EditorState['editMode']) => void;
    setSelectedPanorama: (id: string | null) => void;
    setSelectedCategory: (id: string | null) => void;
    setSelectedHotspot: (id: string | null) => void;
    setDirty: (dirty: boolean) => void;
    togglePreviewMode: () => void;
    toggleFullscreen: () => void;

    // Panorama CRUD
    addPanorama: (panorama: PanoramaNode) => void;
    updatePanorama: (id: string, updates: Partial<PanoramaNode>) => void;
    deletePanorama: (id: string) => void;
    duplicatePanorama: (id: string) => void;

    // Category CRUD
    addCategory: (category: Category) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;

    // Hotspot CRUD
    addHotspot: (hotspot: Hotspot) => void;
    updateHotspot: (id: string, updates: Partial<Hotspot>) => void;
    deleteHotspot: (id: string) => void;
    moveHotspot: (id: string, position: { yaw: number; pitch: number }) => void;

    // Minimap CRUD
    updateMinimapData: (data: Partial<MinimapData>) => void;
    addMinimapMarker: (marker: MinimapMarker) => void;
    updateMinimapMarker: (id: string, updates: Partial<MinimapMarker>) => void;
    deleteMinimapMarker: (id: string) => void;
    moveMinimapMarker: (id: string, position: { x: number; y: number }) => void;

    // File operations
    uploadPanorama: (file: File) => Promise<string>;
    uploadMinimap: (file: File) => Promise<string>;
    exportProject: () => void;
    importProject: (data: ProjectData) => void;
    saveProject: () => void;
    loadProject: () => void;
}

export interface Hotspot {
    id: string;
    panoramaId: string;
    position: {
        yaw: number;
        pitch: number;
    };
    type: 'info' | 'link' | 'custom';
    title: string;
    content?: string;
    targetNodeId?: string;
    style?: {
        backgroundColor?: string;
        borderColor?: string;
        size?: number;
    };
    isVisible: boolean;
}

export interface ProjectData {
    panoramas: PanoramaNode[];
    categories: Category[];
    hotspots: Hotspot[];
    minimapData: MinimapData;
    metadata: {
        name: string;
        version: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface EditorTool {
    id: string;
    name: string;
    icon: string;
    shortcut?: string;
    description: string;
    isActive: boolean;
}

export interface EditorPanel {
    id: string;
    title: string;
    isVisible: boolean;
    isCollapsed: boolean;
    position: 'left' | 'right' | 'bottom';
    size: number;
}

export interface DragDropState {
    isDragging: boolean;
    draggedItem: any;
    dropTarget: any;
    dragType: 'panorama' | 'hotspot' | 'marker' | 'category';
}

// Import existing types
import { PanoramaNode, Category, MinimapData, MinimapMarker } from './panorama';
