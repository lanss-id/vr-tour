import React, { useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import panoramaData from '../../data/panorama-data.json';
import { PanoramaData } from '../../utils/dataManager';
import Button from './Button';

interface SupabaseMigrationProps {
  onComplete?: () => void;
}

export const SupabaseMigration: React.FC<SupabaseMigrationProps> = ({ onComplete }) => {
  const { migrateFromJson, loading, error, clearError } = useSupabase();
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [showMigration, setShowMigration] = useState(false);

  const handleMigration = async () => {
    try {
      setMigrationStatus('Memulai migrasi data...');
      clearError();
      
      // Convert JSON data to PanoramaData format
      const panoramaDataArray = panoramaData as PanoramaData[];
      
      await migrateFromJson(panoramaDataArray);
      
      setMigrationStatus('Migrasi berhasil! Data panorama telah dipindahkan ke Supabase.');
      
      // Call onComplete after successful migration
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      setMigrationStatus('Migrasi gagal. Silakan coba lagi.');
      console.error('Migration error:', error);
    }
  };

  const handleRetry = () => {
    setMigrationStatus('');
    clearError();
  };

  if (!showMigration) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Migrasi ke Supabase
        </h3>
        <p className="text-blue-700 mb-4">
          Klik tombol di bawah untuk memindahkan data panorama dari file JSON ke database Supabase.
          Markers akan dikosongkan sesuai permintaan.
        </p>
        <Button
          onClick={() => setShowMigration(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Mulai Migrasi
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Migrasi Data ke Supabase
      </h3>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={`text-sm px-2 py-1 rounded ${
            loading ? 'bg-yellow-100 text-yellow-800' : 
            error ? 'bg-red-100 text-red-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {loading ? 'Sedang memproses...' : 
             error ? 'Error' : 
             migrationStatus ? 'Berhasil' : 'Siap'}
          </span>
        </div>
        
        {migrationStatus && (
          <p className="text-sm text-gray-600 mt-2">
            {migrationStatus}
          </p>
        )}
        
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">
              Error: {error}
            </p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Data yang akan dimigrasi:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• {panoramaData.length} panorama</li>
          <li>• Markers akan dikosongkan (sesuai permintaan)</li>
          <li>• Hotspots akan dikosongkan (sesuai permintaan)</li>
          <li>• Data akan tersimpan di database Supabase</li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleMigration}
          disabled={loading}
          className={`${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {loading ? 'Memproses...' : 'Jalankan Migrasi'}
        </Button>
        
        {error && (
          <Button
            onClick={handleRetry}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Coba Lagi
          </Button>
        )}
        
        <Button
          onClick={() => setShowMigration(false)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Batal
        </Button>
      </div>

      {loading && (
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Memindahkan data ke Supabase...</span>
          </div>
        </div>
      )}
    </div>
  );
}; 