import { useDataManager } from './dataManager';

export interface CachedImage {
    url: string;
    data: string; // base64
    timestamp: number;
    size: number;
    lastAccessed: number;
    accessCount: number;
}

export interface CacheStats {
    totalSize: number;
    totalImages: number;
    oldestImage: string | null;
    mostAccessed: string | null;
    averageSize: number;
}

class ImageCacheManager {
    private cache = new Map<string, CachedImage>();
    private maxSize: number;
    private maxAge: number;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(maxSize: number = 50 * 1024 * 1024, maxAge: number = 24 * 60 * 60 * 1000) {
        this.maxSize = maxSize;
        this.maxAge = maxAge;
        this.startCleanupInterval();
    }

    // Add image to cache
    set(url: string, data: string): void {
        const size = new Blob([data]).size;
        const now = Date.now();

        // Check if adding this image would exceed cache size
        if (this.getTotalSize() + size > this.maxSize) {
            this.evictOldest();
        }

        const cachedImage: CachedImage = {
            url,
            data,
            timestamp: now,
            size,
            lastAccessed: now,
            accessCount: 1
        };

        this.cache.set(url, cachedImage);
        console.log(`Image cached: ${url} (${this.formatSize(size)})`);
    }

    // Get image from cache
    get(url: string): CachedImage | null {
        const cached = this.cache.get(url);

        if (!cached) return null;

        const now = Date.now();

        // Check if cache is expired
        if (now - cached.timestamp > this.maxAge) {
            this.cache.delete(url);
            console.log(`Cached image expired: ${url}`);
            return null;
        }

        // Update access statistics
        cached.lastAccessed = now;
        cached.accessCount++;

        return cached;
    }

    // Check if image is cached
    has(url: string): boolean {
        return this.get(url) !== null;
    }

    // Remove specific image from cache
    delete(url: string): boolean {
        return this.cache.delete(url);
    }

    // Clear all cache
    clear(): void {
        this.cache.clear();
        console.log('Image cache cleared');
    }

    // Get cache statistics
    getStats(): CacheStats {
        const images = Array.from(this.cache.values());
        const totalSize = images.reduce((sum, img) => sum + img.size, 0);
        const totalImages = images.length;
        const averageSize = totalImages > 0 ? totalSize / totalImages : 0;

        const oldestImage = images.length > 0
            ? images.reduce((oldest, current) =>
                current.timestamp < oldest.timestamp ? current : oldest
            ).url
            : null;

        const mostAccessed = images.length > 0
            ? images.reduce((most, current) =>
                current.accessCount > most.accessCount ? current : most
            ).url
            : null;

        return {
            totalSize,
            totalImages,
            oldestImage,
            mostAccessed,
            averageSize
        };
    }

    // Get total cache size
    getTotalSize(): number {
        return Array.from(this.cache.values()).reduce((sum, img) => sum + img.size, 0);
    }

    // Evict oldest images to make space
    private evictOldest(): void {
        const images = Array.from(this.cache.entries());

        // Sort by last accessed time (oldest first)
        images.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

        let freedSpace = 0;
        const targetSpace = this.maxSize * 0.2; // Free 20% of max size

        for (const [url, image] of images) {
            if (freedSpace >= targetSpace) break;

            this.cache.delete(url);
            freedSpace += image.size;
            console.log(`Evicted image from cache: ${url}`);
        }

        console.log(`Freed ${this.formatSize(freedSpace)} from cache`);
    }

    // Cleanup expired images
    cleanup(): void {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [url, image] of this.cache.entries()) {
            if (now - image.timestamp > this.maxAge) {
                this.cache.delete(url);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} expired images from cache`);
        }
    }

    // Start automatic cleanup interval
    private startCleanupInterval(): void {
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60 * 60 * 1000); // Cleanup every hour
    }

    // Stop cleanup interval
    stopCleanupInterval(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    // Format size for display
    private formatSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Preload images for better performance
    async preloadImages(urls: string[]): Promise<void> {
        console.log(`Preloading ${urls.length} images...`);

        const promises = urls.map(async (url) => {
            try {
                if (!this.has(url)) {
                    await this.loadImage(url);
                }
            } catch (error) {
                console.warn(`Failed to preload image: ${url}`, error);
            }
        });

        await Promise.allSettled(promises);
        console.log('Image preloading completed');
    }

    // Load image with cache
    async loadImage(url: string): Promise<string> {
        // Check cache first
        const cached = this.get(url);
        if (cached) {
            console.log(`Image loaded from cache: ${url}`);
            return cached.data;
        }

        // Load from network
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const reader = new FileReader();

            return new Promise((resolve, reject) => {
                reader.onload = () => {
                    const data = reader.result as string;
                    this.set(url, data);
                    resolve(data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error loading image:', url, error);
            throw error;
        }
    }

    // Load image with progress callback
    async loadImageWithProgress(url: string, onProgress?: (progress: number) => void): Promise<string> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;

            if (total && onProgress) {
                const reader = response.body?.getReader();
                if (!reader) throw new Error('No response body');

                const chunks: Uint8Array[] = [];
                let receivedLength = 0;

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    chunks.push(value);
                    receivedLength += value.length;

                    if (onProgress) {
                        onProgress(receivedLength / total);
                    }
                }

                const blob = new Blob(chunks);
                const data = await this.blobToBase64(blob);
                this.set(url, data);
                return data;
            } else {
                // Fallback to simple loading
                return await this.loadImage(url);
            }
        } catch (error) {
            console.error('Error loading image with progress:', url, error);
            throw error;
        }
    }

    // Convert blob to base64
    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Get cache info for debugging
    getDebugInfo(): any {
        const stats = this.getStats();
        return {
            ...stats,
            maxSize: this.maxSize,
            maxAge: this.maxAge,
            formattedTotalSize: this.formatSize(stats.totalSize),
            formattedAverageSize: this.formatSize(stats.averageSize),
            cacheEntries: Array.from(this.cache.entries()).map(([url, img]) => ({
                url,
                size: img.size,
                age: Date.now() - img.timestamp,
                accessCount: img.accessCount,
                lastAccessed: img.lastAccessed
            }))
        };
    }
}

// Create global instance
export const imageCache = new ImageCacheManager();

// React hook for image cache
export const useImageCache = () => {
    const loadImage = async (url: string): Promise<string> => {
        return await imageCache.loadImage(url);
    };

    const loadImageWithProgress = async (url: string, onProgress?: (progress: number) => void): Promise<string> => {
        return await imageCache.loadImageWithProgress(url, onProgress);
    };

    const preloadImages = async (urls: string[]): Promise<void> => {
        return await imageCache.preloadImages(urls);
    };

    const getStats = (): CacheStats => {
        return imageCache.getStats();
    };

    const clearCache = (): void => {
        imageCache.clear();
    };

    return {
        loadImage,
        loadImageWithProgress,
        preloadImages,
        getStats,
        clearCache
    };
};

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
    imageCache.stopCleanupInterval();
});

// Export for use in components
export { imageCache as default };
