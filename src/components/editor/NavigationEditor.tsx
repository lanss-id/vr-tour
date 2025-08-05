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
import { NavigationCategory, NavigationItem, NavigationMenuData } from '../../types/editor';
import Button from '../common/Button';

const NavigationEditor: React.FC = memo(() => {
    const {
        navigationMenu,
        panoramas,
        addNavigationCategory,
        updateNavigationCategory,
        deleteNavigationCategory,
        addNavigationItem,
        updateNavigationItem,
        deleteNavigationItem,
        updateNavigationMenu
    } = useEditorStore();

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
            console.error('Error adding category:', error);
            setError('Failed to add category');
        }
    };

    const handleAddItem = (categoryId: string) => {
        try {
            if (newItemData.title.trim() && newItemData.panoramaId) {
                const item: NavigationItem = {
                    id: `item-${Date.now()}`,
                    title: newItemData.title,
                    subtitle: newItemData.subtitle,
                    thumbnail: newItemData.thumbnail || '/placeholder-thumbnail.jpg',
                    panoramaId: newItemData.panoramaId,
                    order: newItemData.order,
                    isVisible: true
                };
                addNavigationItem(categoryId, item);
                setNewItemData({ title: '', subtitle: '', thumbnail: '', panoramaId: '', order: 0 });
                setIsAddingItem(false);
            }
        } catch (error) {
            console.error('Error adding item:', error);
            setError('Failed to add item');
        }
    };

    const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>, itemId: string, categoryId: string) => {
        try {
            const file = event.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const thumbnail = e.target?.result as string;
                    updateNavigationItem(categoryId, itemId, { thumbnail });
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
            setError('Failed to upload thumbnail');
        }
    };

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'map-pin':
                return <MapPin className="w-4 h-4" />;
            case 'home':
                return <Home className="w-4 h-4" />;
            case 'building':
                return <Building2 className="w-4 h-4" />;
            case 'image':
                return <Image className="w-4 h-4" />;
            default:
                return <Building2 className="w-4 h-4" />;
        }
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

    // Show error if any
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <div className="text-red-600">⚠️</div>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
                <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                    Dismiss
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Menu className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-800">Navigation Menu Editor</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingCategory(true)}
                        className="flex items-center space-x-1"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Category</span>
                    </Button>
                </div>
            </div>

            {/* Layout Settings */}
            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Layout Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Layout Type</label>
                        <select
                            value={navigationMenu.layout}
                            onChange={handleLayoutChange}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="cards">Cards (like reference)</option>
                            <option value="grid">Grid</option>
                            <option value="list">List</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Theme</label>
                        <select
                            value={navigationMenu.theme}
                            onChange={handleThemeChange}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Show Thumbnails</label>
                        <input
                            type="checkbox"
                            checked={navigationMenu.showThumbnails}
                            onChange={handleShowThumbnailsChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Show Subtitles</label>
                        <input
                            type="checkbox"
                            checked={navigationMenu.showSubtitles}
                            onChange={handleShowSubtitlesChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Add Category Modal */}
            {isAddingCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Category</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newCategoryData.title}
                                    onChange={(e) => setNewCategoryData({ ...newCategoryData, title: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Drone View"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={newCategoryData.subtitle}
                                    onChange={(e) => setNewCategoryData({ ...newCategoryData, subtitle: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Aerial perspective of the property"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                                <select
                                    value={newCategoryData.icon}
                                    onChange={(e) => setNewCategoryData({ ...newCategoryData, icon: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="map-pin">Map Pin</option>
                                    <option value="home">Home</option>
                                    <option value="building">Building</option>
                                    <option value="image">Image</option>
                                </select>
                            </div>
                            <div className="flex space-x-2 pt-2">
                                <Button onClick={handleAddCategory} className="flex-1">Add Category</Button>
                                <Button variant="secondary" onClick={() => setIsAddingCategory(false)} className="flex-1">Cancel</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Item Modal */}
            {isAddingItem && selectedCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Item</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newItemData.title}
                                    onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Tipe Swan 45/160"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={newItemData.subtitle}
                                    onChange={(e) => setNewItemData({ ...newItemData, subtitle: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 45 sqm unit"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Panorama</label>
                                <select
                                    value={newItemData.panoramaId}
                                    onChange={(e) => setNewItemData({ ...newItemData, panoramaId: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select panorama...</option>
                                    {panoramas.map(panorama => (
                                        <option key={panorama.id} value={panorama.id}>
                                            {panorama.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Thumbnail</label>
                                <input
                                    type="text"
                                    value={newItemData.thumbnail}
                                    onChange={(e) => setNewItemData({ ...newItemData, thumbnail: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Image URL or upload"
                                />
                            </div>
                            <div className="flex space-x-2 pt-2">
                                <Button onClick={() => handleAddItem(selectedCategory)} className="flex-1">Add Item</Button>
                                <Button variant="secondary" onClick={() => setIsAddingItem(false)} className="flex-1">Cancel</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories List */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Categories</h3>
                {navigationMenu.categories.map((category) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                {getIconComponent(category.icon)}
                                <div>
                                    <h4 className="font-medium text-gray-800">{category.title}</h4>
                                    {category.subtitle && (
                                        <p className="text-xs text-gray-500">{category.subtitle}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedCategory(category.id);
                                        setIsAddingItem(true);
                                    }}
                                    className="p-1"
                                    title="Add item to category"
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCategory(category.id)}
                                    className="p-1"
                                    title="Edit category"
                                >
                                    <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteNavigationCategory(category.id)}
                                    className="p-1 text-red-500 hover:text-red-700"
                                    title="Delete category"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Items in Category */}
                        <div className="space-y-2">
                            {category.items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                    {navigationMenu.showThumbnails && (
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-thumbnail.jpg';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                                        {navigationMenu.showSubtitles && item.subtitle && (
                                            <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                                        )}
                                        <p className="text-xs text-gray-400">
                                            Panorama: {panoramas.find(p => p.id === item.panoramaId)?.name || 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleThumbnailUpload(e, item.id, category.id)}
                                                className="hidden"
                                                id={`thumbnail-${item.id}`}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => document.getElementById(`thumbnail-${item.id}`)?.click()}
                                                className="p-1"
                                                title="Upload thumbnail"
                                            >
                                                <Upload className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedItem(item.id)}
                                            className="p-1"
                                            title="Edit item"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteNavigationItem(category.id, item.id)}
                                            className="p-1 text-red-500 hover:text-red-700"
                                            title="Delete item"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {category.items.length === 0 && (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    No items in this category. Click the + button to add items.
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview */}
            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-2">Navigation menu preview will appear here</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {navigationMenu.categories.slice(0, 3).map((category) => (
                            <div key={category.id} className="bg-white rounded-lg p-3 shadow-sm">
                                <div className="flex items-center space-x-2 mb-2">
                                    {getIconComponent(category.icon)}
                                    <span className="text-sm font-medium">{category.title}</span>
                                </div>
                                {category.items.slice(0, 2).map((item) => (
                                    <div key={item.id} className="flex items-center space-x-2 text-xs">
                                        {navigationMenu.showThumbnails && (
                                            <div className="w-6 h-6 rounded bg-gray-200 flex-shrink-0"></div>
                                        )}
                                        <span className="truncate">{item.title}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default NavigationEditor;
