import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import MinimapEditor from './MinimapEditor';
import NavigationEditor from './NavigationEditor';
import { SupabaseStatus } from '../common/SupabaseStatus';
import { SupabaseMigration } from '../common/SupabaseMigration';
import { SupabasePanoramaManager } from './SupabasePanoramaManager';
import MarkerMigration from '../common/MarkerMigration';
import { Map, Navigation, Database, Target, Settings, FileText } from 'lucide-react';

const EditorDashboard: React.FC = () => {
    const { editMode, setEditMode } = useEditorStore();
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

    const handleModeChange = (mode: string) => {
        setEditMode(mode as any);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Editor Dashboard</h1>

                {/* Enhanced Tab Navigation */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-1 bg-gray-200 p-1 rounded-lg">
                        <button
                            onClick={() => handleModeChange('hotspot')}
                            className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                editMode === 'hotspot'
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <Target className="w-4 h-4" />
                            <span>Hotspot Editor</span>
                        </button>
                        <button
                            onClick={() => handleModeChange('minimap')}
                            className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                editMode === 'minimap'
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <Map className="w-4 h-4" />
                            <span>Minimap Editor</span>
                        </button>
                        <button
                            onClick={() => handleModeChange('navigation')}
                            className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                editMode === 'navigation'
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <Navigation className="w-4 h-4" />
                            <span>Navigation Editor</span>
                        </button>
                        <button
                            onClick={() => handleModeChange('supabase')}
                            className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                editMode === 'supabase'
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <Database className="w-4 h-4" />
                            <span>Database</span>
                        </button>
                        <button
                            onClick={() => handleModeChange('settings')}
                            className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                editMode === 'settings'
                                    ? 'bg-gray-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </button>
                    </div>
                </div>

                {/* Content based on selected mode */}
                {editMode === 'minimap' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Minimap Editor</h2>
                        <MinimapEditor />
                    </div>
                )}

                {editMode === 'navigation' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Navigation Editor</h2>
                        <NavigationEditor />
                    </div>
                )}

                {editMode === 'hotspot' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Target className="w-6 h-6 text-blue-500" />
                            <h2 className="text-xl font-semibold">Hotspot Editor</h2>
                        </div>
                        <div className="text-center py-12">
                            <div className="text-gray-500 mb-4">
                                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-700 mb-2">VR Hotspot Editor</h3>
                                <p className="text-sm text-gray-500">
                                    Gunakan VR Editor untuk mengedit hotspot secara langsung di panorama 360°
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/editor'}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                Buka VR Editor
                            </button>
                        </div>
                    </div>
                )}

                {editMode === 'supabase' && (
                    <div className="space-y-6">
                        {/* Supabase Status */}
                        <SupabaseStatus />

                        {/* Supabase Migration */}
                        <SupabaseMigration />

                        {/* Marker Migration */}
                        <MarkerMigration />

                        {/* Supabase Panorama Manager */}
                        <SupabasePanoramaManager />
                    </div>
                )}

                {editMode === 'settings' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Settings className="w-6 h-6 text-gray-600" />
                            <h2 className="text-xl font-semibold">Settings</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-medium text-gray-800 mb-3">Migration Tools</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            // Run migration script
                                            console.log('Running migration script...');
                                        }}
                                        className="w-full text-left p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        Generate SQL Migration
                                    </button>
                                    <p className="text-xs text-gray-500">
                                        Generate SQL untuk migrasi data dari JSON ke Supabase
                                    </p>
                                </div>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-medium text-gray-800 mb-3">Database Status</h3>
                                <div className="text-sm text-gray-600">
                                    <p>• Panoramas: <span className="font-medium">Loaded from Supabase</span></p>
                                    <p>• Hotspots: <span className="font-medium">Ready for migration</span></p>
                                    <p>• Real-time sync: <span className="font-medium text-green-600">Active</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorDashboard; 