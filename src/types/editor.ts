export interface Hotspot {
    id: string;
    panoramaId: string;
    title: string;
    content?: string;
    type: 'info' | 'link' | 'custom';
    targetNodeId?: string;
    position: {
        yaw: number;
        pitch: number;
    } | {
        textureX: number;
        textureY: number;
    };
    isVisible: boolean;
    style?: {
        size?: number;
        backgroundColor?: string;
        borderColor?: string;
        icon?: string;
        opacity?: number;
    };
}

export interface EditorState {
    currentPanoramaId: string;
    hotspots: Hotspot[];
    isDirty: boolean;
    isEditing: boolean;
    selectedHotspotId: string | null;

    // Actions
    setCurrentPanorama: (panoramaId: string) => void;
    addHotspot: (hotspot: Hotspot) => void;
    updateHotspot: (id: string, updates: Partial<Hotspot>) => void;
    deleteHotspot: (id: string) => void;
    duplicateHotspot: (id: string) => void;
    setSelectedHotspot: (id: string | null) => void;
    setIsEditing: (isEditing: boolean) => void;
    setIsDirty: (isDirty: boolean) => void;
    clearHotspots: () => void;
}

export interface ProjectData {
    panoramas: PanoramaNode[];
    categories: Category[];
    hotspots: Hotspot[];
    minimapData: MinimapData;
    navigationMenu: NavigationMenuData;
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

// Navigation Menu Types
export interface NavigationItem {
    id: string;
    title: string;
    subtitle?: string;
    thumbnail: string;
    panoramaId: string;
    order: number;
    isVisible: boolean;
    style?: {
        backgroundColor?: string;
        textColor?: string;
        borderColor?: string;
    };
}

export interface NavigationCategory {
    id: string;
    title: string;
    subtitle?: string;
    icon: string;
    order: number;
    isVisible: boolean;
    items: NavigationItem[];
    style?: {
        backgroundColor?: string;
        textColor?: string;
        borderColor?: string;
    };
}

export interface NavigationMenuData {
    categories: NavigationCategory[];
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
}

// Import existing types
import { PanoramaNode, Category, MinimapData, MinimapMarker } from './panorama';
