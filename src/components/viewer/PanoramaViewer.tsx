import React, { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useViewerStore } from '../../store/viewerStore';
import { useViewerSupabase } from '../../hooks/useViewerSupabase';
import { getPanoramaById } from '../../utils/dataManager';
import { getHotspotsForPanorama } from '../../services/migrationService';
import Loading from '../common/Loading';
import HotspotDisplay from './HotspotDisplay';

// Helper function to validate node ID
const validateNodeId = (nodeId: string, panoramas: any[]): string => {
    const validNode = panoramas.find(p => p.id === nodeId);
    if (validNode) {
        return nodeId;
    }
    // Return first panorama as default if invalid
    return panoramas.length > 0 ? panoramas[0].id : '';
};

// Helper: cari node by id
const getNodeById = (id: string, panoramas: any[]) => {
    return panoramas.find(p => p.id === id);
};

// Helper: hapus semua marker navigasi, lalu tambahkan marker navigasi baru sesuai hotspots dari database
const updateNavigationMarkers = async (viewer: any, nodeId: string, panoramas: any[]) => {
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

    // Get hotspots from database for this panorama
    const hotspots = await getHotspotsForPanorama(nodeId);
    console.log('Hotspots from database for node:', nodeId, 'count:', hotspots.length);

    if (hotspots.length === 0) {
        console.log('No hotspots found for node:', nodeId);
        return;
    }

    console.log('Adding navigation markers for hotspots:', hotspots.length);

    hotspots.forEach((hotspot: any, idx: number) => {
        console.log('Adding marker for navigation:', hotspot.target_node_id, 'at position:', { yaw: hotspot.position_yaw, pitch: hotspot.position_pitch });

        try {
            markersPlugin.addMarker({
                id: `nav-marker-${hotspot.target_node_id}`,
                image: '/icon/door-open.svg',
                tooltip: {
                    content: hotspot.title || `Pindah ke panorama ${hotspot.target_node_id}`,
                    position: 'top'
                },
                size: { width: 48, height: 48 },
                anchor: 'bottom center',
                position: { yaw: hotspot.position_yaw, pitch: hotspot.position_pitch },
                data: { targetNodeId: hotspot.target_node_id }
            });
        } catch (error) {
            console.warn('Error adding marker:', error);
        }
    });
};

// Helper: force update markers dengan retry mechanism
const forceUpdateMarkers = async (viewer: any, nodeId: string, panoramas: any[], retryCount = 0) => {
    if (retryCount >= 3) {
        console.warn('Max retry count reached for marker update');
        return;
    }

    try {
        await updateNavigationMarkers(viewer, nodeId, panoramas);
    } catch (error) {
        console.warn(`Error updating markers (attempt ${retryCount + 1}):`, error);
        setTimeout(() => {
            forceUpdateMarkers(viewer, nodeId, panoramas, retryCount + 1);
        }, 500 * (retryCount + 1));
    }
};

const PanoramaViewer: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const { currentNodeId, setCurrentNode } = useViewerStore();
    const { panoramas, loading, error, getPanoramaById } = useViewerSupabase();
    const isInitializedRef = useRef(false);

    // Set default panorama when data is loaded
    useEffect(() => {
        if (panoramas.length > 0 && !currentNodeId) {
            console.log('Setting default panorama to:', panoramas[0].id);
            setCurrentNode(panoramas[0].id);
        }
    }, [panoramas, currentNodeId, setCurrentNode]);

    // Initialize viewer effect - selalu dipanggil
    useEffect(() => {
        if (!containerRef.current || isInitializedRef.current || panoramas.length === 0) {
            return;
        }

        isInitializedRef.current = true;
        console.log('Initializing PanoramaViewer with currentNodeId:', currentNodeId);
        console.log('Available panoramas:', panoramas.length);

        // Convert panorama data to PSV format
        const nodes = panoramas.map((node: any) => ({
            id: node.id,
            panorama: node.panorama,
            thumbnail: node.thumbnail,
            name: node.name,
            caption: node.caption,
        }));

        // Use current node if it exists, otherwise use first panorama as default
        let validNodeId = currentNodeId;
        const currentNode = nodes.find(node => node.id === currentNodeId);
        if (!currentNode || !currentNodeId) {
            validNodeId = panoramas[0].id;
            console.log('Current node not found or empty, using first panorama as default:', validNodeId);
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
            setTimeout(async () => {
                await forceUpdateMarkers(viewerRef.current, validNodeId, panoramas);
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
                            setTimeout(async () => {
                                console.log('Updating markers after navigation to:', targetNodeId);
                                await forceUpdateMarkers(viewerRef.current, targetNodeId, panoramas);
                            }, 1000);
                        } catch (error) {
                            console.error('Error navigating to node:', error);
                        }
                    }
                });
            }

            // Jika user pindah panorama lewat cara lain (misal: menu), update marker navigasi juga
            if (virtualTour) {
                virtualTour.addEventListener('node-changed', async (e: any, node: any) => {
                    console.log('Node changed event triggered');
                    console.log('Node changed to:', node.id);

                    // Validate the nodeId before setting it
                    const validNodeId = validateNodeId(node.id, panoramas);
                    console.log('Validated nodeId:', validNodeId);
                    setCurrentNode(validNodeId);

                    // Update marker navigasi dengan delay yang lebih lama
                    setTimeout(async () => {
                        console.log('Updating markers after node-changed to:', validNodeId);
                        await forceUpdateMarkers(viewerRef.current, validNodeId, panoramas);
                    }, 1000);
                });
            }
        });

        // Tambahan: Event listener untuk memastikan marker diupdate setelah panorama selesai loading
        viewerRef.current.addEventListener('ready', () => {
            const virtualTour = viewerRef.current?.getPlugin(VirtualTourPlugin) as any;

            if (virtualTour) {
                // Listen untuk event panorama loaded
                virtualTour.addEventListener('panorama-loaded', async (e: any) => {
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

                    setTimeout(async () => {
                        console.log('Updating markers after panorama loaded');
                        await forceUpdateMarkers(viewerRef.current, validNodeId, panoramas);
                    }, 500);
                });

                // Tambahan: Event listener untuk panorama-changed (lebih reliable)
                virtualTour.addEventListener('panorama-changed', async (e: any) => {
                    console.log('Panorama changed event triggered');
                    const currentVirtualNode = virtualTour.getCurrentNode();
                    if (currentVirtualNode) {
                        const nodeId = currentVirtualNode.id;
                        console.log('Current panorama changed to:', nodeId);

                        // Update store state
                        setCurrentNode(nodeId);

                        setTimeout(async () => {
                            console.log('Updating markers after panorama-changed to:', nodeId);
                            await forceUpdateMarkers(viewerRef.current, nodeId, panoramas);
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
    }, [panoramas, currentNodeId, setCurrentNode]); // Add panoramas as dependency

    // Handle panorama navigation from external components
    useEffect(() => {
        if (!viewerRef.current || !isInitializedRef.current || panoramas.length === 0) {
            return;
        }

        const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
        if (virtualTour) {
            // Check if the node exists in the data
            const nodeExists = panoramas.some((node: any) => node.id === currentNodeId);
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
                        setTimeout(async () => {
                            console.log('Updating markers after external navigation to:', currentNodeId);
                            await forceUpdateMarkers(viewerRef.current, currentNodeId, panoramas);
                        }, 500);
                    } catch (err) {
                        console.warn('Error navigating to node:', err);
                    }
                } else {
                    console.log('Already on target node, skipping navigation');
                    // Even if we're already on the target node, ensure markers are updated
                    setTimeout(async () => {
                        console.log('Updating markers for current node:', currentNodeId);
                        await forceUpdateMarkers(viewerRef.current, currentNodeId, panoramas);
                    }, 100);
                }
            } else {
                console.warn('Node does not exist in panorama data:', currentNodeId);
            }
        }
    }, [currentNodeId, panoramas]); // Add panoramas as dependency

    // Additional effect to ensure markers are always updated when currentNodeId changes
    useEffect(() => {
        if (!viewerRef.current || !isInitializedRef.current || panoramas.length === 0) {
            return;
        }

        // Force update markers whenever currentNodeId changes
        const timeoutId = setTimeout(async () => {
            console.log('Force updating markers for currentNodeId change:', currentNodeId);
            await forceUpdateMarkers(viewerRef.current, currentNodeId, panoramas);
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [currentNodeId, panoramas]); // Add panoramas as dependency

    // Effect to ensure state synchronization between viewer and store
    useEffect(() => {
        if (!viewerRef.current || !isInitializedRef.current || panoramas.length === 0) {
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
    }, [currentNodeId, setCurrentNode, panoramas]); // Add panoramas as dependency

    // Render loading state
    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loading message="Memuat panorama dari Supabase..." />
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
                    <div className="text-gray-600">{error}</div>
                    <div className="text-sm text-gray-500 mt-2">
                        Mencoba memuat data dari file lokal...
                    </div>
                </div>
            </div>
        );
    }

    // Render empty state
    if (panoramas.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-600 text-lg font-semibold mb-2">Tidak ada panorama</div>
                    <div className="text-sm text-gray-500">
                        Belum ada data panorama di Supabase. Silakan tambah panorama melalui editor.
                    </div>
                </div>
            </div>
        );
    }

    // Render viewer
    return (
        <div className="w-full h-full relative">
            <div
                ref={containerRef}
                className="w-full h-full relative"
                style={{ width: '100%', height: '100%', position: 'relative' }}
            />
            {/* Hotspot Display Component */}
            {viewerRef.current && currentNodeId && (
                <HotspotDisplay viewer={viewerRef.current} />
            )}
        </div>
    );
};

export default PanoramaViewer;
