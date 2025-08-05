import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Grid,
    Map,
    EyeOff,
    Maximize,
    Eye,
    Minimize,
    Play,
    Pause,
    Volume2,
    RotateCcw
} from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import Button from '../common/Button';
import panoramaData from '../../data/panorama-data.json';

// Global audio instance to prevent multiple instances
let globalAudio: HTMLAudioElement | null = null;

const ControlBar: React.FC = () => {
    const {
        controlsVisible,
        isFullscreen,
        currentNodeId,
        setCurrentNode,
        toggleGallery,
        toggleMinimap,
        toggleControls,
        toggleFullscreen,
        hideAllOverlays,
        clearStoredState
    } = useViewerStore();

    const [isPlaying, setIsPlaying] = useState(false);

    // Initialize audio once
    useEffect(() => {
        if (!globalAudio) {
            globalAudio = new Audio('/music/bg-music.mp3');
            globalAudio.loop = true;
            globalAudio.volume = 0.3;

            // Try to play immediately
            globalAudio.play().then(() => {
                setIsPlaying(true);
                console.log('Music autoplay successful');
            }).catch(() => {
                console.log('Autoplay failed, waiting for user interaction');

                // If autoplay fails, try to play on first user interaction
                const handleFirstInteraction = () => {
                    if (globalAudio && globalAudio.paused) {
                        globalAudio.play().then(() => {
                            setIsPlaying(true);
                            console.log('Music started on user interaction');
                        }).catch(err => {
                            console.warn('Failed to play music on interaction:', err);
                        });
                    }

                    // Remove event listeners after successful play
                    document.removeEventListener('click', handleFirstInteraction);
                    document.removeEventListener('keydown', handleFirstInteraction);
                    document.removeEventListener('touchstart', handleFirstInteraction);
                    document.removeEventListener('mousedown', handleFirstInteraction);
                };

                // Add multiple event listeners for different types of user interaction
                document.addEventListener('click', handleFirstInteraction, { once: true });
                document.addEventListener('keydown', handleFirstInteraction, { once: true });
                document.addEventListener('touchstart', handleFirstInteraction, { once: true });
                document.addEventListener('mousedown', handleFirstInteraction, { once: true });
            });
        }

        // Update playing state based on global audio
        const updatePlayingState = () => {
            setIsPlaying(!globalAudio?.paused);
        };

        if (globalAudio) {
            globalAudio.addEventListener('play', updatePlayingState);
            globalAudio.addEventListener('pause', updatePlayingState);
            updatePlayingState(); // Set initial state
        }

        return () => {
            if (globalAudio) {
                globalAudio.removeEventListener('play', updatePlayingState);
                globalAudio.removeEventListener('pause', updatePlayingState);
            }
        };
    }, []);

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        toggleFullscreen();
    };

    const handleMusicToggle = () => {
        if (!globalAudio) return;

        if (isPlaying) {
            globalAudio.pause();
        } else {
            globalAudio.play().catch(err => {
                console.warn('Failed to play music:', err);
            });
        }
    };

    const handlePreviousPanorama = () => {
        const currentIndex = panoramaData.findIndex(node => node.id === currentNodeId);
        if (currentIndex > 0) {
            const previousNode = panoramaData[currentIndex - 1];
            setCurrentNode(previousNode.id);
        } else {
            // Wrap to last panorama
            const lastNode = panoramaData[panoramaData.length - 1];
            setCurrentNode(lastNode.id);
        }
    };

    const handleNextPanorama = () => {
        const currentIndex = panoramaData.findIndex(node => node.id === currentNodeId);
        if (currentIndex < panoramaData.length - 1) {
            const nextNode = panoramaData[currentIndex + 1];
            setCurrentNode(nextNode.id);
        } else {
            // Wrap to 'kawasan-1' as default
            setCurrentNode('kawasan-1');
        }
    };

    const handleResetState = () => {
        if (confirm('Reset panorama state? This will clear any stored state and return to the first panorama.')) {
            clearStoredState();
        }
    };

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
                    onClick={handleMusicToggle}
                    className="p-2"
                    title={isPlaying ? "Pause Music (M)" : "Play Music (M)"}
                >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={hideAllOverlays}
                    className="p-2"
                    title="Hide All (H)"
                >
                    <EyeOff className="w-5 h-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetState}
                    className="p-2"
                    title="Reset State"
                >
                    <RotateCcw className="w-5 h-5" />
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
