export interface PanoramaNode {
  id: string;
  panorama: string;
  thumbnail: string;
  name: string;
  caption: string;
  category?: string;
  links: NodeLink[];
  markers?: Marker[];
  gps: [number, number];
  sphereCorrection?: {
    pan?: string;
    tilt?: string;
    roll?: string;
  };
}

export interface NodeLink {
  nodeId: string;
}

export interface Marker {
  id: string;
  position: {
    yaw: number;
    pitch: number;
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
}

export interface MinimapMarker {
  id: string;
  nodeId: string;
  x: number;
  y: number;
  label: string;
}
