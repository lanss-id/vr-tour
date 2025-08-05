import React from 'react';
import { ChevronRight, X, ArrowLeft } from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import { useEditorStore } from '../../store/editorStore';
import { useResponsive } from '../../hooks/useResponsive';
import Button from '../common/Button';

const NavigationMenu: React.FC = () => {
    const { navigationVisible, setCurrentNode, toggleNavigation } = useViewerStore();
    const { navigationMenu } = useEditorStore();
    const { isMobile } = useResponsive();

    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

    if (!navigationVisible) return null;

    // If a category is selected, show its items
    if (selectedCategory) {
        const category = navigationMenu.categories.find(c => c.id === selectedCategory);
        if (!category) return null;

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedCategory(null)}
                                className="p-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <h2 className="text-xl font-semibold text-gray-800">{category.title}</h2>
                            {category.subtitle && (
                                <span className="text-sm text-gray-500">- {category.subtitle}</span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            onClick={toggleNavigation}
                            className="p-2"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.items
                            .filter(item => item.isVisible)
                            .sort((a, b) => a.order - b.order)
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                                    onClick={() => {
                                        setCurrentNode(item.panoramaId);
                                        toggleNavigation();
                                    }}
                                >
                                    {/* Thumbnail */}
                                    {navigationMenu.showThumbnails && (
                                        <div className="relative mb-3">
                                            <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        target.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                                <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                                    <span className="text-gray-600 text-sm">{item.title}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        {navigationMenu.showSubtitles && item.subtitle && (
                                            <p className="text-sm text-gray-500">{item.subtitle}</p>
                                        )}
                                    </div>

                                    {/* Arrow indicator */}
                                    <div className="flex justify-end mt-3">
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        );
    }

    // Main navigation menu with categories
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto"
                style={{
                    backgroundColor: navigationMenu.style?.backgroundColor || 'rgba(255, 255, 255, 0.95)',
                    color: navigationMenu.style?.textColor || '#1f2937',
                    borderRadius: navigationMenu.style?.borderRadius || '12px',
                    boxShadow: navigationMenu.style?.shadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Navigation</h2>
                    <Button
                        variant="ghost"
                        onClick={toggleNavigation}
                        className="p-2"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {navigationMenu.categories
                        .filter(category => category.isVisible)
                        .sort((a, b) => a.order - b.order)
                        .map((category) => (
                            <div
                                key={category.id}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {/* Category Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-600">
                                                {category.icon === 'map-pin' && '📍'}
                                                {category.icon === 'home' && '🏠'}
                                                {category.icon === 'building' && '🏢'}
                                                {category.icon === 'image' && '🖼️'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                {category.title}
                                            </h3>
                                            {category.subtitle && (
                                                <p className="text-xs text-gray-500">{category.subtitle}</p>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>

                                {/* Preview Items */}
                                <div className="space-y-2">
                                    {category.items
                                        .filter(item => item.isVisible)
                                        .slice(0, 2)
                                        .map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentNode(item.panoramaId);
                                                    toggleNavigation();
                                                }}
                                            >
                                                {navigationMenu.showThumbnails && (
                                                    <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img
                                                            src={item.thumbnail}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                target.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                        <div className="hidden w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                                            <span className="text-xs text-gray-600">{item.title.charAt(0)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {item.title}
                                                    </p>
                                                    {navigationMenu.showSubtitles && item.subtitle && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {item.subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                    {category.items.filter(item => item.isVisible).length > 2 && (
                                        <div className="text-xs text-gray-500 text-center py-1">
                                            +{category.items.filter(item => item.isVisible).length - 2} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(NavigationMenu);
