
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
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
    console.log('Saved scroll position for', scrollKey, scrollPositions[scrollKey]);
  }, [scrollKey]);

  // Enhanced auto-scroll fallback for home page
  const performAutoScroll = useCallback(() => {
    if (scrollKey !== '/') return;

    const returnContext = sessionStorage.getItem('return-context');
    if (!returnContext) return;

    try {
      const context = JSON.parse(returnContext);
      if (!context.fromDetailPage || Date.now() - context.timestamp > 10000) {
        // Clear old context
        sessionStorage.removeItem('return-context');
        return;
      }

      console.log('Performing auto-scroll for', context.type);

      // Find the appropriate section to scroll to
      let targetElement: Element | null = null;
      
      if (context.type === 'anime') {
        // Look for anime sections in order of preference
        targetElement = 
          document.querySelector('[data-section="anime-recommendations"]') ||
          document.querySelector('[data-section="anime-search"]') ||
          document.querySelector('[data-section="trending-anime"]') ||
          document.querySelector('h2:contains("Recommended Anime")') ||
          document.querySelector('h2:contains("Trending Anime")');
      } else if (context.type === 'manga') {
        // Look for manga sections
        targetElement = 
          document.querySelector('[data-section="manga-recommendations"]') ||
          document.querySelector('[data-section="manga-search"]') ||
          document.querySelector('[data-section="trending-manga"]') ||
          document.querySelector('h2:contains("Recommended Manga")') ||
          document.querySelector('h2:contains("Trending Manga")');
      }

      if (targetElement) {
        console.log('Auto-scrolling to', context.type, 'section');
        
        // Smooth scroll to the section with a small offset
        const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;
        const offset = 100; // 100px offset from top
        
        window.scrollTo({
          top: Math.max(0, elementTop - offset),
          behavior: 'smooth'
        });

        // Clear the context after successful scroll
        setTimeout(() => {
          sessionStorage.removeItem('return-context');
        }, 2000);
      } else {
        console.log('Target section not found for auto-scroll');
      }
    } catch (error) {
      console.error('Error in auto-scroll:', error);
      sessionStorage.removeItem('return-context');
    }
  }, [scrollKey]);

  // Restore scroll position
  const restoreScrollPosition = useCallback(async () => {
    if (typeof window === 'undefined' || hasRestoredRef.current || isRestoringRef.current) {
      return;
    }

    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    const savedPosition: ScrollPosition = scrollPositions[scrollKey];
    
    console.log('Attempting to restore scroll for', scrollKey, savedPosition);
    
    if (savedPosition && (savedPosition.x > 0 || savedPosition.y > 0)) {
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      console.log('Restoring scroll position:', savedPosition);
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Try to restore scroll
      window.scrollTo({
        left: savedPosition.x,
        top: savedPosition.y,
        behavior: 'auto'
      });
      
      // Verify restoration worked
      setTimeout(() => {
        const actualY = window.scrollY;
        const targetY = savedPosition.y;
        
        if (Math.abs(actualY - targetY) > 100) {
          console.log('Native scroll restoration failed, trying auto-scroll fallback');
          performAutoScroll();
        } else {
          console.log('Scroll restoration successful');
        }
        
        isRestoringRef.current = false;
      }, 300);
    } else {
      console.log('No saved position found for', scrollKey, '- trying auto-scroll');
      // If no saved position, try auto-scroll fallback
      setTimeout(performAutoScroll, 500);
    }
  }, [scrollKey, performAutoScroll]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringRef.current) return;
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
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
    hasRestoredRef.current = false;
    isRestoringRef.current = false;
    
    const timeoutId = setTimeout(() => {
      restoreScrollPosition();
    }, 100);

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
