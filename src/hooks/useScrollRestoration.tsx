
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
}

const SCROLL_RESTORATION_KEY = 'scroll-positions';

export const useScrollRestoration = (key?: string) => {
  const location = useLocation();
  const scrollKey = key || location.pathname;
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Save scroll position
  const saveScrollPosition = useCallback(() => {
    if (typeof window === 'undefined' || isRestoringRef.current) return;
    
    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    scrollPositions[scrollKey] = {
      x: window.scrollX,
      y: window.scrollY
    };
    
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
  }, [scrollKey]);

  // Restore scroll position with proper timing
  const restoreScrollPosition = useCallback(() => {
    if (typeof window === 'undefined' || hasRestoredRef.current) return;

    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    const savedPosition: ScrollPosition = scrollPositions[scrollKey];
    
    if (savedPosition && (savedPosition.x > 0 || savedPosition.y > 0)) {
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      // Wait for content to load, then restore
      const attemptRestore = (attempts = 0) => {
        if (attempts > 50) { // Max 5 seconds
          isRestoringRef.current = false;
          return;
        }

        // Check if page has sufficient content
        const hasContent = document.body.scrollHeight > window.innerHeight;
        
        if (hasContent) {
          requestAnimationFrame(() => {
            window.scrollTo(savedPosition.x, savedPosition.y);
            
            // Verify scroll worked, if not try again
            setTimeout(() => {
              const currentY = window.scrollY;
              const targetY = savedPosition.y;
              
              if (Math.abs(currentY - targetY) > 10 && attempts < 20) {
                attemptRestore(attempts + 1);
              } else {
                isRestoringRef.current = false;
              }
            }, 50);
          });
        } else {
          // Content not ready, try again
          setTimeout(() => attemptRestore(attempts + 1), 100);
        }
      };

      attemptRestore();
    }
  }, [scrollKey]);

  // Save scroll position on scroll events
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (isRestoringRef.current) return;
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveScrollPosition, 150);
    };

    const handleBeforeUnload = () => {
      clearTimeout(timeoutId);
      saveScrollPosition();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveScrollPosition();
    };
  }, [saveScrollPosition]);

  // Restore scroll position when component mounts
  useEffect(() => {
    // Reset restoration flag when route changes
    hasRestoredRef.current = false;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Restore with multiple timing strategies
    const restoreWithDelay = () => {
      // Try immediate restore
      restoreScrollPosition();
      
      // Try after short delay for dynamic content
      timeoutRef.current = setTimeout(() => {
        restoreScrollPosition();
      }, 100);
      
      // Try after longer delay for slower loading content
      setTimeout(() => {
        restoreScrollPosition();
      }, 500);
    };

    // Use different timing based on navigation type
    if (document.readyState === 'complete') {
      restoreWithDelay();
    } else {
      const handleLoad = () => {
        restoreWithDelay();
        window.removeEventListener('load', handleLoad);
      };
      window.addEventListener('load', handleLoad);
      
      // Also try after DOM is ready
      if (document.readyState === 'interactive') {
        setTimeout(restoreWithDelay, 50);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scrollKey, restoreScrollPosition]);

  const clearScrollPosition = useCallback((keyToClear?: string) => {
    if (typeof window === 'undefined') return;
    
    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    delete scrollPositions[keyToClear || scrollKey];
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
    
    // Reset restoration flags
    hasRestoredRef.current = false;
    isRestoringRef.current = false;
  }, [scrollKey]);

  return { clearScrollPosition };
};
