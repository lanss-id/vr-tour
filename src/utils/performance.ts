// Performance monitoring utilities
export const performance = {
  // Measure function execution time
  measure: (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
    return end - start;
  },

  // Measure async function execution time
  measureAsync: async (name: string, fn: () => Promise<void>) => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
    return end - start;
  },

  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Check if device is low-end
  isLowEndDevice: (): boolean => {
    const memory = (navigator as any).deviceMemory;
    const cores = (navigator as any).hardwareConcurrency;

    return memory < 4 || cores < 4;
  },

  // Get device performance tier
  getPerformanceTier: (): 'low' | 'medium' | 'high' => {
    const memory = (navigator as any).deviceMemory || 8;
    const cores = (navigator as any).hardwareConcurrency || 8;

    if (memory < 4 || cores < 4) return 'low';
    if (memory < 8 || cores < 8) return 'medium';
    return 'high';
  },
};

// Memory usage monitoring
export const memoryMonitor = {
  getMemoryInfo: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576),
      };
    }
    return null;
  },

  logMemoryUsage: () => {
    const info = memoryMonitor.getMemoryInfo();
    if (info) {
      console.log(`Memory: ${info.used}MB / ${info.total}MB (${info.limit}MB limit)`);
    }
  },
};

// Image loading optimization
export const imageOptimizer = {
  // Preload image
  preload: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  },

  // Preload multiple images
  preloadMultiple: async (srcs: string[]): Promise<void> => {
    await Promise.all(srcs.map(src => imageOptimizer.preload(src)));
  },

  // Check if image is cached
  isCached: (src: string): boolean => {
    const img = new Image();
    img.src = src;
    return img.complete;
  },
};
