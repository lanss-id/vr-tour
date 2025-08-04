import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3 } from 'lucide-react';
import PanoramaViewer from '../components/viewer/PanoramaViewer';
import ControlBar from '../components/viewer/ControlBar';
import GalleryModal from '../components/viewer/GalleryModal';
import NavigationMenu from '../components/viewer/NavigationMenu';
import MiniMap from '../components/viewer/MiniMap';
import { useKeyboard } from '../hooks/useKeyboard';
import Button from '../components/common/Button';

const ViewerPage: React.FC = () => {
    // Enable keyboard shortcuts
    useKeyboard();

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Main PSV Container */}
            <main className="w-full h-full">
                <PanoramaViewer />
            </main>

            {/* Top Logo/Branding */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                    <h1 className="text-xl font-bold text-gray-800">VR Panorama Tour</h1>
                </div>
            </div>

            {/* Editor Button */}
            <div className="absolute top-4 right-4 z-10">
                <Link to="/editor">
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center space-x-2"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>Editor</span>
                    </Button>
                </Link>
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
            <div className="absolute bottom-20 right-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs text-gray-600">
                    <div className="font-semibold mb-1">Shortcuts:</div>
                    <div>G: Gallery | M: Minimap | N: Navigation</div>
                    <div>F: Fullscreen | H/ESC: Hide All</div>
                    <div className="mt-1 text-xs">Ctrl+Alt+H: High Contrast</div>
                </div>
            </div>
        </div>
    );
};

export default ViewerPage;
