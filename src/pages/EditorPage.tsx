import React from 'react';
import EditorDashboard from '../components/editor/EditorDashboard';
import SupabaseStatusIndicator from '../components/editor/SupabaseStatusIndicator';

const EditorPage: React.FC = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Main Editor Container */}
            <main className="w-full h-full">
                <EditorDashboard />
            </main>

            {/* Supabase Status Indicator */}
            <SupabaseStatusIndicator />
        </div>
    );
};

export default EditorPage;
