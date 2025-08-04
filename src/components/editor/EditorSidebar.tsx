import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Image,
    Target,
    Map,
    Grid,
    Menu,
    Plus,
    Trash2,
    Copy,
    Settings,
} from 'lucide-react';
import { useEditor } from '../../hooks/useEditor';
import { useEditorStore } from '../../store/editorStore';
import Button from '../common/Button';

interface PanelProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const Panel: React.FC<PanelProps> = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    {icon}
                    <span className="font-medium text-gray-700">{title}</span>
                </div>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
            </button>
            {isOpen && <div className="px-4 pb-4">{children}</div>}
        </div>
    );
};

const EditorSidebar: React.FC = () => {
    const {
        editMode,
        selectedPanorama,
        selectedHotspot,
        setSelectedPanorama,
        setSelectedHotspot,
        addHotspotAtCenter,
    } = useEditor();

    const {
        panoramas,
        hotspots,
        categories,
        selectedPanorama: storeSelectedPanorama,
        selectedHotspot: storeSelectedHotspot,
    } = useEditorStore();

    const selectedPanoramaData = panoramas.find(p => p.id === selectedPanorama);
    const selectedHotspotData = hotspots.find(h => h.id === selectedHotspot);
    const panoramaHotspots = hotspots.filter(h => h.panoramaId === selectedPanorama);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Editor</h2>
                <p className="text-sm text-gray-500">VR Panorama Tour Editor</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Panorama Panel */}
                <Panel title="Panoramas" icon={<Image className="w-4 h-4" />}>
                    <div className="space-y-2">
                        {panoramas.map((panorama) => (
                            <div
                                key={panorama.id}
                                className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedPanorama === panorama.id
                                        ? 'bg-blue-100 border border-blue-300'
                                        : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => setSelectedPanorama(panorama.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {panorama.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {panorama.caption}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1 ml-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Duplicate panorama
                                            }}
                                            className="p-1"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Delete panorama
                                            }}
                                            className="p-1 text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Hotspots Panel */}
                <Panel title="Hotspots" icon={<Target className="w-4 h-4" />}>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">
                                {panoramaHotspots.length} hotspots
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addHotspotAtCenter}
                                disabled={!selectedPanorama}
                                className="p-1"
                                title="Add hotspot at center"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {panoramaHotspots.map((hotspot) => (
                            <div
                                key={hotspot.id}
                                className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedHotspot === hotspot.id
                                        ? 'bg-green-100 border border-green-300'
                                        : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => setSelectedHotspot(hotspot.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {hotspot.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {hotspot.type} • {hotspot.position.yaw.toFixed(1)}°, {hotspot.position.pitch.toFixed(1)}°
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Delete hotspot
                                        }}
                                        className="p-1 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Categories Panel */}
                <Panel title="Categories" icon={<Menu className="w-4 h-4" />}>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <span className="text-sm font-medium text-gray-800">
                                            {category.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {panoramas.filter(p => p.category === category.id).length}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Properties Panel */}
                {(selectedPanoramaData || selectedHotspotData) && (
                    <Panel title="Properties" icon={<Settings className="w-4 h-4" />}>
                        {selectedPanoramaData && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedPanoramaData.name}
                                        onChange={(e) => {
                                            // Update panorama name
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Caption
                                    </label>
                                    <textarea
                                        value={selectedPanoramaData.caption}
                                        onChange={(e) => {
                                            // Update panorama caption
                                        }}
                                        rows={2}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        GPS Coordinates
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            value={selectedPanoramaData.gps[0]}
                                            onChange={(e) => {
                                                // Update longitude
                                            }}
                                            placeholder="Longitude"
                                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            value={selectedPanoramaData.gps[1]}
                                            onChange={(e) => {
                                                // Update latitude
                                            }}
                                            placeholder="Latitude"
                                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedHotspotData && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedHotspotData.title}
                                        onChange={(e) => {
                                            // Update hotspot title
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Content
                                    </label>
                                    <textarea
                                        value={selectedHotspotData.content || ''}
                                        onChange={(e) => {
                                            // Update hotspot content
                                        }}
                                        rows={3}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={selectedHotspotData.type}
                                        onChange={(e) => {
                                            // Update hotspot type
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="info">Info</option>
                                        <option value="link">Link</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </Panel>
                )}
            </div>
        </div>
    );
};

export default EditorSidebar;
