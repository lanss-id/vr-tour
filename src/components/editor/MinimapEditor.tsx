import React, { useState, useRef } from 'react';
import { Map, Upload, Trash2, Plus, Settings } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { MinimapMarker } from '../../types/panorama';
import Button from '../common/Button';

const MinimapEditor: React.FC = () => {
    const { minimapData, updateMinimapData, addMinimapMarker, updateMinimapMarker, deleteMinimapMarker } = useEditorStore();

    const [isDragging, setIsDragging] = useState(false);
    const [draggedMarker, setDraggedMarker] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

    const minimapRef = useRef<HTMLDivElement>(null);

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
            const marker = minimapData.markers.find(m => m.id === markerId);
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

    const selectedMarkerData = minimapData.markers.find(m => m.id === selectedMarker);

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
                    {minimapData.backgroundImage && (
                        <img
                            src={minimapData.backgroundImage}
                            alt="Site Plan"
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Markers */}
                    {minimapData.markers.map(marker => (
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

                    {/* Instructions */}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Click to add marker • Drag to move • {minimapData.markers.length} markers
                    </div>
                </div>
            </div>

            {/* Marker Properties */}
            {selectedMarkerData && (
                <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">Marker Properties</div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                            <input
                                type="text"
                                value={selectedMarkerData.label}
                                onChange={(e) => updateMinimapMarker(selectedMarkerData.id, { label: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">X Position</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={selectedMarkerData.x.toFixed(1)}
                                    onChange={(e) => updateMinimapMarker(selectedMarkerData.id, { x: parseFloat(e.target.value) })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Y Position</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={selectedMarkerData.y.toFixed(1)}
                                    onChange={(e) => updateMinimapMarker(selectedMarkerData.id, { y: parseFloat(e.target.value) })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Linked Panorama</label>
                            <select
                                value={selectedMarkerData.nodeId}
                                onChange={(e) => updateMinimapMarker(selectedMarkerData.id, { nodeId: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select panorama...</option>
                                {/* Add panorama options here */}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinimapEditor;
