# Troubleshooting Guide

## Common Issues and Solutions

### 1. Panorama Stuck in Loading

**Symptoms:**
- Panorama viewer shows "Loading Panorama..." indefinitely
- No error message displayed
- Console shows no errors

**Possible Causes:**
1. **Invalid Node ID** - The default node ID doesn't exist in panorama data
2. **Missing Panorama Images** - Image files don't exist at specified paths
3. **Photo Sphere Viewer Initialization Error** - Plugin configuration issues
4. **Network Issues** - Images failing to load

**Solutions:**

#### Check Node ID
```javascript
// In browser console
console.log('Current node ID:', window.currentNodeId);
console.log('Available nodes:', window.panoramaData);
```

#### Check Image Paths
```javascript
// In browser console
fetch('/panoramas/type_35/vr interior 35 1.png', { method: 'HEAD' })
  .then(response => console.log('Image exists:', response.ok))
  .catch(error => console.error('Image error:', error));
```

#### Verify File Structure
Ensure panorama images exist in the correct paths:
```
public/
└── panoramas/
    ├── type_35/
    │   ├── vr interior 35 1.png
    │   ├── vr interior 35 2.png
    │   └── ...
    ├── type_45/
    └── type_60/
```

### 2. Favicon 404 Error

**Symptoms:**
- Browser console shows: `Failed to load resource: the server responded with a status of 404 (Not Found)`
- Error for `/favicon.ico`

**Solution:**
```bash
# Create favicon file
touch public/favicon.ico
```

### 3. Photo Sphere Viewer Not Loading

**Symptoms:**
- Blank screen
- Console errors related to Photo Sphere Viewer
- "Failed to initialize viewer" error

**Solutions:**

#### Check Dependencies
```bash
npm list @photo-sphere-viewer/core
npm list @photo-sphere-viewer/virtual-tour-plugin
npm list @photo-sphere-viewer/gallery-plugin
npm list @photo-sphere-viewer/markers-plugin
```

#### Verify CSS Imports
Ensure Photo Sphere Viewer CSS is imported correctly:
```css
@import '@photo-sphere-viewer/core/index.css';
@import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
@import '@photo-sphere-viewer/gallery-plugin/index.css';
@import '@photo-sphere-viewer/markers-plugin/index.css';
```

#### Check Container Element
```javascript
// In browser console
const container = document.querySelector('[data-psv-container]');
console.log('Container found:', !!container);
```

### 4. Keyboard Shortcuts Not Working

**Symptoms:**
- Keyboard shortcuts (G, M, N, F, H, ESC) don't respond
- No console errors

**Solutions:**

#### Check Event Listeners
```javascript
// In browser console
document.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key, e.code);
});
```

#### Verify Hook Registration
```javascript
// In browser console
console.log('Keyboard hook active:', window.keyboardHookActive);
```

### 5. Navigation Menu Not Working

**Symptoms:**
- Navigation menu items don't respond to clicks
- No panorama changes when clicking menu items

**Solutions:**

#### Check Event Handlers
```javascript
// In browser console
const menuItems = document.querySelectorAll('[data-navigation-item]');
menuItems.forEach(item => {
  console.log('Menu item:', item.textContent, item.onclick);
});
```

#### Verify State Updates
```javascript
// In browser console
console.log('Current node:', window.currentNodeId);
console.log('Store state:', window.viewerStore);
```

### 6. Performance Issues

**Symptoms:**
- Slow loading
- Laggy interactions
- High memory usage

**Solutions:**

#### Check Bundle Size
```bash
npm run build
# Check the build output for large chunks
```

#### Monitor Memory Usage
```javascript
// In browser console
console.log('Memory usage:', performance.memory);
```

#### Optimize Images
```bash
# Install image optimization tools
npm install -g imagemin-cli
imagemin public/panoramas/**/*.png --out-dir=public/panoramas/optimized
```

### 7. Mobile Issues

**Symptoms:**
- Touch interactions not working
- Layout broken on mobile
- Performance issues on mobile

**Solutions:**

#### Check Touch Events
```javascript
// In browser console
document.addEventListener('touchstart', (e) => {
  console.log('Touch event:', e);
});
```

#### Verify Responsive Design
```css
/* Check if responsive classes are applied */
@media (max-width: 768px) {
  .mobile-hidden { display: none; }
}
```

### 8. Development Server Issues

**Symptoms:**
- `npm run dev` fails
- Hot reload not working
- Port conflicts

**Solutions:**

#### Check Port Availability
```bash
# Kill process on port 3000/3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

#### Clear Cache
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Check Vite Configuration
```javascript
// vite.config.js
export default {
  server: {
    port: 3001,
    host: true
  }
}
```

## Debug Tools

### Browser Console Commands

```javascript
// Check current state
console.log('Current node:', window.currentNodeId);
console.log('Store state:', window.viewerStore);

// Check panorama data
console.log('Panorama data:', window.panoramaData);

// Test image loading
fetch('/panoramas/type_35/vr interior 35 1.png')
  .then(response => console.log('Image status:', response.status))
  .catch(error => console.error('Image error:', error));

// Check Photo Sphere Viewer
console.log('PSV instance:', window.psvInstance);
```

### Network Tab Debugging

1. Open Developer Tools
2. Go to Network tab
3. Reload page
4. Look for failed requests (red entries)
5. Check if panorama images are loading

### Performance Tab Debugging

1. Open Developer Tools
2. Go to Performance tab
3. Start recording
4. Interact with the application
5. Stop recording and analyze

## Common Error Messages

### "Failed to load panorama"
- Check if panorama image exists
- Verify image path in panorama data
- Check network connectivity

### "Panorama node not found"
- Verify node ID exists in panorama data
- Check default node ID in store
- Ensure data structure is correct

### "Viewer initialization error"
- Check Photo Sphere Viewer dependencies
- Verify container element exists
- Check plugin configuration

### "Loading timeout"
- Check internet connection
- Verify image file sizes
- Check server response times

## Prevention Tips

1. **Always validate data** before using it
2. **Use TypeScript** for type safety
3. **Add error boundaries** for React components
4. **Implement proper loading states**
5. **Add comprehensive logging** in development
6. **Test on multiple devices** and browsers
7. **Monitor performance** regularly
8. **Keep dependencies updated**

## Getting Help

If you're still experiencing issues:

1. Check the browser console for errors
2. Look at the Network tab for failed requests
3. Verify all file paths and dependencies
4. Test with a minimal configuration
5. Check the Photo Sphere Viewer documentation
6. Review the implementation summary in `IMPLEMENTATION_SUMMARY.md`
