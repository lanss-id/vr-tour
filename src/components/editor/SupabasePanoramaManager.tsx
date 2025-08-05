import React, { useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { PanoramaData } from '../../utils/dataManager';
import Button from '../common/Button';
import Loading from '../common/Loading';

interface SupabasePanoramaManagerProps {
  onPanoramaUpdate?: () => void;
}

export const SupabasePanoramaManager: React.FC<SupabasePanoramaManagerProps> = ({ 
  onPanoramaUpdate 
}) => {
  const {
    panoramas,
    loading,
    error,
    createPanorama,
    updatePanorama,
    deletePanorama,
    uploadPanoramaImage,
    uploadThumbnailImage,
    clearError,
    refreshData
  } = useSupabase();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPanorama, setEditingPanorama] = useState<PanoramaData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    caption: '',
    panoramaFile: null as File | null,
    thumbnailFile: null as File | null
  });

  const handleCreatePanorama = async () => {
    try {
      if (!formData.name || !formData.panoramaFile) {
        alert('Nama dan file panorama wajib diisi');
        return;
      }

      let panoramaUrl = '';
      let thumbnailUrl = '';

      // Upload panorama image
      if (formData.panoramaFile) {
        const fileName = `panorama_${Date.now()}_${formData.panoramaFile.name}`;
        panoramaUrl = await uploadPanoramaImage(formData.panoramaFile, fileName);
      }

      // Upload thumbnail image
      if (formData.thumbnailFile) {
        const fileName = `thumbnail_${Date.now()}_${formData.thumbnailFile.name}`;
        thumbnailUrl = await uploadThumbnailImage(formData.thumbnailFile, fileName);
      } else {
        // Use panorama as thumbnail if no thumbnail provided
        thumbnailUrl = panoramaUrl;
      }

      const newPanorama: Omit<PanoramaData, 'id'> = {
        panorama: panoramaUrl,
        thumbnail: thumbnailUrl,
        name: formData.name,
        caption: formData.caption,
        markers: [], // Dikosongkan sesuai permintaan
        hotspots: [] // Dikosongkan sesuai permintaan
      };

      await createPanorama(newPanorama);
      
      // Reset form
      setFormData({
        name: '',
        caption: '',
        panoramaFile: null,
        thumbnailFile: null
      });
      setShowCreateForm(false);
      
      if (onPanoramaUpdate) {
        onPanoramaUpdate();
      }
    } catch (error) {
      console.error('Error creating panorama:', error);
      alert('Gagal membuat panorama. Silakan coba lagi.');
    }
  };

  const handleUpdatePanorama = async () => {
    if (!editingPanorama) return;

    try {
      const updates: Partial<PanoramaData> = {};
      
      if (formData.name) updates.name = formData.name;
      if (formData.caption) updates.caption = formData.caption;

      // Upload new images if provided
      if (formData.panoramaFile) {
        const fileName = `panorama_${Date.now()}_${formData.panoramaFile.name}`;
        updates.panorama = await uploadPanoramaImage(formData.panoramaFile, fileName);
      }

      if (formData.thumbnailFile) {
        const fileName = `thumbnail_${Date.now()}_${formData.thumbnailFile.name}`;
        updates.thumbnail = await uploadThumbnailImage(formData.thumbnailFile, fileName);
      }

      await updatePanorama(editingPanorama.id, updates);
      
      // Reset form
      setFormData({
        name: '',
        caption: '',
        panoramaFile: null,
        thumbnailFile: null
      });
      setEditingPanorama(null);
      
      if (onPanoramaUpdate) {
        onPanoramaUpdate();
      }
    } catch (error) {
      console.error('Error updating panorama:', error);
      alert('Gagal mengupdate panorama. Silakan coba lagi.');
    }
  };

  const handleDeletePanorama = async (panoramaId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus panorama ini?')) {
      return;
    }

    try {
      await deletePanorama(panoramaId);
      
      if (onPanoramaUpdate) {
        onPanoramaUpdate();
      }
    } catch (error) {
      console.error('Error deleting panorama:', error);
      alert('Gagal menghapus panorama. Silakan coba lagi.');
    }
  };

  const handleEditPanorama = (panorama: PanoramaData) => {
    setEditingPanorama(panorama);
    setFormData({
      name: panorama.name,
      caption: panorama.caption,
      panoramaFile: null,
      thumbnailFile: null
    });
  };

  const handleFileChange = (field: 'panoramaFile' | 'thumbnailFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-700">{error}</p>
            <Button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Kelola Panorama (Supabase)
        </h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Tambah Panorama
          </Button>
          <Button
            onClick={refreshData}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingPanorama) && (
        <div className="p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingPanorama ? 'Edit Panorama' : 'Tambah Panorama Baru'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Panorama *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama panorama"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <input
                type="text"
                value={formData.caption}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan caption panorama"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Panorama *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('panoramaFile', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Thumbnail (Opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('thumbnailFile', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={editingPanorama ? handleUpdatePanorama : handleCreatePanorama}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {editingPanorama ? 'Update' : 'Simpan'}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPanorama(null);
                  setFormData({
                    name: '',
                    caption: '',
                    panoramaFile: null,
                    thumbnailFile: null
                  });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Panorama List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Daftar Panorama ({panoramas.length})
        </h3>
        
        {panoramas.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg border text-center">
            <p className="text-gray-500">Belum ada panorama. Silakan tambah panorama baru.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {panoramas.map((panorama) => (
              <div
                key={panorama.id}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                      {panorama.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {panorama.caption}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>ID: {panorama.id}</p>
                      <p>Panorama: {panorama.panorama}</p>
                      <p>Thumbnail: {panorama.thumbnail}</p>
                      <p>Markers: {panorama.markers?.length || 0} (dikosongkan)</p>
                      <p>Hotspots: {panorama.hotspots?.length || 0} (dikosongkan)</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleEditPanorama(panorama)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeletePanorama(panorama.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm"
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 