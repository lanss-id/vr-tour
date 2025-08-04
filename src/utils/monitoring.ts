// Monitoring and logging utilities
export const monitoring = {
  // Log levels
  levels: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  },

  // Current log level
  currentLevel: 2, // INFO

  // Logger
  log: (level: number, message: string, data?: any) => {
    if (level <= monitoring.currentLevel) {
      const timestamp = new Date().toISOString();
      const levelName = Object.keys(monitoring.levels)[level];

      console.log(`[${timestamp}] ${levelName}: ${message}`, data || '');

      // Send to external monitoring service if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'log', {
          event_category: 'Monitoring',
          event_label: levelName,
          value: level,
        });
      }
    }
  },

  // Convenience methods
  error: (message: string, data?: any) => {
    monitoring.log(monitoring.levels.ERROR, message, data);
  },

  warn: (message: string, data?: any) => {
    monitoring.log(monitoring.levels.WARN, message, data);
  },

  info: (message: string, data?: any) => {
    monitoring.log(monitoring.levels.INFO, message, data);
  },

  debug: (message: string, data?: any) => {
    monitoring.log(monitoring.levels.DEBUG, message, data);
  },
};

// Performance monitoring
export const performanceMonitor = {
  // Track function performance
  trackFunction: <T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): T => {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const start = performance.now();
      try {
        const result = fn(...args);
        const end = performance.now();
        monitoring.info(`Function ${name} completed in ${end - start}ms`);
        return result;
      } catch (error) {
        const end = performance.now();
        monitoring.error(`Function ${name} failed after ${end - start}ms`, error);
        throw error;
      }
    }) as T;
  },

  // Track async function performance
  trackAsyncFunction: <T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T
  ): T => {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const start = performance.now();
      try {
        const result = await fn(...args);
        const end = performance.now();
        monitoring.info(`Async function ${name} completed in ${end - start}ms`);
        return result;
      } catch (error) {
        const end = performance.now();
        monitoring.error(`Async function ${name} failed after ${end - start}ms`, error);
        throw error;
      }
    }) as T;
  },

  // Track component render time
  trackComponentRender: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      monitoring.info(`Component ${componentName} rendered in ${end - start}ms`);
    };
  },
};

// Error tracking
export const errorTracker = {
  // Track JavaScript errors
  trackError: (error: Error, context?: string) => {
    monitoring.error(`JavaScript Error${context ? ` in ${context}` : ''}`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  },

  // Track network errors
  trackNetworkError: (url: string, status: number, response?: any) => {
    monitoring.error(`Network Error: ${url}`, {
      status,
      url,
      response,
    });
  },

  // Track resource loading errors
  trackResourceError: (resource: string, type: 'image' | 'script' | 'style') => {
    monitoring.error(`Resource Loading Error`, {
      resource,
      type,
    });
  },

  // Initialize error tracking
  initialize: () => {
    // Track unhandled errors
    window.addEventListener('error', (event) => {
      errorTracker.trackError(event.error, 'Unhandled Error');
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      errorTracker.trackError(new Error(event.reason), 'Unhandled Promise Rejection');
    });
  },
};

// User interaction tracking
export const interactionTracker = {
  // Track user clicks
  trackClick: (element: string, context?: string) => {
    monitoring.info(`User Click`, {
      element,
      context,
      timestamp: Date.now(),
    });
  },

  // Track panorama navigation
  trackPanoramaNavigation: (fromId: string, toId: string) => {
    monitoring.info(`Panorama Navigation`, {
      from: fromId,
      to: toId,
      timestamp: Date.now(),
    });
  },

  // Track feature usage
  trackFeatureUsage: (feature: string) => {
    monitoring.info(`Feature Usage`, {
      feature,
      timestamp: Date.now(),
    });
  },

  // Initialize interaction tracking
  initialize: () => {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const trackData = target.closest('[data-track]')?.getAttribute('data-track');
      if (trackData) {
        interactionTracker.trackClick(trackData);
      }
    });
  },
};

// System health monitoring
export const healthMonitor = {
  // Check memory usage
  checkMemory: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);

      monitoring.info(`Memory Usage`, {
        used: usedMB,
        total: totalMB,
        limit: limitMB,
        percentage: Math.round((usedMB / limitMB) * 100),
      });

      // Warn if memory usage is high
      if (usedMB / limitMB > 0.8) {
        monitoring.warn(`High memory usage: ${usedMB}MB / ${limitMB}MB`);
      }
    }
  },

  // Check network connectivity
  checkConnectivity: () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      monitoring.info(`Network Connection`, {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      });
    }
  },

  // Initialize health monitoring
  initialize: () => {
    // Check memory every 30 seconds
    setInterval(() => {
      healthMonitor.checkMemory();
    }, 30000);

    // Check connectivity every minute
    setInterval(() => {
      healthMonitor.checkConnectivity();
    }, 60000);
  },
};

// Initialize all monitoring
export const initializeMonitoring = () => {
  errorTracker.initialize();
  interactionTracker.initialize();
  healthMonitor.initialize();

  monitoring.info('Monitoring initialized');
};
