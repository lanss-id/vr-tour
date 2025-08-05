# VR Panorama Tour - Usage Examples

## 🎯 Hotspot Editor dengan Panorama Links Integration

### Contoh 1: Membuat Link Navigasi Antar Panorama

#### Langkah-langkah:

1. **Buka Editor**: Akses `/editor` di browser
2. **Pilih Panorama**: Pilih panorama dari sidebar (misal: "Kawasan - Panorama 1")
3. **Switch ke Hotspot Mode**: Klik tool "Hotspot" atau tekan '2'
4. **Tambah Hotspot**: Klik di panorama untuk menambah hotspot baru
5. **Edit Hotspot**: Pilih hotspot yang baru dibuat di sidebar
6. **Ubah Type**: Ganti type dari "Info" ke "Link to Panorama"
7. **Pilih Target**: Pilih panorama tujuan dari dropdown (misal: "Type 35 - Interior 1")
8. **Simpan**: Link otomatis ditambahkan ke `panorama-data.json`

#### Hasil:

- Hotspot muncul dengan icon arrow (→)
- Link otomatis ditambahkan ke `panorama-data.json`
- Klik hotspot di viewer untuk navigasi ke panorama tujuan

### Contoh 2: Drag & Drop Repositioning

#### Langkah-langkah:

1. **Pilih Hotspot**: Klik hotspot yang sudah ada
2. **Drag**: Drag hotspot ke posisi baru
3. **Drop**: Lepas mouse di posisi yang diinginkan

#### Hasil:

- Posisi hotspot berubah secara real-time
- Jika hotspot bertipe "Link", posisi link di `panorama-data.json` juga terupdate
- Perubahan langsung terlihat di viewer

### Contoh 3: Mengelola Multiple Links

#### Langkah-langkah:

1. **Buat Beberapa Link**: Buat hotspot link untuk beberapa panorama
2. **Edit Target**: Pilih hotspot dan ubah target panorama
3. **Unlink**: Gunakan tombol "Unlink" untuk menghapus link
4. **Export**: Klik tombol JSON hijau untuk export data

#### Hasil:

- Multiple links terkelola dengan baik
- Export menghasilkan `panorama-data-updated.json`
- Data bisa digunakan untuk update file asli

## 🔧 Technical Examples

### Contoh Kode: Menambah Link Programmatically

```typescript
import { addLinkToPanorama } from '../utils/panoramaLoader';

// Menambah link dari panorama A ke panorama B
const success = addLinkToPanorama('kawasan-1', 'type35-1', {
  yaw: 0.5,
  pitch: 0.2,
});

if (success) {
  console.log('Link berhasil ditambahkan');
} else {
  console.log('Link sudah ada atau panorama tidak ditemukan');
}
```

### Contoh Kode: Update Link Position

```typescript
import { updateLinkPosition } from '../utils/panoramaLoader';

// Update posisi link
const success = updateLinkPosition('kawasan-1', 'type35-1', {
  yaw: 0.8,
  pitch: 0.1,
});

if (success) {
  console.log('Posisi link berhasil diupdate');
}
```

### Contoh Kode: Export Panorama Data

```typescript
import {
  exportPanoramaDataToFile,
  syncHotspotsWithLinks,
} from '../utils/panoramaLoader';

// Sync hotspots dengan links
syncHotspotsWithLinks(hotspots);

// Export data yang sudah diupdate
exportPanoramaDataToFile();
```

## 🎨 Visual Examples

### Hotspot Types di Editor

```
🔵 Info Hotspot: Menampilkan informasi
🟢 Link Hotspot: Navigasi ke panorama lain
🔴 Selected Hotspot: Hotspot yang sedang diedit
```

### Link Status Indicators

```
✅ Linked: Hotspot terhubung dengan panorama-data.json
⚠️ Not Linked: Hotspot belum terhubung
🔄 Syncing: Sedang sinkronisasi dengan panorama-data.json
```

### Editor Interface

```
┌─────────────────────────────────────┐
│ [Panorama] [Hotspot] [Minimap]    │ ← Tool Selection
├─────────────────────────────────────┤
│                                     │
│         Panorama Viewer             │ ← Click to add hotspots
│                                     │
│                                     │
├─────────────────────────────────────┤
│ [📁] [💾] [📤] [⚙️]              │ ← Toolbar with export
└─────────────────────────────────────┘
```

## 📊 Data Flow Examples

### 1. Hotspot Creation Flow

```
User clicks in panorama
    ↓
Hotspot created in editor store
    ↓
If type = "link"
    ↓
addLinkToPanorama() called
    ↓
Link added to panorama-data.json
    ↓
Hotspot visible in viewer
```

### 2. Link Management Flow

```
User selects link hotspot
    ↓
Target panorama dropdown shown
    ↓
User selects new target
    ↓
removeLinkFromPanorama() (old target)
    ↓
addLinkToPanorama() (new target)
    ↓
Link updated in panorama-data.json
```

### 3. Export Flow

```
User clicks export button
    ↓
syncHotspotsWithLinks() called
    ↓
All hotspots synced with panorama-data.json
    ↓
exportPanoramaDataToFile() called
    ↓
panorama-data-updated.json downloaded
```

## 🎯 Real-world Scenarios

### Scenario 1: Property Virtual Tour

- **Tujuan**: Membuat virtual tour properti dengan navigasi antar ruangan
- **Hotspots**: Link dari lobby ke setiap unit type
- **Workflow**:
  1. Buat hotspot di lobby untuk setiap unit type
  2. Set target panorama ke interior unit
  3. Export data untuk deployment

### Scenario 2: Museum Virtual Tour

- **Tujuan**: Membuat virtual tour museum dengan informasi di setiap artefak
- **Hotspots**: Info hotspots untuk deskripsi artefak
- **Workflow**:
  1. Buat info hotspot di setiap artefak
  2. Tambahkan deskripsi di content field
  3. Export untuk publikasi

### Scenario 3: Real Estate Showcase

- **Tujuan**: Menampilkan properti dengan navigasi antar area
- **Hotspots**: Link hotspots untuk navigasi antar area
- **Workflow**:
  1. Buat link hotspots di setiap area
  2. Set target panorama ke area berikutnya
  3. Test navigasi di viewer
  4. Export final data

## 🚀 Advanced Features

### Batch Operations

```typescript
// Sync semua hotspots dengan panorama links
const allLinks = getLinksFromHotspots(hotspots);
allLinks.forEach(link => {
  addLinkToPanorama(link.sourceId, link.targetId, link.position);
});
```

### Validation

```typescript
// Validasi link sebelum ditambahkan
const isValidLink = (sourceId: string, targetId: string) => {
  return (
    sourceId !== targetId &&
    getPanoramaById(sourceId) &&
    getPanoramaById(targetId)
  );
};
```

### Analytics

```typescript
// Track link usage
const trackLinkUsage = (sourceId: string, targetId: string) => {
  console.log(`Navigation: ${sourceId} → ${targetId}`);
  // Send to analytics service
};
```

## 📝 Best Practices

### 1. Hotspot Placement

- Letakkan hotspot di area yang jelas dan mudah dilihat
- Hindari menempatkan hotspot terlalu dekat dengan tepi panorama
- Gunakan posisi yang konsisten untuk link antar panorama

### 2. Link Management

- Berikan nama yang jelas untuk setiap panorama
- Gunakan target panorama yang logis (misal: dari lobby ke unit)
- Test navigasi setelah membuat link

### 3. Export Strategy

- Export data secara berkala untuk backup
- Test exported data di environment yang berbeda
- Dokumentasikan perubahan yang dibuat

### 4. Performance

- Batasi jumlah hotspot per panorama (max 10-15)
- Gunakan lazy loading untuk panorama besar
- Optimize gambar panorama untuk loading cepat

## 🎉 Kesimpulan

Sistem hotspot editor yang terintegrasi ini memberikan:

✅ **Seamless Integration**: Hotspot editor otomatis mengelola panorama links
✅ **Visual Feedback**: Indikator status link yang jelas
✅ **Drag & Drop**: Repositioning yang intuitif
✅ **Automatic Export**: Export data yang mudah
✅ **Real-time Updates**: Perubahan langsung terlihat di viewer

Dengan sistem ini, pengguna dapat dengan mudah membuat virtual tours yang interaktif dan profesional! 🚀
