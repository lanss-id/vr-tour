import React, { useState, useEffect } from 'react';
import { Info, Play, Pause } from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import Button from '../common/Button';

// Global audio instance to prevent multiple instances
let globalAudio: HTMLAudioElement | null = null;

const SideButtons: React.FC = () => {
    const { allOverlaysHidden, toggleInfoBlock } = useViewerStore();
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

    // Jika semua overlay tersembunyi, jangan tampilkan tombol
    if (allOverlaysHidden) return null;

    return (
        <div className="absolute bottom-10 right-4 z-20">
            <div className="flex space-x-4">
                {/* Info Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleInfoBlock}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    title="Keyboard Shortcuts (I/ESC)"
                >
                    <Info className="w-6 h-6" />
                </Button>

                {/* Music Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMusicToggle}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    title={isPlaying ? "Pause Music (M)" : "Play Music (M)"}
                >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
            </div>
        </div>
    );
};

export default SideButtons; 