import React, { useState } from 'react';
import { useEditorStore } from '../../../../store/editorStore';
import { NavigationCategory, NavigationItem } from '../../../../types/editor';
import { 
    Folder, 
    Plus, 
    Edit3, 
    Trash2, 
    Eye, 
    EyeOff, 
    ChevronDown, 
    ChevronRight,
    Building2,
    MapPin,
    Home,
    Image,
    Menu
} from 'lucide-react';
import Button from '../../../common/Button';

const NavigationGroupManager: React.FC = () => {
    const { navigationMenu, addNavigationCategory, updateNavigationCategory, deleteNavigationCategory, addNavigationItem, updateNavigationItem, deleteNavigationItem } = useEditorStore();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [editingGroup, setEditingGroup] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<{ groupId: string; itemId: string } | null>(null);
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState<string | null>(null);

    const [newGroupData, setNewGroupData] = useState({
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

    const iconMap: { [key: string]: React.ComponentType<any> } = {
        building: Building2,
        map: MapPin,
        home: Home,
        image: Image,
        menu: Menu,
        folder: Folder
    };

    const toggleGroupExpansion = (groupId: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);
        }
        setExpandedGroups(newExpanded);
    };

    const handleAddGroup = () => {
        if (newGroupData.title.trim()) {
            const group: NavigationCategory = {
                id: `group-${Date.now()}`,
                title: newGroupData.title,
                subtitle: newGroupData.subtitle,
                icon: newGroupData.icon,
                order: newGroupData.order,
                isVisible: true,
                items: []
            };
            addNavigationCategory(group);
            setNewGroupData({ title: '', subtitle: '', icon: 'building', order: 0 });
            setIsAddingGroup(false);
        }
    };

    const handleAddItem = (groupId: string) => {
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
            addNavigationItem(groupId, item);
            setNewItemData({ title: '', subtitle: '', thumbnail: '', panoramaId: '', order: 0 });
            setIsAddingItem(null);
        }
    };

    const getIconComponent = (iconName: string) => {
        return iconMap[iconName] || Building2;
    };

    return (
        <div className="p-4 space-y-4">
            {/* Add Group Form */}
            {isAddingGroup && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-blue-900">Add New Group</h4>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Group Title"
                            value={newGroupData.title}
                            onChange={(e) => setNewGroupData({ ...newGroupData, title: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Subtitle (optional)"
                            value={newGroupData.subtitle}
                            onChange={(e) => setNewGroupData({ ...newGroupData, subtitle: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                        <select
                            value={newGroupData.icon}
                            onChange={(e) => setNewGroupData({ ...newGroupData, icon: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="building">Building</option>
                            <option value="map">Map</option>
                            <option value="home">Home</option>
                            <option value="image">Image</option>
                            <option value="menu">Menu</option>
                            <option value="folder">Folder</option>
                        </select>
                        <div className="flex space-x-2">
                            <Button
                                onClick={handleAddGroup}
                                disabled={!newGroupData.title.trim()}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Add Group
                            </Button>
                            <Button
                                onClick={() => setIsAddingGroup(false)}
                                variant="ghost"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Groups List */}
            <div className="space-y-2">
                {navigationMenu.categories
                    .sort((a, b) => a.order - b.order)
                    .map((group) => {
                        const IconComponent = getIconComponent(group.icon);
                        const isExpanded = expandedGroups.has(group.id);
                        
                        return (
                            <div key={group.id} className="border border-gray-200 rounded-lg">
                                {/* Group Header */}
                                <div className="p-3 bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => toggleGroupExpansion(group.id)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>
                                        <IconComponent className="w-4 h-4 text-gray-600" />
                                        <span className="font-medium text-sm">{group.title}</span>
                                        {group.subtitle && (
                                            <span className="text-xs text-gray-500">- {group.subtitle}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            onClick={() => setIsAddingItem(group.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            onClick={() => setEditingGroup(group.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            onClick={() => deleteNavigationCategory(group.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Group Items */}
                                {isExpanded && (
                                    <div className="p-3 space-y-2">
                                        {/* Add Item Form */}
                                        {isAddingItem === group.id && (
                                            <div className="bg-green-50 rounded-lg p-3 space-y-2">
                                                <h5 className="text-sm font-medium text-green-900">Add Item</h5>
                                                <input
                                                    type="text"
                                                    placeholder="Item Title"
                                                    value={newItemData.title}
                                                    onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md text-xs"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Subtitle (optional)"
                                                    value={newItemData.subtitle}
                                                    onChange={(e) => setNewItemData({ ...newItemData, subtitle: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md text-xs"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Panorama ID"
                                                    value={newItemData.panoramaId}
                                                    onChange={(e) => setNewItemData({ ...newItemData, panoramaId: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md text-xs"
                                                />
                                                <div className="flex space-x-1">
                                                    <Button
                                                        onClick={() => handleAddItem(group.id)}
                                                        disabled={!newItemData.title.trim() || !newItemData.panoramaId}
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                                    >
                                                        Add
                                                    </Button>
                                                    <Button
                                                        onClick={() => setIsAddingItem(null)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Items List */}
                                        {group.items
                                            .sort((a, b) => a.order - b.order)
                                            .map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                                    <div className="flex items-center space-x-2">
                                                        <img
                                                            src={item.thumbnail || '/placeholder-thumbnail.jpg'}
                                                            alt={item.title}
                                                            className="w-8 h-8 rounded object-cover"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium">{item.title}</div>
                                                            {item.subtitle && (
                                                                <div className="text-xs text-gray-500">{item.subtitle}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Button
                                                            onClick={() => setEditingItem({ groupId: group.id, itemId: item.id })}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            <Edit3 className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => deleteNavigationItem(group.id, item.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>

            {/* Add Group Button */}
            {!isAddingGroup && (
                <Button
                    onClick={() => setIsAddingGroup(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Navigation Group
                </Button>
            )}
        </div>
    );
};

export default NavigationGroupManager; 