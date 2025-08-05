# VR Panorama Editor - Fitur Lengkap

## 🎯 **Overview**

VR Panorama Editor adalah aplikasi web interaktif untuk membuat dan mengedit tur panorama 360° dengan fitur-fitur canggih seperti hotspot interaktif, minimap, galeri, dan navigation menu yang dapat dikustomisasi.

## 🛠️ **Fitur Editor**

### **1. Panorama Editor**

- **Upload Panorama**: Upload file panorama 360° (JPG, PNG)
- **Edit Properties**: Nama, caption, GPS coordinates
- **Duplicate**: Salin panorama dengan pengaturan yang sama
- **Delete**: Hapus panorama dan hotspot terkait
- **Preview**: Lihat panorama dalam viewer

### **2. Hotspot Editor (FULLY FUNCTIONAL)**

- **Dynamic Hotspot Creation**:
  - Click untuk menambah hotspot baru
  - Drag & drop untuk memindahkan posisi
  - Double-click untuk menghapus
  - **Viewer Integration**: Hotspot otomatis tersimpan dan terlihat di viewer
  - **Navigation Links**: Hotspot bisa berfungsi sebagai shortcut navigasi

- **Hotspot Management**:
  - **Visibility Toggle**: Sembunyikan/tampilkan hotspot
  - **Type-based Icons**: Icon berbeda untuk setiap tipe hotspot
  - **Properties Panel**: Edit title, content, type, position
  - **Style Customization**: Background color, border color, size

- **Hotspot Types & Navigation**:
  - **Info**: Menampilkan konten saat diklik
  - **Link**: Navigasi ke panorama lain
  - **Custom**: Untuk penggunaan lanjutan
  - **Link Hotspot Features**:
    - Target selection dari dropdown
    - Visual indicator (→ arrow)
    - Target preview di tooltip
    - Navigasi otomatis saat diklik
    - Exclude current panorama dari target

- **Workflow Editor**:
  1. Switch ke "Hotspot" tool (2)
  2. Click di panorama untuk menambah hotspot
  3. Set Type (Info/Link/Custom)
  4. Set Target (untuk Link type)
  5. Edit properties di sidebar
  6. Hotspot otomatis tersimpan

- **Hotspot Navigation Workflow**:
  1. Buat hotspot dengan type "Link"
  2. Pilih target panorama dari dropdown
  3. Hotspot akan menampilkan arrow (→)
  4. Click hotspot di viewer untuk navigasi
  5. Tooltip menampilkan nama target panorama

### **3. Minimap Editor**

- **Upload Background**: Upload gambar site plan
- **Add Markers**: Click untuk menambah marker
- **Drag Markers**: Pindahkan marker dengan drag & drop
- **Edit Properties**: Label, position, linked panorama
- **Visual Feedback**: Marker selected state

### **4. Gallery Editor**

- **Thumbnail Management**: Upload dan edit thumbnail
- **Layout Settings**: Grid, list, masonry
- **Gallery Properties**: Title, description, order

### **5. Navigation Editor (NEW!)**

- **Custom Navigation Structure**:
  - Buat kategori dan sub-kategori
  - Tambah item dengan thumbnail
  - Set panorama target untuk setiap item
  - **Card Layout**: Tampilan seperti referensi gambar

- **Navigation Categories**:
  - **Add Category**: Title, subtitle, icon
  - **Add Items**: Title, subtitle, thumbnail, panorama target
  - **Reorder Items**: Drag & drop untuk mengatur urutan
  - **Upload Thumbnails**: Upload gambar untuk setiap item

- **Layout Settings**:
  - **Layout Type**: Cards (seperti referensi), Grid, List
  - **Theme**: Light, Dark, Auto
  - **Show Thumbnails**: Toggle thumbnail display
  - **Show Subtitles**: Toggle subtitle display
  - **Max Items Per Row**: Atur jumlah item per baris

- **Navigation Menu Features**:
  - **Card-based Layout**: Tampilan card yang modern
  - **Thumbnail Support**: Gambar untuk setiap item
  - **Category Navigation**: Klik kategori untuk lihat items
  - **Direct Navigation**: Klik item untuk langsung ke panorama
  - **Responsive Design**: Bekerja di desktop dan mobile

### **6. File Operations**

- **Save Project**: Simpan ke localStorage
- **Export Project**: Download sebagai JSON
- **Import Project**: Upload file JSON
- **Auto-save**: Otomatis tersimpan saat ada perubahan

## 🎮 **Keyboard Shortcuts**

### **Editor Tools**

- `1`: Panorama Editor
- `2`: Hotspot Editor
- `3`: Minimap Editor
- `4`: Gallery Editor
- `5`: Navigation Editor

### **General**

- `Ctrl+P`: Toggle Preview Mode
- `Ctrl+S`: Save Project
- `Escape`: Clear Selection
- `Delete/Backspace`: Delete selected item

### **Hotspot Editor**

- Click: Add hotspot
- Drag: Move hotspot
- Double-click: Delete hotspot

## 🎨 **UI/UX Features**

### **Editor Layout**

- **Left Sidebar**: Tools dan properties panels
- **Top Toolbar**: File operations dan actions
- **Main Workspace**: Panorama viewer dengan overlay
- **Bottom Status Bar**: Project info dan shortcuts

### **Preview Mode**

- **Toggle**: Switch antara editor dan preview
- **Fullscreen**: Immersive viewing experience
- **Navigation**: Semua kontrol viewer tersedia

### **Responsive Design**

- **Desktop**: Full editor interface
- **Mobile**: Optimized touch interface
- **Tablet**: Hybrid layout

## 🔧 **Technical Features**

### **State Management**

- **Zustand**: Lightweight state management
- **Persist**: Auto-save ke localStorage
- **DevTools**: Debug dengan Redux DevTools

### **Photo Sphere Viewer Integration**

- **Virtual Tour Plugin**: Navigasi antar panorama
- **Markers Plugin**: Hotspot management
- **Gallery Plugin**: Thumbnail gallery
- **Custom Controls**: Custom control bar

### **Performance**

- **Lazy Loading**: Load panorama on demand
- **Image Optimization**: Compressed thumbnails
- **Memory Management**: Proper cleanup

## 📱 **Viewer Features**

### **Navigation Menu (Updated)**

- **Custom Layout**: Menggunakan data dari editor
- **Card Design**: Layout seperti referensi gambar
- **Category Navigation**: Klik kategori untuk lihat items
- **Thumbnail Display**: Gambar untuk setiap item
- **Direct Navigation**: Klik item untuk langsung ke panorama

### **Control Bar**

- **Navigation**: Previous/Next panorama
- **Music Control**: Play/pause background music
- **Gallery**: Toggle thumbnail gallery
- **Minimap**: Toggle site plan
- **Fullscreen**: Toggle fullscreen mode

### **Hotspot Integration**

- **Visible Hotspots**: Hotspot dari editor terlihat di viewer
- **Interactive Navigation**: Click hotspot untuk navigasi
- **Visual Feedback**: Hover effects dan animations
- **Type Indicators**: Icon berbeda untuk setiap tipe

## 🚀 **Getting Started**

### **1. Setup Project**

```bash
npm install
npm run dev
```

### **2. Editor Workflow**

1. **Upload Panoramas**: Upload file panorama 360°
2. **Add Hotspots**: Switch ke hotspot tool, click untuk menambah
3. **Configure Navigation**: Buat kategori dan item di navigation editor
4. **Test Navigation**: Preview mode untuk test navigasi
5. **Export Project**: Download untuk deployment

### **3. Navigation Editor Workflow**

1. **Switch to Navigation Tool**: Tekan `5` atau klik Navigation tool
2. **Add Categories**: Klik "Add Category" untuk buat kategori baru
3. **Add Items**: Klik "+" di kategori untuk tambah item
4. **Upload Thumbnails**: Upload gambar untuk setiap item
5. **Set Panorama Target**: Pilih panorama yang akan dituju
6. **Configure Layout**: Atur layout, theme, dan display options
7. **Test in Viewer**: Lihat hasil di viewer mode

## 🎯 **Unique Features**

### **Navigation Menu Customization**

- **Fully Editable**: Semua kategori dan item bisa diedit
- **Card Layout**: Modern card design seperti referensi
- **Thumbnail Support**: Upload gambar untuk setiap item
- **Category Hierarchy**: Kategori dan sub-kategori
- **Direct Navigation**: Klik item untuk langsung ke panorama
- **Responsive Design**: Bekerja di semua device

### **Hotspot Navigation**

- **Link Hotspots**: Navigasi antar panorama
- **Visual Indicators**: Arrow untuk link hotspots
- **Target Preview**: Tooltip menampilkan target panorama
- **Automatic Navigation**: Click untuk langsung pindah

### **Editor Integration**

- **Real-time Preview**: Lihat perubahan langsung di viewer
- **Auto-save**: Semua perubahan otomatis tersimpan
- **Export/Import**: Backup dan restore project
- **Keyboard Shortcuts**: Navigasi cepat dengan keyboard

## 📊 **Project Structure**

```
src/
├── components/
│   ├── editor/
│   │   ├── NavigationEditor.tsx    # Navigation menu editor
│   │   ├── EditorLayout.tsx        # Main editor layout
│   │   ├── EditorSidebar.tsx       # Left sidebar
│   │   ├── EditorToolbar.tsx       # Top toolbar
│   │   ├── EditorWorkspace.tsx     # Main workspace
│   │   └── EditorStatusBar.tsx     # Bottom status bar
│   └── viewer/
│       ├── NavigationMenu.tsx      # Custom navigation menu
│       ├── PanoramaViewer.tsx      # PSV viewer
│       └── ControlBar.tsx          # Custom controls
├── store/
│   └── editorStore.ts              # Zustand store
├── types/
│   └── editor.ts                   # TypeScript types
└── hooks/
    └── useEditor.tsx               # Editor logic
```

## 🎉 **Summary**

VR Panorama Editor sekarang memiliki fitur lengkap untuk membuat tur panorama 360° yang interaktif dengan:

- **Navigation Links**: Hotspot berfungsi sebagai shortcut navigasi
- **Viewer Integration**: Hotspot otomatis tersimpan dan terlihat di viewer
- **Visibility Toggle**: Kontrol visibility hotspot
- **Type-based Icons**: Icon berbeda untuk setiap tipe hotspot
- **Custom Navigation Menu**: Layout card yang modern dan dapat dikustomisasi
- **Thumbnail Support**: Upload gambar untuk navigation items
- **Category Management**: Buat dan atur kategori navigation
- **Direct Navigation**: Klik item untuk langsung ke panorama

Editor ini memberikan kontrol penuh atas struktur navigasi dan hotspot, memungkinkan pembuatan tur panorama yang sangat interaktif dan user-friendly.
