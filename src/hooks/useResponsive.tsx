import { useState, useEffect } from 'react';
import { UI } from '../utils/constants';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export const useResponsive = () => {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;

            if (width < UI.BREAKPOINTS.MOBILE) {
                setBreakpoint('mobile');
                setIsMobile(true);
                setIsTablet(false);
                setIsDesktop(false);
            } else if (width < UI.BREAKPOINTS.TABLET) {
                setBreakpoint('tablet');
                setIsMobile(false);
                setIsTablet(true);
                setIsDesktop(false);
            } else {
                setBreakpoint('desktop');
                setIsMobile(false);
                setIsTablet(false);
                setIsDesktop(true);
            }
        };

        // Set initial breakpoint
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        breakpoint,
        isMobile,
        isTablet,
        isDesktop,
    };
};
