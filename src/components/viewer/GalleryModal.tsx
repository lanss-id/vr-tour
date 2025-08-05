import React from 'react';
import { X } from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import { useViewerSupabase } from '../../hooks/useViewerSupabase';
import Button from '../common/Button';
import Loading from '../common/Loading';

const GalleryModal: React.FC = () => {
    const { galleryVisible, toggleGallery, setCurrentNode, allOverlaysHidden } = useViewerStore();
    const { panoramas, loading, error } = useViewerSupabase();

    const handleSelectPanorama = (nodeId: string) => {
        setCurrentNode(nodeId);
        toggleGallery();
    };

    if (!galleryVisible || allOverlaysHidden) return null;

    // Show loading if data is still loading
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[80vh] overflow-auto w-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Galeri Panorama</h2>
                        <Button
                            variant="ghost"
                            onClick={toggleGallery}
                            className="p-2"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <Loading message="Memuat panorama dari Supabase..." />
                    </div>
                </div>
            </div>
        );
    }

    // Show error if there's an error
    if (error) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[80vh] overflow-auto w-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Galeri Panorama</h2>
                        <Button
                            variant="ghost"
                            onClick={toggleGallery}
                            className="p-2"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                    <div className="text-center py-12">
                        <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
                        <div className="text-gray-600">{error}</div>
                        <div className="text-sm text-gray-500 mt-2">
                            Tidak dapat memuat data panorama dari Supabase
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show message if no panoramas
    if (panoramas.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[80vh] overflow-auto w-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Galeri Panorama</h2>
                        <Button
                            variant="ghost"
                            onClick={toggleGallery}
                            className="p-2"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                    <div className="text-center py-12">
                        <div className="text-gray-600 text-lg font-semibold mb-2">Tidak ada panorama</div>
                        <div className="text-sm text-gray-500">
                            Belum ada data panorama di Supabase. Silakan tambah panorama melalui editor.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[80vh] overflow-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Galeri Panorama</h2>
                    <Button
                        variant="ghost"
                        onClick={toggleGallery}
                        className="p-2"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {panoramas.map(item => (
                        <div
                            key={item.id}
                            className="cursor-pointer group hover:opacity-80 transition-all duration-200"
                            onClick={() => handleSelectPanorama(item.id)}
                        >
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={item.thumbnail}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                    <span className="text-gray-600 text-sm">{item.name}</span>
                                </div>
                            </div>
                            <p className="text-sm text-center mt-2 text-gray-700 font-medium truncate">
                                {item.name}
                            </p>
                            {item.caption && (
                                <p className="text-xs text-center text-gray-500 truncate">
                                    {item.caption}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(GalleryModal);
