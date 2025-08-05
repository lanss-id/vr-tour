import React, { useEffect, useState } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { useViewerSupabase } from '../../hooks/useViewerSupabase';
import { getHotspotsForPanorama } from '../../services/migrationService';

interface MinimapMarker {
    id: string;
    nodeId: string;
    x: number;
    y: number;
    label: string;
    hasLinks: boolean;
}

const MiniMap: React.FC = () => {
    const { minimapVisible, currentNodeId, setCurrentNode, allOverlaysHidden } = useViewerStore();
    const { panoramas, loading, error } = useViewerSupabase();
    const [markers, setMarkers] = useState<MinimapMarker[]>([]);
    const [markerConnections, setMarkerConnections] = useState<{ from: string; to: string }[]>([]);

    // Generate minimap markers from panorama data and check connections
    useEffect(() => {
        if (panoramas.length === 0) return;

        const generateMarkers = async () => {
            const minimapMarkers = panoramas.map((node, index) => ({
                id: node.id,
                nodeId: node.id,
                x: 20 + (index * 15) % 60, // Mock positioning
                y: 20 + Math.floor(index / 3) * 20,
                label: node.name,
                hasLinks: false, // Will be updated after checking hotspots
            })) as MinimapMarker[];

            // Check connections by looking at hotspots
            const connections: { from: string; to: string }[] = [];
            const markersWithLinks = await Promise.all(
                minimapMarkers.map(async (marker) => {
                    try {
                        const hotspots = await getHotspotsForPanorama(marker.nodeId);
                        const hasLinks = hotspots.length > 0;
                        
                        // Add connections
                        hotspots.forEach(hotspot => {
                            if (hotspot.target_node_id) {
                                connections.push({
                                    from: marker.nodeId,
                                    to: hotspot.target_node_id
                                });
                            }
                        });

                        return {
                            ...marker,
                            hasLinks
                        };
                    } catch (error) {
                        console.warn(`Error checking hotspots for ${marker.nodeId}:`, error);
                        return marker;
                    }
                })
            );

            setMarkers(markersWithLinks);
            setMarkerConnections(connections);
        };

        generateMarkers();
    }, [panoramas]);

    // Ensure current node is valid
    useEffect(() => {
        if (panoramas.length === 0) return;

        const validNode = panoramas.find(node => node.id === currentNodeId);
        if (!validNode) {
            // If current node is invalid, set to first panorama as default
            setCurrentNode(panoramas[0].id);
        }
    }, [currentNodeId, setCurrentNode, panoramas]);

    if (!minimapVisible || allOverlaysHidden) return null;

    // Show loading state
    if (loading) {
        return (
            <div className="absolute left-4 bottom-20 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 w-64 h-48 shadow-lg">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-gray-600 text-sm mb-2">Memuat...</div>
                            <div className="text-xs text-gray-500">Mengambil data dari Supabase</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="absolute left-4 bottom-20 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 w-64 h-48 shadow-lg">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-red-600 text-sm mb-2">Error</div>
                            <div className="text-xs text-gray-500">Tidak dapat memuat data</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show empty state
    if (panoramas.length === 0) {
        return (
            <div className="absolute left-4 bottom-20 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 w-64 h-48 shadow-lg">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-gray-600 text-sm mb-2">Tidak ada panorama</div>
                            <div className="text-xs text-gray-500">Belum ada data di Supabase</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute left-4 bottom-20 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 w-64 h-48 shadow-lg">
                <div className="relative w-full h-full">
                    <img
                        src="/minimap/sideplan.jpeg"
                        alt="Site Plan"
                        className="w-full h-full object-cover rounded"
                    />
                    
                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {markerConnections.map((connection, index) => {
                            const fromMarker = markers.find(m => m.nodeId === connection.from);
                            const toMarker = markers.find(m => m.nodeId === connection.to);
                            
                            if (!fromMarker || !toMarker) return null;
                            
                            return (
                                <line
                                    key={`connection-${index}`}
                                    x1={fromMarker.x}
                                    y1={fromMarker.y}
                                    x2={toMarker.x}
                                    y2={toMarker.y}
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                />
                            );
                        })}
                    </svg>

                    {/* Markers */}
                    {markers.map((marker) => (
                        <div
                            key={marker.id}
                            className={`absolute w-3 h-3 rounded-full cursor-pointer transition-all ${
                                marker.nodeId === currentNodeId
                                    ? 'bg-blue-600 ring-2 ring-blue-300'
                                    : marker.hasLinks
                                    ? 'bg-green-500'
                                    : 'bg-gray-400'
                            }`}
                            style={{
                                left: `${marker.x}%`,
                                top: `${marker.y}%`,
                                transform: 'translate(-50%, -50%)'
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

export default MiniMap;
