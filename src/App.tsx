import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ViewerPage from './pages/ViewerPage';
import EditorPage from './pages/EditorPage';
import ErrorBoundary from './components/common/ErrorBoundary';

const App: React.FC = () => {
    return (
        <ErrorBoundary key="app-error-boundary">
            <div className="App">
                <Routes>
                    <Route path="/" element={<ViewerPage />} />
                    <Route path="/viewer" element={<ViewerPage />} />
                    <Route path="/editor" element={<EditorPage />} />
                </Routes>
            </div>
        </ErrorBoundary>
    );
};

export default App;
