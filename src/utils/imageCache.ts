// Simple image cache for performance optimization
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<void>>();
  private maxCacheSize = 50; // Maximum number of cached images

  // Preload an image
  async preloadImage(src: string): Promise<void> {
    if (this.cache.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, img);
        this.loadingPromises.delete(src);
        this.cleanupCache();
        resolve();
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  // Get cached image
  getCachedImage(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null;
  }

  // Check if image is cached
  isCached(src: string): boolean {
    return this.cache.has(src);
  }

  // Check if image is loading
  isLoading(src: string): boolean {
    return this.loadingPromises.has(src);
  }

  // Cleanup cache to prevent memory leaks
  private cleanupCache(): void {
    if (this.cache.size > this.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      const toDelete = entries.slice(0, Math.floor(this.maxCacheSize / 2));
      
      toDelete.forEach(([key]) => {
        this.cache.delete(key);
      });
    }
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  // Get cache stats
  getCacheStats(): { cached: number; loading: number } {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size
    };
  }
}

// Create singleton instance
export const imageCache = new ImageCache();

// Helper function to preload multiple images
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => imageCache.preloadImage(url));
  await Promise.allSettled(promises);
};

// Helper function to optimize Supabase URLs
export const optimizeSupabaseUrl = (url: string, width?: number): string => {
  if (!url || !url.includes('supabase.co')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Add optimization parameters
    if (width && !urlObj.searchParams.has('width')) {
      urlObj.searchParams.set('width', width.toString());
    }
    
    // Add quality parameter for better compression
    if (!urlObj.searchParams.has('quality')) {
      urlObj.searchParams.set('quality', '85');
    }
    
    return urlObj.toString();
  } catch {
    return url;
  }
}; 