import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useViewerStore } from '../../store/viewerStore';
import { getLinksForPanorama, getAllLinks, validatePanoramaData } from '../../utils/panoramaLoader';
import { Link, CheckCircle, AlertCircle, Info } from 'lucide-react';

const EditorStatusBar: React.FC = () => {
    const { hotspots, currentPanoramaId } = useEditorStore();
    const { currentNodeId } = useViewerStore();

    // Get current panorama links
    const currentLinks = getLinksForPanorama(currentNodeId);
    const allLinks = getAllLinks();

    // Count hotspots by type
    const linkHotspots = hotspots.filter(h => h.type === 'link');
    const infoHotspots = hotspots.filter(h => h.type === 'info');
    const customHotspots = hotspots.filter(h => h.type === 'custom');

    // Count current panorama hotspots
    const currentHotspots = hotspots.filter(h => h.panoramaId === currentNodeId);
    const currentLinkHotspots = currentHotspots.filter(h => h.type === 'link');

    // Validate data
    const isDataValid = validatePanoramaData();

    return (
        <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 text-xs text-gray-600">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Data Validation Status */}
                    <div className="flex items-center space-x-1">
                        {isDataValid ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span>Data: {isDataValid ? 'Valid' : 'Invalid'}</span>
                    </div>

                    {/* Current Panorama Info */}
                    <div className="flex items-center space-x-1">
                        <Info className="w-3 h-3 text-blue-500" />
                        <span>Current: {currentNodeId}</span>
                    </div>

                    {/* Links Status */}
                    <div className="flex items-center space-x-1">
                        <Link className="w-3 h-3 text-purple-500" />
                        <span>Links: {allLinks.length} total</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Current Panorama Links */}
                    <div className="flex items-center space-x-1">
                        <span>Current Links: {currentLinks.length}</span>
                    </div>

                    {/* Hotspots Summary */}
                    <div className="flex items-center space-x-2">
                        <span>Hotspots:</span>
                        <span className="bg-blue-100 text-blue-700 px-1 rounded">Link: {linkHotspots.length}</span>
                        <span className="bg-green-100 text-green-700 px-1 rounded">Info: {infoHotspots.length}</span>
                        <span className="bg-orange-100 text-orange-700 px-1 rounded">Custom: {customHotspots.length}</span>
                    </div>

                    {/* Current Panorama Hotspots */}
                    <div className="flex items-center space-x-1">
                        <span>Current: {currentHotspots.length} ({currentLinkHotspots.length} links)</span>
                    </div>
                </div>
            </div>

            {/* Detailed Current Panorama Info */}
            {currentLinks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                        Current panorama links: {currentLinks.map(link => link.nodeId).join(', ')}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorStatusBar;
