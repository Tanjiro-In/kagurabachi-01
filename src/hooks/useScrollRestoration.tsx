
import { useEffect, useRef } from 'react';
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

  // Save scroll position before leaving
  useEffect(() => {
    const saveScrollPosition = () => {
      if (typeof window === 'undefined') return;
      
      const scrollPositions = JSON.parse(
        sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
      );
      
      scrollPositions[scrollKey] = {
        x: window.scrollX,
        y: window.scrollY
      };
      
      sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
    };

    // Save on scroll (debounced)
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      if (isRestoringRef.current) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveScrollPosition, 100);
    };

    // Save before navigation
    const handleBeforeUnload = saveScrollPosition;

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveScrollPosition(); // Save on unmount
    };
  }, [scrollKey]);

  // Restore scroll position when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const restoreScrollPosition = () => {
      const scrollPositions = JSON.parse(
        sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
      );
      
      const savedPosition: ScrollPosition = scrollPositions[scrollKey];
      
      if (savedPosition) {
        isRestoringRef.current = true;
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(savedPosition.x, savedPosition.y);
          
          // Reset the flag after a short delay
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 100);
        });
      }
    };

    // Small delay to ensure content is loaded
    const timeoutId = setTimeout(restoreScrollPosition, 50);

    return () => clearTimeout(timeoutId);
  }, [scrollKey]);

  const clearScrollPosition = (keyToClear?: string) => {
    if (typeof window === 'undefined') return;
    
    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    delete scrollPositions[keyToClear || scrollKey];
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
  };

  return { clearScrollPosition };
};
