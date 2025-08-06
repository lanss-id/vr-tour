# Setup Minimap/Floorplan di Supabase

## Langkah-langkah Setup

### 1. Jalankan SQL Script
Jalankan file `minimap-setup.sql` di SQL Editor Supabase untuk membuat:
- Tabel `minimaps`
- Storage bucket `minimaps`
- Policies untuk keamanan

### 2. Struktur Database

#### Tabel `minimaps`
```sql
CREATE TABLE minimaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Floorplan',
    background_image_url TEXT,
    markers JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{"width": 800, "height": 600, "scale": 1, "show_labels": true, "show_connections": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Storage Bucket `minimaps`
- Untuk menyimpan gambar floorplan
- Public access untuk membaca
- Authenticated users untuk upload/update/delete

### 3. Fitur yang Tersedia

#### Save Floorplan
- Klik tombol "Save to Database" untuk menyimpan floorplan
- Background image akan diupload ke Supabase Storage
- Markers akan disimpan sebagai JSONB

#### Load Floorplan
- Pilih dari daftar floorplan yang tersimpan
- Klik "Load" untuk memuat floorplan dari database

#### Upload Background Image
- Klik icon upload untuk memilih gambar floorplan
- Gambar akan diupload ke Supabase Storage
- URL akan disimpan di database

### 4. Cara Penggunaan

1. **Upload Floorplan Image**
   - Klik icon upload (📤)
   - Pilih file gambar floorplan
   - Gambar akan muncul di canvas

2. **Tambah Markers**
   - Klik di canvas untuk menambah marker
   - Drag marker untuk memindahkan posisi
   - Edit properties di panel sebelah kanan

3. **Save ke Database**
   - Klik tombol "Save to Database"
   - Floorplan akan disimpan dengan nama "Floorplan"
   - Markers dan settings akan disimpan

4. **Load dari Database**
   - Pilih floorplan dari daftar yang tersimpan
   - Klik "Load" untuk memuat data
   - Background image dan markers akan dimuat

### 5. Data Structure

#### MinimapRow
```typescript
interface MinimapRow {
  id: string;
  name: string;
  background_image_url: string;
  markers: MinimapMarkerData[];
  settings: MinimapSettings;
  created_at?: string;
  updated_at?: string;
}
```

#### MinimapMarkerData
```typescript
interface MinimapMarkerData {
  id: string;
  node_id: string;
  x: number;
  y: number;
  label: string;
  type: 'panorama' | 'custom';
}
```

#### MinimapSettings
```typescript
interface MinimapSettings {
  width: number;
  height: number;
  scale: number;
  show_labels: boolean;
  show_connections: boolean;
}
```

### 6. Troubleshooting

#### Error "Failed to load minimaps"
- Pastikan tabel `minimaps` sudah dibuat
- Cek RLS policies sudah benar
- Pastikan environment variables sudah diset

#### Error "Failed to upload image"
- Pastikan storage bucket `minimaps` sudah dibuat
- Cek storage policies sudah benar
- Pastikan file tidak terlalu besar

#### Error "Failed to save markers"
- Pastikan user sudah authenticated
- Cek RLS policies untuk UPDATE
- Pastikan data format JSONB valid

### 7. Environment Variables
Pastikan sudah diset di `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 8. Next Steps
- [ ] Implementasi editor untuk mengedit nama floorplan
- [ ] Implementasi delete floorplan
- [ ] Implementasi duplicate floorplan
- [ ] Implementasi export/import floorplan
- [ ] Implementasi preview floorplan di viewer 