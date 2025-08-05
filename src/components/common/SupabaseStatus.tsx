import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from './Button';

interface SupabaseStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
}

export const SupabaseStatus: React.FC<SupabaseStatusProps> = ({ onStatusChange }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || 'Not configured',
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  });

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test connection by trying to fetch a simple query
      const { data, error } = await supabase
        .from('panoramas')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      setIsConnected(true);
      if (onStatusChange) {
        onStatusChange(true);
      }
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
      if (onStatusChange) {
        onStatusChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-500';
    if (isConnected) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getErrorMessage = () => {
    if (!config.hasKey) {
      return 'VITE_SUPABASE_ANON_KEY tidak dikonfigurasi';
    }
    if (config.url === 'Not configured') {
      return 'VITE_SUPABASE_URL tidak dikonfigurasi';
    }
    return error;
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Status Supabase
        </h3>
        <Button
          onClick={checkConnection}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          {isLoading ? 'Checking...' : 'Test Connection'}
        </Button>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <span className="text-sm font-medium text-gray-700">
          {getStatusText()}
        </span>
      </div>

      {/* Configuration Info */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">URL:</span>
          <span className={`font-mono ${
            config.url === 'Not configured' ? 'text-red-600' : 'text-gray-900'
          }`}>
            {config.url}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">API Key:</span>
          <span className={`font-mono ${
            config.hasKey ? 'text-green-600' : 'text-red-600'
          }`}>
            {config.hasKey ? 'Configured' : 'Not configured'}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-700">
            Error: {getErrorMessage()}
          </p>
        </div>
      )}

      {/* Connection Info */}
      {isConnected && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-700">
            ✅ Berhasil terhubung ke Supabase
          </p>
        </div>
      )}

      {/* Setup Instructions */}
      {!isConnected && !isLoading && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            Setup yang diperlukan:
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Buat file .env di root project</li>
            <li>• Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY</li>
            <li>• Jalankan script SQL setup di Supabase</li>
            <li>• Buat storage buckets 'panoramas' dan 'thumbnails'</li>
          </ul>
        </div>
      )}
    </div>
  );
}; 