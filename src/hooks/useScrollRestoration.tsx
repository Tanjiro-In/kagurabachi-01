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
  const contentReadyRef = useRef(false);

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

  // Enhanced content detection for home page
  const waitForHomeContent = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const checkContent = () => {
        // For home page, wait for content-ready event
        if (scrollKey === '/' && !contentReadyRef.current) {
          return false;
        }
        
        // Check if page has meaningful content
        const hasContent = document.body.scrollHeight > window.innerHeight + 100;
        
        // Check if images are loaded
        const images = document.querySelectorAll('img');
        const imagesLoaded = Array.from(images).every(img => img.complete);
        
        // For home page, also check for specific content sections
        if (scrollKey === '/') {
          const hasSearchResults = document.querySelector('[data-testid="search-results"], .grid .anime-card');
          const hasRecommendations = document.querySelector('[data-testid="recommendations"], .recommendation-section');
          const hasTrending = document.querySelector('[data-testid="trending"], .trending-section');
          
          return hasContent && imagesLoaded && (hasSearchResults || hasRecommendations || hasTrending);
        }
        
        return hasContent && imagesLoaded;
      };
      
      const attemptResolve = () => {
        if (checkContent()) {
          resolve();
        } else {
          setTimeout(attemptResolve, 50);
        }
      };
      
      // Start checking immediately
      attemptResolve();
      
      // Maximum wait time
      setTimeout(() => resolve(), 3000);
    });
  }, [scrollKey]);

  // Restore scroll position
  const restoreScrollPosition = useCallback(async () => {
    if (typeof window === 'undefined' || hasRestoredRef.current || isRestoringRef.current) {
      return;
    }

    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    const savedPosition: ScrollPosition & { timestamp?: number } = scrollPositions[scrollKey];
    
    console.log('Attempting to restore scroll for', scrollKey, savedPosition);
    
    if (savedPosition && (savedPosition.x > 0 || savedPosition.y > 0)) {
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      console.log('Restoring scroll position:', savedPosition);
      
      // Wait for content to be ready
      await waitForHomeContent();
      
      // Multiple restoration attempts for better reliability
      const attemptRestore = (attempt = 1) => {
        requestAnimationFrame(() => {
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: 'auto'
          });
          
          // Verify and retry if needed
          setTimeout(() => {
            const actualY = window.scrollY;
            const targetY = savedPosition.y;
            
            if (Math.abs(actualY - targetY) > 50 && attempt < 3) {
              console.log(`Scroll restoration attempt ${attempt} failed, retrying...`);
              attemptRestore(attempt + 1);
            } else {
              console.log('Scroll restoration completed');
              isRestoringRef.current = false;
            }
          }, 100);
        });
      };
      
      attemptRestore();
    } else {
      console.log('No saved position found for', scrollKey);
    }
  }, [scrollKey, waitForHomeContent]);

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

  // Listen for home content ready event
  useEffect(() => {
    const handleContentReady = () => {
      console.log('Home content ready event received');
      contentReadyRef.current = true;
    };

    if (scrollKey === '/') {
      window.addEventListener('home-content-ready', handleContentReady);
      return () => window.removeEventListener('home-content-ready', handleContentReady);
    }
  }, [scrollKey]);

  // Restore on mount with improved timing
  useEffect(() => {
    // Reset flags when route changes
    hasRestoredRef.current = false;
    isRestoringRef.current = false;
    contentReadyRef.current = false;
    
    // Restore scroll position with appropriate delay
    const timeoutId = setTimeout(() => {
      restoreScrollPosition();
    }, scrollKey === '/' ? 150 : 50);

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
