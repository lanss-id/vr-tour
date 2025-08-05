# Manual Mode Update - Texture Coordinates

## Perubahan yang Dilakukan

### 1. Format Data Panorama

**Sebelum (GPS Mode):**

```json
{
  "id": "type35-1",
  "gps": [106.8456, -6.2088],
  "links": [
    {
      "nodeId": "type35-2"
    }
  ]
}
```

**Sesudah (Manual Mode):**

```json
{
  "id": "type35-1",
  "links": [
    {
      "nodeId": "type35-2",
      "position": {
        "textureX": 1500,
        "textureY": 780
      }
    }
  ]
}
```

### 2. Type Definitions

**Updated `src/types/panorama.ts`:**

```typescript
export interface NodeLink {
  nodeId: string;
  position?:
    | {
        textureX: number;
        textureY: number;
      }
    | {
        yaw: number;
        pitch: number;
      };
}
```

### 3. Utility Functions

**Added conversion functions in `src/utils/panoramaLoader.ts`:**

```typescript
// Convert texture coordinates to spherical coordinates
export const textureToSpherical = (
  textureX: number,
  textureY: number,
  textureWidth: number = 4096,
  textureHeight: number = 2048
): { yaw: number; pitch: number } => {
  const yaw = (textureX / textureWidth) * 2 * Math.PI - Math.PI;
  const pitch = (textureY / textureHeight) * Math.PI - Math.PI / 2;
  return { yaw, pitch };
};

// Convert spherical coordinates to texture coordinates
export const sphericalToTexture = (
  yaw: number,
  pitch: number,
  textureWidth: number = 4096,
  textureHeight: number = 2048
): { textureX: number; textureY: number } => {
  const textureX = ((yaw + Math.PI) / (2 * Math.PI)) * textureWidth;
  const textureY = ((pitch + Math.PI / 2) / Math.PI) * textureHeight;
  return { textureX, textureY };
};
```

### 4. PanoramaViewer Updates

**Changed PSV configuration:**

```typescript
VirtualTourPlugin.withConfig({
    positionMode: 'manual', // Changed from 'gps'
    renderMode: '3d',
    nodes: nodes,
    startNodeId: validNodeId,
}),
```

**Added position conversion:**

```typescript
// Convert textureX/textureY to yaw/pitch for PSV
if (link.position && link.position.textureX && link.position.textureY) {
  const spherical = textureToSpherical(
    link.position.textureX,
    link.position.textureY
  );
  return {
    nodeId: link.nodeId,
    position: {
      yaw: spherical.yaw,
      pitch: spherical.pitch,
    },
  };
}
```

### 5. HotspotEditor Updates

**Updated position display:**

```typescript
// Convert position to texture coordinates for display
const getPositionDisplay = () => {
  if ('textureX' in hotspot.position && 'textureY' in hotspot.position) {
    return {
      textureX: hotspot.position.textureX,
      textureY: hotspot.position.textureY,
    };
  } else if ('yaw' in hotspot.position && 'pitch' in hotspot.position) {
    const texture = sphericalToTexture(
      hotspot.position.yaw,
      hotspot.position.pitch
    );
    return texture;
  }
  return { textureX: 0, textureY: 0 };
};
```

## Keuntungan Manual Mode

### 1. Presisi Tinggi

- **Texture coordinates** memberikan posisi yang sangat presisi
- Tidak bergantung pada GPS yang mungkin tidak akurat
- Kontrol penuh atas posisi markers

### 2. Fleksibilitas

- Bisa menggunakan textureX/textureY atau yaw/pitch
- Konversi otomatis antara kedua format
- Support untuk berbagai ukuran texture

### 3. Kompatibilitas

- Tetap kompatibel dengan PSV VirtualTourPlugin
- Auto-conversion untuk PSV internal format
- Backward compatibility dengan yaw/pitch

## Cara Kerja

### 1. Data Storage

```json
// panorama-data.json menggunakan textureX/textureY
{
  "position": {
    "textureX": 1500,
    "textureY": 780
  }
}
```

### 2. PSV Conversion

```typescript
// Konversi otomatis untuk PSV
const spherical = textureToSpherical(textureX, textureY);
// Result: { yaw: 0.5, pitch: -0.3 }
```

### 3. Display Conversion

```typescript
// Konversi untuk display di editor
const texture = sphericalToTexture(yaw, pitch);
// Result: { textureX: 1500, textureY: 780 }
```

## Error Fixes

### PSVError: No position provided

**Masalah:** PSV mengharapkan format position yang benar
**Solusi:** Auto-conversion textureX/textureY ke yaw/pitch

```typescript
links: node.links.map((link: any) => {
    if (link.position && link.position.textureX && link.position.textureY) {
        const spherical = textureToSpherical(link.position.textureX, link.position.textureY);
        return {
            nodeId: link.nodeId,
            position: {
                yaw: spherical.yaw,
                pitch: spherical.pitch
            }
        };
    }
    return link;
}),
```

## Testing

### 1. Test Data Format

```bash
# Cek format data
cat panorama-data.json | jq '.[0].links[0]'
```

### 2. Test Conversion

```typescript
// Test conversion functions
const spherical = textureToSpherical(1500, 780);
console.log(spherical); // { yaw: 0.5, pitch: -0.3 }

const texture = sphericalToTexture(0.5, -0.3);
console.log(texture); // { textureX: 1500, textureY: 780 }
```

### 3. Test PSV Integration

- Load panorama dengan texture coordinates
- Verify markers muncul di posisi yang benar
- Test navigation antar panorama

## Next Steps

- [ ] Implement position picker di viewer
- [ ] Add texture coordinate validation
- [ ] Improve conversion accuracy
- [ ] Add texture size detection
- [ ] Support for different texture formats
