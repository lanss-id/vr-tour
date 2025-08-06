export interface PanoramaNode {
    id: string;
    panorama: string;
    thumbnail: string;
    name: string;
    caption: string;
    category?: string;
    links: NodeLink[];
    markers?: Marker[];
    sphereCorrection?: {
        pan?: string;
        tilt?: string;
        roll?: string;
    };
}

export interface NodeLink {
    nodeId: string;
    position?: {
        textureX: number;
        textureY: number;
    } | {
        yaw: number;
        pitch: number;
    };
}

export interface Marker {
    id: string;
    position: {
        yaw: number;
        pitch: number;
    } | {
        textureX: number;
        textureY: number;
    };
    tooltip?: string;
    content?: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    order: number;
    color: string;
}

export interface MinimapData {
    backgroundImage: string;
    markers: MinimapMarker[];
    panoramas: MinimapPanorama[];
}

export interface MinimapMarker {
    id: string;
    nodeId: string;
    x: number;
    y: number;
    label: string;
}

export interface MinimapPanorama {
    id: string;
    x: number;
    y: number;
    name?: string;
    thumbnail?: string;
}
