import React, { useState } from 'react';
import { migrateMarkersToHotspots } from '../../services/migrationService';
import Button from './Button';
import Loading from './Loading';

const MarkerMigration: React.FC = () => {
    const [isMigrating, setIsMigrating] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleMigration = async () => {
        setIsMigrating(true);
        setResult(null);

        try {
            const migrationResult = await migrateMarkersToHotspots();
            setResult(migrationResult);
        } catch (error) {
            setResult({
                success: false,
                message: `Migration failed: ${error}`
            });
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Migration Markers ke Hotspots</h3>
            
            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                    Konversi markers navigasi dari <code>panorama-data.json</code> ke hotspots di database.
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Mengkonversi textureX/textureY ke yaw/pitch</li>
                    <li>Membuat hotspot dengan type 'link'</li>
                    <li>Menghapus hotspots yang sudah ada</li>
                    <li>Menambahkan hotspots baru dari markers</li>
                </ul>
            </div>

            <div className="flex items-center space-x-4">
                <Button
                    onClick={handleMigration}
                    disabled={isMigrating}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isMigrating ? (
                        <div className="flex items-center space-x-2">
                            <Loading size="sm" />
                            <span>Migrating...</span>
                        </div>
                    ) : (
                        'Jalankan Migration'
                    )}
                </Button>
            </div>

            {result && (
                <div className={`mt-4 p-4 rounded-lg ${
                    result.success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                }`}>
                    <div className={`font-medium ${
                        result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                        {result.success ? '✅ Migration Berhasil' : '❌ Migration Gagal'}
                    </div>
                    <div className={`text-sm mt-1 ${
                        result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                        {result.message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarkerMigration; 