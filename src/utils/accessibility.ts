// Accessibility utilities
export const accessibility = {
  // Focus management
  focus: {
    // Trap focus within an element
    trap: (element: HTMLElement) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      });
    },

    // Move focus to first focusable element
    moveToFirst: (container: HTMLElement) => {
      const firstElement = container.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    },

    // Restore focus to previous element
    restore: (previousElement: HTMLElement) => {
      if (previousElement) {
        previousElement.focus();
      }
    },
  },

  // Screen reader utilities
  screenReader: {
    // Announce message to screen readers
    announce: (message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },

    // Announce panorama change
    announcePanoramaChange: (panoramaName: string) => {
      accessibility.screenReader.announce(`Navigated to ${panoramaName}`);
    },

    // Announce feature activation
    announceFeature: (feature: string) => {
      accessibility.screenReader.announce(`${feature} activated`);
    },
  },

  // Keyboard navigation
  keyboard: {
    // Handle arrow key navigation
    handleArrowKeys: (callback: (direction: 'up' | 'down' | 'left' | 'right') => void) => {
      return (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            callback('up');
            break;
          case 'ArrowDown':
            e.preventDefault();
            callback('down');
            break;
          case 'ArrowLeft':
            e.preventDefault();
            callback('left');
            break;
          case 'ArrowRight':
            e.preventDefault();
            callback('right');
            break;
        }
      };
    },

    // Handle number key shortcuts
    handleNumberKeys: (callback: (number: number) => void) => {
      return (e: KeyboardEvent) => {
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 0 && num <= 9) {
          e.preventDefault();
          callback(num);
        }
      };
    },
  },

  // High contrast mode
  highContrast: {
    // Enable high contrast mode
    enable: () => {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('high-contrast', 'true');
      accessibility.screenReader.announce('High contrast mode enabled');
    },

    // Disable high contrast mode
    disable: () => {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('high-contrast', 'false');
      accessibility.screenReader.announce('High contrast mode disabled');
    },

    // Toggle high contrast mode
    toggle: () => {
      const isEnabled = document.documentElement.classList.contains('high-contrast');
      if (isEnabled) {
        accessibility.highContrast.disable();
      } else {
        accessibility.highContrast.enable();
      }
    },

    // Check if high contrast is enabled
    isEnabled: () => {
      return document.documentElement.classList.contains('high-contrast') ||
             localStorage.getItem('high-contrast') === 'true';
    },
  },

  // Reduced motion
  reducedMotion: {
    // Check if user prefers reduced motion
    isPreferred: () => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Apply reduced motion styles
    apply: () => {
      if (accessibility.reducedMotion.isPreferred()) {
        document.documentElement.classList.add('reduced-motion');
      }
    },
  },
};

// Initialize accessibility features
export const initializeAccessibility = () => {
  // Apply reduced motion if preferred
  accessibility.reducedMotion.apply();

  // Restore high contrast preference
  if (accessibility.highContrast.isEnabled()) {
    accessibility.highContrast.enable();
  }

  // Add accessibility event listeners
  document.addEventListener('keydown', (e) => {
    // Ctrl + Alt + H: Toggle high contrast
    if (e.ctrlKey && e.altKey && e.key === 'h') {
      e.preventDefault();
      accessibility.highContrast.toggle();
    }
  });
};
