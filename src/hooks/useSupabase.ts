import { useState, useEffect, useCallback } from 'react';
import { PanoramaService } from '../services/panoramaService';
import { PanoramaData, PanoramaMarker, HotspotData } from '../utils/dataManager';

interface UseSupabaseState {
  panoramas: PanoramaData[];
  loading: boolean;
  error: string | null;
  currentPanoramaId: string;
}

interface UseSupabaseActions {
  // Panorama operations
  loadPanoramas: () => Promise<void>;
  getPanoramaById: (id: string) => PanoramaData | undefined;
  setCurrentPanorama: (id: string) => void;
  createPanorama: (data: Omit<PanoramaData, 'id'>) => Promise<PanoramaData>;
  updatePanorama: (id: string, updates: Partial<PanoramaData>) => Promise<PanoramaData>;
  deletePanorama: (id: string) => Promise<void>;
  
  // Marker operations
  getMarkersForPanorama: (panoramaId: string) => Promise<PanoramaMarker[]>;
  addMarker: (panoramaId: string, marker: PanoramaMarker) => Promise<void>;
  updateMarker: (markerId: string, updates: Partial<PanoramaMarker>) => Promise<void>;
  deleteMarker: (markerId: string) => Promise<void>;
  
  // Hotspot operations
  getHotspotsForPanorama: (panoramaId: string) => Promise<HotspotData[]>;
  addHotspot: (panoramaId: string, hotspot: HotspotData) => Promise<void>;
  updateHotspot: (hotspotId: string, updates: Partial<HotspotData>) => Promise<void>;
  deleteHotspot: (hotspotId: string) => Promise<void>;
  
  // Image upload operations
  uploadPanoramaImage: (file: File, fileName: string) => Promise<string>;
  uploadThumbnailImage: (file: File, fileName: string) => Promise<string>;
  deleteImage: (bucket: string, fileName: string) => Promise<void>;
  
  // Migration operations
  migrateFromJson: (panoramaData: PanoramaData[]) => Promise<void>;
  syncWithSupabase: () => Promise<PanoramaData[]>;
  
  // Utility operations
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export const useSupabase = (): UseSupabaseState & UseSupabaseActions => {
  const [state, setState] = useState<UseSupabaseState>({
    panoramas: [],
    loading: false,
    error: null,
    currentPanoramaId: 'kawasan-1'
  });

  // Load panoramas from Supabase
  const loadPanoramas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const panoramas = await PanoramaService.getAllPanoramas();
      setState(prev => ({ 
        ...prev, 
        panoramas, 
        loading: false 
      }));
    } catch (error) {
      console.error('Error loading panoramas:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Gagal memuat data panorama' 
      }));
    }
  }, []);

  // Get panorama by ID (from cache)
  const getPanoramaById = useCallback((id: string): PanoramaData | undefined => {
    return state.panoramas.find(p => p.id === id);
  }, [state.panoramas]);

  // Set current panorama
  const setCurrentPanorama = useCallback((id: string) => {
    const panorama = state.panoramas.find(p => p.id === id);
    if (panorama) {
      setState(prev => ({ ...prev, currentPanoramaId: id }));
    }
  }, [state.panoramas]);

  // Create panorama
  const createPanorama = useCallback(async (data: Omit<PanoramaData, 'id'>): Promise<PanoramaData> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newPanorama = await PanoramaService.createPanorama(data);
      setState(prev => ({ 
        ...prev, 
        panoramas: [...prev.panoramas, newPanorama],
        loading: false 
      }));
      return newPanorama;
    } catch (error) {
      console.error('Error creating panorama:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Gagal membuat panorama' 
      }));
      throw error;
    }
  }, []);

  // Update panorama
  const updatePanorama = useCallback(async (id: string, updates: Partial<PanoramaData>): Promise<PanoramaData> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedPanorama = await PanoramaService.updatePanorama(id, updates);
      setState(prev => ({ 
        ...prev, 
        panoramas: prev.panoramas.map(p => p.id === id ? updatedPanorama : p),
        loading: false 
      }));
      return updatedPanorama;
    } catch (error) {
      console.error('Error updating panorama:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Gagal mengupdate panorama' 
      }));
      throw error;
    }
  }, []);

  // Delete panorama
  const deletePanorama = useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await PanoramaService.deletePanorama(id);
      setState(prev => ({ 
        ...prev, 
        panoramas: prev.panoramas.filter(p => p.id !== id),
        loading: false 
      }));
    } catch (error) {
      console.error('Error deleting panorama:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Gagal menghapus panorama' 
      }));
      throw error;
    }
  }, []);

  // Marker operations
  const getMarkersForPanorama = useCallback(async (panoramaId: string): Promise<PanoramaMarker[]> => {
    try {
      return await PanoramaService.getMarkersForPanorama(panoramaId);
    } catch (error) {
      console.error('Error getting markers:', error);
      throw error;
    }
  }, []);

  const addMarker = useCallback(async (panoramaId: string, marker: PanoramaMarker): Promise<void> => {
    try {
      await PanoramaService.addMarker(panoramaId, marker);
      // Refresh panoramas to get updated data
      await loadPanoramas();
    } catch (error) {
      console.error('Error adding marker:', error);
      throw error;
    }
  }, [loadPanoramas]);

  const updateMarker = useCallback(async (markerId: string, updates: Partial<PanoramaMarker>): Promise<void> => {
    try {
      await PanoramaService.updateMarker(markerId, updates);
      // Refresh panoramas to get updated data
      await loadPanoramas();
    } catch (error) {
      console.error('Error updating marker:', error);
      throw error;
    }
  }, [loadPanoramas]);

  const deleteMarker = useCallback(async (markerId: string): Promise<void> => {
    try {
      await PanoramaService.deleteMarker(markerId);
      // Refresh panoramas to get updated data
      await loadPanoramas();
    } catch (error) {
      console.error('Error deleting marker:', error);
      throw error;
    }
  }, [loadPanoramas]);

  // Hotspot operations
  const getHotspotsForPanorama = useCallback(async (panoramaId: string): Promise<HotspotData[]> => {
    try {
      return await PanoramaService.getHotspotsForPanorama(panoramaId);
    } catch (error) {
      console.error('Error getting hotspots:', error);
      throw error;
    }
  }, []);

  const addHotspot = useCallback(async (panoramaId: string, hotspot: HotspotData): Promise<void> => {
    try {
      await PanoramaService.addHotspot(panoramaId, hotspot);
      // Refresh panoramas to get updated data
      await loadPanoramas();
    } catch (error) {
      console.error('Error adding hotspot:', error);
      throw error;
    }
  }, [loadPanoramas]);

  const updateHotspot = useCallback(async (hotspotId: string, updates: Partial<HotspotData>): Promise<void> => {
    try {
      await PanoramaService.updateHotspot(hotspotId, updates);
      // Refresh panoramas to get updated data
      await loadPanoramas();
    } catch (error) {
      console.error('Error updating hotspot:', error);
      throw error;
    }
  }, [loadPanoramas]);

  const deleteHotspot = useCallback(async (hotspotId: string): Promise<void> => {
    try {
      await PanoramaService.deleteHotspot(hotspotId);
      // Refresh panoramas to get updated data
      await loadPanoramas();
    } catch (error) {
      console.error('Error deleting hotspot:', error);
      throw error;
    }
  }, [loadPanoramas]);

  // Image upload operations
  const uploadPanoramaImage = useCallback(async (file: File, fileName: string): Promise<string> => {
    try {
      return await PanoramaService.uploadPanoramaImage(file, fileName);
    } catch (error) {
      console.error('Error uploading panorama image:', error);
      throw error;
    }
  }, []);

  const uploadThumbnailImage = useCallback(async (file: File, fileName: string): Promise<string> => {
    try {
      return await PanoramaService.uploadThumbnailImage(file, fileName);
    } catch (error) {
      console.error('Error uploading thumbnail image:', error);
      throw error;
    }
  }, []);

  const deleteImage = useCallback(async (bucket: string, fileName: string): Promise<void> => {
    try {
      await PanoramaService.deleteImage(bucket, fileName);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }, []);

  // Migration operations
  const migrateFromJson = useCallback(async (panoramaData: PanoramaData[]): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await PanoramaService.migrateFromJson(panoramaData);
      await loadPanoramas(); // Reload data after migration
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Error during migration:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Gagal melakukan migrasi data' 
      }));
      throw error;
    }
  }, [loadPanoramas]);

  const syncWithSupabase = useCallback(async (): Promise<PanoramaData[]> => {
    try {
      const panoramas = await PanoramaService.syncWithSupabase();
      setState(prev => ({ ...prev, panoramas }));
      return panoramas;
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
      throw error;
    }
  }, []);

  // Utility operations
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshData = useCallback(async () => {
    await loadPanoramas();
  }, [loadPanoramas]);

  // Load panoramas on mount
  useEffect(() => {
    loadPanoramas();
  }, [loadPanoramas]);

  return {
    ...state,
    loadPanoramas,
    getPanoramaById,
    setCurrentPanorama,
    createPanorama,
    updatePanorama,
    deletePanorama,
    getMarkersForPanorama,
    addMarker,
    updateMarker,
    deleteMarker,
    getHotspotsForPanorama,
    addHotspot,
    updateHotspot,
    deleteHotspot,
    uploadPanoramaImage,
    uploadThumbnailImage,
    deleteImage,
    migrateFromJson,
    syncWithSupabase,
    clearError,
    refreshData
  };
}; 