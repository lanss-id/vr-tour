import React from 'react';
import {
    Save,
    Upload,
    Download,
    Eye,
    Settings,
    Undo,
    Redo,
    Plus,
    Trash2,
    Copy,
    Image,
    Target,
    Map,
    Grid,
    Menu,
} from 'lucide-react';
import { useEditor } from '../../hooks/useEditor';
import { useEditorStore } from '../../store/editorStore';
import Button from '../common/Button';

const EditorToolbar: React.FC = () => {
    const {
        editMode,
        editorTools,
        setEditMode,
        togglePreviewMode,
        handleExportProject,
        handleImportProject,
    } = useEditor();

    const { isDirty, saveProject } = useEditorStore();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImportProject(file);
        }
    };

    const handlePanoramaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Handle panorama upload
            console.log('Uploading panorama:', file.name);
        }
    };

    return (
        <div className="flex items-center justify-between px-4 h-full">
            {/* Left Section - Tools */}
            <div className="flex items-center space-x-2">
                {editorTools.map((tool) => (
                    <Button
                        key={tool.id}
                        variant={tool.isActive ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setEditMode(tool.id as any)}
                        className="flex items-center space-x-2"
                        title={`${tool.description} (${tool.shortcut})`}
                    >
                        {tool.id === 'panorama' && <Image className="w-4 h-4" />}
                        {tool.id === 'hotspot' && <Target className="w-4 h-4" />}
                        {tool.id === 'minimap' && <Map className="w-4 h-4" />}
                        {tool.id === 'gallery' && <Grid className="w-4 h-4" />}
                        {tool.id === 'navigation' && <Menu className="w-4 h-4" />}
                        <span className="hidden sm:inline">{tool.name}</span>
                    </Button>
                ))}
            </div>

            {/* Center Section - Actions */}
            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePreviewMode}
                    title="Toggle Preview Mode (Ctrl+P)"
                >
                    <Eye className="w-4 h-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Undo */ }}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="w-4 h-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Redo */ }}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo className="w-4 h-4" />
                </Button>
            </div>

            {/* Right Section - File Operations */}
            <div className="flex items-center space-x-2">
                {/* Upload Panorama */}
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handlePanoramaUpload}
                        className="hidden"
                        id="panorama-upload"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => document.getElementById('panorama-upload')?.click()}
                        title="Upload Panorama"
                    >
                        <Upload className="w-4 h-4" />
                    </Button>
                </div>

                {/* Import Project */}
                <div className="relative">
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="project-import"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => document.getElementById('project-import')?.click()}
                        title="Import Project"
                    >
                        <Upload className="w-4 h-4" />
                    </Button>
                </div>

                {/* Export Project */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportProject}
                    title="Export Project"
                >
                    <Download className="w-4 h-4" />
                </Button>

                {/* Save Project */}
                <Button
                    variant={isDirty ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={saveProject}
                    title="Save Project (Ctrl+S)"
                >
                    <Save className="w-4 h-4" />
                </Button>

                {/* Settings */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Open settings */ }}
                    title="Settings"
                >
                    <Settings className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default EditorToolbar;
