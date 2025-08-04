import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Grid,
    Map,
    EyeOff,
    Maximize,
    Eye,
    Minimize
} from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import Button from '../common/Button';

const ControlBar: React.FC = () => {
    const {
        controlsVisible,
        isFullscreen,
        toggleGallery,
        toggleMinimap,
        toggleControls,
        toggleFullscreen,
        hideAllOverlays
    } = useViewerStore();

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        toggleFullscreen();
    };

    if (!controlsVisible) return null;

    return (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Previous panorama logic */ }}
                    className="p-2"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleGallery}
                    className="p-2"
                >
                    <Grid className="w-5 h-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMinimap}
                    className="p-2"
                >
                    <Map className="w-5 h-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={hideAllOverlays}
                    className="p-2"
                >
                    <EyeOff className="w-5 h-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFullscreen}
                    className="p-2"
                >
                    {isFullscreen ? (
                        <Minimize className="w-5 h-5" />
                    ) : (
                        <Maximize className="w-5 h-5" />
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Next panorama logic */ }}
                    className="p-2"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export default React.memo(ControlBar);
