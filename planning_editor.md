# Cursor Prompt: VR Panorama Editor Comprehensive

## Context
Buat halaman editor baru yang menggantikan EditorDashboard.tsx dengan layout dan fitur yang lebih komprehensif untuk aplikasi VR Panorama menggunakan React + Vite + TypeScript + Tailwind CSS + Supabase.

## Project Structure Context
```
src/
├── components/
│   ├── editor/          # Editor components
│   ├── viewer/          # Viewer components  
│   └── common/          # Shared components
├── hooks/               # Custom hooks
├── services/            # API services
├── store/               # Zustand stores
└── utils/               # Utilities
```

## Required Layout Architecture

### Main Layout (3-Panel Design)
1. **Left Sidebar (300px)**: Panorama List & Navigation Management
2. **Center Workspace**: Editor Canvas (Minimap/Hotspot Editor)
3. **Right Sidebar (350px)**: Properties & Controls Panel

## Detailed Feature Requirements

### 1. LEFT SIDEBAR - Navigation & Panorama Management

#### Components Needed:
- **NavigationGroupManager**: Manage navigation categories/groups
- **PanoramaListView**: Display panoramas grouped by navigation categories
- **AddPanoramaModal**: Upload new panoramas with preview
- **DragDropProvider**: Enable drag & drop from list to workspace

#### Features:
```typescript
interface NavigationGroup {
  id: string;
  title: string;
  subtitle?: string;
  icon: string; // lucide-react icon name
  order: number;
  panoramas: PanoramaData[];
}

interface PanoramaListItem {
  id: string;
  name: string;
  thumbnail: string;
  groupId: string;
  isDraggable: true;
}
```

#### Actions:
- **Add Group**: Create new navigation category
- **Add Panorama**: Upload image to Supabase Storage + create DB record
- **Drag Panorama**: Drag from list to workspace for editing
- **Reorder**: Drag to reorder within groups
- **Edit/Delete**: Context menu for management

### 2. CENTER WORKSPACE - Editor Canvas

#### Two Main Modes:

#### A. **Minimap Editor Mode**
```typescript
interface MinimapEditor {
  backgroundImage: string; // Uploaded denah/floorplan
  nodes: MinimapNode[];
  selectedNode: string | null;
  dragMode: boolean;
}

interface MinimapNode {
  id: string;
  panoramaId: string;
  position: { x: number; y: number }; // percentage-based
  size: number; // dynamic sizing
  label: string;
  isVisible: boolean;
}
```

**Features:**
- Upload custom denah/floorplan images
- Drag & drop panoramas from left sidebar as nodes
- Dynamic node sizing with handles
- Precise position control with coordinates input
- Multiple minimap support (different denah per category)
- Visual connections between related panoramas

#### B. **Hotspot Editor Mode**
```typescript
interface HotspotEditor {
  currentPanoramaId: string;
  panoramaViewer: PhotoSphereViewer; // Photo Sphere Viewer instance
  hotspots: EditorHotspot[];
  selectedHotspot: string | null;
}

interface EditorHotspot {
  id: string;
  position: { yaw: number; pitch: number };
  icon: string; // lucide-react icon
  size: number; // dynamic sizing
  targetPanoramaId: string;
  label: string;
  style: HotspotStyle;
}
```

**Features:**
- Live Photo Sphere Viewer integration for precise hotspot placement
- Drag & drop panoramas as hotspot targets
- Custom icon selection from lucide-react
- Dynamic sizing with visual handles
- Real-time preview of hotspot appearance
- Click-to-place or coordinate input

### 3. RIGHT SIDEBAR - Properties & Controls

#### Tabs Structure:
1. **Properties Tab**: Selected item properties
2. **Minimap Tab**: Minimap-specific controls
3. **Hotspot Tab**: Hotspot-specific controls  
4. **Database Tab**: Supabase management
5. **Settings Tab**: Global settings

#### Properties Panel Features:
```typescript
interface PropertyPanel {
  selectedItem: MinimapNode | EditorHotspot | null;
  itemType: 'minimap' | 'hotspot' | null;
}
```

- **Position Controls**: X/Y coordinates, Yaw/Pitch sliders
- **Size Controls**: Dynamic sizing slider
- **Appearance**: Icon picker, color picker, styling options
- **Target Selection**: Dropdown for target panorama
- **Visibility Toggle**: Show/hide controls
- **Delete/Duplicate**: Item actions

## Technical Implementation Requirements

### 1. Supabase Integration & Performance

#### Database Schema Enhancement:
```sql
-- Enhanced panorama table
ALTER TABLE panoramas ADD COLUMN navigation_group_id UUID REFERENCES navigation_groups(id);
ALTER TABLE panoramas ADD COLUMN order_in_group INTEGER DEFAULT 0;

-- New tables for better relations
CREATE TABLE navigation_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  subtitle VARCHAR,
  icon VARCHAR DEFAULT 'folder',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE minimaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  navigation_group_id UUID REFERENCES navigation_groups(id),
  background_image_url VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE minimap_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minimap_id UUID REFERENCES minimaps(id) ON DELETE CASCADE,
  panorama_id UUID REFERENCES panoramas(id) ON DELETE CASCADE,
  position_x DECIMAL(5,2) NOT NULL,
  position_y DECIMAL(5,2) NOT NULL,
  size INTEGER DEFAULT 24,
  label VARCHAR,
  is_visible BOOLEAN DEFAULT true
);
```

#### Real-time Sync Strategy:
```typescript
// Debounced updates to prevent infinite loops
interface RealtimeManager {
  updateDebounceMs: 500;
  batchUpdates: boolean;
  conflictResolution: 'last-write-wins' | 'merge';
}

// Implementation
const useRealtimeSync = () => {
  const [updateQueue, setUpdateQueue] = useState<Update[]>([]);
  
  const debouncedSync = useMemo(
    () => debounce((updates: Update[]) => {
      // Batch process updates
      processBatchUpdates(updates);
    }, 500),
    []
  );
  
  // Prevent feedback loops
  const isLocalUpdate = useRef(false);
  
  useEffect(() => {
    const channel = supabase
      .channel('editor-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public' 
      }, (payload) => {
        if (!isLocalUpdate.current) {
          handleRemoteUpdate(payload);
        }
      })
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, []);
};
```

### 2. Photo Sphere Viewer Integration

#### Editor Configuration:
```typescript
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const EditorPSVConfig = {
  container: 'hotspot-editor-container',
  plugins: [
    [MarkersPlugin, {
      markers: [],
      gotoMarkerSpeed: '2rpm',
      clickEventOnMarker: true
    }]
  ],
  navbar: false,
  defaultYaw: 0,
  defaultPitch: 0,
  mouseWheelCtrlKey: false,
  mousemove: true,
  click: (e) => {
    // Add hotspot at click position
    addHotspotAtPosition(e.data.rightclickData);
  }
};
```

### 3. Drag & Drop Implementation

#### React DnD Setup:
```typescript
import { DndProvider, useDrag, useDrop } from 'react-dnd';

// Panorama item that can be dragged
const DraggablePanoramaItem = ({ panorama }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'PANORAMA',
    item: { type: 'PANORAMA', panorama },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  return (
    <div ref={drag} className={`${isDragging ? 'opacity-50' : ''}`}>
      {/* Panorama item content */}
    </div>
  );
};

// Editor workspace that accepts drops
const EditorWorkspace = () => {
  const [{ isOver }, drop] = useDrop({
    accept: 'PANORAMA',
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const containerRect = dropRef.current.getBoundingClientRect();
      
      const position = {
        x: ((clientOffset.x - containerRect.left) / containerRect.width) * 100,
        y: ((clientOffset.y - containerRect.top) / containerRect.height) * 100
      };
      
      handlePanoramaDrop(item.panorama, position);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  
  return (
    <div ref={drop} className={`workspace ${isOver ? 'drop-active' : ''}`}>
      {/* Editor content */}
    </div>
  );
};
```

### 4. Performance Optimization

#### Image Loading Strategy:
```typescript
// Progressive loading with placeholders
const useProgressiveImage = (src: string) => {
  const [currentSrc, setCurrentSrc] = useState<string>();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Show low-res placeholder first
    const placeholder = src.replace(/\.(jpg|jpeg|png)$/i, '_thumb.$1');
    setCurrentSrc(placeholder);
    
    // Preload full resolution
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };
    img.src = src;
  }, [src]);
  
  return { currentSrc, loading };
};

// Lazy loading for panorama list
const PanoramaList = () => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });
  
  return (
    <div ref={ref}>
      {inView && <PanoramaItem />}
    </div>
  );
};
```

#### Virtualization for Large Lists:
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedPanoramaList = ({ panoramas }) => (
  <List
    height={400}
    itemCount={panoramas.length}
    itemSize={80}
    itemData={panoramas}
  >
    {PanoramaListItem}
  </List>
);
```

### 5. Mobile Responsive Design

#### Responsive Layout:
```typescript
// Mobile-first approach
const ResponsiveEditor = () => {
  const { isMobile, isTablet } = useResponsive();
  
  if (isMobile) {
    return <MobileEditorLayout />;
  }
  
  if (isTablet) {
    return <TabletEditorLayout />;
  }
  
  return <DesktopEditorLayout />;
};

// Mobile layout with collapsible panels
const MobileEditorLayout = () => (
  <div className="flex flex-col h-screen">
    {/* Top navigation */}
    <MobileNavHeader />
    
    {/* Collapsible sidebar */}
    <CollapsibleSidebar />
    
    {/* Full-screen workspace */}
    <div className="flex-1">
      <EditorWorkspace />
    </div>
    
    {/* Bottom sheet for properties */}
    <BottomSheet>
      <PropertyPanel />
    </BottomSheet>
  </div>
);
```

#### Touch Interactions:
```typescript
// Touch-friendly drag & drop
const useTouchDragDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState(null);
  
  const handleTouchStart = (e, data) => {
    setIsDragging(true);
    setDragData(data);
    // Show visual feedback
  };
  
  const handleTouchEnd = (e) => {
    if (isDragging && dragData) {
      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (element?.dataset.dropZone) {
        handleDrop(dragData, element);
      }
    }
    
    setIsDragging(false);
    setDragData(null);
  };
  
  return { isDragging, handleTouchStart, handleTouchEnd };
};
```

## File Structure to Create:

```
src/components/editor/
├── NewEditor/
│   ├── index.tsx                    # Main editor container
│   ├── LeftSidebar/
│   │   ├── NavigationGroupManager.tsx
│   │   ├── PanoramaList.tsx
│   │   ├── AddPanoramaModal.tsx
│   │   └── DragDropProvider.tsx
│   ├── CenterWorkspace/
│   │   ├── MinimapEditor.tsx
│   │   ├── HotspotEditor.tsx
│   │   ├── WorkspaceToolbar.tsx
│   │   └── EditorCanvas.tsx
│   ├── RightSidebar/
│   │   ├── PropertyPanel.tsx
│   │   ├── MinimapControls.tsx
│   │   ├── HotspotControls.tsx
│   │   └── DatabaseManager.tsx
│   └── Mobile/
│       ├── MobileEditor.tsx
│       ├── BottomSheet.tsx
│       └── CollapsibleSidebar.tsx
```

## Implementation Priorities:

1. **Phase 1**: Basic layout + panorama list + Supabase CRUD
2. **Phase 2**: Minimap editor + drag & drop
3. **Phase 3**: Hotspot editor + Photo Sphere Viewer integration  
4. **Phase 4**: Real-time sync + performance optimization
5. **Phase 5**: Mobile responsive design + touch interactions

## Key Components to Implement:

1. Create `NewEditorPage.tsx` as main container
2. Implement three-panel layout with proper sizing
3. Build NavigationGroupManager for category management
4. Create MinimapEditor with drag & drop nodes
5. Implement HotspotEditor with Photo Sphere Viewer
6. Add real-time Supabase sync with debouncing
7. Optimize performance for image loading
8. Make responsive for mobile devices

Generate the complete implementation following this specification, ensuring all features are functional, performant, and properly integrated with the existing codebase.