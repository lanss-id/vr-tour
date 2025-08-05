import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
    Menu,
    Plus,
    Trash2,
    Edit3,
    Eye,
    EyeOff,
    Upload,
    Settings,
    ChevronRight,
    Image,
    Building2,
    MapPin,
    Home
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useViewerSupabase } from '../../hooks/useViewerSupabase';
import { NavigationCategory, NavigationItem, NavigationMenuData } from '../../types/editor';
import Button from '../common/Button';

const NavigationEditor: React.FC = memo(() => {
    const {
        navigationMenu,
        addNavigationCategory,
        updateNavigationCategory,
        deleteNavigationCategory,
        addNavigationItem,
        updateNavigationItem,
        deleteNavigationItem,
        updateNavigationMenu
    } = useEditorStore();

    const { panoramas, loading, error: supabaseError } = useViewerSupabase();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const [newCategoryData, setNewCategoryData] = useState({
        title: '',
        subtitle: '',
        icon: 'building',
        order: 0
    });
    const [newItemData, setNewItemData] = useState({
        title: '',
        subtitle: '',
        thumbnail: '',
        panoramaId: '',
        order: 0
    });

    // Reset error when navigation menu changes
    useEffect(() => {
        setError(null);
    }, [navigationMenu]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Debounced update function
    const debouncedUpdateNavigationMenu = useCallback((updates: Partial<NavigationMenuData>) => {
        try {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                updateNavigationMenu(updates);
            }, 300);
        } catch (error) {
            console.error('Error updating navigation menu:', error);
            setError('Failed to update navigation menu');
        }
    }, [updateNavigationMenu]);

    const handleAddCategory = () => {
        try {
            if (newCategoryData.title.trim()) {
                const category: NavigationCategory = {
                    id: `category-${Date.now()}`,
                    title: newCategoryData.title,
                    subtitle: newCategoryData.subtitle,
                    icon: newCategoryData.icon,
                    order: newCategoryData.order,
                    isVisible: true,
                    items: []
                };
                addNavigationCategory(category);
                console.log('Navigation category added:', category);
                setNewCategoryData({ title: '', subtitle: '', icon: 'building', order: 0 });
                setIsAddingCategory(false);
            }
        } catch (error) {
            console.error('Error adding navigation category:', error);
            setError('Failed to add navigation category');
        }
    };

    const handleAddItem = (categoryId: string) => {
        try {
            if (newItemData.title.trim() && newItemData.panoramaId) {
                const item: NavigationItem = {
                    id: `item-${Date.now()}`,
                    title: newItemData.title,
                    subtitle: newItemData.subtitle,
                    thumbnail: newItemData.thumbnail,
                    panoramaId: newItemData.panoramaId,
                    order: newItemData.order,
                    isVisible: true
                };
                addNavigationItem(categoryId, item);
                console.log('Navigation item added:', item);
                setNewItemData({ title: '', subtitle: '', thumbnail: '', panoramaId: '', order: 0 });
                setIsAddingItem(false);
            }
        } catch (error) {
            console.error('Error adding navigation item:', error);
            setError('Failed to add navigation item');
        }
    };

    const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>, itemId: string, categoryId: string) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            updateNavigationItem(categoryId, itemId, { thumbnail: url });
        }
    };

    const getIconComponent = (iconName: string) => {
        const iconMap: { [key: string]: React.ComponentType<any> } = {
            building: Building2,
            map: MapPin,
            home: Home,
            image: Image,
            menu: Menu
        };
        return iconMap[iconName] || Building2;
    };

    const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        debouncedUpdateNavigationMenu({ layout: e.target.value as any });
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        debouncedUpdateNavigationMenu({ theme: e.target.value as any });
    };

    const handleShowThumbnailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedUpdateNavigationMenu({ showThumbnails: e.target.checked });
    };

    const handleShowSubtitlesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedUpdateNavigationMenu({ showSubtitles: e.target.checked });
    };

    // Show loading state
    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                <div className="text-center py-8">
                    <div className="text-gray-600 text-lg font-semibold mb-2">Memuat data...</div>
                    <div className="text-sm text-gray-500">Mengambil data panorama dari Supabase</div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                <div className="text-center py-8">
                    <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
                    <div className="text-gray-600">{error}</div>
                    <div className="text-sm text-gray-500 mt-2">
                        Tidak dapat memuat data panorama dari Supabase
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Menu className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-800">Navigation Editor</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* Open settings */ }}
                        title="Navigation settings"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Panorama Info */}
            <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-800 mb-1">Data Panorama dari Supabase</div>
                <div className="text-xs text-blue-600">
                    Total panorama: {panoramas.length} | Categories: {navigationMenu.categories.length}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-red-800 text-sm">{error}</div>
                </div>
            )}

            {/* Navigation Menu Settings */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Menu Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                        <select
                            value={navigationMenu.layout}
                            onChange={handleLayoutChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="grid">Grid</option>
                            <option value="list">List</option>
                            <option value="carousel">Carousel</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <select
                            value={navigationMenu.theme}
                            onChange={handleThemeChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={navigationMenu.showThumbnails}
                            onChange={handleShowThumbnailsChange}
                            className="rounded"
                        />
                        <span className="text-sm text-gray-700">Show Thumbnails</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={navigationMenu.showSubtitles}
                            onChange={handleShowSubtitlesChange}
                            className="rounded"
                        />
                        <span className="text-sm text-gray-700">Show Subtitles</span>
                    </label>
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
                    <Button
                        onClick={() => setIsAddingCategory(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Category
                    </Button>
                </div>

                {/* Add Category Form */}
                {isAddingCategory && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="font-medium text-gray-800">Add New Category</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Category Title"
                                value={newCategoryData.title}
                                onChange={(e) => setNewCategoryData({ ...newCategoryData, title: e.target.value })}
                                className="p-2 border border-gray-300 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Subtitle (optional)"
                                value={newCategoryData.subtitle}
                                onChange={(e) => setNewCategoryData({ ...newCategoryData, subtitle: e.target.value })}
                                className="p-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={handleAddCategory}
                                disabled={!newCategoryData.title.trim()}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Add Category
                            </Button>
                            <Button
                                onClick={() => setIsAddingCategory(false)}
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Categories List */}
                <div className="space-y-3">
                    {navigationMenu.categories
                        .sort((a, b) => a.order - b.order)
                        .map((category) => (
                            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        {React.createElement(getIconComponent(category.icon), { className: "w-4 h-4" })}
                                        <span className="font-medium">{category.title}</span>
                                        {category.subtitle && (
                                            <span className="text-sm text-gray-500">- {category.subtitle}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            onClick={() => setSelectedCategory(category.id)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => deleteNavigationCategory(category.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="text-sm text-gray-500">
                                    {category.items.length} items
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Panorama Selection for Items */}
            {isAddingItem && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-gray-800">Add Navigation Item</h4>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Item Title"
                            value={newItemData.title}
                            onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })}
                            className="p-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Subtitle (optional)"
                            value={newItemData.subtitle}
                            onChange={(e) => setNewItemData({ ...newItemData, subtitle: e.target.value })}
                            className="p-2 border border-gray-300 rounded-md text-sm"
                        />
                        <select
                            value={newItemData.panoramaId}
                            onChange={(e) => setNewItemData({ ...newItemData, panoramaId: e.target.value })}
                            className="p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="">Select Panorama...</option>
                            {panoramas.map((panorama) => (
                                <option key={panorama.id} value={panorama.id}>
                                    {panorama.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => handleAddItem(selectedCategory!)}
                                disabled={!newItemData.title.trim() || !newItemData.panoramaId}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Add Item
                            </Button>
                            <Button
                                onClick={() => setIsAddingItem(false)}
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default NavigationEditor;
