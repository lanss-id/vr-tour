import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useEditorStore } from '../../../../store/editorStore';
import { useViewerSupabase } from '../../../../hooks/useViewerSupabase';
import { 
    Menu, 
    X, 
    ChevronLeft, 
    ChevronRight,
    Map,
    Eye,
    Settings,
    Database,
    Plus,
    Upload
} from 'lucide-react';
import LeftSidebar from '../LeftSidebar';
import CenterWorkspace from '../CenterWorkspace';
import RightSidebar from '../RightSidebar';
import Button from '../../../common/Button';

const MobileEditor: React.FC = () => {
    const { panoramas, loading, error } = useViewerSupabase();
    const [activePanel, setActivePanel] = useState<'left' | 'center' | 'right'>('center');
    const [isLeftOpen, setIsLeftOpen] = useState(false);
    const [isRightOpen, setIsRightOpen] = useState(false);

    const toggleLeftPanel = () => {
        setIsLeftOpen(!isLeftOpen);
        setIsRightOpen(false);
        setActivePanel(isLeftOpen ? 'center' : 'left');
    };

    const toggleRightPanel = () => {
        setIsRightOpen(!isRightOpen);
        setIsLeftOpen(false);
        setActivePanel(isRightOpen ? 'center' : 'right');
    };

    const closePanels = () => {
        setIsLeftOpen(false);
        setIsRightOpen(false);
        setActivePanel('center');
    };

    if (loading) {
        return (
            <div className="h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading editor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-sm mx-auto p-6">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">
                        Error Loading Data
                    </h1>
                    <p className="text-gray-600 mb-6 text-sm">
                        {error}
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Refresh Page
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <DndProvider backend={TouchBackend}>
            <div className="h-screen flex flex-col bg-gray-50">
                {/* Mobile Header */}
                <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleLeftPanel}
                            className={`p-2 rounded-md transition-colors ${
                                isLeftOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Panorama Editor</h1>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleRightPanel}
                            className={`p-2 rounded-md transition-colors ${
                                isRightOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Panel Navigation */}
                <div className="bg-white border-b border-gray-200 px-4 py-2">
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => {
                                setActivePanel('left');
                                setIsLeftOpen(true);
                                setIsRightOpen(false);
                            }}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                activePanel === 'left'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Map className="w-4 h-4 mr-1" />
                            Panoramas
                        </button>
                        <button
                            onClick={() => {
                                setActivePanel('center');
                                setIsLeftOpen(false);
                                setIsRightOpen(false);
                            }}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                activePanel === 'center'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Editor
                        </button>
                        <button
                            onClick={() => {
                                setActivePanel('right');
                                setIsRightOpen(true);
                                setIsLeftOpen(false);
                            }}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                activePanel === 'right'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Database className="w-4 h-4 mr-1" />
                            Properties
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Left Panel */}
                    <div className={`absolute inset-0 bg-white transform transition-transform duration-300 ease-in-out ${
                        isLeftOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                        <div className="h-full flex flex-col">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Panoramas</h2>
                                <button
                                    onClick={closePanels}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <LeftSidebar />
                            </div>
                        </div>
                    </div>

                    {/* Center Panel */}
                    <div className={`absolute inset-0 transform transition-transform duration-300 ease-in-out ${
                        isLeftOpen ? 'translate-x-full' : isRightOpen ? '-translate-x-full' : 'translate-x-0'
                    }`}>
                        <CenterWorkspace />
                    </div>

                    {/* Right Panel */}
                    <div className={`absolute inset-0 bg-white transform transition-transform duration-300 ease-in-out ${
                        isRightOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}>
                        <div className="h-full flex flex-col">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
                                <button
                                    onClick={closePanels}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <RightSidebar />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Footer */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                            <span>Panoramas: {panoramas.length}</span>
                            <span>•</span>
                            <span>Ready</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <Upload className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default MobileEditor; 