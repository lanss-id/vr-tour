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
    Link,
    Info,
    Eye,
    EyeOff,
    RefreshCw,
} from 'lucide-react';
import { useEditor } from '../../hooks/useEditor';
import { useEditorStore } from '../../store/editorStore';
import {
    getAllHotspotsForPanorama,
    getPanoramaById,
    getPanoramaNames,
    updateMarkerInPanoramaData,
    addMarkerToPanoramaData,
    removeMarkerFromPanoramaData,
    getMarkerIndexFromHotspotId
} from '../../utils/panoramaLoader';
import panoramaData from '../../../panorama-data.json';
import Button from '../common/Button';
import NavigationEditor from './NavigationEditor';
import ErrorBoundary from '../common/ErrorBoundary';

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
        currentPanoramaId,
        selectedHotspotId,
        setCurrentPanorama,
        setSelectedHotspot,
        addHotspotAtCenter,
        saveAndReload,
    } = useEditor();

    const {
        hotspots,
        categories,
        updatePanorama,
        deletePanorama,
        duplicatePanorama,
        updateHotspot,
        deleteHotspot,
    } = useEditorStore();

    const selectedPanoramaData = panoramaData.find((p: any) => p.id === currentPanoramaId);
    const selectedHotspotData = hotspots.find(h => h.id === selectedHotspotId);

    // Debug: Log hotspots and selected panorama
    console.log('All hotspots:', hotspots);
    console.log('Selected panorama:', currentPanoramaId);

    const panoramaHotspots = getAllHotspotsForPanorama(currentPanoramaId || '', hotspots);
    console.log('Filtered hotspots for current panorama:', panoramaHotspots);

    const handlePanoramaUpdate = (field: string, value: string) => {
        if (currentPanoramaId) {
            updatePanorama(currentPanoramaId, { [field]: value });
        }
    };

    const handleHotspotUpdate = async (field: string, value: any) => {
        if (selectedHotspotId) {
            // Update in store for immediate UI feedback
            updateHotspot(selectedHotspotId, { [field]: value });

            // Update in panorama-data.json for persistence
            const markerInfo = getMarkerIndexFromHotspotId(selectedHotspotId);
            if (markerInfo) {
                await updateMarkerInPanoramaData(markerInfo.panoramaId, markerInfo.markerIndex, { [field]: value });
            }
        }
    };

    const handleHotspotDelete = async (hotspotId: string) => {
        if (confirm('Delete this hotspot?')) {
            // Delete from store for immediate UI feedback
            deleteHotspot(hotspotId);

            // Delete from panorama-data.json for persistence
            const markerInfo = getMarkerIndexFromHotspotId(hotspotId);
            if (markerInfo) {
                await removeMarkerFromPanoramaData(markerInfo.panoramaId, markerInfo.markerIndex);
            }

            if (selectedHotspotId === hotspotId) {
                setSelectedHotspot(null);
            }
        }
    };

    const handlePanoramaDelete = (panoramaId: string) => {
        if (confirm('Delete this panorama? This will also delete all associated hotspots.')) {
            deletePanorama(panoramaId);
            if (currentPanoramaId === panoramaId) {
                setCurrentPanorama('kawasan-1');
            }
        }
    };

    const handlePanoramaDuplicate = (panoramaId: string) => {
        duplicatePanorama(panoramaId);
    };

    const getHotspotIcon = (type: string) => {
        switch (type) {
            case 'link':
                return <Link className="w-3 h-3 text-green-600" />;
            case 'info':
                return <Info className="w-3 h-3 text-blue-600" />;
            default:
                return <Target className="w-3 h-3 text-gray-600" />;
        }
    };

    const getTargetPanoramaName = (targetNodeId: string) => {
        const targetPanorama = panoramaData.find((p: any) => p.id === targetNodeId);
        return targetPanorama?.name || 'Unknown';
    };

    // Render Navigation Editor when in navigation mode
    // if (editMode === 'navigation') {
    //     return (
    //         <div className="flex flex-col h-full">
    //             <div className="p-4 border-b border-gray-200">
    //                 <h2 className="text-lg font-semibold text-gray-800">Navigation Editor</h2>
    //                 <p className="text-sm text-gray-500">Customize navigation menu structure</p>
    //             </div>
    //             <div className="flex-1 overflow-y-auto">
    //                 <ErrorBoundary key="navigation-editor-error-boundary">
    //                     <NavigationEditor />
    //                 </ErrorBoundary>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Editor</h2>
                        <p className="text-sm text-gray-500">VR Panorama Tour Editor</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={saveAndReload}
                        className="text-blue-600 hover:text-blue-700"
                        title="Save and reload data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Panorama Panel */}
                <Panel title="Panoramas" icon={<Image className="w-4 h-4" />}>
                    <div className="space-y-2">
                        {panoramaData.map((panorama: any) => (
                            <div
                                key={panorama.id}
                                className={`p-2 rounded-lg cursor-pointer transition-colors ${currentPanoramaId === panorama.id
                                    ? 'bg-blue-100 border border-blue-300'
                                    : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => setCurrentPanorama(panorama.id)}
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
                                                handlePanoramaDuplicate(panorama.id);
                                            }}
                                            className="p-1"
                                            title="Duplicate panorama"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePanoramaDelete(panorama.id);
                                            }}
                                            className="p-1 text-red-500 hover:text-red-700"
                                            title="Delete panorama"
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
                                {currentPanoramaId && (
                                    <span className="text-xs text-gray-400 ml-2">
                                        for {currentPanoramaId}
                                    </span>
                                )}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addHotspotAtCenter}
                                disabled={!currentPanoramaId}
                                className="p-1"
                                title="Add hotspot at center"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {panoramaHotspots.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                {currentPanoramaId ? (
                                    <div>
                                        <p>No hotspots for this panorama</p>
                                        <p className="text-xs mt-1">Click the + button or click in the panorama to add hotspots</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p>Select a panorama first</p>
                                        <p className="text-xs mt-1">Choose a panorama to see its hotspots</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            panoramaHotspots.map((hotspot) => (
                                <div
                                    key={hotspot.id}
                                    className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedHotspotId === hotspot.id
                                        ? 'bg-green-100 border border-green-300'
                                        : 'hover:bg-gray-100'
                                        }`}
                                    onClick={() => setSelectedHotspot(hotspot.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                {getHotspotIcon(hotspot.type)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {hotspot.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {('yaw' in hotspot.position)
                                                            ? `${hotspot.position.yaw.toFixed(1)}°, ${hotspot.position.pitch.toFixed(1)}°`
                                                            : `Texture: ${(hotspot.position as any).textureX}, ${(hotspot.position as any).textureY}`
                                                        }
                                                    </p>
                                                    {hotspot.type === 'link' && hotspot.targetNodeId && (
                                                        <p className="text-xs text-green-600">
                                                            → {getTargetPanoramaName(hotspot.targetNodeId)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    await handleHotspotUpdate('isVisible', !hotspot.isVisible);
                                                }}
                                                className="p-1"
                                                title={hotspot.isVisible ? 'Hide hotspot' : 'Show hotspot'}
                                            >
                                                {hotspot.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    await handleHotspotDelete(hotspot.id);
                                                }}
                                                className="p-1 text-red-500 hover:text-red-700"
                                                title="Delete hotspot"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
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
                                        {panoramaData.filter((p: any) => p.category === category.id).length}
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
                                        value={selectedPanoramaData.name || ''}
                                        onChange={(e) => handlePanoramaUpdate('name', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Caption
                                    </label>
                                    <textarea
                                        value={selectedPanoramaData.caption || ''}
                                        onChange={(e) => handlePanoramaUpdate('caption', e.target.value)}
                                        rows={2}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Panorama ID
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedPanoramaData.id || ''}
                                        readOnly
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Panorama Path
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedPanoramaData.panorama || ''}
                                        readOnly
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
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
                                        value={selectedHotspotData.title || ''}
                                        onChange={async (e) => await handleHotspotUpdate('title', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Content
                                    </label>
                                    <textarea
                                        value={selectedHotspotData.content || ''}
                                        onChange={async (e) => await handleHotspotUpdate('content', e.target.value)}
                                        rows={3}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={selectedHotspotData.type || 'link'}
                                        onChange={async (e) => await handleHotspotUpdate('type', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="info">Info - Show content</option>
                                        <option value="link">Link - Navigate to panorama</option>
                                        <option value="custom">Custom - Advanced usage</option>
                                    </select>
                                </div>
                                {selectedHotspotData.type === 'link' && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Target Panorama
                                        </label>
                                        <select
                                            value={selectedHotspotData.targetNodeId || ''}
                                            onChange={async (e) => await handleHotspotUpdate('targetNodeId', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select panorama...</option>
                                            {panoramaData
                                                .filter((p: any) => p.id !== currentPanoramaId) // Exclude current panorama
                                                .map((panorama: any) => (
                                                    <option key={panorama.id} value={panorama.id}>
                                                        {panorama.name}
                                                    </option>
                                                ))}
                                        </select>
                                        {selectedHotspotData.targetNodeId && (
                                            <p className="text-xs text-green-600 mt-1">
                                                Will navigate to: {getTargetPanoramaName(selectedHotspotData.targetNodeId)}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Position
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            step="1"
                                            value={selectedHotspotData.position && ('textureX' in selectedHotspotData.position) ? (selectedHotspotData.position as any).textureX : (selectedHotspotData.position?.yaw || 0)}
                                            onChange={async (e) => {
                                                if (!selectedHotspotData.position) return;
                                                const newPosition = { ...selectedHotspotData.position };
                                                if ('textureX' in newPosition) {
                                                    (newPosition as any).textureX = parseInt(e.target.value);
                                                } else {
                                                    newPosition.yaw = parseFloat(e.target.value);
                                                }
                                                await handleHotspotUpdate('position', newPosition);
                                            }}
                                            placeholder={selectedHotspotData.position && ('textureX' in selectedHotspotData.position) ? "Texture X" : "Yaw"}
                                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            step="1"
                                            value={selectedHotspotData.position && ('textureY' in selectedHotspotData.position) ? (selectedHotspotData.position as any).textureY : (selectedHotspotData.position?.pitch || 0)}
                                            onChange={async (e) => {
                                                if (!selectedHotspotData.position) return;
                                                const newPosition = { ...selectedHotspotData.position };
                                                if ('textureY' in newPosition) {
                                                    (newPosition as any).textureY = parseInt(e.target.value);
                                                } else {
                                                    newPosition.pitch = parseFloat(e.target.value);
                                                }
                                                await handleHotspotUpdate('position', newPosition);
                                            }}
                                            placeholder={selectedHotspotData.position && ('textureY' in selectedHotspotData.position) ? "Texture Y" : "Pitch"}
                                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedHotspotData.position && ('textureX' in selectedHotspotData.position)
                                            ? "Using texture coordinates (0-4096 range)"
                                            : "Using spherical coordinates (degrees)"
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Visibility
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedHotspotData.isVisible}
                                            onChange={async (e) => await handleHotspotUpdate('isVisible', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-gray-600">
                                            {selectedHotspotData.isVisible ? 'Visible' : 'Hidden'}
                                        </span>
                                    </div>
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
