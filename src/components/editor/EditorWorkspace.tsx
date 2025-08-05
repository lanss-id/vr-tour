import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useEditor } from '../../hooks/useEditor';
import { useEditorStore } from '../../store/editorStore';
import { useDataManager, getPanoramaById, getLinksForPanorama, loadImageWithCache } from '../../utils/dataManager';
import ErrorBoundary from '../common/ErrorBoundary';

const EditorWorkspace: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const isInitializedRef = useRef(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const {
        currentPanoramaId,
        selectedHotspotId,
        setCurrentPanorama,
        setSelectedHotspot,
        setViewerRef,
        getHotspotsForPanorama,
        updateHotspotPosition,
        addHotspotAtCenter,
    } = useEditor();

    // Editor state
    const [editMode, setEditMode] = useState<'panorama' | 'hotspot' | 'minimap' | 'gallery' | 'navigation'>('hotspot');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const selectedPanorama = currentPanoramaId;
    const selectedHotspot = selectedHotspotId;

    const { setCurrentPanorama: setDataManagerPanorama } = useDataManager();
    const { hotspots, addHotspot, updateHotspot, deleteHotspot } = useEditorStore();
    const { panoramas } = useDataManager();

    const [isDraggingHotspot, setIsDraggingHotspot] = useState(false);
    const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
    const [error, setError] = useState<string | null>(null);

    // Function to refresh viewer markers
    const refreshViewerMarkers = useCallback(() => {
        if (!viewerRef.current || !isInitializedRef.current) return;

        try {
            const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin) as any;
            if (!markersPlugin) return;

            // Clear existing markers
            markersPlugin.clearMarkers();

            // Get current panorama data from data manager
            const currentPanoramaId = selectedPanorama || 'kawasan-1';
            const currentLinks = getLinksForPanorama(currentPanoramaId);

            // Add navigation markers from data manager
            currentLinks.forEach((link, index) => {
                // Validate position
                let position = { yaw: 0, pitch: 0 };
                if (link.position) {
                    if ('textureX' in link.position && 'textureY' in link.position) {
                        // Convert texture coordinates to spherical
                        const textureX = (link.position as any).textureX;
                        const textureY = (link.position as any).textureY;
                        position = {
                            yaw: (textureX / 4096) * 2 * Math.PI - Math.PI,
                            pitch: (textureY / 2048) * Math.PI - Math.PI / 2
                        };
                    } else if ('yaw' in link.position && 'pitch' in link.position) {
                        position = link.position as any;
                    }
                }

                try {
                    const markerConfig: any = {
                        id: `nav-marker-${link.nodeId}`,
                        image: '/icon/door-open.svg', // Use icon from public/icon
                        tooltip: {
                            content: `Navigate to ${getPanoramaById(link.nodeId)?.name || link.nodeId}`,
                            position: 'top'
                        },
                        size: { width: 48, height: 48 },
                        anchor: 'bottom center',
                        position: position,
                        data: {
                            targetNodeId: link.nodeId,
                            isNavigationMarker: true
                        }
                    };

                    markersPlugin.addMarker(markerConfig);
                } catch (error) {
                    console.warn('Error adding navigation marker:', error);
                }
            });

            // Add editor hotspots (from store + converted from markers)
            const currentHotspots = hotspots.filter(h => h.panoramaId === selectedPanorama);
            currentHotspots.forEach(hotspot => {
                if (!hotspot.isVisible) return;

                // Validate position
                let position = { yaw: 0, pitch: 0 };
                if (hotspot.position) {
                    if ('textureX' in hotspot.position && 'textureY' in hotspot.position) {
                        // Convert texture coordinates to spherical
                        const textureX = (hotspot.position as any).textureX;
                        const textureY = (hotspot.position as any).textureY;
                        position = {
                            yaw: (textureX / 4096) * 2 * Math.PI - Math.PI,
                            pitch: (textureY / 2048) * Math.PI - Math.PI / 2
                        };
                    } else if ('yaw' in hotspot.position && 'pitch' in hotspot.position) {
                        position = hotspot.position as any;
                    }
                }

                try {
                    const markerConfig: any = {
                        id: hotspot.id,
                        image: hotspot.style?.icon || (hotspot.type === 'link' ? '/icon/door-open.svg' : '/icon/chevrons-up.svg'),
                        tooltip: {
                            content: hotspot.title,
                            position: 'top'
                        },
                        size: { width: hotspot.style?.size || 32, height: hotspot.style?.size || 32 },
                        anchor: 'bottom center',
                        position: position,
                        data: {
                            hotspotId: hotspot.id,
                            isHotspot: true,
                            type: hotspot.type,
                            targetNodeId: hotspot.targetNodeId,
                        },
                    };

                    markersPlugin.addMarker(markerConfig);
                } catch (error) {
                    console.warn('Error adding hotspot marker:', error);
                }
            });

            console.log('Viewer markers refreshed');
        } catch (error) {
            console.error('Error refreshing viewer markers:', error);
        }
    }, [selectedPanorama, selectedHotspot, hotspots]);

    // Auto-refresh viewer when hotspots change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            refreshViewerMarkers();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [refreshViewerMarkers, refreshTrigger]);

    // Initialize viewer
    useEffect(() => {
        if (!containerRef.current || isInitializedRef.current) {
            return;
        }

        try {
            isInitializedRef.current = true;

            // Convert panorama data to PSV format from data manager
            const nodes = panoramas.map((node: any) => ({
                id: node.id,
                panorama: node.panorama,
                thumbnail: node.thumbnail,
                name: node.name,
                caption: node.caption,
            }));

            // Use selected panorama or default to 'kawasan-1'
            let validNodeId = selectedPanorama || 'kawasan-1';
            if (!nodes.find((node: any) => node.id === validNodeId)) {
                validNodeId = 'kawasan-1';
            }

            // Initialize viewer with hidden navbar for editor
            viewerRef.current = new Viewer({
                container: containerRef.current,
                defaultYaw: '0deg',
                navbar: false, // Hide PSV navbar in editor
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

            // Set viewer reference for editor hook
            setViewerRef(viewerRef.current);

            // Listen for node changes
            const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
            if (virtualTour) {
                virtualTour.addEventListener('node-changed', (e: any) => {
                    if (e.data && e.data.nodeId) {
                        setDataManagerPanorama(e.data.nodeId);
                    }
                });
            }

            // Initial marker refresh
            setTimeout(() => {
                refreshViewerMarkers();
            }, 1000);
        } catch (error) {
            console.error('Error initializing viewer:', error);
            setError('Failed to initialize viewer');
        }

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
    }, [panoramas]);

    // Handle panorama navigation from editor
    useEffect(() => {
        if (!viewerRef.current || !isInitializedRef.current || !selectedPanorama) {
            return;
        }

        try {
            const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
            if (virtualTour) {
                const nodeExists = panoramas.some((node: any) => node.id === selectedPanorama);
                if (nodeExists) {
                    (virtualTour as any).setCurrentNode(selectedPanorama);

                    // Refresh markers after navigation
                    setTimeout(() => {
                        refreshViewerMarkers();
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error navigating to panorama:', error);
        }
    }, [selectedPanorama, refreshViewerMarkers, panoramas]);

    // Handle hotspot display and editing
    useEffect(() => {
        if (!viewerRef.current || !isInitializedRef.current) {
            return;
        }

        try {
            // Add click handler for hotspot selection in editor
            const handleMarkerClick = (e: any) => {
                const markerData = e.data.marker.data;

                if (markerData?.isHotspot) {
                    // Select hotspot in editor
                    setSelectedHotspot(markerData.hotspotId);
                    console.log('Hotspot selected in editor:', markerData.hotspotId);
                } else if (markerData?.isNavigationMarker) {
                    // Navigate to target panorama
                    const targetNodeId = markerData.targetNodeId;
                    if (targetNodeId) {
                        setDataManagerPanorama(targetNodeId);
                        console.log('Navigating to:', targetNodeId);
                    }
                }
            };

            // Add double-click handler for hotspot deletion
            const handleMarkerDoubleClick = (e: any) => {
                const markerData = e.data.marker.data;

                if (markerData?.isHotspot) {
                    if (confirm('Delete this hotspot?')) {
                        // Remove link from data manager if it's a link hotspot
                        const hotspot = hotspots.find(h => h.id === markerData.hotspotId);
                        if (hotspot && hotspot.type === 'link' && hotspot.targetNodeId) {
                            useDataManager.getState().deleteLink(hotspot.panoramaId, hotspot.targetNodeId);
                        }

                        deleteHotspot(markerData.hotspotId);

                        // Refresh viewer
                        setRefreshTrigger(prev => prev + 1);
                    }
                }
            };

            const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin) as any;
            if (markersPlugin) {
                markersPlugin.addEventListener('click-marker', handleMarkerClick);
                markersPlugin.addEventListener('dblclick-marker', handleMarkerDoubleClick);

                return () => {
                    try {
                        markersPlugin.removeEventListener('click-marker', handleMarkerClick);
                        markersPlugin.removeEventListener('dblclick-marker', handleMarkerDoubleClick);
                    } catch (error) {
                        console.warn('Error removing event listeners:', error);
                    }
                };
            }
        } catch (error) {
            console.error('Error handling hotspots:', error);
            setError('Failed to handle hotspots');
        }
    }, [deleteHotspot, hotspots, setSelectedHotspot, setDataManagerPanorama]);

    // Handle viewer click to add new hotspots
    useEffect(() => {
        if (!viewerRef.current || editMode !== 'hotspot') {
            return;
        }

        try {
            const handleViewerClick = (e: any) => {
                if (e.data.rightclick) return; // Ignore right clicks

                const position = { yaw: e.data.yaw, pitch: e.data.pitch };

                // Ensure we have a selected panorama
                if (!selectedPanorama) {
                    console.warn('No panorama selected, cannot add hotspot');
                    return;
                }

                // Create new hotspot
                const newHotspot = {
                    id: `hotspot-${Date.now()}`,
                    panoramaId: selectedPanorama, // Use selected panorama ID
                    position: position,
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

                console.log('Adding new hotspot:', newHotspot);
                addHotspot(newHotspot);

                // Refresh viewer
                setRefreshTrigger(prev => prev + 1);
            };

            viewerRef.current.addEventListener('click', handleViewerClick);

            return () => {
                if (viewerRef.current) {
                    try {
                        viewerRef.current.removeEventListener('click', handleViewerClick);
                    } catch (error) {
                        console.warn('Error removing click listener:', error);
                    }
                }
            };
        } catch (error) {
            console.error('Error setting up click handler:', error);
        }
    }, [editMode, selectedPanorama, addHotspot]);

    // Handle mouse events for hotspot dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if (editMode !== 'hotspot' || !selectedHotspot) return;

        const target = e.target as HTMLElement;
        if (target.closest('.hotspot-marker-editor')) {
            setIsDraggingHotspot(true);
            setDragStartPosition({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingHotspot || !viewerRef.current || !selectedHotspot) return;

        try {
            const deltaX = e.clientX - dragStartPosition.x;
            const deltaY = e.clientY - dragStartPosition.y;

            // Convert screen coordinates to spherical coordinates
            const viewer = viewerRef.current;
            const position = viewer.getPosition();

            // Simple conversion (can be improved)
            const newYaw = position.yaw + (deltaX * 0.5);
            const newPitch = Math.max(-90, Math.min(90, position.pitch - (deltaY * 0.5)));

            const newPosition = { yaw: newYaw, pitch: newPitch };
            updateHotspotPosition(selectedHotspot, newPosition);

            // Update link position in data manager if this is a link hotspot
            const hotspot = hotspots.find(h => h.id === selectedHotspot);
            if (hotspot && hotspot.type === 'link' && hotspot.targetNodeId) {
                useDataManager.getState().updateLink(hotspot.panoramaId, hotspot.targetNodeId, {
                    position: newPosition
                });
            }

            // Refresh viewer
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error updating hotspot position:', error);
        }
    };

    const handleMouseUp = () => {
        setIsDraggingHotspot(false);
    };

    // Add global mouse event listeners
    useEffect(() => {
        if (editMode === 'hotspot') {
            document.addEventListener('mousemove', handleMouseMove as any);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove as any);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [editMode, isDraggingHotspot, selectedHotspot]);

    // Show error if any
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                <div className="flex items-center space-x-2">
                    <div className="text-red-600">⚠️</div>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
                <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                    Dismiss
                </button>
            </div>
        );
    }

    return (
        <ErrorBoundary key="editor-workspace-error-boundary">
            <div className="relative w-full h-full">
                {/* Main Viewer Container */}
                <div
                    ref={containerRef}
                    className="w-full h-full relative"
                    onMouseDown={handleMouseDown}
                    style={{ cursor: editMode === 'hotspot' ? 'crosshair' : 'default' }}
                />

                {/* Editor Overlay */}
                {!isPreviewMode && (
                    <div className="absolute top-4 left-4 z-10">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                            <div className="text-sm font-medium text-gray-800 mb-2">
                                Editor Mode: {editMode}
                            </div>
                            {editMode === 'hotspot' && (
                                <div className="text-xs text-gray-600">
                                    Click to add hotspot • Drag to move • Double-click to delete
                                </div>
                            )}
                            {editMode === 'minimap' && (
                                <div className="text-xs text-gray-600">
                                    Drag markers to reposition • Click to select
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Minimap Editor Overlay */}
                {editMode === 'minimap' && !isPreviewMode && (
                    <div className="absolute bottom-4 left-4 z-10">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 w-64 h-48 shadow-lg">
                            <div className="text-sm font-medium text-gray-800 mb-2">Minimap Editor</div>
                            <div className="relative w-full h-full">
                                <img
                                    src="/minimap/sideplan.jpeg"
                                    alt="Site Plan"
                                    className="w-full h-full object-cover rounded"
                                />
                                {panoramas.map((node: any, index: number) => (
                                    <button
                                        key={node.id}
                                        className="absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 shadow-md cursor-move"
                                        style={{
                                            left: `${20 + (index * 15) % 60}%`,
                                            top: `${20 + Math.floor(index / 3) * 20}%`
                                        }}
                                        title={node.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions Overlay */}
                {editMode === 'hotspot' && !isPreviewMode && (
                    <div className="absolute bottom-4 right-4 z-10">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
                            <div className="text-sm font-medium text-gray-800 mb-2">Nav-Marker Editor</div>
                            <div className="text-xs text-gray-600 space-y-1">
                                <div>• Click anywhere to add a new nav-marker</div>
                                <div>• Drag existing markers to reposition</div>
                                <div>• Double-click marker to delete</div>
                                <div>• Select markers in the sidebar to edit properties</div>
                                <div>• Markers are automatically saved and visible in viewer</div>
                                <div>• Use "Navigation Link" type to create navigation links</div>
                                <div>• Links are automatically added to data manager</div>
                                <div>• Real-time updates in both editor and viewer</div>
                                {!selectedPanorama && (
                                    <div className="text-red-600 font-medium">
                                        ⚠️ Select a panorama first to add nav-markers
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Refresh Button */}
                {!isPreviewMode && (
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={() => setRefreshTrigger(prev => prev + 1)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg transition-colors"
                            title="Refresh viewer markers"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default EditorWorkspace;
