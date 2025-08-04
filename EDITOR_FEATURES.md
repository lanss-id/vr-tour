# VR Panorama Editor - Fitur Lengkap

## 🎯 Overview

Editor interaktif untuk VR Panorama Tour dengan fitur-fitur yang mirip dengan SaaS Panoee, memungkinkan pengguna untuk mengedit panorama, hotspot, minimap, dan navigasi secara visual.

## 🚀 Fitur Utama

### 1. **Editor Layout**

- **Sidebar Kiri**: Panel untuk panorama, hotspot, kategori, dan properti
- **Toolbar Atas**: Tools dan file operations
- **Workspace Tengah**: Area editing panorama dengan viewer interaktif
- **Status Bar Bawah**: Informasi project dan shortcuts

### 2. **Panorama Management**

- ✅ Upload panorama images (360° equirectangular)
- ✅ Edit properti panorama (nama, caption, GPS coordinates)
- ✅ Duplicate panorama
- ✅ Delete panorama
- ✅ Preview panorama sebelum publish

### 3. **Hotspot Editor (Interaktif)**

- ✅ **Click to Add**: Klik di panorama untuk menambah hotspot baru
- ✅ **Drag & Drop**: Drag hotspot untuk memindahkan posisi
- ✅ **Visual Editor**: Hotspot ditampilkan sebagai marker di panorama
- ✅ **Real-time Editing**: Perubahan langsung terlihat di viewer
- ✅ **Properties Panel**: Edit title, content, type, dan style
- ✅ **Visibility Toggle**: Show/hide hotspot
- ✅ **Duplicate Hotspot**: Copy hotspot dengan properti yang sama

### 4. **Minimap Editor (Drag & Drop)**

- ✅ **Upload Background**: Upload gambar site plan/aerial
- ✅ **Click to Add Marker**: Klik di minimap untuk menambah marker
- ✅ **Drag Markers**: Drag marker untuk reposisi
- ✅ **Marker Properties**: Edit label, posisi, dan link panorama
- ✅ **Visual Connection**: Marker terhubung dengan panorama
- ✅ **Delete Markers**: Hapus marker yang tidak diperlukan

### 5. **Category Management**

- ✅ **CRUD Categories**: Create, Read, Update, Delete kategori
- ✅ **Color Coding**: Set warna untuk setiap kategori
- ✅ **Icon Assignment**: Assign icon untuk setiap kategori
- ✅ **Order Management**: Atur urutan kategori

### 6. **File Operations**

- ✅ **Save Project**: Auto-save ke localStorage
- ✅ **Export Project**: Export ke JSON file
- ✅ **Import Project**: Import dari JSON file
- ✅ **Upload Assets**: Upload panorama dan minimap images

### 7. **Keyboard Shortcuts**

- ✅ **1-5**: Switch tools (Panorama, Hotspot, Minimap, Gallery, Navigation)
- ✅ **Ctrl+P**: Toggle preview mode
- ✅ **Ctrl+S**: Save project
- ✅ **Delete/Backspace**: Delete selected item
- ✅ **ESC**: Clear selection

## 🎨 UI Components

### Editor Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Editor Toolbar                          │
├─────────────┬─────────────────────────────────────────────┤
│             │                                             │
│   Sidebar   │              Workspace                     │
│             │                                             │
│  - Panorama │          Panorama Viewer                   │
│  - Hotspot  │          + Editor Overlays                 │
│  - Minimap  │                                             │
│  - Category │                                             │
│  - Props    │                                             │
│             │                                             │
└─────────────┴─────────────────────────────────────────────┤
│                    Status Bar                             │
└─────────────────────────────────────────────────────────────┘
```

### Hotspot Editor Features

- **Visual Markers**: Hotspot ditampilkan sebagai lingkaran berwarna
- **Selection State**: Hotspot terpilih ditandai dengan warna merah
- **Drag Handle**: Drag hotspot untuk reposisi
- **Properties Panel**: Edit hotspot properties secara real-time
- **Style Customization**: Custom background dan border color

### Minimap Editor Features

- **Background Upload**: Upload gambar site plan
- **Marker Management**: Add, move, delete markers
- **Position Control**: Precise positioning dengan input numerik
- **Visual Feedback**: Marker terpilih ditandai dengan ring merah
- **Connection Lines**: Visual connection antar marker

## 🔧 Technical Implementation

### State Management

```typescript
// Editor Store (Zustand)
interface EditorState {
  editMode: 'panorama' | 'minimap' | 'gallery' | 'navigation' | 'hotspot';
  selectedPanorama: string | null;
  selectedHotspot: string | null;
  isDirty: boolean;
  isPreviewMode: boolean;

  // CRUD operations
  panoramas: PanoramaNode[];
  hotspots: Hotspot[];
  minimapData: MinimapData;

  // Actions
  addHotspot: (hotspot: Hotspot) => void;
  updateHotspot: (id: string, updates: Partial<Hotspot>) => void;
  moveHotspot: (id: string, position: { yaw: number; pitch: number }) => void;
  // ... more actions
}
```

### Hotspot Interaction

```typescript
// Drag & Drop Implementation
const handleMouseDown = (e: React.MouseEvent) => {
  if (editMode !== 'hotspot' || !selectedHotspot) return;

  const target = e.target as HTMLElement;
  if (target.closest('.hotspot-marker')) {
    setIsDraggingHotspot(true);
    setDragStartPosition({ x: e.clientX, y: e.clientY });
  }
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDraggingHotspot || !viewerRef.current || !selectedHotspot) return;

  // Convert screen coordinates to spherical coordinates
  const viewer = viewerRef.current;
  const position = viewer.getPosition();
  const newYaw = position.yaw + deltaX * 0.5;
  const newPitch = Math.max(-90, Math.min(90, position.pitch - deltaY * 0.5));

  updateHotspotPosition(selectedHotspot, { yaw: newYaw, pitch: newPitch });
};
```

### Minimap Drag & Drop

```typescript
// Minimap Marker Dragging
const handleMarkerMouseDown = (event: React.MouseEvent, markerId: string) => {
  event.stopPropagation();
  setIsDragging(true);
  setDraggedMarker(markerId);

  const rect = minimapRef.current?.getBoundingClientRect();
  if (rect) {
    const marker = minimapData.markers.find(m => m.id === markerId);
    if (marker) {
      const markerX = (marker.x / 100) * rect.width;
      const markerY = (marker.y / 100) * rect.height;
      setDragOffset({
        x: event.clientX - markerX,
        y: event.clientY - markerY,
      });
    }
  }
};
```

## 🎮 User Experience

### Workflow Editor

1. **Upload Panorama**: Upload gambar 360° panorama
2. **Set Properties**: Edit nama, caption, dan GPS coordinates
3. **Add Hotspots**: Klik di panorama untuk menambah hotspot
4. **Edit Hotspots**: Drag untuk reposisi, edit properti di sidebar
5. **Configure Minimap**: Upload site plan dan posisikan markers
6. **Organize Categories**: Buat dan atur kategori navigasi
7. **Preview & Test**: Toggle preview mode untuk testing
8. **Save & Export**: Save project dan export untuk deployment

### Keyboard Shortcuts

| Shortcut | Action                    |
| -------- | ------------------------- |
| `1`      | Switch to Panorama tool   |
| `2`      | Switch to Hotspot tool    |
| `3`      | Switch to Minimap tool    |
| `4`      | Switch to Gallery tool    |
| `5`      | Switch to Navigation tool |
| `Ctrl+P` | Toggle preview mode       |
| `Ctrl+S` | Save project              |
| `Delete` | Delete selected item      |
| `ESC`    | Clear selection           |

### Mouse Interactions

- **Left Click**: Select item, add hotspot, add marker
- **Drag**: Move hotspot, move minimap marker
- **Right Click**: Context menu (future feature)
- **Scroll**: Zoom in/out panorama

## 📊 Data Structure

### Hotspot Data

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
  targetNodeId?: string;
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    size?: number;
  };
  isVisible: boolean;
}
```

### Minimap Data

```typescript
interface MinimapData {
  backgroundImage: string;
  markers: MinimapMarker[];
}

interface MinimapMarker {
  id: string;
  nodeId: string; // Linked panorama ID
  x: number; // Percentage position (0-100)
  y: number; // Percentage position (0-100)
  label: string;
}
```

## 🚀 Deployment & Export

### Project Export

```typescript
interface ProjectData {
  panoramas: PanoramaNode[];
  categories: Category[];
  hotspots: Hotspot[];
  minimapData: MinimapData;
  metadata: {
    name: string;
    version: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

### Auto-Save

- Project data disimpan otomatis ke localStorage
- Indikator "Unsaved changes" di status bar
- Manual save dengan Ctrl+S
- Export ke JSON file untuk backup

## 🔮 Future Enhancements

### Planned Features

- [ ] **Undo/Redo**: History management untuk semua actions
- [ ] **Bulk Operations**: Select multiple items untuk batch edit
- [ ] **Templates**: Pre-built templates untuk common use cases
- [ ] **Collaboration**: Real-time collaboration (future)
- [ ] **Advanced Hotspots**: Custom HTML content, animations
- [ ] **Audio Support**: Background music, audio hotspots
- [ ] **Mobile Editor**: Touch-friendly editor interface
- [ ] **Performance Optimization**: Lazy loading, virtual scrolling

### Advanced Features

- [ ] **AI Hotspot Detection**: Auto-detect potential hotspot locations
- [ ] **Smart Positioning**: Auto-align hotspots based on content
- [ ] **Analytics Integration**: Track user interactions in editor
- [ ] **Version Control**: Git-like versioning untuk projects
- [ ] **Plugin System**: Extensible editor dengan custom plugins

## 📝 Usage Examples

### Creating a New Hotspot

1. Select panorama di sidebar
2. Switch ke "Hotspot" tool (shortcut: `2`)
3. Klik di panorama untuk menambah hotspot
4. Edit properti di sidebar (title, content, type)
5. Drag hotspot untuk reposisi yang tepat
6. Save project (Ctrl+S)

### Editing Minimap

1. Switch ke "Minimap" tool (shortcut: `3`)
2. Upload background image (site plan)
3. Klik di minimap untuk menambah marker
4. Drag marker ke posisi yang tepat
5. Edit marker properties (label, linked panorama)
6. Test navigasi di preview mode

### Organizing Categories

1. Switch ke "Navigation" tool (shortcut: `5`)
2. Create new categories dengan warna dan icon
3. Assign panoramas ke kategori
4. Set urutan kategori
5. Preview navigation menu

## 🎯 Performance Considerations

### Optimization Strategies

- **Lazy Loading**: Load panorama images on demand
- **Virtual Scrolling**: Handle large lists efficiently
- **Debounced Updates**: Prevent excessive re-renders
- **Memory Management**: Cleanup resources properly
- **Caching**: Cache frequently accessed data

### Best Practices

- **Batch Updates**: Group multiple state updates
- **Memoization**: Use React.memo untuk expensive components
- **Event Delegation**: Handle events efficiently
- **Resource Cleanup**: Proper cleanup di useEffect
- **Error Boundaries**: Graceful error handling

---

**Editor ini memberikan pengalaman yang mirip dengan SaaS Panoee dengan fitur-fitur interaktif yang memungkinkan pengguna untuk mengedit panorama, hotspot, dan minimap secara visual dan intuitif.**
