
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
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Save scroll position with debouncing
  const saveScrollPosition = useCallback(() => {
    if (typeof window === 'undefined' || isRestoringRef.current) return;
    
    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    scrollPositions[scrollKey] = {
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
  }, [scrollKey]);

  // Wait for content to be ready
  const waitForContent = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const checkContent = () => {
        // Check if page has content beyond the header
        const hasContent = document.body.scrollHeight > window.innerHeight + 100;
        
        // Also check if images are loaded
        const images = document.querySelectorAll('img');
        const imagesLoaded = Array.from(images).every(img => img.complete);
        
        if (hasContent && imagesLoaded) {
          resolve();
        } else {
          // Wait a bit more
          setTimeout(checkContent, 100);
        }
      };
      
      // Start checking immediately
      checkContent();
      
      // But also set a maximum wait time
      setTimeout(() => resolve(), 2000);
    });
  }, []);

  // Restore scroll position
  const restoreScrollPosition = useCallback(async () => {
    if (typeof window === 'undefined' || hasRestoredRef.current || isRestoringRef.current) {
      return;
    }

    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    const savedPosition: ScrollPosition & { timestamp?: number } = scrollPositions[scrollKey];
    
    if (savedPosition && (savedPosition.x > 0 || savedPosition.y > 0)) {
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      console.log('Restoring scroll position:', savedPosition);
      
      // Wait for content to be ready
      await waitForContent();
      
      // Use requestAnimationFrame for smoother restoration
      requestAnimationFrame(() => {
        window.scrollTo({
          left: savedPosition.x,
          top: savedPosition.y,
          behavior: 'auto' // Instant scroll, no animation
        });
        
        // Verify restoration worked
        setTimeout(() => {
          const actualY = window.scrollY;
          const targetY = savedPosition.y;
          
          if (Math.abs(actualY - targetY) > 50) {
            console.log('Scroll restoration verification failed, retrying...');
            window.scrollTo(savedPosition.x, savedPosition.y);
          }
          
          isRestoringRef.current = false;
        }, 100);
      });
    }
  }, [scrollKey, waitForContent]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringRef.current) return;
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Debounce save
      saveTimeoutRef.current = setTimeout(saveScrollPosition, 100);
    };

    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveScrollPosition();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveScrollPosition();
    };
  }, [saveScrollPosition]);

  // Restore on mount
  useEffect(() => {
    // Reset flags when route changes
    hasRestoredRef.current = false;
    isRestoringRef.current = false;
    
    // Restore scroll position after a short delay
    const timeoutId = setTimeout(() => {
      restoreScrollPosition();
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [scrollKey, restoreScrollPosition]);

  const clearScrollPosition = useCallback((keyToClear?: string) => {
    if (typeof window === 'undefined') return;
    
    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    delete scrollPositions[keyToClear || scrollKey];
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
    
    hasRestoredRef.current = false;
    isRestoringRef.current = false;
  }, [scrollKey]);

  return { clearScrollPosition };
};
