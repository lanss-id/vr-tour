import React, { useState } from 'react';
import { useSupabase } from '../../../../hooks/useSupabase';
import { useViewerSupabase } from '../../../../hooks/useViewerSupabase';
import { 
    Database, 
    Save, 
    Download, 
    Upload, 
    RefreshCw,
    Trash2,
    AlertTriangle,
    CheckCircle,
    Clock,
    Settings,
    FileText,
    HardDrive
} from 'lucide-react';
import Button from '../../../common/Button';

const DatabaseManager: React.FC = () => {
    const { panoramas, loading, error } = useViewerSupabase();
    const { createPanorama, updatePanorama, deletePanorama } = useSupabase();
    const [activeTab, setActiveTab] = useState<'status' | 'backup' | 'sync' | 'tools'>('status');
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            // TODO: Implement sync logic
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sync
            setLastSync(new Date());
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleBackup = async () => {
        try {
            const backupData = {
                panoramas,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };
            
            const blob = new Blob([JSON.stringify(backupData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `panorama-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Backup failed:', error);
        }
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backupData = JSON.parse(e.target?.result as string);
                    console.log('Restore data:', backupData);
                    // TODO: Implement restore logic
                } catch (error) {
                    console.error('Restore failed:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    const renderStatusTab = () => (
        <div className="space-y-4">
            {/* Connection Status */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Connection Status</h4>
                    <div className={`w-2 h-2 rounded-full ${
                        error ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                    <div>Status: {error ? 'Disconnected' : 'Connected'}</div>
                    <div>Panoramas: {panoramas.length}</div>
                    {error && <div className="text-red-600">Error: {error}</div>}
                </div>
            </div>

            {/* Sync Status */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Sync Status</h4>
                    <Button
                        size="sm"
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                    <div>Last Sync: {lastSync ? lastSync.toLocaleString() : 'Never'}</div>
                    <div>Auto-sync: Enabled</div>
                </div>
            </div>

            {/* Database Info */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Database Info</h4>
                <div className="text-xs text-gray-600 space-y-1">
                    <div>Type: Supabase</div>
                    <div>Tables: panoramas, hotspots, navigation</div>
                    <div>Storage: 2.3 GB used</div>
                </div>
            </div>
        </div>
    );

    const renderBackupTab = () => (
        <div className="space-y-4">
            {/* Backup Options */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Backup Options</h4>
                <div className="space-y-3">
                    <Button
                        size="sm"
                        onClick={handleBackup}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Create Backup
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleRestore}
                            className="hidden"
                            id="restore-file"
                        />
                        <label
                            htmlFor="restore-file"
                            className="block w-full p-2 border border-gray-300 rounded-md text-sm text-center cursor-pointer hover:bg-gray-50"
                        >
                            <Upload className="w-4 h-4 mr-2 inline" />
                            Restore from Backup
                        </label>
                    </div>
                </div>
            </div>

            {/* Backup History */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Backups</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span>panorama-backup-2024-01-15.json</span>
                        <span className="text-gray-500">2.1 MB</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span>panorama-backup-2024-01-10.json</span>
                        <span className="text-gray-500">2.0 MB</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSyncTab = () => (
        <div className="space-y-4">
            {/* Sync Settings */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Sync Settings</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Auto-sync</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Sync on save</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Conflict resolution</span>
                        <select className="text-xs border border-gray-300 rounded px-2 py-1">
                            <option>Server wins</option>
                            <option>Client wins</option>
                            <option>Manual</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Sync Log */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Sync Log</h4>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Synced 5 panoramas - 2 minutes ago</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        <span>Conflict detected - resolved automatically</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Synced 3 hotspots - 5 minutes ago</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderToolsTab = () => (
        <div className="space-y-4">
            {/* Database Tools */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Database Tools</h4>
                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-600 hover:text-blue-700"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Optimize Database
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-orange-600 hover:text-orange-700"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Export Schema
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Cache
                    </Button>
                </div>
            </div>

            {/* Maintenance */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Maintenance</h4>
                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-600 hover:text-gray-900"
                    >
                        <HardDrive className="w-4 h-4 mr-2" />
                        Check Storage
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-600 hover:text-gray-900"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Repair Database
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    {[
                        { key: 'status', label: 'Status', icon: CheckCircle },
                        { key: 'backup', label: 'Backup', icon: Download },
                        { key: 'sync', label: 'Sync', icon: RefreshCw },
                        { key: 'tools', label: 'Tools', icon: Settings }
                    ].map(({ key, label, icon: IconComponent }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                                activeTab === key
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
                {activeTab === 'status' && renderStatusTab()}
                {activeTab === 'backup' && renderBackupTab()}
                {activeTab === 'sync' && renderSyncTab()}
                {activeTab === 'tools' && renderToolsTab()}
            </div>
        </div>
    );
};

export default DatabaseManager; 