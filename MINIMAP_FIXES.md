# Perbaikan Masalah Minimap/Floorplan

## Masalah yang Ditemukan

### 1. Node tidak muncul di minimap editor workspace
**Penyebab:** 
- MinimapData tidak memiliki struktur yang benar
- Drop event tidak ditangani dengan benar
- Panorama yang di-drop tidak disimpan ke state

**Solusi:**
```typescript
// 1. Update interface MinimapData
export interface MinimapData {
    backgroundImage: string;
    markers: MinimapMarker[];
    panoramas: MinimapPanorama[]; // Tambahkan ini
}

export interface MinimapPanorama {
    id: string;
    x: number;
    y: number;
    name?: string;
    thumbnail?: string;
}

// 2. Tambahkan actions di editor store
addPanoramaToMinimap: (panoramaId: string, x: number, y: number) => void;

// 3. Implementasi di MinimapEditor
const handlePanoramaDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const panoramaId = event.dataTransfer.getData('text/plain');
    const panorama = panoramas.find(p => p.id === panoramaId);
    
    if (panorama && minimapRef.current) {
        const rect = minimapRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        
        addPanoramaToMinimap(panoramaId, x, y);
    }
};
```

### 2. Image tidak tersimpan ke database
**Penyebab:**
- Upload function tidak terintegrasi dengan benar
- Database schema belum dibuat
- Service layer belum lengkap

**Solusi:**
```typescript
// 1. Jalankan SQL setup
-- Jalankan minimap-setup.sql di Supabase

// 2. Perbaiki upload function
const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        try {
            const imageUrl = await uploadBackgroundImage(file);
            updateMinimapData({ backgroundImage: imageUrl });
            console.log('Image uploaded successfully:', imageUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }
};

// 3. Perbaiki save function
const handleSaveToDatabase = async () => {
    try {
        setIsSaving(true);
        
        const minimapDataToSave = {
            name: 'Floorplan',
            background_image_url: minimapData?.backgroundImage || '',
            markers: markers.map(marker => ({
                id: marker.id,
                node_id: marker.nodeId,
                x: marker.x,
                y: marker.y,
                label: marker.label,
                type: 'custom' as const
            })),
            settings: {
                width: 800,
                height: 600,
                scale: 1,
                show_labels: true,
                show_connections: true
            }
        };
        
        if (currentMinimap) {
            await updateMinimap(currentMinimap.id, minimapDataToSave);
            alert('Floorplan updated successfully!');
        } else {
            const newMinimap = await createMinimap(minimapDataToSave);
            setCurrentMinimap(newMinimap);
            alert('Floorplan saved successfully!');
        }
    } catch (error) {
        console.error('Error saving floorplan:', error);
        alert('Error saving floorplan: ' + error);
    } finally {
        setIsSaving(false);
    }
};
```

### 3. Properties panel tidak berfungsi
**Penyebab:**
- State management tidak terintegrasi
- Event handlers tidak terhubung
- UI tidak responsive terhadap perubahan

**Solusi:**
```typescript
// 1. Tambahkan state untuk selected panorama
const [selectedPanorama, setSelectedPanorama] = useState<string | null>(null);

// 2. Handle panorama selection
const handlePanoramaClick = (panoramaId: string) => {
    setSelectedPanorama(panoramaId);
    setSelectedMarker(null);
};

// 3. Properties panel untuk panorama
{selectedPanoramaData && (
    <div className="bg-purple-50 rounded-lg p-4">
        <h3 className="font-medium text-purple-800 mb-3">Edit Panorama Position</h3>
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">
                    Panorama ID
                </label>
                <input
                    type="text"
                    value={selectedPanoramaData.id}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-purple-700 mb-1">
                        X Position (%)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedPanoramaData.x}
                        onChange={(e) => {
                            const updatedPanoramas = minimapPanoramas.map(p => 
                                p.id === selectedPanoramaData.id 
                                    ? { ...p, x: parseFloat(e.target.value) }
                                    : p
                            );
                            updateMinimapData({ panoramas: updatedPanoramas });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-purple-700 mb-1">
                        Y Position (%)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedPanoramaData.y}
                        onChange={(e) => {
                            const updatedPanoramas = minimapPanoramas.map(p => 
                                p.id === selectedPanoramaData.id 
                                    ? { ...p, y: parseFloat(e.target.value) }
                                    : p
                            );
                            updateMinimapData({ panoramas: updatedPanoramas });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                </div>
            </div>
        </div>
    </div>
)}
```

## Langkah-langkah Perbaikan

### 1. Update Editor Store
```typescript
// src/store/editorStore.ts
interface EditorState {
    // ... existing properties
    minimapData: MinimapData;
    
    // ... existing actions
    updateMinimapData: (updates: Partial<MinimapData>) => void;
    addMinimapMarker: (marker: MinimapMarker) => void;
    updateMinimapMarker: (id: string, updates: Partial<MinimapMarker>) => void;
    deleteMinimapMarker: (id: string) => void;
    addPanoramaToMinimap: (panoramaId: string, x: number, y: number) => void;
}
```

### 2. Update Types
```typescript
// src/types/panorama.ts
export interface MinimapData {
    backgroundImage: string;
    markers: MinimapMarker[];
    panoramas: MinimapPanorama[];
}

export interface MinimapPanorama {
    id: string;
    x: number;
    y: number;
    name?: string;
    thumbnail?: string;
}
```

### 3. Setup Database
```sql
-- Jalankan minimap-setup.sql di Supabase SQL Editor
```

### 4. Update MinimapEditor
- Tambahkan drop event handlers
- Tambahkan panorama rendering
- Tambahkan properties panel untuk panorama
- Perbaiki save function

### 5. Test Fitur
1. Upload floorplan image
2. Drag panorama dari panel kiri ke minimap
3. Klik panorama untuk edit properties
4. Klik "Save Floorplan" untuk simpan ke database

## Expected Results

Setelah perbaikan:
- ✅ Node panorama akan muncul di minimap saat di-drop
- ✅ Image akan tersimpan ke database
- ✅ Properties panel akan berfungsi untuk edit posisi
- ✅ Drag & drop panorama akan bekerja dengan baik
- ✅ Save ke database akan berhasil

## Troubleshooting

### Error "Failed to load minimaps"
- Pastikan tabel `minimaps` sudah dibuat
- Cek environment variables

### Error "Failed to upload image"
- Pastikan storage bucket `minimaps` sudah dibuat
- Cek storage policies

### Node tidak muncul setelah drop
- Cek console untuk error
- Pastikan `addPanoramaToMinimap` terpanggil
- Cek state management

### Properties tidak berubah
- Pastikan event handlers terhubung
- Cek state updates
- Cek UI re-rendering 