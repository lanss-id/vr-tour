import { createClient } from '@supabase/supabase-js';

// Ganti dengan URL dan anon key dari project Supabase Anda
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types untuk database
export interface PanoramaRow {
  id: string;
  panorama_url: string;
  thumbnail_url: string;
  name: string;
  caption: string;
  markers: any[]; // Akan dikosongkan sesuai permintaan
  hotspots: any[]; // Akan dikosongkan sesuai permintaan
  created_at?: string;
  updated_at?: string;
}

export interface MarkerRow {
  id: string;
  panorama_id: string;
  target_node_id: string;
  position_x: number;
  position_y: number;
  created_at?: string;
}

export interface HotspotRow {
  id: string;
  panorama_id: string;
  position_yaw: number;
  position_pitch: number;
  type: 'info' | 'link' | 'custom';
  title: string;
  content: string;
  is_visible: boolean;
  style: any;
  target_node_id?: string;
  created_at?: string;
}

export interface MinimapRow {
  id: string;
  name: string;
  background_image_url: string;
  markers: MinimapMarkerData[];
  settings: MinimapSettings;
  created_at?: string;
  updated_at?: string;
}

export interface MinimapMarkerData {
  id: string;
  node_id: string;
  x: number;
  y: number;
  label: string;
  type: 'panorama' | 'custom';
}

export interface MinimapSettings {
  width: number;
  height: number;
  scale: number;
  show_labels: boolean;
  show_connections: boolean;
} 