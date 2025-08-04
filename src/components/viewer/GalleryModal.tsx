import React from 'react';
import { X } from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import panoramaData from '../../data/panorama-data.json';
import Button from '../common/Button';

const GalleryModal: React.FC = () => {
    const { galleryVisible, toggleGallery, setCurrentNode } = useViewerStore();

    const handleSelectPanorama = (nodeId: string) => {
        setCurrentNode(nodeId);
        toggleGallery();
    };

    if (!galleryVisible) return null;

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
                    {panoramaData.map(item => (
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(GalleryModal);
