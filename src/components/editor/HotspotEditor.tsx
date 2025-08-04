import React, { useState, useRef } from 'react';
import { Target, Edit3, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { useEditor } from '../../hooks/useEditor';
import { useEditorStore } from '../../store/editorStore';
import { Hotspot } from '../../types/editor';
import Button from '../common/Button';

interface HotspotEditorProps {
    hotspot: Hotspot;
    onUpdate: (updates: Partial<Hotspot>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

const HotspotEditor: React.FC<HotspotEditorProps> = ({
    hotspot,
    onUpdate,
    onDelete,
    onDuplicate,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(hotspot.title);
    const [tempContent, setTempContent] = useState(hotspot.content || '');

    const handleSave = () => {
        onUpdate({
            title: tempTitle,
            content: tempContent,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempTitle(hotspot.title);
        setTempContent(hotspot.content || '');
        setIsEditing(false);
    };

    const handleToggleVisibility = () => {
        onUpdate({ isVisible: !hotspot.isVisible });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-800">Hotspot Editor</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleVisibility}
                        title={hotspot.isVisible ? 'Hide hotspot' : 'Show hotspot'}
                    >
                        {hotspot.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDuplicate}
                        title="Duplicate hotspot"
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        title="Edit hotspot"
                    >
                        <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="text-red-500 hover:text-red-700"
                        title="Delete hotspot"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Position Info */}
            <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Position</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-gray-500">Yaw:</span>
                        <span className="ml-1 font-mono">{hotspot.position.yaw.toFixed(2)}°</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Pitch:</span>
                        <span className="ml-1 font-mono">{hotspot.position.pitch.toFixed(2)}°</span>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            {isEditing ? (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                        </label>
                        <textarea
                            value={tempContent}
                            onChange={(e) => setTempContent(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter hotspot content..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            value={hotspot.type}
                            onChange={(e) => onUpdate({ type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="info">Info</option>
                            <option value="link">Link</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handleSave} className="flex-1">
                            Save
                        </Button>
                        <Button variant="secondary" onClick={handleCancel} className="flex-1">
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                /* Display Mode */
                <div className="space-y-3">
                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Title</div>
                        <div className="text-sm text-gray-800">{hotspot.title}</div>
                    </div>
                    {hotspot.content && (
                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Content</div>
                            <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                                {hotspot.content}
                            </div>
                        </div>
                    )}
                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Type</div>
                        <div className="text-sm text-gray-800 capitalize">{hotspot.type}</div>
                    </div>
                </div>
            )}

            {/* Style Options */}
            <div className="border-t border-gray-200 pt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Style</div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Background</label>
                        <input
                            type="color"
                            value={hotspot.style?.backgroundColor || '#3b82f6'}
                            onChange={(e) => onUpdate({
                                style: { ...hotspot.style, backgroundColor: e.target.value }
                            })}
                            className="w-full h-8 rounded border border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Border</label>
                        <input
                            type="color"
                            value={hotspot.style?.borderColor || '#ffffff'}
                            onChange={(e) => onUpdate({
                                style: { ...hotspot.style, borderColor: e.target.value }
                            })}
                            className="w-full h-8 rounded border border-gray-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotspotEditor;
