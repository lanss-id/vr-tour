import React, { useEffect, useState } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import panoramaData from '../../data/panorama-data.json';

interface MinimapMarker {
    id: string;
    nodeId: string;
    x: number;
    y: number;
    label: string;
}

const MiniMap: React.FC = () => {
    const { minimapVisible, currentNodeId, setCurrentNode } = useViewerStore();
    const [markers, setMarkers] = useState<MinimapMarker[]>([]);

    // Generate minimap markers from panorama data
    useEffect(() => {
        const minimapMarkers = panoramaData.map((node, index) => ({
            id: node.id,
            nodeId: node.id,
            x: 20 + (index * 15) % 60, // Mock positioning
            y: 20 + Math.floor(index / 3) * 20,
            label: node.name,
        })) as MinimapMarker[];

        setMarkers(minimapMarkers);
    }, []);

    // Ensure current node is valid
    useEffect(() => {
        const validNode = panoramaData.find(node => node.id === currentNodeId);
        if (!validNode) {
            // If current node is invalid, set to 'kawasan-1' as default
            setCurrentNode('kawasan-1');
        }
    }, [currentNodeId, setCurrentNode]);

    if (!minimapVisible) return null;

    return (
        <div className="absolute left-4 bottom-20 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 w-64 h-48 shadow-lg">
                <div className="relative w-full h-full">
                    <img
                        src="/minimap/sideplan.jpeg"
                        alt="Site Plan"
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                            // Fallback to a colored div if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 rounded flex items-center justify-center">
                        <span className="text-gray-600 text-sm">Site Plan</span>
                    </div>

                    {markers.map(marker => {
                        const isActive = marker.id === currentNodeId;
                        const node = panoramaData.find(node => node.id === marker.id);
                        const hasLinks = (node?.links && node.links.length > 0) || false;

                        return (
                            <button
                                key={marker.id}
                                className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-125 ${isActive
                                    ? 'bg-red-500 ring-2 ring-red-200 shadow-lg'
                                    : hasLinks
                                        ? 'bg-blue-500 hover:bg-blue-600 shadow-md'
                                        : 'bg-gray-400 hover:bg-gray-500 shadow-md'
                                    }`}
                                style={{
                                    left: `${marker.x}%`,
                                    top: `${marker.y}%`
                                }}
                                onClick={() => setCurrentNode(marker.nodeId)}
                                title={`${marker.label}${isActive ? ' (Current)' : ''}${hasLinks ? ' (Has links)' : ''}`}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                )}

                                {/* Link indicator */}
                                {hasLinks && !isActive && (
                                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                            </button>
                        );
                    })}

                    {/* Current node label */}
                    {currentNodeId && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b">
                            {panoramaData.find(node => node.id === currentNodeId)?.name || 'Unknown Location'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(MiniMap);
