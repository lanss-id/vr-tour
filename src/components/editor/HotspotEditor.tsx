import React, { useState, useRef, useEffect } from 'react';
import { Target, Edit3, Trash2, Copy, Eye, EyeOff, Link, Unlink, MapPin, Move, Save, RefreshCw } from 'lucide-react';
import { useEditor } from '../../hooks/useEditor';
import { useEditorStore } from '../../store/editorStore';
import { useViewerStore } from '../../store/viewerStore';
import { Hotspot } from '../../types/editor';
import {
    getPanoramaNames,
    addLinkToPanorama,
    removeLinkFromPanorama,
    updateLinkPosition,
    arePanoramasLinked,
    getLinksForPanorama,
    getPanoramaById,
    sphericalToTexture,
    textureToSpherical,
    savePanoramaData,
    autoSavePanoramaData,
    forceSavePanoramaData
} from '../../utils/panoramaLoader';
import Button from '../common/Button';

interface HotspotEditorProps {
    hotspot: Hotspot;
    onUpdate: (updates: Partial<Hotspot>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

const HotspotEditor: React.FC<HotspotEditorProps> = ({
    hotspot,
    onUpdate,
    onDelete,
    onDuplicate,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isPositioning, setIsPositioning] = useState(false);
    const [tempTitle, setTempTitle] = useState(hotspot.title);
    const [tempContent, setTempContent] = useState(hotspot.content || '');
    const [selectedTargetPanorama, setSelectedTargetPanorama] = useState(hotspot.targetNodeId || '');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedPosition, setLastSavedPosition] = useState(hotspot.position);

    const panoramaNames = getPanoramaNames();
    const currentPanoramaId = hotspot.panoramaId;
    const { setCurrentNode } = useViewerStore();
    const { setSelectedHotspot } = useEditorStore();
    const { setEditMode } = useEditor();

    // Get existing links from panorama-data.json
    const existingLinks = getLinksForPanorama(currentPanoramaId);
    const targetPanorama = selectedTargetPanorama ? getPanoramaById(selectedTargetPanorama) : null;

    // Check if this hotspot corresponds to an existing link
    const isCurrentlyLinked = hotspot.type === 'link' && hotspot.targetNodeId &&
        arePanoramasLinked(currentPanoramaId, hotspot.targetNodeId);

    // Convert position to texture coordinates for display
    const getPositionDisplay = () => {
        if ('textureX' in hotspot.position && 'textureY' in hotspot.position) {
            return {
                textureX: hotspot.position.textureX,
                textureY: hotspot.position.textureY
            };
        } else if ('yaw' in hotspot.position && 'pitch' in hotspot.position) {
            const texture = sphericalToTexture(hotspot.position.yaw, hotspot.position.pitch);
            return texture;
        }
        return { textureX: 0, textureY: 0 };
    };

    const positionDisplay = getPositionDisplay();

    // Auto-sync with panorama-data.json when hotspot changes
    useEffect(() => {
        if (hotspot.type === 'link' && hotspot.targetNodeId) {
            // Ensure link exists in panorama-data.json
            if (!arePanoramasLinked(currentPanoramaId, hotspot.targetNodeId)) {
                addLinkToPanorama(currentPanoramaId, hotspot.targetNodeId, hotspot.position);
            }
        }
    }, [hotspot, currentPanoramaId]);

    // Auto-save position changes
    useEffect(() => {
        if (JSON.stringify(hotspot.position) !== JSON.stringify(lastSavedPosition)) {
            const timeoutId = setTimeout(() => {
                handleAutoSave();
            }, 1000); // Auto-save after 1 second of no changes

            return () => clearTimeout(timeoutId);
        }
    }, [hotspot.position, lastSavedPosition]);

    const handleAutoSave = async () => {
        if (isSaving) return;

        setIsSaving(true);
        try {
            // Update link position in panorama-data.json if this is a link hotspot
            if (hotspot.type === 'link' && hotspot.targetNodeId) {
                updateLinkPosition(currentPanoramaId, hotspot.targetNodeId, hotspot.position);
            }

            // Auto-save to panorama-data.json
            autoSavePanoramaData(1000); // Auto-save after 1 second
            setLastSavedPosition(hotspot.position);

            console.log('Auto-saved hotspot position');
        } catch (error) {
            console.error('Error auto-saving hotspot:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            onUpdate({
                title: tempTitle,
                content: tempContent,
            });

            // Update panorama-data.json
            if (hotspot.type === 'link' && hotspot.targetNodeId) {
                updateLinkPosition(currentPanoramaId, hotspot.targetNodeId, hotspot.position);
            }

            await forceSavePanoramaData();
            setIsEditing(false);
            console.log('Hotspot saved successfully');
        } catch (error) {
            console.error('Error saving hotspot:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTempTitle(hotspot.title);
        setTempContent(hotspot.content || '');
        setIsEditing(false);
    };

    const handleToggleVisibility = () => {
        onUpdate({ isVisible: !hotspot.isVisible });
    };

    const handleLinkTypeChange = (type: 'info' | 'link' | 'custom') => {
        onUpdate({ type });

        // If changing to link type, ensure we have a target
        if (type === 'link' && !hotspot.targetNodeId) {
            // Set first available panorama as default target
            const availablePanoramas = panoramaNames.filter(p => p.id !== currentPanoramaId);
            if (availablePanoramas.length > 0) {
                const defaultTarget = availablePanoramas[0].id;
                onUpdate({ targetNodeId: defaultTarget });
                setSelectedTargetPanorama(defaultTarget);

                // Add link to panorama-data.json
                addLinkToPanorama(currentPanoramaId, defaultTarget, hotspot.position);
            }
        } else if (type !== 'link') {
            // Remove link from panorama-data.json if changing away from link type
            if (hotspot.targetNodeId) {
                removeLinkFromPanorama(currentPanoramaId, hotspot.targetNodeId);
            }
        }
    };

    const handleTargetPanoramaChange = (targetId: string) => {
        setSelectedTargetPanorama(targetId);
        onUpdate({ targetNodeId: targetId });

        // Automatically manage panorama links
        if (hotspot.type === 'link' && targetId) {
            // Remove existing link if any
            if (hotspot.targetNodeId && hotspot.targetNodeId !== targetId) {
                removeLinkFromPanorama(currentPanoramaId, hotspot.targetNodeId);
            }

            // Add new link to panorama-data.json
            const success = addLinkToPanorama(currentPanoramaId, targetId, hotspot.position);
            if (success) {
                console.log(`Link added from ${currentPanoramaId} to ${targetId}`);
            } else {
                console.warn(`Failed to add link from ${currentPanoramaId} to ${targetId}`);
            }
        }
    };

    const handlePositionUpdate = (position: { yaw: number; pitch: number } | { textureX: number; textureY: number }) => {
        onUpdate({ position: position as any });

        // Update link position in panorama-data.json if this is a link hotspot
        if (hotspot.type === 'link' && hotspot.targetNodeId) {
            updateLinkPosition(currentPanoramaId, hotspot.targetNodeId, position);
        }
    };

    const handleUnlink = () => {
        // Remove link from panorama-data.json
        if (hotspot.targetNodeId) {
            removeLinkFromPanorama(currentPanoramaId, hotspot.targetNodeId);
        }

        // Update hotspot
        onUpdate({
            type: 'info' as const,
            targetNodeId: undefined
        });
        setSelectedTargetPanorama('');
    };

    const handleNavigateToTarget = () => {
        if (hotspot.targetNodeId) {
            setCurrentNode(hotspot.targetNodeId);
        }
    };

    const handlePickPosition = () => {
        setIsPositioning(true);
        setSelectedHotspot(hotspot.id);

        // Enable positioning mode in viewer
        setEditMode('hotspot');

        console.log('Position picker activated for hotspot:', hotspot.id);
    };

    const handleManualPositionUpdate = (field: 'textureX' | 'textureY', value: number) => {
        const newPosition = {
            textureX: field === 'textureX' ? value : positionDisplay.textureX,
            textureY: field === 'textureY' ? value : positionDisplay.textureY
        };

        handlePositionUpdate(newPosition);
    };

    const handleRefreshViewer = () => {
        // Trigger viewer refresh to show updated markers
        const { setCurrentNode } = useViewerStore.getState();
        const currentId = useViewerStore.getState().currentNodeId;
        setCurrentNode(currentId); // This will trigger a refresh
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-800">Nav-Marker Editor</span>
                    {isSaving && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Saving...</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleVisibility}
                        title={hotspot.isVisible ? 'Hide hotspot' : 'Show hotspot'}
                    >
                        {hotspot.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDuplicate}
                        title="Duplicate hotspot"
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        title="Edit hotspot"
                    >
                        <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="text-red-500 hover:text-red-700"
                        title="Delete hotspot"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Position Control */}
            <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-blue-800">Position Control</div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePickPosition}
                            title="Pick position in viewer"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <MapPin className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefreshViewer}
                            title="Refresh viewer"
                            className="text-green-600 hover:text-green-800"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                                setIsSaving(true);
                                try {
                                    await forceSavePanoramaData();
                                    console.log('Manual save completed');
                                } catch (error) {
                                    console.error('Error manual saving:', error);
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            title="Save to file"
                            className="text-purple-600 hover:text-purple-800"
                            disabled={isSaving}
                        >
                            <Save className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {isPositioning && (
                    <div className="mb-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                        🎯 Click in the viewer to set position • Press ESC to cancel
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <label className="block text-gray-600 mb-1">Texture X:</label>
                        <input
                            type="number"
                            value={positionDisplay.textureX}
                            onChange={(e) => handleManualPositionUpdate('textureX', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-1">Texture Y:</label>
                        <input
                            type="number"
                            value={positionDisplay.textureY}
                            onChange={(e) => handleManualPositionUpdate('textureY', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-2 text-xs text-blue-600">
                    💡 Drag hotspot in viewer or use manual inputs above
                </div>
            </div>

            {/* Link Status */}
            {hotspot.type === 'link' && (
                <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Link className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Navigation Link</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isCurrentlyLinked ? (
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">✓ Linked</span>
                            ) : (
                                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">⚠ Not Linked</span>
                            )}
                            {hotspot.targetNodeId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleNavigateToTarget}
                                    title="Navigate to target panorama"
                                >
                                    →
                                </Button>
                            )}
                        </div>
                    </div>
                    {hotspot.targetNodeId && (
                        <div className="mt-2 text-xs text-green-600">
                            Target: {panoramaNames.find(p => p.id === hotspot.targetNodeId)?.name || 'Unknown'}
                        </div>
                    )}
                </div>
            )}

            {/* Existing Links Info */}
            {existingLinks.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-purple-800 mb-2">Existing Links in panorama-data.json</div>
                    <div className="space-y-1">
                        {existingLinks.map((link, index) => {
                            const targetPanorama = getPanoramaById(link.nodeId);
                            return (
                                <div key={index} className="text-xs text-purple-700 flex items-center justify-between">
                                    <span>→ {targetPanorama?.name || link.nodeId}</span>
                                    {link.position && (
                                        <span className="text-gray-500">
                                            {('textureX' in (link.position as any)) ?
                                                `(${(link.position as any).textureX}, ${(link.position as any).textureY})` :
                                                `(${(link.position as any).yaw.toFixed(1)}°, ${(link.position as any).pitch.toFixed(1)}°)`
                                            }
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {isEditing ? (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                        </label>
                        <textarea
                            value={tempContent}
                            onChange={(e) => setTempContent(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter hotspot content..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            value={hotspot.type}
                            onChange={(e) => handleLinkTypeChange(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="info">Info</option>
                            <option value="link">Navigation Link</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {/* Target Panorama Selection */}
                    {hotspot.type === 'link' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target Panorama
                            </label>
                            <select
                                value={selectedTargetPanorama}
                                onChange={(e) => handleTargetPanoramaChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select target panorama...</option>
                                {panoramaNames
                                    .filter(p => p.id !== currentPanoramaId)
                                    .map(panorama => (
                                        <option key={panorama.id} value={panorama.id}>
                                            {panorama.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    <div className="flex space-x-2">
                        <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="secondary" onClick={handleCancel} className="flex-1">
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                /* Display Mode */
                <div className="space-y-3">
                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Title</div>
                        <div className="text-sm text-gray-800">{hotspot.title}</div>
                    </div>
                    {hotspot.content && (
                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Content</div>
                            <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                                {hotspot.content}
                            </div>
                        </div>
                    )}
                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Type</div>
                        <div className="text-sm text-gray-800 capitalize">{hotspot.type}</div>
                    </div>
                    {hotspot.type === 'link' && hotspot.targetNodeId && (
                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Target Panorama</div>
                            <div className="text-sm text-gray-800">
                                {panoramaNames.find(p => p.id === hotspot.targetNodeId)?.name || 'Unknown'}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Link Management */}
            {hotspot.type === 'link' && !isEditing && (
                <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Link Management</span>
                        <div className="flex items-center space-x-2">
                            {hotspot.targetNodeId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleNavigateToTarget}
                                    title="Navigate to target"
                                >
                                    →
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleUnlink}
                                className="text-red-500 hover:text-red-700"
                                title="Remove link"
                            >
                                <Unlink className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {isCurrentlyLinked
                            ? "✓ This hotspot is linked in panorama-data.json"
                            : "⚠ This hotspot is not linked in panorama-data.json"
                        }
                    </div>
                </div>
            )}

            {/* Icon Selection */}
            <div className="border-t border-gray-200 pt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Icon</div>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => onUpdate({
                            style: { ...hotspot.style, icon: '/icon/door-open.svg' }
                        })}
                        className={`p-2 rounded border-2 transition-colors ${hotspot.style?.icon === '/icon/door-open.svg'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                        title="Door Open Icon"
                    >
                        <img src="/icon/door-open.svg" alt="Door" className="w-6 h-6 mx-auto" />
                    </button>
                    <button
                        onClick={() => onUpdate({
                            style: { ...hotspot.style, icon: '/icon/chevrons-up.svg' }
                        })}
                        className={`p-2 rounded border-2 transition-colors ${hotspot.style?.icon === '/icon/chevrons-up.svg'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                        title="Chevrons Up Icon"
                    >
                        <img src="/icon/chevrons-up.svg" alt="Chevrons" className="w-6 h-6 mx-auto" />
                    </button>
                    <button
                        onClick={() => onUpdate({
                            style: { ...hotspot.style, icon: 'https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-blue.png' }
                        })}
                        className={`p-2 rounded border-2 transition-colors ${hotspot.style?.icon === 'https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-blue.png'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                        title="Default Pin Icon"
                    >
                        <img src="https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-blue.png" alt="Pin" className="w-6 h-6 mx-auto" />
                    </button>
                </div>
            </div>

            {/* Style Options */}
            <div className="border-t border-gray-200 pt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Style</div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Size</label>
                        <input
                            type="range"
                            min="24"
                            max="64"
                            value={hotspot.style?.size || 32}
                            onChange={(e) => onUpdate({
                                style: { ...hotspot.style, size: parseInt(e.target.value) }
                            })}
                            className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-center">
                            {hotspot.style?.size || 32}px
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Opacity</label>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={hotspot.style?.opacity || 1}
                            onChange={(e) => onUpdate({
                                style: { ...hotspot.style, opacity: parseFloat(e.target.value) }
                            })}
                            className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-center">
                            {Math.round((hotspot.style?.opacity || 1) * 100)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-save Status */}
            <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                        <span className={isSaving ? 'text-yellow-600' : 'text-green-600'}>
                            {isSaving ? 'Saving...' : 'Auto-save enabled'}
                        </span>
                    </div>
                    <div className="text-gray-500">
                        Changes auto-save to panorama-data.json
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotspotEditor;
