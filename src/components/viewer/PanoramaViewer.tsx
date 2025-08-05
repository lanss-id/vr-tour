import React, { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useViewerStore } from '../../store/viewerStore';
import { useDataManager, getPanoramaById, getLinksForPanorama, loadImageWithCache } from '../../utils/dataManager';

// Helper function to validate node ID
const validateNodeId = (nodeId: string): string => {
    const validNode = getPanoramaById(nodeId);
    if (validNode) {
        return nodeId;
    }
    // Return 'kawasan-1' as default if invalid
    return 'kawasan-1';
};

// Helper: cari node by id
const getNodeById = (id: string) => {
    return getPanoramaById(id);
};

// Helper: hapus semua marker navigasi, lalu tambahkan marker navigasi baru sesuai markers node aktif
const updateNavigationMarkers = (viewer: any, nodeId: string) => {
    console.log('Updating navigation markers for node:', nodeId);

    const markersPlugin = viewer.getPlugin(MarkersPlugin) as any;
    if (!markersPlugin) {
        console.error('MarkersPlugin not found');
        return;
    }

    // Clear existing markers
    try {
        markersPlugin.clearMarkers();
    } catch (error) {
        console.warn('Error clearing markers:', error);
    }

    const node = getNodeById(nodeId);
    if (!node || !node.links) {
        console.log('No node or links found for:', nodeId);
        return;
    }

    console.log('Adding navigation markers for links:', node.links.length);

    node.links.forEach((link: any, idx: number) => {
        console.log('Adding marker for navigation:', link.nodeId, 'at position:', link.position);

        // Konversi posisi jika menggunakan textureX/textureY
        let position;
        if (link.position && 'textureX' in link.position && 'textureY' in link.position) {
            const textureX = link.position.textureX;
            const textureY = link.position.textureY;
            position = {
                yaw: (textureX / 4096) * 2 * Math.PI - Math.PI,
                pitch: (textureY / 2048) * Math.PI - Math.PI / 2
            };
        } else {
            position = link.position || { yaw: 0, pitch: 0 };
        }

        try {
            markersPlugin.addMarker({
                id: `nav-marker-${link.nodeId}`,
                image: '/icon/door-open.svg',
                tooltip: {
                    content: `Pindah ke panorama ${link.nodeId}`,
                    position: 'top'
                },
                size: { width: 48, height: 48 },
                anchor: 'bottom center',
                position: position,
                data: { targetNodeId: link.nodeId }
            });
        } catch (error) {
            console.warn('Error adding marker:', error);
        }
    });
};

// Helper: force update markers dengan retry mechanism
const forceUpdateMarkers = (viewer: any, nodeId: string, retryCount = 0) => {
    if (retryCount >= 3) {
        console.warn('Max retry count reached for marker update');
        return;
    }

    try {
        updateNavigationMarkers(viewer, nodeId);
    } catch (error) {
        console.warn(`Error updating markers (attempt ${retryCount + 1}):`, error);
        setTimeout(() => {
            forceUpdateMarkers(viewer, nodeId, retryCount + 1);
        }, 500 * (retryCount + 1));
    }
};

const PanoramaViewer: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const { currentNodeId, setCurrentNode } = useViewerStore();
    const { panoramas } = useDataManager();
    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (!containerRef.current || isInitializedRef.current) {
            return;
        }

        isInitializedRef.current = true;
        console.log('Initializing PanoramaViewer with currentNodeId:', currentNodeId);

        // Convert panorama data to PSV format - PSV requires yaw/pitch internally
        const nodes = panoramas.map((node: any) => ({
            id: node.id,
            panorama: node.panorama,
            thumbnail: node.thumbnail,
            name: node.name,
            caption: node.caption,
        }));

        // Use current node if it exists, otherwise use 'kawasan-1' as default
        let validNodeId = currentNodeId;
        const currentNode = nodes.find(node => node.id === currentNodeId);
        if (!currentNode) {
            validNodeId = 'kawasan-1';
            console.log('Current node not found, using default node:', validNodeId);
            setCurrentNode(validNodeId);
        } else {
            console.log('Using existing current node:', validNodeId);
        }

        // Initialize viewer with hidden navbar - using custom control bar instead
        viewerRef.current = new Viewer({
            container: containerRef.current,
            defaultYaw: '0deg',
            navbar: false, // Hide PSV navbar, use custom control bar
            plugins: [
                MarkersPlugin.withConfig({
                    clickEventOnMarker: true, // Enable click event on markers
                }),
                GalleryPlugin.withConfig({
                    thumbnailSize: { width: 100, height: 100 },
                }),
                VirtualTourPlugin.withConfig({
                    positionMode: 'manual',
                    renderMode: '3d',
                    nodes: nodes,
                    startNodeId: validNodeId,
                }),
            ],
        });

        // Setelah viewer siap, render marker navigasi pertama
        viewerRef.current.addEventListener('ready', () => {
            console.log('Viewer ready, initializing navigation markers');
            // Delay sedikit untuk memastikan plugin sudah siap
            setTimeout(() => {
                forceUpdateMarkers(viewerRef.current, validNodeId);
            }, 1000);
        });

        // Event handler marker navigasi menggunakan select-marker event
        viewerRef.current.addEventListener('ready', () => {
            const markersPlugin = viewerRef.current?.getPlugin(MarkersPlugin) as any;
            const virtualTour = viewerRef.current?.getPlugin(VirtualTourPlugin) as any;

            if (markersPlugin && virtualTour) {
                // Gunakan event select-marker sesuai dokumentasi
                markersPlugin.addEventListener('select-marker', ({ marker, doubleClick, rightClick }: { marker: any; doubleClick: boolean; rightClick: boolean }) => {
                    console.log('Marker selected:', marker);
                    console.log('Double click:', doubleClick);
                    console.log('Right click:', rightClick);

                    if (marker.data && marker.data.targetNodeId) {
                        const targetNodeId = marker.data.targetNodeId;
                        console.log('Navigating to:', targetNodeId);

                        try {
                            // Update store state first
                            setCurrentNode(targetNodeId);

                            // Pindah panorama menggunakan VirtualTourPlugin
                            virtualTour.setCurrentNode(targetNodeId);

                            // Update marker navigasi setelah delay yang lebih lama
                            setTimeout(() => {
                                console.log('Updating markers after navigation to:', targetNodeId);
                                forceUpdateMarkers(viewerRef.current, targetNodeId);
                            }, 1000);
                        } catch (error) {
                            console.error('Error navigating to node:', error);
                        }
                    }
                });
            }

            // Jika user pindah panorama lewat cara lain (misal: menu), update marker navigasi juga
            if (virtualTour) {
                virtualTour.addEventListener('node-changed', (e: any, node: any) => {
                    console.log('Node changed event triggered');
                    console.log('Node changed to:', node.id);

                    // Validate the nodeId before setting it
                    const validNodeId = validateNodeId(node.id);
                    console.log('Validated nodeId:', validNodeId);
                    setCurrentNode(validNodeId);

                    // Update marker navigasi dengan delay yang lebih lama
                    setTimeout(() => {
                        console.log('Updating markers after node-changed to:', validNodeId);
                        forceUpdateMarkers(viewerRef.current, validNodeId);
                    }, 1000);
                });
            }
        });

        // Tambahan: Event listener untuk memastikan marker diupdate setelah panorama selesai loading
        viewerRef.current.addEventListener('ready', () => {
            const virtualTour = viewerRef.current?.getPlugin(VirtualTourPlugin) as any;

            if (virtualTour) {
                // Listen untuk event panorama loaded
                virtualTour.addEventListener('panorama-loaded', (e: any) => {
                    console.log('Panorama loaded event triggered');
                    const currentVirtualNode = virtualTour.getCurrentNode();
                    if (currentVirtualNode) {
                        const nodeId = currentVirtualNode.id;
                        console.log('Panorama loaded for node:', nodeId);

                        // Update store state if different
                        if (nodeId !== validNodeId) {
                            setCurrentNode(nodeId);
                        }
                    }

                    setTimeout(() => {
                        console.log('Updating markers after panorama loaded');
                        forceUpdateMarkers(viewerRef.current, validNodeId);
                    }, 500);
                });

                // Tambahan: Event listener untuk panorama-changed (lebih reliable)
                virtualTour.addEventListener('panorama-changed', (e: any) => {
                    console.log('Panorama changed event triggered');
                    const currentVirtualNode = virtualTour.getCurrentNode();
                    if (currentVirtualNode) {
                        const nodeId = currentVirtualNode.id;
                        console.log('Current panorama changed to:', nodeId);

                        // Update store state
                        setCurrentNode(nodeId);

                        setTimeout(() => {
                            console.log('Updating markers after panorama-changed to:', nodeId);
                            forceUpdateMarkers(viewerRef.current, nodeId);
                        }, 300);
                    }
                });

                // Tambahan: Event listener untuk memastikan state selalu sinkron
                virtualTour.addEventListener('position-updated', (e: any) => {
                    const currentVirtualNode = virtualTour.getCurrentNode();
                    if (currentVirtualNode) {
                        const nodeId = currentVirtualNode.id;
                        // Update store state jika berbeda
                        if (nodeId !== currentNodeId) {
                            console.log('Position updated, syncing state to:', nodeId);
                            setCurrentNode(nodeId);
                        }
                    }
                });
            }
        });

        return () => {
            if (viewerRef.current) {
                try {
                    viewerRef.current.destroy();
                } catch (err) {
                    console.warn('Error destroying viewer in cleanup:', err);
                }
                viewerRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, []); // Empty dependency array for initial setup

    // Handle panorama navigation from external components
    useEffect(() => {
        if (!viewerRef.current || !isInitializedRef.current) {
            return;
        }

        const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
        if (virtualTour) {
            // Check if the node exists in the data
            const nodeExists = panoramas.some(node => node.id === currentNodeId);
            if (nodeExists) {
                console.log('=== EXTERNAL NAVIGATION ===');
                console.log('Navigating to node:', currentNodeId);

                // Get current node from virtual tour to avoid unnecessary navigation
                const currentVirtualNode = (virtualTour as any).getCurrentNode();
                console.log('Current virtual tour node:', currentVirtualNode);

                if (currentVirtualNode?.id !== currentNodeId) {
                    // Navigate to the selected panorama using the correct method
                    try {
                        console.log('Executing navigation to:', currentNodeId);
                        (virtualTour as any).setCurrentNode(currentNodeId);

                        // Update markers immediately after navigation
                        setTimeout(() => {
                            console.log('Updating markers after external navigation to:', currentNodeId);
                            forceUpdateMarkers(viewerRef.current, currentNodeId);
                        }, 500);
                    } catch (err) {
                        console.warn('Error navigating to node:', err);
                    }
                } else {
                    console.log('Already on target node, skipping navigation');
                    // Even if we're already on the target node, ensure markers are updated
                    setTimeout(() => {
                        console.log('Updating markers for current node:', currentNodeId);
                        forceUpdateMarkers(viewerRef.current, currentNodeId);
                    }, 100);
                }
            } else {
                console.warn('Node does not exist in panorama data:', currentNodeId);
            }
        }
    }, [currentNodeId, panoramas]); // Listen to currentNodeId changes

    // Additional effect to ensure markers are always updated when currentNodeId changes
    useEffect(() => {
        if (!viewerRef.current || !isInitializedRef.current) {
            return;
        }

        // Force update markers whenever currentNodeId changes
        const timeoutId = setTimeout(() => {
            console.log('Force updating markers for currentNodeId change:', currentNodeId);
            forceUpdateMarkers(viewerRef.current, currentNodeId);
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [currentNodeId]);

    // Effect to ensure state synchronization between viewer and store
    useEffect(() => {
        if (!viewerRef.current || !isInitializedRef.current) {
            return;
        }

        const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
        if (virtualTour) {
            const currentVirtualNode = (virtualTour as any).getCurrentNode();
            if (currentVirtualNode && currentVirtualNode.id !== currentNodeId) {
                console.log('Syncing viewer state with store state');
                console.log('Viewer node:', currentVirtualNode.id, 'Store node:', currentNodeId);

                // Update store to match viewer state
                setCurrentNode(currentVirtualNode.id);
            }
        }
    }, [currentNodeId, setCurrentNode]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative"
            style={{ width: '100%', height: '100%', position: 'relative' }}
        />
    );
};

export default PanoramaViewer;
