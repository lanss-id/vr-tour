import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useEditorStore } from '../store/editorStore';
import { useViewerSupabase } from '../hooks/useViewerSupabase';
import { useResponsive } from '../hooks/useResponsive';
import LeftSidebar from '../components/editor/NewEditor/LeftSidebar';
import CenterWorkspace from '../components/editor/NewEditor/CenterWorkspace';
import RightSidebar from '../components/editor/NewEditor/RightSidebar';
import MobileEditor from '../components/editor/NewEditor/Mobile/MobileEditor';
import Loading from '../components/common/Loading';
import ErrorBoundary from '../components/common/ErrorBoundary';

const NewEditorPage: React.FC = () => {
    const { editMode, setEditMode } = useEditorStore();
    const { panoramas, loading, error } = useViewerSupabase();
    const { isMobile, isTablet } = useResponsive();
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize editor when data is loaded
    useEffect(() => {
        if (panoramas.length > 0 && !isInitialized) {
            setIsInitialized(true);
        }
    }, [panoramas, isInitialized]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loading message="Memuat data panorama dari Supabase..." />
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Error Loading Data
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    // Mobile layout
    if (isMobile) {
        return (
            <ErrorBoundary>
                <MobileEditor />
            </ErrorBoundary>
        );
    }

    // Desktop layout with 3-panel design
    return (
        <ErrorBoundary>
            <DndProvider backend={isTablet ? TouchBackend : HTML5Backend}>
                <div className="h-screen flex bg-gray-50">
                    {/* Left Sidebar - Panorama List & Navigation Management */}
                    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                        <LeftSidebar />
                    </div>

                    {/* Center Workspace - Editor Canvas */}
                    <div className="flex-1 flex flex-col">
                        <CenterWorkspace />
                    </div>

                    {/* Right Sidebar - Properties & Controls Panel */}
                    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
                        <RightSidebar />
                    </div>
                </div>
            </DndProvider>
        </ErrorBoundary>
    );
};

export default NewEditorPage; 