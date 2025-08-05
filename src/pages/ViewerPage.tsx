import React, { useEffect } from 'react';
import { ChevronRight, Menu } from 'lucide-react';
import PanoramaViewer from '../components/viewer/PanoramaViewer';
import ControlBar from '../components/viewer/ControlBar';
import GalleryModal from '../components/viewer/GalleryModal';
import NavigationMenu from '../components/viewer/NavigationMenu';
import MiniMap from '../components/viewer/MiniMap';
import { useKeyboard } from '../hooks/useKeyboard';
import { useViewerStore } from '../store/viewerStore';
import Button from '../components/common/Button';

const ViewerPage: React.FC = () => {
    // Enable keyboard shortcuts
    useKeyboard();

    const { toggleNavigation, clearStoredState } = useViewerStore();

    // Clear stored state on component mount to prevent persistent state issues
    useEffect(() => {
        // Clear any stored state that might cause issues
        try {
            localStorage.removeItem('viewer-store');
            localStorage.removeItem('panorama-viewer-state');
            console.log('Cleared stored viewer state on mount');
        } catch (error) {
            console.warn('Error clearing stored state on mount:', error);
        }
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Main PSV Container */}
            <main className="w-full h-full">
                <PanoramaViewer />
            </main>

            {/* Top Logo/Branding */}
            <div className="hidden md:block absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                    <h1 className="text-xl font-bold text-gray-800">VR Panorama Tour</h1>
                </div>
            </div>

            {/* Navigation Button - Right Center */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                    variant="transparent"
                    onClick={toggleNavigation}
                    className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    title="Navigation Menu (N)"
                >
                    <ChevronRight className="w-12 h-12 text-gray-800" />
                </Button>
            </div>

            {/* Right Navigation Menu */}
            <NavigationMenu />

            {/* Left Bottom Minimap */}
            <MiniMap />

            {/* Bottom Control Bar */}
            <ControlBar />

            {/* Gallery Modal */}
            <GalleryModal />

            {/* Keyboard Shortcuts Help */}
            <div className="hidden md:block absolute top-5 right-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs text-gray-600">
                    <div className="font-semibold mb-1">Shortcuts:</div>
                    <div>G: Gallery | M: Minimap | N: Navigation</div>
                    <div>F: Fullscreen | H/ESC: Hide All</div>
                    <div>←/A: Previous | →/D: Next</div>
                    <div>M: Music Toggle | Ctrl+R: Reset State</div>
                    <div className="mt-1 text-xs">Ctrl+Alt+H: High Contrast</div>
                </div>
            </div>
        </div>
    );
};

export default ViewerPage;
