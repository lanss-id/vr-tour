import React from 'react';
import { ChevronRight, MapPin, Home, Building2, X } from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import { useResponsive } from '../../hooks/useResponsive';
import panoramaData from '../../data/panorama-data.json';
import Button from '../common/Button';

interface NavigationItem {
    id: string;
    title: string;
    icon: React.ReactNode;
    nodeId: string;
    category: 'drone' | 'entrance' | 'unit-type';
}

const NavigationMenu: React.FC = () => {
    const { navigationVisible, setCurrentNode, toggleNavigation } = useViewerStore();
    const { isMobile } = useResponsive();

    // Group panoramas by category
    const navigationItems: NavigationItem[] = [
        // Drone View - Kawasan panoramas
        ...panoramaData
            .filter(node => node.id.startsWith('kawasan'))
            .map(node => ({
                id: node.id,
                title: node.name,
                icon: <MapPin className="w-6 h-6 text-blue-600" />,
                nodeId: node.id,
                category: 'drone' as const,
            })),

        // Main Gate - First panorama
        {
            id: 'main-gate',
            title: 'Main Gate',
            icon: <Home className="w-6 h-6 text-green-600" />,
            nodeId: 'kawasan-1',
            category: 'entrance' as const,
        },

        // Unit Types
        ...panoramaData
            .filter(node => node.id.startsWith('type'))
            .slice(0, 3) // Show first 3 unit types as examples
            .map(node => ({
                id: node.id,
                title: node.name,
                icon: <Building2 className="w-6 h-6 text-purple-600" />,
                nodeId: node.id,
                category: 'unit-type' as const,
            })),
    ];

    if (!navigationVisible) return null;

    // Mobile layout - full screen overlay
    if (isMobile) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[80vh] overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Navigation</h3>
                        <Button
                            variant="ghost"
                            onClick={toggleNavigation}
                            className="p-2"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {navigationItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentNode(item.nodeId);
                                    toggleNavigation();
                                }}
                                className="flex items-center space-x-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors group"
                            >
                                <div className="flex-shrink-0">
                                    {item.icon}
                                </div>
                                <span className="text-left font-medium text-gray-700 group-hover:text-gray-900">
                                    {item.title}
                                </span>
                                {item.category === 'unit-type' && (
                                    <ChevronRight className="ml-auto w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Desktop layout - right sidebar
    return (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-4 w-80 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h3>

                {navigationItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentNode(item.nodeId)}
                        className="flex items-center space-x-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                        <div className="flex-shrink-0">
                            {item.icon}
                        </div>
                        <span className="text-left font-medium text-gray-700 group-hover:text-gray-900">
                            {item.title}
                        </span>
                        {item.category === 'unit-type' && (
                            <ChevronRight className="ml-auto w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default React.memo(NavigationMenu);
