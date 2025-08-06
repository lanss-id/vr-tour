import { useState, useEffect, useCallback } from 'react';
import { imageCache } from '../utils/imageCache';

interface PerformanceMetrics {
  totalImages: number;
  cachedImages: number;
  loadingImages: number;
  averageLoadTime: number;
  failedLoads: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalImages: 0,
    cachedImages: 0,
    loadingImages: 0,
    averageLoadTime: 0,
    failedLoads: 0
  });

  const [loadTimes, setLoadTimes] = useState<Map<string, number>>(new Map());
  const [failedLoads, setFailedLoads] = useState<Set<string>>(new Set());

  // Track image load time
  const trackImageLoad = useCallback((src: string, startTime: number) => {
    const loadTime = performance.now() - startTime;
    setLoadTimes(prev => new Map(prev.set(src, loadTime)));
  }, []);

  // Track failed image load
  const trackImageError = useCallback((src: string) => {
    setFailedLoads(prev => new Set(prev.add(src)));
  }, []);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const cacheStats = imageCache.getCacheStats();
      const totalLoadTimes = Array.from(loadTimes.values());
      const averageLoadTime = totalLoadTimes.length > 0 
        ? totalLoadTimes.reduce((sum, time) => sum + time, 0) / totalLoadTimes.length 
        : 0;

      setMetrics({
        totalImages: loadTimes.size + failedLoads.size,
        cachedImages: cacheStats.cached,
        loadingImages: cacheStats.loading,
        averageLoadTime,
        failedLoads: failedLoads.size
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [loadTimes, failedLoads]);

  // Get performance insights
  const getPerformanceInsights = useCallback(() => {
    const insights = [];
    
    if (metrics.averageLoadTime > 2000) {
      insights.push('Image loading is slow. Consider optimizing image sizes or using CDN.');
    }
    
    if (metrics.failedLoads > metrics.totalImages * 0.1) {
      insights.push('High failure rate. Check image URLs and network connectivity.');
    }
    
    if (metrics.cachedImages < metrics.totalImages * 0.5) {
      insights.push('Low cache hit rate. Consider preloading important images.');
    }
    
    return insights;
  }, [metrics]);

  // Preload important images
  const preloadImages = useCallback(async (urls: string[]) => {
    const startTime = performance.now();
    
    try {
      await Promise.allSettled(
        urls.map(async (url) => {
          const imageStartTime = performance.now();
          await imageCache.preloadImage(url);
          trackImageLoad(url, imageStartTime);
        })
      );
      
      console.log(`Preloaded ${urls.length} images in ${performance.now() - startTime}ms`);
    } catch (error) {
      console.error('Error preloading images:', error);
    }
  }, [trackImageLoad]);

  return {
    metrics,
    trackImageLoad,
    trackImageError,
    getPerformanceInsights,
    preloadImages
  };
}; 