import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useEditorStore } from '../../../../store/editorStore';
import { Map, Eye, Settings, Download, Upload } from 'lucide-react';
import MinimapEditor from './MinimapEditor';
import HotspotEditor from './HotspotEditor';
import Button from '../../../common/Button';

const CenterWorkspace: React.FC = () => {
    const { editMode, setEditMode } = useEditorStore();
    const [activeTab, setActiveTab] = useState<'minimap' | 'hotspot'>('minimap');

    // Drop zone for panoramas from left sidebar
    const [{ isOver }, drop] = useDrop({
        accept: 'PANORAMA',
        drop: (item: any) => {
            console.log('Dropped panorama:', item.panorama);
            // TODO: Handle panorama drop based on active tab
            if (activeTab === 'minimap') {
                // Add to minimap as node
                console.log('Adding to minimap as node');
            } else {
                // Add to hotspot editor
                console.log('Adding to hotspot editor');
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold text-gray-900">Editor Workspace</h2>
                        
                        {/* Tab Navigation */}
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('minimap')}
                                className={`flex items-center space-x-2 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'minimap'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Map className="w-4 h-4" />
                                <span>Minimap</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('hotspot')}
                                className={`flex items-center space-x-2 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'hotspot'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Eye className="w-4 h-4" />
                                <span>Hotspot</span>
                            </button>
                        </div>
                    </div>

                    {/* Workspace Actions */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <Settings className="w-4 h-4 mr-1" />
                            Settings
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <Upload className="w-4 h-4 mr-1" />
                            Import
                        </Button>
                    </div>
                </div>

                {/* Mode Indicator */}
                <div className="mt-3 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Mode:</span>
                        <span className="text-sm font-medium text-gray-900">
                            {editMode === 'minimap' ? 'Minimap Editor' : 'Hotspot Editor'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Active Tab:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                            {activeTab} Editor
                        </span>
                    </div>
                </div>
            </div>

            {/* Workspace Content */}
            <div 
                ref={drop}
                className={`flex-1 relative ${
                    isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
                }`}
            >
                {activeTab === 'minimap' ? (
                    <MinimapEditor />
                ) : (
                    <HotspotEditor />
                )}

                {/* Drop Zone Overlay */}
                {isOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-75 z-10">
                        <div className="text-center">
                            <Map className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                            <p className="text-blue-700 font-medium">
                                Drop panorama here to add to {activeTab === 'minimap' ? 'minimap' : 'hotspot editor'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="bg-white border-t border-gray-200 p-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                        <span>Ready</span>
                        <span>•</span>
                        <span>Auto-save enabled</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span>Zoom: 100%</span>
                        <span>•</span>
                        <span>Position: 0, 0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CenterWorkspace; 