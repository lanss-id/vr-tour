import React from 'react';
import EditorLayout from '../components/editor/EditorLayout';
import { useEditor } from '../hooks/useEditor';
import ErrorBoundary from '../components/common/ErrorBoundary';

const EditorPage: React.FC = () => {
    const { isPreviewMode } = useEditor();

    return (
        <ErrorBoundary key="editor-page-error-boundary">
            <div className="w-full h-screen overflow-hidden bg-gray-50">
                <EditorLayout />

                {/* Preview Mode Overlay */}
                {isPreviewMode && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-6 max-w-2xl mx-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Preview Mode</h2>
                            <p className="text-gray-600 mb-6">
                                You are now in preview mode. All editor controls are hidden.
                                Press Ctrl+P to exit preview mode.
                            </p>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => window.location.href = '/viewer'}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Open Viewer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default EditorPage;
