import { useState, useEffect, useCallback } from 'react';
import { PanoramaService } from '../services/panoramaService';
import { PanoramaData } from '../utils/dataManager';

interface UseViewerSupabaseState {
  panoramas: PanoramaData[];
  loading: boolean;
  error: string | null;
  currentPanoramaId: string;
}

interface UseViewerSupabaseActions {
  loadPanoramas: () => Promise<void>;
  getPanoramaById: (id: string) => PanoramaData | undefined;
  setCurrentPanorama: (id: string) => void;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export const useViewerSupabase = (): UseViewerSupabaseState & UseViewerSupabaseActions => {
  const [state, setState] = useState<UseViewerSupabaseState>({
    panoramas: [],
    loading: false,
    error: null,
    currentPanoramaId: ''
  });

  // Load panoramas from Supabase
  const loadPanoramas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const panoramas = await PanoramaService.getAllPanoramas();
      console.log('Loaded panoramas from Supabase:', panoramas.length);
      
      if (panoramas.length > 0) {
        console.log('First panorama ID:', panoramas[0].id);
      }
      
      setState(prev => ({ 
        ...prev, 
        panoramas, 
        loading: false,
        currentPanoramaId: panoramas.length > 0 ? panoramas[0].id : ''
      }));
    } catch (error) {
      console.error('Error loading panoramas for viewer:', error);
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

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadPanoramas();
  }, [loadPanoramas]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load panoramas on mount
  useEffect(() => {
    loadPanoramas();
  }, [loadPanoramas]);

  return {
    ...state,
    loadPanoramas,
    getPanoramaById,
    setCurrentPanorama,
    refreshData,
    clearError
  };
}; 