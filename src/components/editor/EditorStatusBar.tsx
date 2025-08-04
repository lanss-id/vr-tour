import React from 'react';
import { useEditorStore } from '../../store/editorStore';

const EditorStatusBar: React.FC = () => {
    const { isDirty, panoramas, hotspots, categories } = useEditorStore();

    const totalPanoramas = panoramas.length;
    const totalHotspots = hotspots.length;
    const totalCategories = categories.length;

    return (
        <div className="flex items-center justify-between px-4 h-full text-xs text-gray-600">
            {/* Left Section - Project Info */}
            <div className="flex items-center space-x-4">
                <span>Panoramas: {totalPanoramas}</span>
                <span>Hotspots: {totalHotspots}</span>
                <span>Categories: {totalCategories}</span>
                {isDirty && (
                    <span className="text-orange-600 font-medium">• Unsaved changes</span>
                )}
            </div>

            {/* Center Section - Current Mode */}
            <div className="flex items-center space-x-4">
                <span>Ready</span>
            </div>

            {/* Right Section - Shortcuts */}
            <div className="flex items-center space-x-4">
                <span>Ctrl+S: Save</span>
                <span>Ctrl+P: Preview</span>
                <span>1-5: Tools</span>
                <span>ESC: Clear</span>
            </div>
        </div>
    );
};

export default EditorStatusBar;
