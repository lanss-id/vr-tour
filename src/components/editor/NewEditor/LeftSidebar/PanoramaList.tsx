import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useViewerSupabase } from '../../../../hooks/useViewerSupabase';
import { useEditorStore } from '../../../../store/editorStore';
import { 
    Image, 
    Eye, 
    EyeOff, 
    Edit3, 
    Trash2, 
    Copy,
    Search,
    Filter
} from 'lucide-react';
import Button from '../../../common/Button';
import OptimizedImage from '../../../common/OptimizedImage';

interface DraggablePanoramaItemProps {
    panorama: any;
    onSelect: (panorama: any) => void;
    onEdit: (panorama: any) => void;
    onDelete: (panoramaId: string) => void;
    onDuplicate: (panorama: any) => void;
}

const DraggablePanoramaItem: React.FC<DraggablePanoramaItemProps> = ({
    panorama,
    onSelect,
    onEdit,
    onDelete,
    onDuplicate
}) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'PANORAMA',
        item: { type: 'PANORAMA', panorama },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className={`p-3 border border-gray-200 rounded-lg mb-2 cursor-move transition-all ${
                isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => onSelect(panorama)}
        >
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <OptimizedImage
                        src={panorama.thumbnail || '/placeholder-thumbnail.jpg'}
                        alt={panorama.name}
                        className="w-12 h-12 rounded"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Image className="w-2 h-2 text-white" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                        {panorama.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                        {panorama.caption || 'No description'}
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(panorama);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                    >
                        <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(panorama);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                    >
                        <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(panorama.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

const PanoramaList: React.FC = () => {
    const { panoramas } = useViewerSupabase();
    const { setCurrentPanorama } = useEditorStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedPanorama, setSelectedPanorama] = useState<any>(null);

    // Filter panoramas based on search and category
    const filteredPanoramas = panoramas.filter(panorama => {
        const matchesSearch = panorama.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            panorama.caption?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || panorama.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories
    const categories = ['all', ...Array.from(new Set(panoramas.map(p => p.category).filter(Boolean)))];

    const handlePanoramaSelect = (panorama: any) => {
        setSelectedPanorama(panorama);
        setCurrentPanorama(panorama.id);
    };

    const handlePanoramaEdit = (panorama: any) => {
        // TODO: Implement panorama edit modal
        console.log('Edit panorama:', panorama);
    };

    const handlePanoramaDelete = (panoramaId: string) => {
        // TODO: Implement panorama delete confirmation
        console.log('Delete panorama:', panoramaId);
    };

    const handlePanoramaDuplicate = (panorama: any) => {
        // TODO: Implement panorama duplication
        console.log('Duplicate panorama:', panorama);
    };

    return (
        <div className="p-4 space-y-4">
            {/* Search and Filter */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search panoramas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Panorama Count */}
            <div className="text-xs text-gray-500">
                {filteredPanoramas.length} of {panoramas.length} panoramas
            </div>

            {/* Panorama List */}
            <div className="space-y-2">
                {filteredPanoramas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No panoramas found</p>
                        {searchTerm && (
                            <p className="text-xs">Try adjusting your search terms</p>
                        )}
                    </div>
                ) : (
                    filteredPanoramas.map(panorama => (
                        <DraggablePanoramaItem
                            key={panorama.id}
                            panorama={panorama}
                            onSelect={handlePanoramaSelect}
                            onEdit={handlePanoramaEdit}
                            onDelete={handlePanoramaDelete}
                            onDuplicate={handlePanoramaDuplicate}
                        />
                    ))
                )}
            </div>

            {/* Selected Panorama Info */}
            {selectedPanorama && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Panorama</h4>
                    <div className="flex items-center space-x-3">
                        <OptimizedImage
                            src={selectedPanorama.thumbnail || '/placeholder-thumbnail.jpg'}
                            alt={selectedPanorama.name}
                            className="w-8 h-8 rounded"
                        />
                        <div>
                            <div className="text-sm font-medium text-blue-800">
                                {selectedPanorama.name}
                            </div>
                            <div className="text-xs text-blue-600">
                                ID: {selectedPanorama.id}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanoramaList; 