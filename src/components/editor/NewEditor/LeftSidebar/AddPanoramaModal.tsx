import React, { useState, useRef } from 'react';
import { X, Upload, Image, FileText, Eye } from 'lucide-react';
import { useSupabase } from '../../../../hooks/useSupabase';
import Button from '../../../common/Button';
import OptimizedImage from '../../../common/OptimizedImage';

interface AddPanoramaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddPanoramaModal: React.FC<AddPanoramaModalProps> = ({ isOpen, onClose }) => {
    const { createPanorama, uploadPanoramaImage, uploadThumbnailImage } = useSupabase();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        caption: '',
        category: '',
        panoramaFile: null as File | null,
        thumbnailFile: null as File | null
    });
    const [previewUrls, setPreviewUrls] = useState({
        panorama: '',
        thumbnail: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (field: 'panoramaFile' | 'thumbnailFile', file: File | null) => {
        setFormData(prev => ({ ...prev, [field]: file }));
        
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrls(prev => ({
                ...prev,
                [field === 'panoramaFile' ? 'panorama' : 'thumbnail']: url
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.panoramaFile) return;

        setIsLoading(true);
        try {
            // Upload files to Supabase Storage
            const panoramaUrl = await uploadPanoramaImage(
                formData.panoramaFile,
                `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`
            );

            let thumbnailUrl = '';
            if (formData.thumbnailFile) {
                thumbnailUrl = await uploadThumbnailImage(
                    formData.thumbnailFile,
                    `${formData.name.toLowerCase().replace(/\s+/g, '-')}-thumb-${Date.now()}.jpg`
                );
            }

            // Create panorama record in database
            await createPanorama({
                name: formData.name,
                caption: formData.caption,
                panorama: panoramaUrl,
                thumbnail: thumbnailUrl || panoramaUrl, // Use panorama as thumbnail if no thumbnail provided
                category: formData.category
            });

            // Reset form and close modal
            setFormData({
                name: '',
                caption: '',
                category: '',
                panoramaFile: null,
                thumbnailFile: null
            });
            setPreviewUrls({ panorama: '', thumbnail: '' });
            onClose();
        } catch (error) {
            console.error('Error creating panorama:', error);
            alert('Failed to create panorama. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setFormData({
                name: '',
                caption: '',
                category: '',
                panoramaFile: null,
                thumbnailFile: null
            });
            setPreviewUrls({ panorama: '', thumbnail: '' });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Panorama</h2>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Panorama Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter panorama name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.caption}
                                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter panorama description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter category (optional)"
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Upload Files</h3>
                        
                        {/* Panorama Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Panorama Image *
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('panoramaFile', e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                {previewUrls.panorama ? (
                                    <div className="space-y-3">
                                        <OptimizedImage
                                            src={previewUrls.panorama}
                                            alt="Panorama preview"
                                            className="w-full max-h-48 rounded"
                                            priority={true}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            Change Image
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, JPEG up to 50MB
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                                        >
                                            Choose File
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thumbnail Image (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <input
                                    ref={thumbnailInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('thumbnailFile', e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                {previewUrls.thumbnail ? (
                                    <div className="space-y-3">
                                        <OptimizedImage
                                            src={previewUrls.thumbnail}
                                            alt="Thumbnail preview"
                                            className="w-full max-h-32 rounded"
                                            priority={true}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => thumbnailInputRef.current?.click()}
                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            Change Thumbnail
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Image className="w-8 h-8 mx-auto text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Upload a thumbnail image
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Will use panorama as thumbnail if not provided
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => thumbnailInputRef.current?.click()}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                                        >
                                            Choose Thumbnail
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !formData.name || !formData.panoramaFile}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Creating...</span>
                                </div>
                            ) : (
                                'Create Panorama'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPanoramaModal; 