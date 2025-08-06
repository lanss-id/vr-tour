import { supabase, MinimapRow, MinimapMarkerData, MinimapSettings } from '../lib/supabase';

export class MinimapService {
  static async getMinimaps(): Promise<MinimapRow[]> {
    try {
      const { data, error } = await supabase
        .from('minimaps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching minimaps:', error);
      throw error;
    }
  }

  static async createMinimap(minimapData: Partial<MinimapRow>): Promise<MinimapRow> {
    try {
      const { data, error } = await supabase
        .from('minimaps')
        .insert([{
          name: minimapData.name || 'New Floorplan',
          background_image_url: minimapData.background_image_url || '',
          markers: minimapData.markers || [],
          settings: minimapData.settings || {
            width: 800,
            height: 600,
            scale: 1,
            show_labels: true,
            show_connections: true
          }
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating minimap:', error);
      throw error;
    }
  }

  static async updateMinimap(id: string, updates: Partial<MinimapRow>): Promise<MinimapRow> {
    try {
      const { data, error } = await supabase
        .from('minimaps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating minimap:', error);
      throw error;
    }
  }

  static async uploadBackgroundImage(file: File): Promise<string> {
    try {
      const fileName = `minimap-bg-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('minimaps')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('minimaps')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading background image:', error);
      throw error;
    }
  }
} 