// Test utilities for component testing
export const testUtils = {
  // Mock panorama data for testing
  mockPanoramaData: [
    {
      id: 'test-1',
      panorama: '/test-panorama-1.jpg',
      thumbnail: '/test-thumbnail-1.jpg',
      name: 'Test Panorama 1',
      caption: 'Test panorama for testing',
      links: [{ nodeId: 'test-2' }],
      gps: [106.8456, -6.2088] as [number, number],
    },
    {
      id: 'test-2',
      panorama: '/test-panorama-2.jpg',
      thumbnail: '/test-thumbnail-2.jpg',
      name: 'Test Panorama 2',
      caption: 'Test panorama for testing',
      links: [{ nodeId: 'test-1' }],
      gps: [106.8457, -6.2089] as [number, number],
    },
  ],

  // Mock viewer store state
  mockViewerState: {
    currentNodeId: 'test-1',
    minimapVisible: true,
    galleryVisible: false,
    controlsVisible: true,
    isFullscreen: false,
    navigationVisible: true,
  },

  // Mock functions
  mockFunctions: {
    setCurrentNode: jest.fn(),
    toggleMinimap: jest.fn(),
    toggleGallery: jest.fn(),
    toggleControls: jest.fn(),
    toggleFullscreen: jest.fn(),
    toggleNavigation: jest.fn(),
    hideAllOverlays: jest.fn(),
  },

  // Wait for component to update
  waitFor: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock IntersectionObserver
  mockIntersectionObserver: () => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
  },

  // Mock ResizeObserver
  mockResizeObserver: () => {
    const mockResizeObserver = jest.fn();
    mockResizeObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.ResizeObserver = mockResizeObserver;
  },

  // Mock Photo Sphere Viewer
  mockPhotoSphereViewer: () => {
    const mockViewer = {
      destroy: jest.fn(),
      getPlugin: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    const mockVirtualTour = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    mockViewer.getPlugin.mockReturnValue(mockVirtualTour);

    return { mockViewer, mockVirtualTour };
  },
};

// Test data generators
export const testData = {
  // Generate random panorama data
  generatePanoramaData: (count: number = 5) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-${i + 1}`,
      panorama: `/test-panorama-${i + 1}.jpg`,
      thumbnail: `/test-thumbnail-${i + 1}.jpg`,
      name: `Test Panorama ${i + 1}`,
      caption: `Test panorama ${i + 1} for testing`,
      links: [{ nodeId: `test-${(i + 1) % count + 1}` }],
      gps: [106.8456 + i * 0.0001, -6.2088 + i * 0.0001] as [number, number],
    }));
  },

  // Generate random GPS coordinates
  generateGPS: () => [
    106.8456 + Math.random() * 0.01,
    -6.2088 + Math.random() * 0.01,
  ] as [number, number],
};
