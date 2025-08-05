import './styles.css';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import panoramaData from './panorama-data.json';

// State node aktif manual
let currentNodeId = 'kawasan-1';

// Helper: cari node by id
function getNodeById(id: string) {
    return panoramaData.find(node => node.id === id);
}

// Helper: konversi textureX/textureY ke yaw/pitch
function textureToSpherical(textureX: number, textureY: number, textureWidth: number = 4096, textureHeight: number = 2048) {
    const yaw = (textureX / textureWidth) * 2 * Math.PI - Math.PI;
    const pitch = (textureY / textureHeight) * Math.PI - Math.PI / 2;
    return { yaw, pitch };
}

// Helper: hapus semua marker navigasi, lalu tambahkan marker navigasi baru sesuai markers node aktif
function updateNavigationMarkers(viewer: any, nodeId: string) {
    console.log('Updating navigation markers for node:', nodeId);

    const markersPlugin = viewer.getPlugin(MarkersPlugin) as any;
    if (!markersPlugin) {
        console.error('MarkersPlugin not found');
        return;
    }

    markersPlugin.clearMarkers();

    const node = getNodeById(nodeId);
    if (!node || !node.markers) {
        console.log('No node or markers found for:', nodeId);
        return;
    }

    console.log('Adding navigation markers for markers:', node.markers.length);

    node.markers.forEach((marker: any, idx: number) => {
        console.log('Adding marker for navigation:', marker.nodeId, 'at position:', marker.position);

        // Konversi posisi jika menggunakan textureX/textureY
        let position;
        if (marker.position.textureX !== undefined && marker.position.textureY !== undefined) {
            const spherical = textureToSpherical(marker.position.textureX, marker.position.textureY);
            position = { yaw: spherical.yaw, pitch: spherical.pitch };
        } else {
            position = marker.position;
        }

        markersPlugin.addMarker({
            id: `nav-marker-${marker.nodeId}`,
            image: 'https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-blue.png',
            tooltip: `Pindah ke panorama ${marker.nodeId}`,
            size: { width: 120, height: 120 },
            anchor: 'bottom center',
            position: position,
            data: { targetNodeId: marker.nodeId }
        });
    });
}

// Inisialisasi viewer
const viewer = new Viewer({
    container: 'viewer',
    defaultYaw: '0deg',
    navbar: 'zoom move gallery caption fullscreen',
    plugins: [
        MarkersPlugin.withConfig({
            clickEventOnMarker: true, // Enable click event on markers
        }),
        GalleryPlugin.withConfig({
            thumbnailSize: { width: 100, height: 100 },
        }),
        VirtualTourPlugin.withConfig({
            renderMode: '3d',
            nodes: panoramaData.map(node => ({
                id: node.id,
                panorama: node.panorama,
                thumbnail: node.thumbnail,
                name: node.name,
                caption: node.caption
            })),
            startNodeId: currentNodeId,
        }),
    ],
});

// Setelah viewer siap, render marker navigasi pertama
viewer.addEventListener('ready', () => {
    console.log('Viewer ready, initializing navigation markers');
    // Delay sedikit untuk memastikan plugin sudah siap
    setTimeout(() => {
        updateNavigationMarkers(viewer, currentNodeId);
    }, 1000);
});

// Event handler marker navigasi menggunakan select-marker event
viewer.addEventListener('ready', () => {
    const markersPlugin = viewer.getPlugin(MarkersPlugin) as any;
    const virtualTour = viewer.getPlugin(VirtualTourPlugin) as any;

    if (markersPlugin) {
        // Gunakan event select-marker sesuai dokumentasi
        markersPlugin.addEventListener('select-marker', ({ marker, doubleClick, rightClick }) => {
            console.log('Marker selected:', marker);
            console.log('Double click:', doubleClick);
            console.log('Right click:', rightClick);

            if (marker.data && marker.data.targetNodeId) {
                currentNodeId = marker.data.targetNodeId;
                console.log('Navigating to:', currentNodeId);

                // Pindah panorama
                virtualTour.setCurrentNode(currentNodeId);

                // Update marker navigasi setelah delay yang lebih lama
                setTimeout(() => {
                    console.log('Updating markers after navigation to:', currentNodeId);
                    updateNavigationMarkers(viewer, currentNodeId);
                }, 1000);
            }
        });
    }

    // Jika user pindah panorama lewat cara lain (misal: menu), update marker navigasi juga
    if (virtualTour) {
        virtualTour.addEventListener('node-changed', (e: any, node: any) => {
            console.log('Node changed event triggered');
            console.log('Node changed to:', node.id);
            currentNodeId = node.id;

            // Update marker navigasi dengan delay yang lebih lama
            setTimeout(() => {
                console.log('Updating markers after node-changed to:', currentNodeId);
                updateNavigationMarkers(viewer, currentNodeId);
            }, 1000);
        });
    }
});

// Tambahan: Event listener untuk memastikan marker diupdate setelah panorama selesai loading
viewer.addEventListener('ready', () => {
    const virtualTour = viewer.getPlugin(VirtualTourPlugin) as any;

    if (virtualTour) {
        // Listen untuk event panorama loaded
        virtualTour.addEventListener('panorama-loaded', (e: any) => {
            console.log('Panorama loaded event triggered');
            setTimeout(() => {
                console.log('Updating markers after panorama loaded');
                updateNavigationMarkers(viewer, currentNodeId);
            }, 500);
        });
    }
});
