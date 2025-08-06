import React, { useState } from 'react';
import { Folder, Plus, Upload, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import NavigationGroupManager from './NavigationGroupManager';
import PanoramaList from './PanoramaList';
import AddPanoramaModal from './AddPanoramaModal';
import Button from '../../../common/Button';

const LeftSidebar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'panoramas' | 'navigation'>('panoramas');
    const [isAddPanoramaOpen, setIsAddPanoramaOpen] = useState(false);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Panorama Editor</h2>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('panoramas')}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                            activeTab === 'panoramas'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Panoramas
                    </button>
                    <button
                        onClick={() => setActiveTab('navigation')}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                            activeTab === 'navigation'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Navigation
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'panoramas' ? (
                    <div className="h-full flex flex-col">
                        {/* Panorama List Header */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-900">Panorama List</h3>
                                <Button
                                    onClick={() => setIsAddPanoramaOpen(true)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="flex space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <Upload className="w-4 h-4 mr-1" />
                                    Upload
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <Settings className="w-4 h-4 mr-1" />
                                    Settings
                                </Button>
                            </div>
                        </div>

                        {/* Panorama List */}
                        <div className="flex-1 overflow-y-auto">
                            <PanoramaList />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        {/* Navigation Management */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-900">Navigation Groups</h3>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Group
                                </Button>
                            </div>
                        </div>

                        {/* Navigation Group Manager */}
                        <div className="flex-1 overflow-y-auto">
                            <NavigationGroupManager />
                        </div>
                    </div>
                )}
            </div>

            {/* Add Panorama Modal */}
            <AddPanoramaModal
                isOpen={isAddPanoramaOpen}
                onClose={() => setIsAddPanoramaOpen(false)}
            />
        </div>
    );
};

export default LeftSidebar; 