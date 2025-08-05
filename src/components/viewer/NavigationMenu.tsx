import React from 'react';
import { ChevronRight, X, ArrowLeft } from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import { useEditorStore } from '../../store/editorStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useViewerSupabase } from '../../hooks/useViewerSupabase';
import Button from '../common/Button';

const NavigationMenu: React.FC = () => {
    const { navigationVisible, setCurrentNode, toggleNavigation, allOverlaysHidden } = useViewerStore();
    const { panoramas, loading, error } = useViewerSupabase();
    const { isMobile } = useResponsive();

    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

    // Generate navigation menu from database panoramas
    const generateNavigationMenu = () => {
        if (panoramas.length === 0) return { categories: [] };

        // Create main menu items based on panorama types
        const mainMenuItems = [];
        
        // Add drone view if exists
        const droneView = panoramas.find(p => p.name?.toLowerCase().includes('drone'));
        if (droneView) {
            mainMenuItems.push({
                id: 'drone-view',
                title: 'Drone View',
                type: 'item',
                panoramaId: droneView.id,
                thumbnail: droneView.thumbnail
            });
        }

        // Add main gate if exists
        const mainGate = panoramas.find(p => p.name?.toLowerCase().includes('gate') || p.name?.toLowerCase().includes('main'));
        if (mainGate) {
            mainMenuItems.push({
                id: 'main-gate',
                title: 'Main Gate',
                type: 'item',
                panoramaId: mainGate.id,
                thumbnail: mainGate.thumbnail
            });
        }

        // Group panoramas by type for sub menu
        const panoramaGroups = panoramas.reduce((groups: any, panorama: any) => {
            let type = 'Umum';
            if (panorama.name) {
                if (panorama.name.toLowerCase().includes('type')) {
                    type = panorama.name.split(' ')[0] + ' ' + panorama.name.split(' ')[1];
                } else if (panorama.name.toLowerCase().includes('kawasan')) {
                    type = 'Kawasan';
                }
            }
            
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(panorama);
            return groups;
        }, {});

        // Add type categories as sub menu
        Object.entries(panoramaGroups).forEach(([type, items]: [string, any]) => {
            if (items.length > 0) {
                mainMenuItems.push({
                    id: type.toLowerCase().replace(/\s+/g, '-'),
                    title: type,
                    type: 'category',
                    items: items.map((panorama: any) => ({
                        id: panorama.id,
                        title: panorama.name || panorama.caption || `Panorama ${panorama.id}`,
                        panoramaId: panorama.id,
                        thumbnail: panorama.thumbnail
                    }))
                });
            }
        });

        return { 
            mainItems: mainMenuItems,
            showThumbnails: true,
            showSubtitles: true,
            style: {
                backgroundColor: '#ffffff',
                textColor: '#000000',
                accentColor: '#3b82f6',
                borderRadius: '8px',
                shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }
        };
    };

    const navigationMenu = generateNavigationMenu();

    if (!navigationVisible || allOverlaysHidden) return null;

    // Show loading if data is still loading
    if (loading) {
        return (
            <div className="fixed right-20 top-1/2 transform -translate-y-1/2 z-50">
                <div className="bg-white rounded-lg p-4 w-80 shadow-lg border border-gray-200 relative">
                    <Button
                        variant="ghost"
                        onClick={toggleNavigation}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </Button>
                    <div className="text-center mt-2">
                        <div className="text-gray-600 text-sm font-semibold mb-2">Memuat panorama...</div>
                        <div className="text-xs text-gray-500">Mengambil data dari Supabase</div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error if there's an error
    if (error) {
        return (
            <div className="fixed right-20 top-1/2 transform -translate-y-1/2 z-50">
                <div className="bg-white rounded-lg p-4 w-80 shadow-lg border border-gray-200 relative">
                    <Button
                        variant="ghost"
                        onClick={toggleNavigation}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </Button>
                    <div className="text-center mt-2">
                        <div className="text-red-600 text-sm font-semibold mb-2">Error</div>
                        <div className="text-xs text-gray-600">{error}</div>
                        <div className="text-xs text-gray-500 mt-2">
                            Tidak dapat memuat data panorama dari Supabase
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show message if no panoramas
    if (panoramas.length === 0) {
        return (
            <div className="fixed right-20 top-1/2 transform -translate-y-1/2 z-50">
                <div className="bg-white rounded-lg p-4 w-80 shadow-lg border border-gray-200 relative">
                    <Button
                        variant="ghost"
                        onClick={toggleNavigation}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </Button>
                    <div className="text-center mt-2">
                        <div className="text-gray-600 text-sm font-semibold mb-2">Tidak ada panorama</div>
                        <div className="text-xs text-gray-500">
                            Belum ada data panorama di Supabase. Silakan tambah panorama melalui editor.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

        // If a category is selected, show its items
    if (selectedCategory) {
        const category = navigationMenu.mainItems.find(c => c.id === selectedCategory);
        if (!category || category.type !== 'category') return null;

        return (
            <div className="fixed right-20 top-1/2 transform -translate-y-1/2 z-50">
                <div className="bg-white rounded-lg p-4 w-80 shadow-lg border border-gray-200 relative">
                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        onClick={toggleNavigation}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </Button>
                    
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4 py-8 border-b border-gray-200">
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedCategory(null)}
                            className="p-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h2 className="text-sm font-semibold text-gray-800">{category.title}</h2>
                    </div>

                    {/* Items List */}
                    <div className="space-y-1">
                        {category.items.map((item) => {
                            // Find panorama data from Supabase
                            const panorama = panoramas.find(p => p.id === item.panoramaId);
                            if (!panorama) return null;

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group border-b border-gray-100 last:border-b-0"
                                    onClick={() => {
                                        console.log('Navigating to panorama:', item.panoramaId);
                                        setCurrentNode(item.panoramaId);
                                        toggleNavigation();
                                    }}
                                >
                                    {/* Circular Icon */}
                                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
                                        <span className="text-blue-600 text-xs font-medium">
                                            {panorama.name?.charAt(0) || 'P'}
                                        </span>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {panorama.name || item.title}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Main navigation menu
    return (
        <div className="fixed right-20 top-1/2 transform -translate-y-1/2 z-50">
            <div className="bg-white rounded-lg p-4 w-80 shadow-lg border border-gray-200 relative">
                {/* Close Button */}
                <Button
                    variant="ghost"
                    onClick={toggleNavigation}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </Button>
                
                {/* Main Menu Items */}
                <div className="space-y-1 mt-2">
                    {navigationMenu.mainItems?.map((item) => {
                        // Find panorama data from Supabase for direct items
                        const panorama = item.type === 'item' ? panoramas.find(p => p.id === item.panoramaId) : null;

                        return (
                            <div
                                key={item.id}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                    if (item.type === 'item') {
                                        console.log('Navigating to panorama:', item.panoramaId);
                                        setCurrentNode(item.panoramaId);
                                        toggleNavigation();
                                    } else if (item.type === 'category') {
                                        setSelectedCategory(item.id);
                                    }
                                }}
                            >
                                {/* Circular Icon */}
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    {item.type === 'item' && panorama?.thumbnail ? (
                                        <img
                                            src={panorama.thumbnail}
                                            alt={panorama.name || item.title}
                                            className="w-full h-full object-cover rounded-full"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                target.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : (
                                        <span className="text-gray-600 text-xs font-medium">
                                            {item.title.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {item.title}
                                    </p>
                                </div>

                                {/* Arrow for categories */}
                                {item.type === 'category' && (
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default React.memo(NavigationMenu);
