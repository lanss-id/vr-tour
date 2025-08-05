import React, { useState, useRef } from 'react';
import { Map, Upload, Trash2, Plus, Settings } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useViewerSupabase } from '../../hooks/useViewerSupabase';
import { MinimapMarker } from '../../types/panorama';
import Button from '../common/Button';

const MinimapEditor: React.FC = () => {
    const { minimapData, updateMinimapData, addMinimapMarker, updateMinimapMarker, deleteMinimapMarker } = useEditorStore();
    const { panoramas, loading, error: supabaseError } = useViewerSupabase();

    const [isDragging, setIsDragging] = useState(false);
    const [draggedMarker, setDraggedMarker] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

    const minimapRef = useRef<HTMLDivElement>(null);

    // Ensure minimapData.markers exists
    const markers = minimapData?.markers || [];

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            updateMinimapData({ backgroundImage: url });
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

    // Show loading state
    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                <div className="text-center py-8">
                    <div className="text-gray-600 text-lg font-semibold mb-2">Memuat data...</div>
                    <div className="text-sm text-gray-500">Mengambil data panorama dari Supabase</div>
                </div>
            </div>
        );
    }

    // Show error state
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
                    <span className="font-medium text-gray-800">Minimap Editor</span>
                </div>
                <div className="flex items-center space-x-1">
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
                            title="Upload minimap image"
                        >
                            <Upload className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* Open settings */ }}
                        title="Minimap settings"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Panorama Info */}
            <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-800 mb-1">Data Panorama dari Supabase</div>
                <div className="text-xs text-blue-600">
                    Total panorama: {panoramas.length} | Markers: {markers.length}
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
                >
                    {minimapData?.backgroundImage && (
                        <img
                            src={minimapData.backgroundImage}
                            alt="Site Plan"
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Panorama Markers */}
                    {panoramas.map((panorama, index) => (
                        <div
                            key={panorama.id}
                            className="absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 bg-green-500 hover:bg-green-600 shadow-md"
                            style={{
                                left: `${20 + (index * 15) % 60}%`,
                                top: `${20 + Math.floor(index / 3) * 20}%`,
                            }}
                            title={panorama.name}
                        />
                    ))}

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
                    <p>• Hijau = panorama dari Supabase, Biru = marker editor</p>
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
                                onChange={(e) => updateMinimapMarker(selectedMarkerData.id, { label: e.target.value })}
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
                                onChange={(e) => updateMinimapMarker(selectedMarkerData.id, { nodeId: e.target.value })}
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
                                    onChange={(e) => updateMinimapMarker(selectedMarkerData.id, { x: parseFloat(e.target.value) })}
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
                                    onChange={(e) => updateMinimapMarker(selectedMarkerData.id, { y: parseFloat(e.target.value) })}
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

export default MinimapEditor;
