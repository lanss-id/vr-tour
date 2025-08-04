import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useEditor } from '../../hooks/useEditor';
import { useEditorStore } from '../../store/editorStore';
import { useViewerStore } from '../../store/viewerStore';
import panoramaData from '../../data/panorama-data.json';

const EditorWorkspace: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const isInitializedRef = useRef(false);

    const {
        editMode,
        selectedPanorama,
        selectedHotspot,
        isPreviewMode,
        setViewerRef,
        getHotspotsForPanorama,
        updateHotspotPosition,
    } = useEditor();

    const { setCurrentNode } = useViewerStore();
    const { panoramas, hotspots, minimapData } = useEditorStore();

    const [isDraggingHotspot, setIsDraggingHotspot] = useState(false);
    const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });

    // Initialize viewer
    useEffect(() => {
        if (!containerRef.current || isInitializedRef.current) {
            return;
        }

        isInitializedRef.current = true;

        // Convert panorama data to PSV format
        const nodes = panoramas.map(node => ({
            ...node,
            gps: node.gps as [number, number]
        }));

        // Use first available node if no panorama is selected
        let validNodeId = selectedPanorama || nodes[0]?.id || 'kawasan-1';
        if (!nodes.find(node => node.id === validNodeId)) {
            validNodeId = nodes[0]?.id || 'kawasan-1';
        }

        // Initialize viewer with hidden navbar for editor
        viewerRef.current = new Viewer({
            container: containerRef.current,
            defaultYaw: '0deg',
            navbar: false, // Hide PSV navbar in editor
            plugins: [
                MarkersPlugin,
                GalleryPlugin.withConfig({
                    thumbnailSize: { width: 100, height: 100 },
                }),
                VirtualTourPlugin.withConfig({
                    positionMode: 'gps',
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
            virtualTour.addEventListener('node-changed', (e) => {
                setCurrentNode(e.data.nodeId);
            });
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
    }, []);

    // Handle panorama navigation from editor
    useEffect(() => {
        if (!viewerRef.current || !isInitializedRef.current || !selectedPanorama) {
            return;
        }

        const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
        if (virtualTour) {
            const nodeExists = panoramas.some(node => node.id === selectedPanorama);
            if (nodeExists) {
                try {
                    (virtualTour as any).setCurrentNode(selectedPanorama);
                } catch (err) {
                    console.warn('Error navigating to node:', err);
                }
            }
        }
    }, [selectedPanorama, panoramas]);

    // Handle hotspot editing
    useEffect(() => {
        if (!viewerRef.current || editMode !== 'hotspot') {
            return;
        }

        const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin);
        if (!markersPlugin) return;

        // Clear existing markers
        markersPlugin.clearMarkers();

        // Add hotspots as markers for editing
        const currentHotspots = getHotspotsForPanorama(selectedPanorama || '');
        currentHotspots.forEach(hotspot => {
            markersPlugin.addMarker({
                id: hotspot.id,
                position: hotspot.position,
                html: `
          <div class="hotspot-marker ${selectedHotspot === hotspot.id ? 'selected' : ''}"
               data-hotspot-id="${hotspot.id}"
               style="
                 width: 20px;
                 height: 20px;
                 background-color: ${selectedHotspot === hotspot.id ? '#ef4444' : '#3b82f6'};
                 border: 2px solid white;
                 border-radius: 50%;
                 cursor: pointer;
                 box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                 transition: all 0.2s ease;
               "
          >
            ${selectedHotspot === hotspot.id ? '✓' : ''}
          </div>
        `,
                tooltip: hotspot.title,
            });
        });

        // Add click handler for hotspot selection
        const handleMarkerClick = (e: any) => {
            const hotspotId = e.data.marker.id;
            // Handle hotspot selection
            console.log('Hotspot clicked:', hotspotId);
        };

        markersPlugin.addEventListener('click-marker', handleMarkerClick);

        return () => {
            markersPlugin.removeEventListener('click-marker', handleMarkerClick);
        };
    }, [editMode, selectedPanorama, selectedHotspot, getHotspotsForPanorama]);

    // Handle mouse events for hotspot dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if (editMode !== 'hotspot' || !selectedHotspot) return;

        const target = e.target as HTMLElement;
        if (target.closest('.hotspot-marker')) {
            setIsDraggingHotspot(true);
            setDragStartPosition({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingHotspot || !viewerRef.current || !selectedHotspot) return;

        const deltaX = e.clientX - dragStartPosition.x;
        const deltaY = e.clientY - dragStartPosition.y;

        // Convert screen coordinates to spherical coordinates
        const viewer = viewerRef.current;
        const position = viewer.getPosition();

        // Simple conversion (can be improved)
        const newYaw = position.yaw + (deltaX * 0.5);
        const newPitch = Math.max(-90, Math.min(90, position.pitch - (deltaY * 0.5)));

        updateHotspotPosition(selectedHotspot, { yaw: newYaw, pitch: newPitch });
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

    return (
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
                                Click to add hotspot • Drag to move • Delete to remove
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
                                src={minimapData.backgroundImage}
                                alt="Site Plan"
                                className="w-full h-full object-cover rounded"
                            />
                            {minimapData.markers.map(marker => (
                                <button
                                    key={marker.id}
                                    className="absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 shadow-md cursor-move"
                                    style={{
                                        left: `${marker.x}%`,
                                        top: `${marker.y}%`
                                    }}
                                    title={marker.label}
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
                        <div className="text-sm font-medium text-gray-800 mb-2">Hotspot Editor</div>
                        <div className="text-xs text-gray-600 space-y-1">
                            <div>• Click anywhere to add a new hotspot</div>
                            <div>• Drag existing hotspots to reposition</div>
                            <div>• Select hotspots in the sidebar to edit properties</div>
                            <div>• Press Delete to remove selected hotspot</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorWorkspace;
