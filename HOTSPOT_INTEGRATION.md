# Integrasi Hotspot dari Database Supabase

## Overview

Sistem panorama sekarang mendukung hotspot yang disimpan di database Supabase. Hotspot dapat ditampilkan di viewer dan dikelola melalui editor.

## Fitur Hotspot

### 1. Jenis Hotspot

- **Info**: Menampilkan informasi dalam modal
- **Link**: Navigasi ke panorama lain
- **Custom**: Hotspot dengan aksi kustom

### 2. Struktur Data Hotspot

```typescript
interface HotspotData {
  id: string;
  panoramaId: string;
  position: {
    yaw: number;
    pitch: number;
  };
  type: 'info' | 'link' | 'custom' | string;
  title: string;
  content: string;
  isVisible: boolean;
  style?: {
    backgroundColor?: string;
    size?: number;
    icon?: string;
  };
  targetNodeId?: string;
}
```

### 3. Komponen yang Terlibat

#### Hook: `useHotspots`
- Mengelola state hotspot
- CRUD operasi untuk hotspot
- Loading dan error handling

#### Komponen: `HotspotDisplay`
- Menampilkan hotspot di viewer
- Menangani klik hotspot
- Menampilkan modal info

#### Komponen: `HotspotInfoModal`
- Modal untuk menampilkan informasi hotspot
- Support HTML content
- Responsive design

## Cara Penggunaan

### 1. Menampilkan Hotspot di Viewer

Hotspot akan otomatis dimuat dan ditampilkan ketika:
- Panorama berubah
- Data hotspot diupdate di database

### 2. Menambah Hotspot Baru

```typescript
// Menggunakan hook useHotspots
const { addHotspot } = useHotspots();

const newHotspot = {
  panoramaId: 'panorama-1',
  position: { yaw: 0, pitch: 0 },
  type: 'info',
  title: 'Judul Hotspot',
  content: 'Konten hotspot',
  isVisible: true
};

await addHotspot('panorama-1', newHotspot);
```

### 3. Mengupdate Hotspot

```typescript
const { updateHotspot } = useHotspots();

await updateHotspot('hotspot-id', {
  title: 'Judul Baru',
  content: 'Konten baru'
});
```

### 4. Menghapus Hotspot

```typescript
const { deleteHotspot } = useHotspots();

await deleteHotspot('hotspot-id');
```

## Database Schema

### Tabel: `hotspots`

```sql
CREATE TABLE hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panorama_id UUID REFERENCES panoramas(id) ON DELETE CASCADE,
  position_yaw DECIMAL NOT NULL,
  position_pitch DECIMAL NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  style JSONB,
  target_node_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Konfigurasi

### 1. Environment Variables

Pastikan environment variables sudah dikonfigurasi:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

Jalankan script SQL untuk membuat tabel hotspots:

```sql
-- Buat tabel hotspots
CREATE TABLE IF NOT EXISTS hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panorama_id UUID REFERENCES panoramas(id) ON DELETE CASCADE,
  position_yaw DECIMAL NOT NULL,
  position_pitch DECIMAL NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  style JSONB,
  target_node_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_hotspots_panorama_id ON hotspots(panorama_id);
CREATE INDEX IF NOT EXISTS idx_hotspots_visible ON hotspots(is_visible);

-- Enable RLS
ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;

-- Policy untuk development (allow all)
CREATE POLICY "Allow all operations" ON hotspots FOR ALL USING (true);
```

## Troubleshooting

### 1. Hotspot Tidak Muncul

- Periksa apakah `isVisible` = true
- Periksa koneksi ke Supabase
- Periksa console untuk error

### 2. Hotspot Tidak Berfungsi

- Periksa apakah MarkersPlugin sudah terinstall
- Periksa event listener untuk hotspot
- Periksa data hotspot di database

### 3. Error Loading Hotspot

- Periksa koneksi internet
- Periksa Supabase credentials
- Periksa database permissions

## Contoh Data Hotspot

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "panorama_id": "panorama-1",
  "position_yaw": 1.57,
  "position_pitch": 0.0,
  "type": "info",
  "title": "Informasi Ruangan",
  "content": "<h3>Ruang Tamu</h3><p>Ruang tamu dengan desain modern...</p>",
  "is_visible": true,
  "style": {
    "backgroundColor": "#ff6b6b",
    "size": 40,
    "icon": "/icon/info.svg"
  },
  "target_node_id": null
}
```

## Next Steps

1. **Editor Hotspot**: Implementasi UI untuk menambah/edit hotspot
2. **Hotspot Analytics**: Tracking penggunaan hotspot
3. **Advanced Styling**: Lebih banyak opsi styling
4. **Hotspot Templates**: Template untuk hotspot umum
5. **Bulk Operations**: Operasi massal untuk hotspot 