import React from 'react';
import EditorToolbar from './EditorToolbar';
import EditorSidebar from './EditorSidebar';
import EditorWorkspace from './EditorWorkspace';
import EditorStatusBar from './EditorStatusBar';
import { useEditor } from '../../hooks/useEditor';

const EditorLayout: React.FC = () => {
    const { isPreviewMode } = useEditor();

    if (isPreviewMode) {
        return <EditorWorkspace />;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <EditorSidebar />
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col">
                {/* Top Toolbar */}
                <div className="h-16 bg-white border-b border-gray-200">
                    <EditorToolbar />
                </div>

                {/* Workspace Area */}
                <div className="flex-1 overflow-hidden">
                    <EditorWorkspace />
                </div>

                {/* Bottom Status Bar */}
                <div className="h-8 bg-gray-100 border-t border-gray-200">
                    <EditorStatusBar />
                </div>
            </div>
        </div>
    );
};

export default EditorLayout;
