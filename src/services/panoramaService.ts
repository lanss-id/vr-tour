import { supabase, PanoramaRow, MarkerRow, HotspotRow } from '../lib/supabase';
import { PanoramaData, PanoramaMarker, HotspotData } from '../utils/dataManager';

export class PanoramaService {
  // ===== PANORAMA CRUD OPERATIONS =====
  
  // Get all panoramas
  static async getAllPanoramas(): Promise<PanoramaData[]> {
    try {
      const { data, error } = await supabase
        .from('panoramas')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(this.mapPanoramaRowToData) || [];
    } catch (error) {
      console.error('Error fetching panoramas:', error);
      throw error;
    }
  }

  // Get panorama by ID
  static async getPanoramaById(id: string): Promise<PanoramaData | null> {
    try {
      const { data, error } = await supabase
        .from('panoramas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? this.mapPanoramaRowToData(data) : null;
    } catch (error) {
      console.error('Error fetching panorama:', error);
      throw error;
    }
  }

  // Create new panorama
  static async createPanorama(panoramaData: Omit<PanoramaData, 'id'>): Promise<PanoramaData> {
    try {
      const panoramaRow: Omit<PanoramaRow, 'id' | 'created_at' | 'updated_at'> = {
        panorama_url: panoramaData.panorama,
        thumbnail_url: panoramaData.thumbnail,
        name: panoramaData.name,
        caption: panoramaData.caption,
        markers: panoramaData.markers || [],
        hotspots: panoramaData.hotspots || []
      };

      const { data, error } = await supabase
        .from('panoramas')
        .insert(panoramaRow)
        .select()
        .single();

      if (error) throw error;

      return this.mapPanoramaRowToData(data);
    } catch (error) {
      console.error('Error creating panorama:', error);
      throw error;
    }
  }

  // Update panorama
  static async updatePanorama(id: string, updates: Partial<PanoramaData>): Promise<PanoramaData> {
    try {
      const updateData: Partial<PanoramaRow> = {};
      
      if (updates.panorama) updateData.panorama_url = updates.panorama;
      if (updates.thumbnail) updateData.thumbnail_url = updates.thumbnail;
      if (updates.name) updateData.name = updates.name;
      if (updates.caption) updateData.caption = updates.caption;
      if (updates.markers) updateData.markers = updates.markers;
      if (updates.hotspots) updateData.hotspots = updates.hotspots;

      const { data, error } = await supabase
        .from('panoramas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapPanoramaRowToData(data);
    } catch (error) {
      console.error('Error updating panorama:', error);
      throw error;
    }
  }

  // Delete panorama
  static async deletePanorama(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('panoramas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting panorama:', error);
      throw error;
    }
  }

  // ===== MARKER OPERATIONS =====
  
  // Get markers for panorama
  static async getMarkersForPanorama(panoramaId: string): Promise<PanoramaMarker[]> {
    try {
      const { data, error } = await supabase
        .from('markers')
        .select('*')
        .eq('panorama_id', panoramaId);

      if (error) throw error;

      return data?.map(this.mapMarkerRowToData) || [];
    } catch (error) {
      console.error('Error fetching markers:', error);
      throw error;
    }
  }

  // Add marker to panorama
  static async addMarker(panoramaId: string, marker: PanoramaMarker): Promise<void> {
    try {
      const markerRow: Omit<MarkerRow, 'id' | 'created_at'> = {
        panorama_id: panoramaId,
        target_node_id: marker.nodeId,
        position_x: 'textureX' in marker.position ? marker.position.textureX : 0,
        position_y: 'textureY' in marker.position ? marker.position.textureY : 0
      };

      const { error } = await supabase
        .from('markers')
        .insert(markerRow);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding marker:', error);
      throw error;
    }
  }

  // Update marker
  static async updateMarker(markerId: string, updates: Partial<PanoramaMarker>): Promise<void> {
    try {
      const updateData: Partial<MarkerRow> = {};
      
      if (updates.nodeId) updateData.target_node_id = updates.nodeId;
      if (updates.position) {
        updateData.position_x = 'textureX' in updates.position ? updates.position.textureX : 0;
        updateData.position_y = 'textureY' in updates.position ? updates.position.textureY : 0;
      }

      const { error } = await supabase
        .from('markers')
        .update(updateData)
        .eq('id', markerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating marker:', error);
      throw error;
    }
  }

  // Delete marker
  static async deleteMarker(markerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('markers')
        .delete()
        .eq('id', markerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting marker:', error);
      throw error;
    }
  }

  // ===== HOTSPOT OPERATIONS =====
  
  // Get hotspots for panorama
  static async getHotspotsForPanorama(panoramaId: string): Promise<HotspotData[]> {
    try {
      const { data, error } = await supabase
        .from('hotspots')
        .select('*')
        .eq('panorama_id', panoramaId);

      if (error) throw error;

      return data?.map(this.mapHotspotRowToData) || [];
    } catch (error) {
      console.error('Error fetching hotspots:', error);
      throw error;
    }
  }

  // Add hotspot to panorama
  static async addHotspot(panoramaId: string, hotspot: HotspotData): Promise<void> {
    try {
      const hotspotRow: Omit<HotspotRow, 'id' | 'created_at'> = {
        panorama_id: panoramaId,
        position_yaw: hotspot.position.yaw,
        position_pitch: hotspot.position.pitch,
        type: hotspot.type,
        title: hotspot.title,
        content: hotspot.content,
        is_visible: hotspot.isVisible,
        style: hotspot.style || {},
        target_node_id: hotspot.targetNodeId
      };

      const { error } = await supabase
        .from('hotspots')
        .insert(hotspotRow);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding hotspot:', error);
      throw error;
    }
  }

  // Update hotspot
  static async updateHotspot(hotspotId: string, updates: Partial<HotspotData>): Promise<void> {
    try {
      const updateData: Partial<HotspotRow> = {};
      
      if (updates.position) {
        updateData.position_yaw = updates.position.yaw;
        updateData.position_pitch = updates.position.pitch;
      }
      if (updates.type) updateData.type = updates.type;
      if (updates.title) updateData.title = updates.title;
      if (updates.content) updateData.content = updates.content;
      if (updates.isVisible !== undefined) updateData.is_visible = updates.isVisible;
      if (updates.style) updateData.style = updates.style;
      if (updates.targetNodeId) updateData.target_node_id = updates.targetNodeId;

      const { error } = await supabase
        .from('hotspots')
        .update(updateData)
        .eq('id', hotspotId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating hotspot:', error);
      throw error;
    }
  }

  // Delete hotspot
  static async deleteHotspot(hotspotId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('hotspots')
        .delete()
        .eq('id', hotspotId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting hotspot:', error);
      throw error;
    }
  }

  // ===== IMAGE UPLOAD =====
  
  // Upload panorama image
  static async uploadPanoramaImage(file: File, fileName: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('panoramas')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('panoramas')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading panorama image:', error);
      throw error;
    }
  }

  // Upload thumbnail image
  static async uploadThumbnailImage(file: File, fileName: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail image:', error);
      throw error;
    }
  }

  // Delete image from storage
  static async deleteImage(bucket: string, fileName: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // ===== DATA MAPPING =====
  
  // Map database row to PanoramaData
  private static mapPanoramaRowToData(row: PanoramaRow): PanoramaData {
    return {
      id: row.id,
      panorama: row.panorama_url,
      thumbnail: row.thumbnail_url,
      name: row.name,
      caption: row.caption,
      markers: row.markers || [],
      hotspots: row.hotspots || []
    };
  }

  // Map database row to PanoramaMarker
  private static mapMarkerRowToData(row: MarkerRow): PanoramaMarker {
    return {
      nodeId: row.target_node_id,
      position: {
        textureX: row.position_x,
        textureY: row.position_y
      }
    };
  }

  // Map database row to HotspotData
  private static mapHotspotRowToData(row: HotspotRow): HotspotData {
    return {
      id: row.id,
      panoramaId: row.panorama_id,
      position: {
        yaw: row.position_yaw,
        pitch: row.position_pitch
      },
      type: row.type,
      title: row.title,
      content: row.content,
      isVisible: row.is_visible,
      style: row.style,
      targetNodeId: row.target_node_id
    };
  }

  // ===== MIGRATION HELPERS =====
  
  // Migrate existing JSON data to Supabase
  static async migrateFromJson(panoramaData: PanoramaData[]): Promise<void> {
    try {
      console.log('Starting migration of', panoramaData.length, 'panoramas...');
      
      for (const panorama of panoramaData) {
        // Create panorama without markers (dikosongkan sesuai permintaan)
        const panoramaWithoutMarkers = {
          ...panorama,
          markers: [], // Dikosongkan
          hotspots: [] // Dikosongkan
        };
        
        await this.createPanorama(panoramaWithoutMarkers);
        console.log('Migrated panorama:', panorama.id);
      }
      
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }

  // Sync local data with Supabase
  static async syncWithSupabase(): Promise<PanoramaData[]> {
    try {
      const panoramas = await this.getAllPanoramas();
      console.log('Synced', panoramas.length, 'panoramas from Supabase');
      return panoramas;
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
      throw error;
    }
  }
} 