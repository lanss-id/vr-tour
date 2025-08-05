import React from 'react';
import { useViewerSupabase } from '../../hooks/useViewerSupabase';

const SupabaseStatusIndicator: React.FC = () => {
    const { loading, error } = useViewerSupabase();

    if (!loading && !error) {
        return null; // Don't show anything if everything is fine
    }

    return (
        <div className="absolute top-4 right-4 z-30">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                {loading && (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-600">Memuat dari Supabase...</span>
                    </div>
                )}
                {error && (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-600">Error: {error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupabaseStatusIndicator; 