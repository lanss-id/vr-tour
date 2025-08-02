import './styles.css';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import panoramaData from './panorama-data.json';

// Menggunakan data dari file JSON dengan type assertion untuk GPS
const nodes = panoramaData.map(node => ({
    ...node,
    gps: node.gps as [number, number]
}));

new Viewer({
    container: 'viewer',
    defaultYaw: '0deg',
    navbar: 'zoom move gallery caption fullscreen',

    plugins: [
        MarkersPlugin,
        GalleryPlugin.withConfig({
            thumbnailSize: { width: 100, height: 100 },
        }),
        VirtualTourPlugin.withConfig({
            positionMode: 'gps',
            renderMode: '3d',
            nodes: nodes,
            startNodeId: 'kawasan-1',
        }),
    ],
});
