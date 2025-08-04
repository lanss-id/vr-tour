// Analytics and monitoring utilities
export const analytics = {
  // Track page views
  trackPageView: (page: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: page,
      });
    }
    console.log(`Page view: ${page}`);
  },

  // Track user interactions
  trackEvent: (category: string, action: string, label?: string, value?: number) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
    console.log(`Event: ${category} - ${action}${label ? ` - ${label}` : ''}`);
  },

  // Track panorama navigation
  trackPanoramaNavigation: (fromId: string, toId: string) => {
    analytics.trackEvent('Navigation', 'Panorama Change', `${fromId} -> ${toId}`);
  },

  // Track feature usage
  trackFeatureUsage: (feature: string) => {
    analytics.trackEvent('Feature', 'Usage', feature);
  },

  // Track performance metrics
  trackPerformance: (metric: string, value: number) => {
    analytics.trackEvent('Performance', metric, undefined, value);
  },
};

// User behavior tracking
export const userBehavior = {
  // Track user session
  sessionStart: () => {
    const sessionId = Date.now().toString();
    localStorage.setItem('session_id', sessionId);
    analytics.trackEvent('Session', 'Start', sessionId);
  },

  // Track user preferences
  trackPreference: (key: string, value: string) => {
    localStorage.setItem(`pref_${key}`, value);
    analytics.trackEvent('Preference', 'Set', `${key}: ${value}`);
  },

  // Get user preference
  getPreference: (key: string, defaultValue?: string) => {
    return localStorage.getItem(`pref_${key}`) || defaultValue;
  },

  // Track user engagement
  trackEngagement: (type: 'panorama_view' | 'gallery_open' | 'minimap_use' | 'fullscreen') => {
    analytics.trackEvent('Engagement', type);
  },
};

// Error tracking
export const errorTracking = {
  // Track JavaScript errors
  trackError: (error: Error, context?: string) => {
    analytics.trackEvent('Error', 'JavaScript', `${error.name}: ${error.message}`, 1);
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  },

  // Track network errors
  trackNetworkError: (url: string, status: number) => {
    analytics.trackEvent('Error', 'Network', `${url} - ${status}`, 1);
  },

  // Track resource loading errors
  trackResourceError: (resource: string, type: 'image' | 'script' | 'style') => {
    analytics.trackEvent('Error', 'Resource', `${type}: ${resource}`, 1);
  },
};

// Performance monitoring
export const performanceTracking = {
  // Track page load time
  trackPageLoad: () => {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      analytics.trackPerformance('Page Load', Math.round(loadTime));
    });
  },

  // Track panorama load time
  trackPanoramaLoad: (panoramaId: string, loadTime: number) => {
    analytics.trackPerformance(`Panorama Load: ${panoramaId}`, Math.round(loadTime));
  },

  // Track memory usage
  trackMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      analytics.trackPerformance('Memory Usage', usedMB);
    }
  },
};

// Initialize analytics
export const initializeAnalytics = () => {
  // Start session tracking
  userBehavior.sessionStart();

  // Track page load performance
  performanceTracking.trackPageLoad();

  // Track memory usage periodically
  setInterval(() => {
    performanceTracking.trackMemoryUsage();
  }, 30000); // Every 30 seconds

  // Track user engagement
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-track]')) {
      const trackData = target.closest('[data-track]')?.getAttribute('data-track');
      if (trackData) {
        analytics.trackEvent('Click', trackData);
      }
    }
  });
};
