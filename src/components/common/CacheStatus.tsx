import React, { useState, useEffect } from 'react';
import { useImageCache } from '../../utils/imageCache';
import { useDataManager } from '../../utils/dataManager';
import Button from './Button';

interface CacheStatusProps {
    className?: string;
}

const CacheStatus: React.FC<CacheStatusProps> = ({ className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const { getStats, clearCache, preloadImages } = useImageCache();
    const { panoramas, saveToStorage, loadFromStorage } = useDataManager();

    useEffect(() => {
        // Update stats every 5 seconds
        const interval = setInterval(() => {
            setStats(getStats());
        }, 5000);

        return () => clearInterval(interval);
    }, [getStats]);

    useEffect(() => {
        // Set initial sync time
        setLastSync(new Date());
    }, []);

    const handlePreloadImages = async () => {
        try {
            const imageUrls = panoramas.map(p => p.panorama).filter(Boolean);
            await preloadImages(imageUrls);
            setLastSync(new Date());
        } catch (error) {
            console.error('Error preloading images:', error);
        }
    };

    const handleClearCache = () => {
        clearCache();
        setStats(getStats());
    };

    const handleSaveData = () => {
        saveToStorage();
        setLastSync(new Date());
    };

    const handleLoadData = () => {
        loadFromStorage();
        setLastSync(new Date());
    };

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString();
    };

    if (!isVisible) {
        return (
            <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
                <Button
                    onClick={() => setIsVisible(true)}
                    variant="transparent"
                    size="sm"
                    className="bg-white/80 backdrop-blur-sm shadow-lg"
                >
                    📊 Cache Status
                </Button>
            </div>
        );
    }

    return (
        <div className={`fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-800">Cache & Sync Status</h3>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>

            {stats && (
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Cache Size:</span>
                        <span className="font-medium">{formatSize(stats.totalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Images Cached:</span>
                        <span className="font-medium">{stats.totalImages}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Avg Size:</span>
                        <span className="font-medium">{formatSize(stats.averageSize)}</span>
                    </div>
                    {lastSync && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Last Sync:</span>
                            <span className="font-medium">{formatTime(lastSync)}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 space-y-2">
                <Button
                    onClick={handlePreloadImages}
                    variant="primary"
                    size="sm"
                    className="w-full"
                >
                    🔄 Preload Images
                </Button>

                <div className="flex space-x-2">
                    <Button
                        onClick={handleSaveData}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                    >
                        💾 Save
                    </Button>
                    <Button
                        onClick={handleLoadData}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                    >
                        📂 Load
                    </Button>
                </div>

                <Button
                    onClick={handleClearCache}
                    variant="danger"
                    size="sm"
                    className="w-full"
                >
                    🗑️ Clear Cache
                </Button>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                    <div>• Cache automatically cleans up expired images</div>
                    <div>• Data syncs between editor and viewer</div>
                    <div>• Images are cached for 24 hours</div>
                </div>
            </div>
        </div>
    );
};

export default CacheStatus;
