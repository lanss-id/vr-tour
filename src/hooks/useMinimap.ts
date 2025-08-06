import { useState, useEffect } from 'react';
import { MinimapService } from '../services/minimapService';
import { MinimapRow, MinimapMarkerData, MinimapSettings } from '../lib/supabase';

export const useMinimap = () => {
  const [minimaps, setMinimaps] = useState<MinimapRow[]>([]);
  const [currentMinimap, setCurrentMinimap] = useState<MinimapRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all minimaps
  const loadMinimaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MinimapService.getMinimaps();
      setMinimaps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load minimaps');
    } finally {
      setLoading(false);
    }
  };

  // Create new minimap
  const createMinimap = async (minimapData: Partial<MinimapRow>) => {
    try {
      setLoading(true);
      setError(null);
      const newMinimap = await MinimapService.createMinimap(minimapData);
      setMinimaps(prev => [newMinimap, ...prev]);
      setCurrentMinimap(newMinimap);
      return newMinimap;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create minimap');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update minimap
  const updateMinimap = async (id: string, updates: Partial<MinimapRow>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedMinimap = await MinimapService.updateMinimap(id, updates);
      setMinimaps(prev => prev.map(m => m.id === id ? updatedMinimap : m));
      if (currentMinimap?.id === id) {
        setCurrentMinimap(updatedMinimap);
      }
      return updatedMinimap;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update minimap');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload background image
  const uploadBackgroundImage = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const imageUrl = await MinimapService.uploadBackgroundImage(file);
      return imageUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Save markers
  const saveMarkers = async (minimapId: string, markers: MinimapMarkerData[]) => {
    try {
      setError(null);
      await MinimapService.updateMinimap(minimapId, { markers });
      setMinimaps(prev => prev.map(m => 
        m.id === minimapId ? { ...m, markers } : m
      ));
      if (currentMinimap?.id === minimapId) {
        setCurrentMinimap(prev => prev ? { ...prev, markers } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save markers');
      throw err;
    }
  };

  // Save settings
  const saveSettings = async (minimapId: string, settings: MinimapSettings) => {
    try {
      setError(null);
      await MinimapService.updateMinimap(minimapId, { settings });
      setMinimaps(prev => prev.map(m => 
        m.id === minimapId ? { ...m, settings } : m
      ));
      if (currentMinimap?.id === minimapId) {
        setCurrentMinimap(prev => prev ? { ...prev, settings } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      throw err;
    }
  };

  // Load minimaps on mount
  useEffect(() => {
    loadMinimaps();
  }, []);

  return {
    minimaps,
    currentMinimap,
    loading,
    error,
    loadMinimaps,
    createMinimap,
    updateMinimap,
    uploadBackgroundImage,
    saveMarkers,
    saveSettings,
    setCurrentMinimap
  };
}; 