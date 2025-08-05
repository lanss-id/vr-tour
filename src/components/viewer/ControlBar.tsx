import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Grid,
    Map,
    EyeOff,
    Maximize,
    Eye,
    Minimize
} from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import { useViewerSupabase } from '../../hooks/useViewerSupabase';
import Button from '../common/Button';

const ControlBar: React.FC = () => {
    const {
        controlsVisible,
        isFullscreen,
        currentNodeId,
        allOverlaysHidden,
        setCurrentNode,
        toggleGallery,
        toggleMinimap,
        toggleControls,
        toggleFullscreen,
        hideAllOverlays,
        toggleAllOverlays
    } = useViewerStore();

    const { panoramas } = useViewerSupabase();

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        toggleFullscreen();
    };

    const handlePreviousPanorama = () => {
        if (panoramas.length === 0) return;
        
        // If currentNodeId is empty, use first panorama
        const currentId = currentNodeId || panoramas[0].id;
        const currentIndex = panoramas.findIndex((node: any) => node.id === currentId);
        
        if (currentIndex > 0) {
            const previousNode = panoramas[currentIndex - 1];
            setCurrentNode(previousNode.id);
        } else {
            // Wrap to last panorama
            const lastNode = panoramas[panoramas.length - 1];
            setCurrentNode(lastNode.id);
        }
    };

    const handleNextPanorama = () => {
        if (panoramas.length === 0) return;
        
        // If currentNodeId is empty, use first panorama
        const currentId = currentNodeId || panoramas[0].id;
        const currentIndex = panoramas.findIndex((node: any) => node.id === currentId);
        
        if (currentIndex < panoramas.length - 1) {
            const nextNode = panoramas[currentIndex + 1];
            setCurrentNode(nextNode.id);
        } else {
            // Wrap to first panorama
            const firstNode = panoramas[0];
            setCurrentNode(firstNode.id);
        }
    };

    const handleResetState = () => {
        if (confirm('Reset panorama state? This will clear any stored state and return to the first panorama.')) {
            window.location.reload();
        }
    };

    // Jika semua overlay tersembunyi, tampilkan tombol chevron up
    if (allOverlaysHidden) {
        return (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllOverlays}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    title="Show All Overlays"
                >
                    <ChevronUp className="w-6 h-6" />
                </Button>
            </div>
        );
    }

    if (!controlsVisible) return null;

    return (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousPanorama}
                    className="p-2"
                    title="Previous Panorama (←/A)"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleGallery}
                    className="p-2"
                    title="Gallery (G)"
                >
                    <Grid className="w-5 h-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMinimap}
                    className="p-2"
                    title="Minimap (M)"
                >
                    <Map className="w-5 h-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllOverlays}
                    className="p-2"
                    title="Hide All (H)"
                >
                    <EyeOff className="w-5 h-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFullscreen}
                    className="p-2"
                    title="Fullscreen (F)"
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
                    onClick={handleNextPanorama}
                    className="p-2"
                    title="Next Panorama (→/D)"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export default React.memo(ControlBar);
