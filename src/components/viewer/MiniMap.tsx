import React from 'react';
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

    // Mock minimap data - in real app this would come from a separate data file
    const minimapData = {
        backgroundImage: '/minimap/sideplan.jpeg',
        markers: panoramaData.map((node, index) => ({
            id: node.id,
            nodeId: node.id,
            x: 20 + (index * 15) % 60, // Mock positioning
            y: 20 + Math.floor(index / 3) * 20,
            label: node.name,
        })) as MinimapMarker[],
    };

    if (!minimapVisible) return null;

    return (
        <div className="absolute left-4 bottom-20 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 w-64 h-48 shadow-lg">
                <div className="relative w-full h-full">
                    <img
                        src={minimapData.backgroundImage}
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

                    {minimapData.markers.map(marker => (
                        <button
                            key={marker.id}
                            className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-125 ${marker.id === currentNodeId
                                ? 'bg-red-500 ring-2 ring-red-200 shadow-lg'
                                : 'bg-blue-500 hover:bg-blue-600 shadow-md'
                                }`}
                            style={{
                                left: `${marker.x}%`,
                                top: `${marker.y}%`
                            }}
                            onClick={() => setCurrentNode(marker.nodeId)}
                            title={marker.label}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(MiniMap);
