import { useState, useEffect, useCallback } from 'react';
import { PanoramaService } from '../services/panoramaService';
import { HotspotData } from '../utils/dataManager';

interface UseHotspotsState {
  hotspots: HotspotData[];
  loading: boolean;
  error: string | null;
}

interface UseHotspotsActions {
  loadHotspotsForPanorama: (panoramaId: string) => Promise<void>;
  addHotspot: (panoramaId: string, hotspot: HotspotData) => Promise<void>;
  updateHotspot: (hotspotId: string, updates: Partial<HotspotData>) => Promise<void>;
  deleteHotspot: (hotspotId: string) => Promise<void>;
  clearError: () => void;
}

export const useHotspots = (): UseHotspotsState & UseHotspotsActions => {
  const [state, setState] = useState<UseHotspotsState>({
    hotspots: [],
    loading: false,
    error: null
  });

  // Load hotspots for a specific panorama
  const loadHotspotsForPanorama = useCallback(async (panoramaId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const hotspots = await PanoramaService.getHotspotsForPanorama(panoramaId);
      setState(prev => ({ 
        ...prev, 
        hotspots, 
        loading: false 
      }));
    } catch (error) {
      console.error('Error loading hotspots:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Gagal memuat hotspots' 
      }));
    }
  }, []);

  // Add hotspot
  const addHotspot = useCallback(async (panoramaId: string, hotspot: HotspotData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await PanoramaService.addHotspot(panoramaId, hotspot);
      // Reload hotspots after adding
      await loadHotspotsForPanorama(panoramaId);
    } catch (error) {
      console.error('Error adding hotspot:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Gagal menambah hotspot' 
      }));
      throw error;
    }
  }, [loadHotspotsForPanorama]);

  // Update hotspot
  const updateHotspot = useCallback(async (hotspotId: string, updates: Partial<HotspotData>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await PanoramaService.updateHotspot(hotspotId, updates);
      // Reload hotspots after updating
      const currentPanoramaId = state.hotspots[0]?.panoramaId;
      if (currentPanoramaId) {
        await loadHotspotsForPanorama(currentPanoramaId);
      }
    } catch (error) {
      console.error('Error updating hotspot:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Gagal mengupdate hotspot' 
      }));
      throw error;
    }
  }, [loadHotspotsForPanorama, state.hotspots]);

  // Delete hotspot
  const deleteHotspot = useCallback(async (hotspotId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await PanoramaService.deleteHotspot(hotspotId);
      // Reload hotspots after deleting
      const currentPanoramaId = state.hotspots[0]?.panoramaId;
      if (currentPanoramaId) {
        await loadHotspotsForPanorama(currentPanoramaId);
      }
    } catch (error) {
      console.error('Error deleting hotspot:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Gagal menghapus hotspot' 
      }));
      throw error;
    }
  }, [loadHotspotsForPanorama, state.hotspots]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadHotspotsForPanorama,
    addHotspot,
    updateHotspot,
    deleteHotspot,
    clearError
  };
}; 