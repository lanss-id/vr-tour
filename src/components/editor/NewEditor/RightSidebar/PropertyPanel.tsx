import React, { useState } from 'react';
import { useEditorStore } from '../../../../store/editorStore';
import { useViewerSupabase } from '../../../../hooks/useViewerSupabase';
import { 
    MapPin, 
    Target, 
    Eye, 
    EyeOff, 
    Palette, 
    Type,
    Settings,
    Layers,
    Grid,
    Move,
    RotateCcw,
    Maximize,
    Minimize,
    Trash2
} from 'lucide-react';
import Button from '../../../common/Button';

const PropertyPanel: React.FC = () => {
    const { selectedHotspotId, currentPanoramaId, hotspots, updateHotspot } = useEditorStore();
    const { panoramas } = useViewerSupabase();
    const [activeSection, setActiveSection] = useState<'position' | 'appearance' | 'target' | 'advanced'>('position');

    const currentPanorama = panoramas.find(p => p.id === currentPanoramaId);
    const selectedHotspot = selectedHotspotId ? 
        hotspots.find(h => h.id === selectedHotspotId) : null;

    const iconOptions = [
        { name: 'map-pin', icon: MapPin },
        { name: 'target', icon: Target },
        { name: 'eye', icon: Eye },
        { name: 'settings', icon: Settings },
        { name: 'layers', icon: Layers },
        { name: 'grid', icon: Grid }
    ];

    const colorOptions = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
        '#8B5CF6', '#EC4899', '#6B7280', '#000000'
    ];

    const renderPositionControls = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs text-gray-500 mb-2">Position</label>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">X</label>
                        <input
                            type="number"
                            value={selectedHotspot?.position?.x || 0}
                            onChange={(e) => {
                                if (selectedHotspot) {
                                    updateHotspot(selectedHotspot.id, {
                                        ...selectedHotspot,
                                        position: {
                                            ...selectedHotspot.position,
                                            x: parseFloat(e.target.value) || 0
                                        }
                                    });
                                }
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            step="0.1"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Y</label>
                        <input
                            type="number"
                            value={selectedHotspot?.position?.y || 0}
                            onChange={(e) => {
                                if (selectedHotspot) {
                                    updateHotspot(selectedHotspot.id, {
                                        ...selectedHotspot,
                                        position: {
                                            ...selectedHotspot.position,
                                            y: parseFloat(e.target.value) || 0
                                        }
                                    });
                                }
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            step="0.1"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs text-gray-500 mb-2">Size</label>
                <input
                    type="range"
                    min="20"
                    max="100"
                    value={selectedHotspot?.size || 40}
                    onChange={(e) => {
                        if (selectedHotspot) {
                            updateHotspot(selectedHotspot.id, {
                                ...selectedHotspot,
                                size: parseInt(e.target.value)
                            });
                        }
                    }}
                    className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                    {selectedHotspot?.size || 40}px
                </div>
            </div>

            <div>
                <label className="block text-xs text-gray-500 mb-2">Rotation</label>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedHotspot?.rotation || 0}
                    onChange={(e) => {
                        if (selectedHotspot) {
                            updateHotspot(selectedHotspot.id, {
                                ...selectedHotspot,
                                rotation: parseInt(e.target.value)
                            });
                        }
                    }}
                    className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                    {selectedHotspot?.rotation || 0}°
                </div>
            </div>
        </div>
    );

    const renderAppearanceControls = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs text-gray-500 mb-2">Icon</label>
                <div className="grid grid-cols-3 gap-2">
                    {iconOptions.map(({ name, icon: IconComponent }) => (
                        <button
                            key={name}
                            className={`p-2 border rounded-md flex items-center justify-center transition-colors ${
                                selectedHotspot?.icon === name
                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => {
                                if (selectedHotspot) {
                                    updateHotspot(selectedHotspot.id, {
                                        ...selectedHotspot,
                                        icon: name
                                    });
                                }
                            }}
                        >
                            <IconComponent className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs text-gray-500 mb-2">Color</label>
                <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map(color => (
                        <button
                            key={color}
                            className={`w-8 h-8 rounded-full border-2 transition-colors ${
                                selectedHotspot?.color === color
                                    ? 'border-gray-800 scale-110'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                if (selectedHotspot) {
                                    updateHotspot(selectedHotspot.id, {
                                        ...selectedHotspot,
                                        color
                                    });
                                }
                            }}
                        />
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs text-gray-500 mb-2">Label</label>
                <input
                    type="text"
                    value={selectedHotspot?.label || ''}
                    onChange={(e) => {
                        if (selectedHotspot) {
                            updateHotspot(selectedHotspot.id, {
                                ...selectedHotspot,
                                label: e.target.value
                            });
                        }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Enter label..."
                />
            </div>

            <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">Visible</label>
                <button
                    onClick={() => {
                        if (selectedHotspot) {
                            updateHotspot(selectedHotspot.id, {
                                ...selectedHotspot,
                                isVisible: !selectedHotspot.isVisible
                            });
                        }
                    }}
                    className={`p-1 rounded transition-colors ${
                        selectedHotspot?.isVisible
                            ? 'text-blue-600 hover:text-blue-700'
                            : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    {selectedHotspot?.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );

    const renderTargetControls = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs text-gray-500 mb-2">Target Panorama</label>
                <select
                    value={selectedHotspot?.targetPanoramaId || ''}
                    onChange={(e) => {
                        if (selectedHotspot) {
                            updateHotspot(selectedHotspot.id, {
                                ...selectedHotspot,
                                targetPanoramaId: e.target.value
                            });
                        }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                    <option value="">Select target panorama...</option>
                    {panoramas.map(panorama => (
                        <option key={panorama.id} value={panorama.id}>
                            {panorama.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedHotspot?.targetPanoramaId && (
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">Target Info</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                        <div>ID: {selectedHotspot.targetPanoramaId}</div>
                        <div>Name: {panoramas.find(p => p.id === selectedHotspot.targetPanoramaId)?.name}</div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderAdvancedControls = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs text-gray-500 mb-2">Hotspot ID</label>
                <input
                    type="text"
                    value={selectedHotspot?.id || ''}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                />
            </div>

            <div>
                <label className="block text-xs text-gray-500 mb-2">Panorama ID</label>
                <input
                    type="text"
                    value={selectedHotspot?.panoramaId || ''}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                />
            </div>

            <div className="space-y-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-blue-600 hover:text-blue-700"
                >
                    <Move className="w-4 h-4 mr-2" />
                    Reset Position
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-orange-600 hover:text-orange-700"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Rotation
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Hotspot
                </Button>
            </div>
        </div>
    );

    if (!selectedHotspotId) {
        return (
            <div className="p-4 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                    No Item Selected
                </h3>
                <p className="text-xs text-gray-500">
                    Select a hotspot or node to edit its properties
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Section Navigation */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    {[
                        { key: 'position', label: 'Position', icon: Move },
                        { key: 'appearance', label: 'Appearance', icon: Palette },
                        { key: 'target', label: 'Target', icon: Target },
                        { key: 'advanced', label: 'Advanced', icon: Settings }
                    ].map(({ key, label, icon: IconComponent }) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key as any)}
                            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                                activeSection === key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <IconComponent className="w-3 h-3 mr-1" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeSection === 'position' && renderPositionControls()}
                {activeSection === 'appearance' && renderAppearanceControls()}
                {activeSection === 'target' && renderTargetControls()}
                {activeSection === 'advanced' && renderAdvancedControls()}
            </div>
        </div>
    );
};

export default PropertyPanel; 