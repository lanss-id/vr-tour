import React, { useState } from 'react';
import { useEditorStore } from '../../../../store/editorStore';
import { useViewerSupabase } from '../../../../hooks/useViewerSupabase';
import { 
    Settings, 
    Database, 
    Save, 
    Download, 
    Upload, 
    Trash2,
    Eye,
    EyeOff,
    Palette,
    Type,
    MapPin,
    Target,
    Layers,
    Grid
} from 'lucide-react';
import PropertyPanel from './PropertyPanel';
import DatabaseManager from './DatabaseManager';
import Button from '../../../common/Button';

const RightSidebar: React.FC = () => {
    const { currentPanoramaId, selectedItem } = useEditorStore();
    const { panoramas } = useViewerSupabase();
    const [activeTab, setActiveTab] = useState<'properties' | 'database'>('properties');

    const currentPanorama = panoramas.find(p => p.id === currentPanoramaId);

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Properties Panel</h2>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('properties')}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                            activeTab === 'properties'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Settings className="w-4 h-4 mr-1" />
                        Properties
                    </button>
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                            activeTab === 'database'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Database className="w-4 h-4 mr-1" />
                        Database
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'properties' ? (
                    <PropertyPanel />
                ) : (
                    <DatabaseManager />
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="space-y-3">
                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                        <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <Upload className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Status Info */}
                    {currentPanorama && (
                        <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center justify-between">
                                <span>Current Panorama:</span>
                                <span className="font-medium">{currentPanorama.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Selected Item:</span>
                                <span className="font-medium">
                                    {selectedItem ? selectedItem.type : 'None'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RightSidebar; 