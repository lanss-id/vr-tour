# VR 360° Panorama Project - Struktur & Planning Detail

## 🎯 Project Overview
Aplikasi VR 360° panorama untuk virtual tour dengan fitur navigasi interaktif, minimap, dan galeri panorama berbasis Photo Sphere Viewer dan React.

## 📋 Tech Stack & Dependencies (Berdasarkan Project Existing)

### Existing Technologies
- **Vite** - build tool & dev server
- **TypeScript** - type safety
- **Photo Sphere Viewer 5.13.4** - panorama 360° viewer
- **Virtual Tour Plugin** - untuk navigasi antar panorama
- **Gallery Plugin** - untuk galeri thumbnail
- **Markers Plugin** - untuk hotspot interaktif

### Additional Libraries untuk React Migration
```json
{
  "dependencies": {
    "@photo-sphere-viewer/core": "5.13.4",
    "@photo-sphere-viewer/virtual-tour-plugin": "5.13.4",
    "@photo-sphere-viewer/gallery-plugin": "5.13.4",
    "@photo-sphere-viewer/markers-plugin": "5.13.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "zustand": "^4.x",
    "react-hook-form": "^7.x",
    "react-dnd": "^16.x",
    "react-dnd-html5-backend": "^16.x",
    "lucide-react": "latest",
    "clsx": "^2.x",
    "tailwindcss": "^3.x",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

## 🗂️ Project Structure (Migration dari Existing)

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx              # Reusable button component
│   │   ├── Modal.tsx               # Modal wrapper
│   │   ├── Loading.tsx             # Loading spinner
│   │   ├── Toast.tsx               # Notification toast
│   │   └── Tooltip.tsx             # Tooltip component
│   ├── viewer/
│   │   ├── PanoramaViewer.tsx      # Main PSV wrapper component
│   │   ├── NavigationMenu.tsx      # Right sidebar navigation (list lokasi)
│   │   ├── ControlBar.tsx          # Bottom control bar
│   │   ├── MiniMap.tsx             # Left bottom minimap/siteplan
│   │   ├── GalleryModal.tsx        # Gallery popup modal
│   │   ├── MarkerHotspot.tsx       # Interactive hotspots
│   │   └── ViewerControls.tsx      # Control buttons wrapper
│   ├── editor/
│   │   ├── EditorLayout.tsx        # Main editor layout
│   │   ├── PanoramaEditor.tsx      # Editor untuk panorama
│   │   ├── MinimapEditor.tsx       # Editor untuk minimap
│   │   ├── GalleryEditor.tsx       # Editor untuk galeri
│   │   ├── MenuEditor.tsx          # Editor untuk menu navigation
│   │   ├── CategoryManager.tsx     # CRUD kategori
│   │   ├── HotspotEditor.tsx       # Editor untuk hotspot
│   │   └── PreviewPanel.tsx        # Preview editor changes
│   └── layout/
│       ├── Header.tsx              # App header
│       ├── Sidebar.tsx             # App sidebar
│       └── Footer.tsx              # App footer
├── pages/
│   ├── ViewerPage.tsx              # Halaman utama viewer
│   ├── EditorPage.tsx              # Halaman editor
│   └── NotFound.tsx                # 404 page
├── hooks/
│   ├── usePanoramaViewer.tsx       # PSV instance management
│   ├── useViewerState.tsx          # Viewer state management
│   ├── useEditor.tsx               # Editor state management
│   └── useKeyboard.tsx             # Keyboard shortcuts
├── store/
│   ├── viewerStore.ts              # Zustand store untuk viewer
│   ├── editorStore.ts              # Zustand store untuk editor
│   └── dataStore.ts                # Zustand store untuk data
├── types/
│   ├── panorama.ts                 # TypeScript interfaces untuk panorama
│   ├── editor.ts                   # TypeScript interfaces untuk editor
│   └── common.ts                   # Common types
├── utils/
│   ├── panoramaLoader.ts           # Utility untuk load panorama
│   ├── imageUtils.ts               # Image processing utilities
│   ├── gpsUtils.ts                 # GPS coordinate utilities
│   └── constants.ts                # App constants
├── data/
│   ├── panorama-data.json          # Data panorama (existing)
│   ├── categories.json             # Data kategori menu
│   └── siteplan.json               # Data minimap/siteplan
└── assets/
    ├── icons/                      # Custom icons
    ├── images/                     # Static images
    └── panoramas/                  # Panorama images (existing)
```

## 🎨 UI Component Structure Berdasarkan Screenshot

### 1. Main Viewer Layout (ViewerPage.tsx)
```tsx
<div className="relative w-full h-screen overflow-hidden">
  {/* Main PSV Container */}
  <PanoramaViewer />

  {/* Top Logo/Branding */}
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
    <BrandingLogo />
  </div>

  {/* Right Navigation Menu */}
  <NavigationMenu
    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
    items={navigationItems}
  />

  {/* Left Bottom Minimap */}
  <MiniMap
    className="absolute left-4 bottom-20 z-10"
    visible={minimapVisible}
    data={sitePlanData}
  />

  {/* Bottom Control Bar */}
  <ControlBar
    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
    onPrev={handlePrevPanorama}
    onNext={handleNextPanorama}
    onGallery={handleOpenGallery}
    onMinimap={handleToggleMinimap}
    onHideControls={handleHideControls}
    onFullscreen={handleFullscreen}
  />

  {/* Gallery Modal */}
  <GalleryModal
    visible={galleryVisible}
    items={galleryItems}
    onClose={handleCloseGallery}
  />
</div>
```

### 2. Navigation Menu Component (NavigationMenu.tsx)
```tsx
// Berdasarkan screenshot - menu kanan dengan list lokasi
interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  nodeId: string;
  category: 'drone' | 'entrance' | 'unit-type';
}

const NavigationMenu = ({ items, onNavigate }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 w-80">
    <div className="space-y-2">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.nodeId)}
          className="flex items-center space-x-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <img src={item.icon} alt="" className="w-8 h-8 rounded" />
          <span className="text-left font-medium">{item.title}</span>
          {item.category === 'unit-type' && <ChevronRight className="ml-auto w-4 h-4" />}
        </button>
      ))}
    </div>
  </div>
);
```

### 3. Control Bar Component (ControlBar.tsx)
```tsx
// Tombol kontrol di bagian bawah tengah
const ControlBar = ({ onPrev, onNext, onGallery, onMinimap, onHideControls, onFullscreen }) => (
  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
    <Button variant="ghost" size="sm" onClick={onPrev}>
      <ChevronLeft className="w-5 h-5" />
    </Button>

    <Button variant="ghost" size="sm" onClick={onGallery}>
      <Grid3X3 className="w-5 h-5" />
    </Button>

    <Button variant="ghost" size="sm" onClick={onMinimap}>
      <Map className="w-5 h-5" />
    </Button>

    <Button variant="ghost" size="sm" onClick={onHideControls}>
      <EyeOff className="w-5 h-5" />
    </Button>

    <Button variant="ghost" size="sm" onClick={onFullscreen}>
      <Maximize className="w-5 h-5" />
    </Button>

    <Button variant="ghost" size="sm" onClick={onNext}>
      <ChevronRight className="w-5 h-5" />
    </Button>
  </div>
);
```

### 4. MiniMap Component (MiniMap.tsx)
```tsx
// Minimap di kiri bawah berdasarkan gambar aerial
const MiniMap = ({ visible, data, currentLocation, onLocationClick }) => {
  if (!visible) return null;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 w-64 h-48">
      <div className="relative w-full h-full">
        <img
          src={data.backgroundImage}
          alt="Site Plan"
          className="w-full h-full object-cover rounded"
        />
        {data.markers.map(marker => (
          <button
            key={marker.id}
            className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
              marker.id === currentLocation
                ? 'bg-red-500 ring-2 ring-red-200'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`
            }}
            onClick={() => onLocationClick(marker.nodeId)}
          />
        ))}
      </div>
    </div>
  );
};
```

### 5. Gallery Modal Component (GalleryModal.tsx)
```tsx
// Modal galeri berdasarkan screenshot gambar ketiga
const GalleryModal = ({ visible, items, onClose, onSelectPanorama }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Galeri Panorama</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSelectPanorama(item.id)}
            >
              <img
                src={item.thumbnail}
                alt={item.name}
                className="w-full aspect-video object-cover rounded-lg"
              />
              <p className="text-sm text-center mt-2">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 🔧 Photo Sphere Viewer Integration

### PanoramaViewer Component
```tsx
// Main PSV wrapper component
import { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const PanoramaViewer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    viewerRef.current = new Viewer({
      container: containerRef.current,
      defaultYaw: '0deg',
      navbar: false, // We'll use custom controls

      plugins: [
        MarkersPlugin,
        GalleryPlugin.withConfig({
          thumbnailSize: { width: 100, height: 100 },
        }),
        VirtualTourPlugin.withConfig({
          positionMode: 'gps',
          renderMode: '3d',
          nodes: panoramaNodes,
          startNodeId: 'kawasan-1',
        }),
      ],
    });

    return () => {
      viewerRef.current?.destroy();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
```

## 📊 State Management dengan Zustand

### Viewer Store
```tsx
// store/viewerStore.ts
interface ViewerState {
  currentNodeId: string;
  minimapVisible: boolean;
  galleryVisible: boolean;
  controlsVisible: boolean;
  isFullscreen: boolean;

  // Actions
  setCurrentNode: (nodeId: string) => void;
  toggleMinimap: () => void;
  toggleGallery: () => void;
  toggleControls: () => void;
  toggleFullscreen: () => void;
}

const useViewerStore = create<ViewerState>((set) => ({
  currentNodeId: 'kawasan-1',
  minimapVisible: true,
  galleryVisible: false,
  controlsVisible: true,
  isFullscreen: false,

  setCurrentNode: (nodeId) => set({ currentNodeId: nodeId }),
  toggleMinimap: () => set((state) => ({ minimapVisible: !state.minimapVisible })),
  toggleGallery: () => set((state) => ({ galleryVisible: !state.galleryVisible })),
  toggleControls: () => set((state) => ({ controlsVisible: !state.controlsVisible })),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
}));
```

### Editor Store
```tsx
// store/editorStore.ts
interface EditorState {
  editMode: 'panorama' | 'minimap' | 'gallery' | 'navigation';
  selectedPanorama: string | null;
  selectedCategory: string | null;
  isDirty: boolean;

  // CRUD operations
  panoramas: PanoramaNode[];
  categories: Category[];

  // Actions
  setEditMode: (mode: EditorState['editMode']) => void;
  addPanorama: (panorama: PanoramaNode) => void;
  updatePanorama: (id: string, updates: Partial<PanoramaNode>) => void;
  deletePanorama: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}
```

## 🎮 Editor Features (Seperti Panoee)

### 1. Panorama Management
- Upload panorama images (360° equirectangular)
- Set GPS coordinates untuk positioning
- Add/edit hotspots dan links
- Preview panorama sebelum publish

### 2. Minimap/Siteplan Editor
- Upload aerial/site plan image
- Drag & drop markers pada minimap
- Set koordinat markers sesuai dengan panorama
- Visual connection lines antar lokasi

### 3. Gallery Management
- Organize panoramas dalam categories
- Set thumbnails untuk setiap panorama
- Drag & drop reordering
- Bulk operations (delete, move category)

### 4. Navigation Menu Editor
- Create/edit categories (Drone View, Main Gate, Unit Types)
- Assign icons untuk setiap menu item
- Set navigation order
- Preview menu layout

## 🚀 Implementation Roadmap

### Phase 1: Basic Migration (1-2 hari)
1. Setup React project dengan Vite
2. Install dependencies
3. Migrate existing PSV setup ke React components
4. Basic routing setup
5. Convert panorama-data.json ke TypeScript interfaces

### Phase 2: UI Components (2-3 hari)
1. Implement NavigationMenu component
2. Create ControlBar component
3. Build MiniMap component
4. Develop GalleryModal component
5. Add responsive design & animations

### Phase 3: Editor Features (3-5 hari)
1. Create editor layout
2. Panorama CRUD operations
3. Minimap editor dengan drag & drop
4. Gallery management
5. Category management
6. Preview functionality

### Phase 4: Advanced Features (2-3 hari)
1. Keyboard shortcuts
2. Auto-save functionality
3. Export/import project data
4. Performance optimizations
5. Mobile responsiveness

### Phase 5: Polish & Deploy (1-2 hari)
1. Bug fixes
2. UI/UX improvements
3. Documentation
4. Deployment setup

## 📁 Data Structure

### Panorama Node Structure
```typescript
interface PanoramaNode {
  id: string;
  panorama: string;           // Image path
  thumbnail: string;          // Thumbnail path
  name: string;               // Display name
  caption: string;            // Description
  category: string;           // Category ID
  links: NodeLink[];          // Navigation links
  markers?: Marker[];         // Interactive hotspots
  gps: [number, number];      // GPS coordinates
  sphereCorrection?: {        // View adjustments
    pan?: string;
    tilt?: string;
    roll?: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
  color: string;
}

interface MinimapData {
  backgroundImage: string;
  markers: MinimapMarker[];
}

interface MinimapMarker {
  id: string;
  nodeId: string;
  x: number;           // Percentage position
  y: number;           // Percentage position
  label: string;
}
```

## 🎯 Key Features Summary

### Viewer Features
- ✅ 360° panorama navigation
- ✅ Interactive hotspots
- ✅ Right sidebar navigation menu
- ✅ Bottom control bar
- ✅ Left minimap dengan location indicators
- ✅ Gallery modal dengan grid view
- ✅ Fullscreen mode
- ✅ Keyboard shortcuts
- ✅ Mobile-friendly controls

### Editor Features
- ✅ Drag & drop panorama upload
- ✅ Visual minimap editor
- ✅ Category management
- ✅ Navigation menu customization
- ✅ Real-time preview
- ✅ Auto-save
- ✅ Export/import project data
- ✅ Batch operations

### Technical Features
- ✅ TypeScript untuk type safety
- ✅ Responsive design
- ✅ Performance optimized
- ✅ SEO friendly
- ✅ Accessible UI components
- ✅ Modern build tools (Vite)
