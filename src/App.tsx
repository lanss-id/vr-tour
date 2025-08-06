import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ViewerPage from './pages/ViewerPage';
import EditorPage from './pages/EditorPage';
import NewEditorPage from './pages/NewEditorPage';
import Navigation from './components/common/Navigation';
import ErrorBoundary from './components/common/ErrorBoundary';

const App: React.FC = () => {
    return (
        <ErrorBoundary key="app-error-boundary">
            <div className="App">
                {/* <Navigation /> */}
                <Routes>
                    <Route path="/" element={<ViewerPage />} />
                    <Route path="/viewer" element={<ViewerPage />} />
                    <Route path="/editor" element={<EditorPage />} />
                    <Route path="/new-editor" element={<NewEditorPage />} />
                </Routes>
            </div>
        </ErrorBoundary>
    );
};

export default App;
