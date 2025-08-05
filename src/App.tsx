import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ViewerPage from './pages/ViewerPage';
import EditorPage from './pages/EditorPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import CacheStatus from './components/common/CacheStatus';
import { useDataManager } from './utils/dataManager';
import { useImageCache } from './utils/imageCache';

const App: React.FC = () => {
    const { loadFromStorage, panoramas } = useDataManager();
    const { preloadImages } = useImageCache();

    // Initialize data manager and preload images on app start
    useEffect(() => {
        // Load data from localStorage
        loadFromStorage();

        // Preload panorama images for better performance
        const imageUrls = panoramas.map(p => p.panorama).filter(Boolean);
        if (imageUrls.length > 0) {
            preloadImages(imageUrls).catch(error => {
                console.warn('Failed to preload images:', error);
            });
        }
    }, [loadFromStorage, panoramas, preloadImages]);

    return (
        <ErrorBoundary key="app-error-boundary">
            <div className="App">
                <Routes>
                    <Route path="/" element={<ViewerPage />} />
                    <Route path="/viewer" element={<ViewerPage />} />
                    <Route path="/editor" element={<EditorPage />} />
                </Routes>

                {/* Cache Status Component */}
                <CacheStatus />
            </div>
        </ErrorBoundary>
    );
};

export default App;
