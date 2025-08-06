import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { imageCache } from '../../utils/imageCache';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = '/placeholder-thumbnail.jpg',
  onLoad,
  onError,
  priority = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Optimize image URL for better performance
  const getOptimizedUrl = (url: string) => {
    if (!url || url === placeholder) return url;
    
    // If it's a Supabase URL, we can add optimization parameters
    if (url.includes('supabase.co')) {
      // Add width parameter for thumbnails to reduce bandwidth
      const urlObj = new URL(url);
      if (!urlObj.searchParams.has('width')) {
        urlObj.searchParams.set('width', '300'); // Optimize for typical thumbnail size
      }
      return urlObj.toString();
    }
    
    return url;
  };

  const optimizedSrc = getOptimizedUrl(src);
  const displaySrc = isInView ? optimizedSrc : placeholder;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  // Image loading handlers
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Preload image when it comes into view
  useEffect(() => {
    if (isInView && optimizedSrc && !imageCache.isCached(optimizedSrc)) {
      imageCache.preloadImage(optimizedSrc);
    }
  }, [isInView, optimizedSrc]);

  return (
    <div className={`relative ${className}`}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1" />
            <div className="text-xs text-gray-500">Failed to load</div>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={displaySrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
};

export default OptimizedImage; 