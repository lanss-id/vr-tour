import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useEditorStore } from '../../../../store/editorStore';
import { useViewerSupabase } from '../../../../hooks/useViewerSupabase';
import { 
    Eye, 
    MapPin, 
    Plus, 
    Trash2, 
    Settings,
    Play,
    Pause,
    RotateCcw,
    Maximize,
    Minimize,
    Palette,
    Type
} from 'lucide-react';
import Button from '../../../common/Button';

interface HotspotMarker {
    id: string;
    panoramaId: string;
    targetPanoramaId: string;
    position: { x: number; y: number };
    icon: string;
    size: number;
    color: string;
    label: string;
    isVisible: boolean;
}

const HotspotEditor: React.FC = () => {
    const { currentPanoramaId, hotspots, addHotspot, updateHotspot, deleteHotspot } = useEditorStore();
    const { panoramas } = useViewerSupabase();
    const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
    const [isViewerReady, setIsViewerReady] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const viewerRef = useRef<HTMLDivElement>(null);
    const psvRef = useRef<any>(null);

    // Drop zone for panoramas
    const [{ isOver }, drop] = useDrop({
        accept: 'PANORAMA',
        drop: (item: any) => {
            console.log('Dropped panorama as hotspot target:', item.panorama);
            // TODO: Add hotspot with target panorama
            const newHotspot: HotspotMarker = {
                id: `hotspot-${Date.now()}`,
                panoramaId: currentPanoramaId || '',
                targetPanoramaId: item.panorama.id,
                position: { x: 0, y: 0 },
                icon: 'map-pin',
                size: 40,
                color: '#3B82F6',
                label: item.panorama.name,
                isVisible: true
            };
            // This would be handled by the Photo Sphere Viewer markers plugin
            console.log('New hotspot:', newHotspot);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    // Initialize Photo Sphere Viewer
    useEffect(() => {
        if (viewerRef.current && currentPanoramaId) {
            const currentPanorama = panoramas.find(p => p.id === currentPanoramaId);
            if (currentPanorama) {
                initializeViewer(currentPanorama);
            }
        }
    }, [currentPanoramaId, panoramas]);

    const initializeViewer = async (panorama: any) => {
        try {
            // Dynamically import Photo Sphere Viewer
            const { Viewer } = await import('photo-sphere-viewer');
            const { MarkersPlugin } = await import('photo-sphere-viewer/dist/plugins/markers');
            const { VirtualTourPlugin } = await import('photo-sphere-viewer/dist/plugins/virtual-tour');

            if (psvRef.current) {
                psvRef.current.destroy();
            }

            psvRef.current = new Viewer({
                container: viewerRef.current!,
                panorama: panorama.panorama,
                plugins: [
                    [MarkersPlugin, {
                        markers: hotspots
                            .filter(h => h.panoramaId === currentPanoramaId)
                            .map(h => ({
                                id: h.id,
                                position: h.position,
                                html: `<div class="hotspot-marker" style="
                                    width: ${h.size}px; 
                                    height: ${h.size}px; 
                                    background-color: ${h.color};
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    font-size: 12px;
                                    cursor: pointer;
                                    border: 2px solid white;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                ">${h.label}</div>`,
                                tooltip: h.label,
                                data: h
                            }))
                    }],
                    VirtualTourPlugin
                ],
                navbar: [
                    'autorotate',
                    'zoom',
                    'move',
                    'fullscreen',
                    'caption',
                    'settings'
                ],
                defaultZoomLvl: 0,
                moveSpeed: 1.5
            });

            // Add event listeners
            psvRef.current.addEventListener('click', handleViewerClick);
            psvRef.current.addEventListener('marker-click', handleMarkerClick);

            setIsViewerReady(true);
        } catch (error) {
            console.error('Error initializing Photo Sphere Viewer:', error);
        }
    };

    const handleViewerClick = (event: any) => {
        if (event.data && event.data.rightclick) {
            // Right click to add hotspot
            const position = event.data.position;
            console.log('Right click position:', position);
            // TODO: Show hotspot creation modal
        }
    };

    const handleMarkerClick = (event: any) => {
        const marker = event.data;
        setSelectedHotspot(marker.data.id);
        console.log('Marker clicked:', marker.data);
    };

    const handleAddHotspot = () => {
        // TODO: Show hotspot creation modal
        console.log('Add hotspot clicked');
    };

    const handleDeleteHotspot = (hotspotId: string) => {
        deleteHotspot(hotspotId);
        setSelectedHotspot(null);
    };

    const toggleFullscreen = () => {
        if (psvRef.current) {
            if (isFullscreen) {
                psvRef.current.exitFullscreen();
            } else {
                psvRef.current.enterFullscreen();
            }
            setIsFullscreen(!isFullscreen);
        }
    };

    const toggleAutorotate = () => {
        if (psvRef.current) {
            if (isPlaying) {
                psvRef.current.stopAutorotate();
            } else {
                psvRef.current.startAutorotate();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const resetView = () => {
        if (psvRef.current) {
            psvRef.current.reset();
        }
    };

    const currentPanorama = panoramas.find(p => p.id === currentPanoramaId);

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddHotspot}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Hotspot
                    </Button>
                    
                    {currentPanorama && (
                        <div className="flex items-center space-x-2 ml-4">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {currentPanorama.name}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleAutorotate}
                        className={isPlaying ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetView}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Viewer Container */}
            <div 
                ref={drop}
                className="flex-1 relative bg-black"
            >
                <div
                    ref={viewerRef}
                    className="w-full h-full"
                />

                {/* Drop Zone Overlay */}
                {isOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-75 z-10">
                        <div className="text-center">
                            <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                            <p className="text-blue-700 font-medium">
                                Drop panorama here to create hotspot
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!currentPanorama && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No Panorama Selected
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Select a panorama from the left sidebar to start editing hotspots
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {currentPanorama && !isViewerReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <p>Loading panorama...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Hotspot Properties (when selected) */}
            {selectedHotspot && (
                <div className="bg-white border-t border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Hotspot Properties</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHotspot(selectedHotspot)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Size</label>
                            <input
                                type="range"
                                min="20"
                                max="80"
                                value={hotspots.find(h => h.id === selectedHotspot)?.size || 40}
                                onChange={(e) => {
                                    const hotspot = hotspots.find(h => h.id === selectedHotspot);
                                    if (hotspot) {
                                        updateHotspot(selectedHotspot, {
                                            ...hotspot,
                                            size: parseInt(e.target.value)
                                        });
                                    }
                                }}
                                className="w-full"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Color</label>
                            <div className="flex space-x-2">
                                {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                                    <button
                                        key={color}
                                        className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-400"
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            const hotspot = hotspots.find(h => h.id === selectedHotspot);
                                            if (hotspot) {
                                                updateHotspot(selectedHotspot, {
                                                    ...hotspot,
                                                    color
                                                });
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Label</label>
                            <input
                                type="text"
                                value={hotspots.find(h => h.id === selectedHotspot)?.label || ''}
                                onChange={(e) => {
                                    const hotspot = hotspots.find(h => h.id === selectedHotspot);
                                    if (hotspot) {
                                        updateHotspot(selectedHotspot, {
                                            ...hotspot,
                                            label: e.target.value
                                        });
                                    }
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md text-xs"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotspotEditor; 