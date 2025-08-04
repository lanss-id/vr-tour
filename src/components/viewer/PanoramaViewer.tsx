import React, { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useViewerStore } from '../../store/viewerStore';
import panoramaData from '../../data/panorama-data.json';

const PanoramaViewer: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const { currentNodeId, setCurrentNode } = useViewerStore();
    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (!containerRef.current || isInitializedRef.current) {
            return;
        }

        isInitializedRef.current = true;

        // Convert panorama data to PSV format - identical to index.ts
        const nodes = panoramaData.map(node => ({
            ...node,
            gps: node.gps as [number, number]
        }));

        // Use first available node if current node doesn't exist
        let validNodeId = currentNodeId;
        const currentNode = nodes.find(node => node.id === currentNodeId);
        if (!currentNode) {
            validNodeId = nodes[0]?.id || 'kawasan-1';
            setCurrentNode(validNodeId);
        }

        // Initialize viewer with hidden navbar - using custom control bar instead
        viewerRef.current = new Viewer({
            container: containerRef.current,
            defaultYaw: '0deg',
            navbar: false, // Hide PSV navbar, use custom control bar
            plugins: [
                MarkersPlugin,
                GalleryPlugin.withConfig({
                    thumbnailSize: { width: 100, height: 100 },
                }),
                VirtualTourPlugin.withConfig({
                    positionMode: 'gps',
                    renderMode: '3d',
                    nodes: nodes,
                    startNodeId: validNodeId,
                }),
            ],
        });

        // Listen for node changes
        const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
        if (virtualTour) {
            virtualTour.addEventListener('node-changed', (e) => {
                setCurrentNode(e.data.nodeId);
            });
        }

        return () => {
            if (viewerRef.current) {
                try {
                    viewerRef.current.destroy();
                } catch (err) {
                    console.warn('Error destroying viewer in cleanup:', err);
                }
                viewerRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, []); // Empty dependency array for initial setup

    // Handle panorama navigation from external components
    useEffect(() => {
        if (!viewerRef.current || !isInitializedRef.current) {
            return;
        }

        const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
        if (virtualTour) {
            // Check if the node exists in the data
            const nodeExists = panoramaData.some(node => node.id === currentNodeId);
            if (nodeExists) {
                // Navigate to the selected panorama using the correct method
                try {
                    // Use the viewer's method to navigate to the node
                    (virtualTour as any).setCurrentNode(currentNodeId);
                } catch (err) {
                    console.warn('Error navigating to node:', err);
                }
            }
        }
    }, [currentNodeId]); // Listen to currentNodeId changes

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative"
            style={{ width: '100%', height: '100%', position: 'relative' }}
        />
    );
};

export default PanoramaViewer;
