
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
    
    const position = {
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    };
    
    scrollPositions[scrollKey] = position;
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
    
    console.log(`Saved scroll position for ${scrollKey}:`, position);
  }, [scrollKey]);

  // Simplified content ready check
  const isContentReady = useCallback((): boolean => {
    // Check if page has meaningful content
    const hasContent = document.body.scrollHeight > window.innerHeight;
    const hasElements = document.querySelectorAll('[data-scroll-content]').length > 0 || 
                       document.querySelectorAll('.grid').length > 0 ||
                       document.body.children.length > 2;
    
    return hasContent && hasElements;
  }, []);

  // Restore scroll position with immediate and fallback attempts
  const restoreScrollPosition = useCallback(() => {
    if (typeof window === 'undefined' || hasRestoredRef.current) {
      return;
    }

    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    const savedPosition: ScrollPosition & { timestamp?: number } = scrollPositions[scrollKey];
    
    console.log(`Attempting to restore scroll for ${scrollKey}:`, savedPosition);
    
    if (!savedPosition || (savedPosition.x === 0 && savedPosition.y === 0)) {
      console.log(`No saved position found for ${scrollKey}`);
      return;
    }

    isRestoringRef.current = true;
    hasRestoredRef.current = true;

    const performRestore = () => {
      console.log(`Restoring scroll to:`, savedPosition);
      
      // Use scrollTo with immediate behavior
      window.scrollTo({
        left: savedPosition.x,
        top: savedPosition.y,
        behavior: 'auto'
      });

      // Verify restoration after a short delay
      setTimeout(() => {
        const actualY = window.scrollY;
        const targetY = savedPosition.y;
        const tolerance = 100;
        
        if (Math.abs(actualY - targetY) > tolerance) {
          console.log(`Scroll restoration verification failed. Target: ${targetY}, Actual: ${actualY}. Retrying...`);
          window.scrollTo(savedPosition.x, savedPosition.y);
        } else {
          console.log(`Scroll restoration successful. Position: ${actualY}`);
        }
        
        isRestoringRef.current = false;
      }, 100);
    };

    // Try immediate restoration
    if (isContentReady()) {
      console.log('Content ready, restoring immediately');
      requestAnimationFrame(performRestore);
    } else {
      console.log('Content not ready, waiting...');
      // Fallback with timeout
      const checkAndRestore = () => {
        if (isContentReady()) {
          console.log('Content ready after wait, restoring');
          requestAnimationFrame(performRestore);
        } else {
          console.log('Content still not ready, forcing restoration');
          requestAnimationFrame(performRestore);
        }
      };
      
      setTimeout(checkAndRestore, 200);
    }
  }, [scrollKey, isContentReady]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringRef.current) return;
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Debounce save
      saveTimeoutRef.current = setTimeout(saveScrollPosition, 150);
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

  // Restore on mount with improved timing
  useEffect(() => {
    console.log(`Scroll restoration hook mounted for key: ${scrollKey}`);
    
    // Reset flags when route changes
    hasRestoredRef.current = false;
    isRestoringRef.current = false;
    
    // Attempt restoration with minimal delay
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
    
    const targetKey = keyToClear || scrollKey;
    delete scrollPositions[targetKey];
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
    
    console.log(`Cleared scroll position for ${targetKey}`);
    
    hasRestoredRef.current = false;
    isRestoringRef.current = false;
  }, [scrollKey]);

  return { clearScrollPosition };
};
