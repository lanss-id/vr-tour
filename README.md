# 🎮 VR Panorama Editor

**Interactive VR Panorama Editor dengan Hotspot Navigation seperti SaaS Panoee**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-blue.svg)](https://tailwindcss.com/)

## 🎯 Overview

VR Panorama Editor adalah aplikasi interaktif untuk membuat dan mengedit virtual tours dengan fitur-fitur yang mirip dengan SaaS Panoee. Editor ini memungkinkan pengguna untuk mengatur panorama, hotspot, minimap, dan navigasi dengan interface yang intuitif.

### ✨ **Key Features**

- 🎮 **Interactive Hotspot Editor** - Click to add, drag & drop, real-time positioning
- 🔗 **Navigation Links** - Hotspot bisa berfungsi sebagai link antar panorama
- 👁️ **Viewer Integration** - Hotspot langsung terlihat di panorama viewer
- 🎨 **Professional Interface** - Layout yang familiar seperti SaaS Panoee
- 💾 **Auto-save** - Perubahan otomatis tersimpan ke localStorage
- ⌨️ **Keyboard Shortcuts** - Power user features untuk editor tools
- 📱 **Responsive Design** - Works on desktop, tablet, dan mobile
- 🎵 **Background Music** - Autoplay music dengan smart fallback
- 🗂️ **Organized Navigation** - Structured categories dan subcategories

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm atau yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd mpnayx6b--run

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Viewer Mode**: Navigate ke `http://localhost:3001/` untuk melihat virtual tour
2. **Editor Mode**: Navigate ke `http://localhost:3001/editor` untuk mengedit tour
3. **Switch Between**: Gunakan tombol "Editor" di viewer atau "Viewer" di editor

## 🎮 Editor Features

### **Interactive Hotspot Editor** ⭐ **FULLY FUNCTIONAL**

#### **Dynamic Hotspot Creation**

- ✅ **Click to Add**: Klik di panorama untuk menambah hotspot baru
- ✅ **Real-time Positioning**: Hotspot langsung muncul di posisi yang diklik
- ✅ **Visual Feedback**: Hotspot ditampilkan sebagai lingkaran berwarna dengan animasi
- ✅ **Auto-save**: Hotspot otomatis tersimpan ke localStorage

#### **Hotspot Navigation**

- ✅ **Link Type**: Hotspot bisa berfungsi sebagai link antar panorama
- ✅ **Target Selection**: Pilih panorama tujuan dari dropdown
- ✅ **Visual Indicators**: Arrow icon (→) untuk link hotspots
- ✅ **Target Preview**: Tampilkan nama panorama tujuan
- ✅ **Navigation**: Klik hotspot untuk pindah ke panorama lain

#### **Hotspot Management**

- ✅ **Drag & Drop**: Drag hotspot untuk memindahkan posisi secara real-time
- ✅ **Selection State**: Hotspot terpilih ditandai dengan warna merah dan centang
- ✅ **Double-click Delete**: Double-click hotspot untuk menghapus
- ✅ **Properties Panel**: Edit title, content, type, dan style di sidebar
- ✅ **Visibility Toggle**: Show/hide hotspot dengan checkbox

### **Editor Layout**

```
┌─────────────────────────────────────────────────────────────┐
│                    Editor Toolbar                          │
├─────────────┬─────────────────────────────────────────────┤
│             │                                             │
│   Sidebar   │              Workspace                     │
│             │          (Panorama Viewer)                 │
│             │                                             │
│             │                                             │
├─────────────┴─────────────────────────────────────────────┤
│                    Status Bar                             │
└─────────────────────────────────────────────────────────────┘
```

### **Sidebar Panels**

1. **Panoramas**: Daftar panorama dengan actions (duplicate, delete)
2. **Hotspots**: Daftar hotspot dengan add button dan visibility toggle
3. **Categories**: Daftar kategori dengan color coding
4. **Properties**: Form untuk edit item terpilih

### **Hotspot Types**

- **Info**: Hotspot untuk menampilkan informasi (alert/modal)
- **Link**: Hotspot untuk navigasi ke panorama lain (seperti Virtual Tour Plugin)
- **Custom**: Hotspot dengan konten kustom (future enhancement)

## 🎯 Viewer Features

### **Panorama Navigation**

- ✅ 360° panorama navigation dengan Photo Sphere Viewer
- ✅ Interactive hotspots dengan visual markers
- ✅ Navigation links antar panorama
- ✅ Visual indicators untuk link hotspots

### **UI Components**

- ✅ Right sidebar navigation menu dengan kategori terstruktur
- ✅ Bottom control bar dengan keyboard shortcuts
- ✅ Left minimap dengan location indicators
- ✅ Gallery modal dengan grid view
- ✅ Fullscreen mode

### **Organized Navigation Menu**

#### **Struktur Navigasi:**

```
📁 Drone View
   📄 Kawasan - Panorama 1
   📄 Kawasan - Panorama 2
   📄 Kawasan - Panorama 3

🏠 Main Gate
   📄 Main Gate

🏢 Unit Types
   📁 Type 35
      📄 Interior 1
      📄 Interior 2
      📄 Interior 3
      📄 Interior 4
      📄 Interior 5

   📁 Type 45
      📄 Bedroom 1
      📄 Bedroom 2
      📄 Living Room
      📄 Master Bed

   📁 Type 60
      🏠 1st Floor
         📄 Dining Room
         📄 Living Room
      🏠 2nd Floor
         📄 Bedroom 1
         📄 Bedroom 2
         📄 Master Bed
         📄 WIC (Walk In Closet)
```

### **Hotspot Interaction**

- ✅ **Click Navigation**: Klik hotspot link untuk pindah panorama
- ✅ **Info Display**: Klik hotspot info untuk tampilkan konten
- ✅ **Visual Feedback**: Hover effects dan transitions
- ✅ **Target Preview**: Tampilkan nama panorama tujuan di hover

## 🎵 Background Music

### **Music Features**

- ✅ **Autoplay**: Music langsung mulai saat website dibuka
- ✅ **Smart Fallback**: Jika autoplay gagal, music mulai saat user interaction
- ✅ **Loop**: Music berputar terus menerus
- ✅ **Volume Control**: Volume 30% (bisa diatur)
- ✅ **Toggle Control**: Button dan keyboard shortcut 'M'
- ✅ **Single Instance**: Hanya satu audio instance untuk mencegah double

### **Music Controls**

- **Button**: Klik button music di control bar untuk play/pause
- **Keyboard**: Tekan 'M' untuk toggle music
- **Visual Feedback**: Icon berubah sesuai status (play/pause)

## ⌨️ Keyboard Shortcuts

### **Editor Shortcuts**

- `1`: Switch to Panorama tool
- `2`: Switch to Hotspot tool
- `3`: Switch to Minimap tool
- `4`: Switch to Gallery tool
- `5`: Switch to Navigation tool
- `Ctrl+P`: Toggle preview mode
- `Ctrl+S`: Save project
- `Delete/Backspace`: Delete selected item
- `ESC`: Clear selection

### **Viewer Shortcuts**

- `G`: Toggle Gallery
- `M`: Toggle Minimap
- `N`: Toggle Navigation
- `F`: Toggle Fullscreen
- `H/ESC`: Hide All Overlays
- `←/A`: Previous Panorama
- `→/D`: Next Panorama
- `M`: Music Toggle

## 🎨 Screenshots

### **Editor Interface**

![Editor Interface](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Editor+Interface)

### **Hotspot Creation**

![Hotspot Creation](https://via.placeholder.com/800x400/10b981/ffffff?text=Hotspot+Creation)

### **Navigation Links**

![Navigation Links](https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Navigation+Links)

### **Organized Navigation**

![Organized Navigation](https://via.placeholder.com/800x400/f59e0b/ffffff?text=Organized+Navigation)

## 🔧 Technical Stack

### **Frontend**

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool dan development server
- **Tailwind CSS** - Utility-first CSS framework

### **State Management**

- **Zustand** - Lightweight state management
- **Persist Middleware** - Auto-save ke localStorage

### **Panorama Viewer**

- **Photo Sphere Viewer** - 360° panorama viewer
- **Virtual Tour Plugin** - Navigation antar panorama
- **Markers Plugin** - Interactive hotspots
- **Gallery Plugin** - Thumbnail gallery

### **Development Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **React Testing Library** - Component testing

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── Button.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Loading.tsx
│   ├── viewer/           # Viewer components
│   │   ├── PanoramaViewer.tsx
│   │   ├── NavigationMenu.tsx
│   │   ├── ControlBar.tsx
│   │   ├── MiniMap.tsx
│   │   └── GalleryModal.tsx
│   └── editor/           # Editor components
│       ├── EditorLayout.tsx
│       ├── EditorToolbar.tsx
│       ├── EditorSidebar.tsx
│       ├── EditorWorkspace.tsx
│       ├── EditorStatusBar.tsx
│       ├── HotspotEditor.tsx
│       └── MinimapEditor.tsx
├── pages/                # Page components
│   ├── ViewerPage.tsx
│   └── EditorPage.tsx
├── hooks/                # Custom hooks
│   ├── useKeyboard.tsx
│   ├── useResponsive.tsx
│   └── useEditor.tsx
├── store/                # State management
│   ├── viewerStore.ts
│   └── editorStore.ts
├── types/                # TypeScript interfaces
│   ├── panorama.ts
│   └── editor.ts
├── utils/                # Utility functions
│   ├── panoramaLoader.ts
│   ├── constants.ts
│   ├── performance.ts
│   ├── analytics.ts
│   ├── accessibility.ts
│   ├── monitoring.ts
│   └── testUtils.ts
├── data/                 # Static data
│   └── panorama-data.json
└── test/                 # Test setup
    └── setup.ts
```

## 🎯 Usage Examples

### **Creating a Hotspot**

1. **Access Editor**: Navigate ke `/editor`
2. **Select Panorama**: Pilih panorama dari sidebar
3. **Switch to Hotspot Tool**: Tekan '2' atau klik tool button
4. **Click to Add**: Klik di panorama untuk menambah hotspot
5. **Edit Properties**: Pilih hotspot dan edit di sidebar
6. **Set Type**: Pilih "Link" untuk navigasi atau "Info" untuk konten
7. **Set Target**: Untuk link, pilih panorama tujuan
8. **Save Changes**: Perubahan otomatis tersimpan

### **Creating Navigation Links**

1. **Create Link Hotspot**: Buat hotspot dengan type "Link"
2. **Select Target**: Pilih panorama tujuan dari dropdown
3. **Test Navigation**: Klik hotspot di viewer untuk navigasi
4. **Edit Properties**: Ubah target panorama jika perlu

### **Editor-Viewer Integration**

1. **Create in Editor**: Buat hotspot di editor mode
2. **Auto-sync**: Hotspot otomatis tersimpan ke store
3. **View in Viewer**: Hotspot terlihat di panorama viewer
4. **Navigate**: Klik hotspot untuk navigasi antar panorama

### **Using Organized Navigation**

1. **Open Navigation**: Tekan 'N' atau klik navigation button
2. **Browse Categories**: Lihat kategori yang terorganisir
3. **Navigate by Floor**: Untuk Type 60, pilih lantai (1st/2nd Floor)
4. **Quick Access**: Klik langsung ke panorama yang diinginkan

## 📊 Data Structure

### **Hotspot Data**

```typescript
interface Hotspot {
  id: string;
  panoramaId: string;
  position: {
    yaw: number; // Horizontal angle (-180 to 180)
    pitch: number; // Vertical angle (-90 to 90)
  };
  type: 'info' | 'link' | 'custom';
  title: string;
  content?: string;
  targetNodeId?: string; // For link type
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    size?: number;
  };
  isVisible: boolean;
}
```

### **Panorama Node**

```typescript
interface PanoramaNode {
  id: string;
  panorama: string; // Image path
  thumbnail: string; // Thumbnail path
  name: string; // Display name
  caption: string; // Description
  category?: string; // Category ID
  links: NodeLink[]; // Navigation links
  gps: [number, number]; // GPS coordinates
}
```

### **Navigation Structure**

```typescript
interface NavigationCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: NavigationItem[];
  subcategories?: {
    id: string;
    title: string;
    icon: React.ReactNode;
    items: NavigationItem[];
  }[];
}
```

## 🚀 Deployment

### **Development**

```bash
npm run dev
```

### **Production Build**

```bash
npm run build
npm run preview
```

### **Testing**

```bash
npm test
npm run test:coverage
```

## 🔮 Future Enhancements

### **Advanced Hotspots**

- [ ] Custom HTML content
- [ ] Audio hotspots
- [ ] Video hotspots
- [ ] Interactive forms

### **AI Features**

- [ ] Auto-detection of interesting points
- [ ] Smart positioning suggestions
- [ ] Content generation

### **Collaboration**

- [ ] Real-time collaboration
- [ ] Multi-user editing
- [ ] Version control

### **Performance**

- [ ] Lazy loading
- [ ] Virtual scrolling
- [ ] Memory optimization

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Photo Sphere Viewer** - 360° panorama viewer library
- **React** - UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Vite** - Build tool

---

**VR Panorama Editor** - Powerful interactive editor untuk membuat virtual tours yang profesional! 🚀
