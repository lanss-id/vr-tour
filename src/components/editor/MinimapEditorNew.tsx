import React, { useState, useRef } from 'react';
import { Map, Upload, Trash2, Save } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useViewerSupabase } from '../../hooks/useViewerSupabase';
import { useMinimap } from '../../hooks/useMinimap';
import { MinimapMarker, MinimapPanorama } from '../../types/panorama';
import Button from '../common/Button';

const MinimapEditorNew: React.FC = () => {
    const { 
        minimapData, 
        updateMinimapData, 
        addMinimapMarker, 
        updateMinimapMarker, 
        deleteMinimapMarker,
        addPanoramaToMinimap
    } = useEditorStore();
    const { panoramas, loading: panoramasLoading, error: supabaseError } = useViewerSupabase();
    const { 
        createMinimap,
        updateMinimap,
        uploadBackgroundImage,
        setCurrentMinimap
    } = useMinimap();

    const [isDragging, setIsDragging] = useState(false);
    const [draggedMarker, setDraggedMarker] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
    const [selectedPanorama, setSelectedPanorama] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const minimapRef = useRef<HTMLDivElement>(null);

    const markers = minimapData?.markers || [];
    const minimapPanoramas = minimapData?.panoramas || [];

    // Handle panorama drop
    const handlePanoramaDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const panoramaId = event.dataTransfer.getData('text/plain');
        const panorama = panoramas.find(p => p.id === panoramaId);
        
        if (panorama && minimapRef.current) {
            const rect = minimapRef.current.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            
            addPanoramaToMinimap(panoramaId, x, y);
            console.log('Panorama dropped:', panoramaId, 'at', x, y);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const imageUrl = await uploadBackgroundImage(file);
                updateMinimapData({ backgroundImage: imageUrl });
                console.log('Image uploaded successfully:', imageUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Error uploading image: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
        }
    };

    const handleSaveToDatabase = async () => {
        try {
            setIsSaving(true);
            console.log('Saving floorplan to database...');
            
            const minimapDataToSave = {
                name: 'Floorplan',
                background_image_url: minimapData?.backgroundImage || '',
                markers: markers.map(marker => ({
                    id: marker.id,
                    node_id: marker.nodeId,
                    x: marker.x,
                    y: marker.y,
                    label: marker.label,
                    type: 'custom' as const
                })),
                settings: {
                    width: 800,
                    height: 600,
                    scale: 1,
                    show_labels: true,
                    show_connections: true
                }
            };
            
            alert('Floorplan saved successfully! (Database integration pending)');
        } catch (error) {
            console.error('Error saving floorplan:', error);
            alert('Error saving floorplan: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleMinimapClick = (event: React.MouseEvent) => {
        if (!minimapRef.current) return;

        const rect = minimapRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        const newMarker: MinimapMarker = {
            id: `marker-${Date.now()}`,
            nodeId: 'new-panorama',
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
            label: 'New Marker',
        };

        addMinimapMarker(newMarker);
        setSelectedMarker(newMarker.id);
    };

    const handleMarkerMouseDown = (event: React.MouseEvent, markerId: string) => {
        event.stopPropagation();
        setIsDragging(true);
        setDraggedMarker(markerId);
        setSelectedMarker(markerId);

        const rect = minimapRef.current?.getBoundingClientRect();
        if (rect) {
            const marker = markers.find(m => m.id === markerId);
            if (marker) {
                const markerX = (marker.x / 100) * rect.width;
                const markerY = (marker.y / 100) * rect.height;
                setDragOffset({
                    x: event.clientX - markerX,
                    y: event.clientY - markerY,
                });
            }
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!isDragging || !draggedMarker || !minimapRef.current) return;

        const rect = minimapRef.current.getBoundingClientRect();
        const x = ((event.clientX - dragOffset.x - rect.left) / rect.width) * 100;
        const y = ((event.clientY - dragOffset.y - rect.top) / rect.height) * 100;

        updateMinimapMarker(draggedMarker, {
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDraggedMarker(null);
    };

    const handleMarkerDelete = (markerId: string) => {
        deleteMinimapMarker(markerId);
        if (selectedMarker === markerId) {
            setSelectedMarker(null);
        }
    };

    const selectedMarkerData = markers.find(m => m.id === selectedMarker);
    const selectedPanoramaData = minimapPanoramas.find(p => p.id === selectedPanorama);

    if (panoramasLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                <div className="text-center py-8">
                    <div className="text-gray-600 text-lg font-semibold mb-2">Memuat data...</div>
                    <div className="text-sm text-gray-500">Mengambil data panorama dari Supabase</div>
                </div>
            </div>
        );
    }

    if (supabaseError) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                <div className="text-center py-8">
                    <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
                    <div className="text-gray-600">{supabaseError}</div>
                    <div className="text-sm text-gray-500 mt-2">
                        Tidak dapat memuat data panorama dari Supabase
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Map className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-800">Floorplan Editor</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Button
                        onClick={handleSaveToDatabase}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Save className="w-4 h-4 mr-1" />
                        {isSaving ? 'Saving...' : 'Save Floorplan'}
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="minimap-upload"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => document.getElementById('minimap-upload')?.click()}
                            title="Upload floorplan image"
                        >
                            <Upload className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Panorama Info */}
            <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm font-medium text-green-800 mb-1">Data Panorama dari Supabase</div>
                <div className="text-xs text-green-600">
                    Total panorama: {panoramas.length} | Markers: {markers.length} | Dropped Panoramas: {minimapPanoramas.length}
                </div>
            </div>

            {/* Minimap Canvas */}
            <div className="relative">
                <div
                    ref={minimapRef}
                    className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
                    onClick={handleMinimapClick}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onDrop={handlePanoramaDrop}
                    onDragOver={handleDragOver}
                >
                    {minimapData?.backgroundImage && (
                        <img
                            src={minimapData.backgroundImage}
                            alt="Floorplan"
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Dropped Panoramas */}
                    {minimapPanoramas.map(panorama => {
                        const panoramaData = panoramas.find(p => p.id === panorama.id);
                        return (
                            <div
                                key={panorama.id}
                                className={`absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${selectedPanorama === panorama.id
                                        ? 'bg-purple-500 ring-2 ring-purple-200 shadow-lg'
                                        : 'bg-purple-500 hover:bg-purple-600 shadow-md'
                                    }`}
                                style={{
                                    left: `${panorama.x}%`,
                                    top: `${panorama.y}%`,
                                    zIndex: selectedPanorama === panorama.id ? 10 : 5,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPanorama(panorama.id);
                                    setSelectedMarker(null);
                                }}
                                title={panoramaData?.name || panorama.id}
                            />
                        );
                    })}

                    {/* Editor Markers */}
                    {markers.map(marker => (
                        <div
                            key={marker.id}
                            className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-move transition-all duration-200 ${selectedMarker === marker.id
                                    ? 'bg-red-500 ring-2 ring-red-200 shadow-lg'
                                    : 'bg-blue-500 hover:bg-blue-600 shadow-md'
                                }`}
                            style={{
                                left: `${marker.x}%`,
                                top: `${marker.y}%`,
                                zIndex: selectedMarker === marker.id ? 10 : 5,
                            }}
                            onMouseDown={(e) => handleMarkerMouseDown(e, marker.id)}
                            title={marker.label}
                        >
                            {selectedMarker === marker.id && (
                                <div className="absolute -top-6 -right-6">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkerDelete(marker.id);
                                        }}
                                        className="p-1 bg-red-500 text-white hover:bg-red-600 rounded-full"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Instructions */}
                <div className="mt-2 text-xs text-gray-500">
                    <p>• Klik untuk menambah marker baru</p>
                    <p>• Drag marker untuk memindahkan posisi</p>
                    <p>• Biru = marker editor, Ungu = panorama yang di-drop</p>
                    <p>• Drag panorama dari panel kiri ke minimap untuk menambahkannya</p>
                    <p>• Klik "Save Floorplan" untuk menyimpan ke database</p>
                </div>
            </div>

            {/* Marker Editor Panel */}
            {selectedMarkerData && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Edit Marker</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Label
                            </label>
                            <input
                                type="text"
                                value={selectedMarkerData.label}
                                onChange={(e) => updateMinimapMarker(selectedMarker, { label: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Node ID
                            </label>
                            <input
                                type="text"
                                value={selectedMarkerData.nodeId}
                                onChange={(e) => updateMinimapMarker(selectedMarker, { nodeId: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    X Position (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={selectedMarkerData.x}
                                    onChange={(e) => updateMinimapMarker(selectedMarker, { x: parseFloat(e.target.value) })}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Y Position (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={selectedMarkerData.y}
                                    onChange={(e) => updateMinimapMarker(selectedMarker, { y: parseFloat(e.target.value) })}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Panorama Editor Panel */}
            {selectedPanoramaData && (
                <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-medium text-purple-800 mb-3">Edit Panorama Position</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">
                                Panorama ID
                            </label>
                            <input
                                type="text"
                                value={selectedPanoramaData.id}
                                disabled
                                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-1">
                                    X Position (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={selectedPanoramaData.x}
                                    onChange={(e) => {
                                        const updatedPanoramas = minimapPanoramas.map(p => 
                                            p.id === selectedPanoramaData.id 
                                                ? { ...p, x: parseFloat(e.target.value) }
                                                : p
                                        );
                                        updateMinimapData({ panoramas: updatedPanoramas });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-1">
                                    Y Position (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={selectedPanoramaData.y}
                                    onChange={(e) => {
                                        const updatedPanoramas = minimapPanoramas.map(p => 
                                            p.id === selectedPanoramaData.id 
                                                ? { ...p, y: parseFloat(e.target.value) }
                                                : p
                                        );
                                        updateMinimapData({ panoramas: updatedPanoramas });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinimapEditorNew; 