
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface SearchContext {
  type: 'anime' | 'manga';
  query: string;
  timestamp: number;
}

const SCROLL_RESTORATION_KEY = 'scroll-positions';
const SEARCH_CONTEXT_KEY = 'search-context';

export const useScrollRestoration = (key?: string) => {
  const location = useLocation();
  const scrollKey = key || location.pathname;
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Store search context
  const storeSearchContext = useCallback((type: 'anime' | 'manga', query: string) => {
    if (typeof window === 'undefined') return;
    
    const searchContext: SearchContext = {
      type,
      query,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(searchContext));
    console.log('Stored search context:', searchContext);
  }, []);

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

  // Enhanced auto-scroll for navigation contexts only (when no exact position exists)
  const performAutoScroll = useCallback(() => {
    if (scrollKey !== '/') return;

    // Check for search context first
    const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
    const returnContext = sessionStorage.getItem('return-context');
    
    let contextToUse = null;
    let isSearchContext = false;

    // Prioritize search context if it's more recent
    if (searchContext) {
      try {
        const searchCtx = JSON.parse(searchContext);
        if (Date.now() - searchCtx.timestamp < 30000) { // 30 seconds validity
          contextToUse = searchCtx;
          isSearchContext = true;
        }
      } catch (error) {
        console.error('Error parsing search context:', error);
        sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
      }
    }

    // Fall back to return context if no valid search context
    if (!contextToUse && returnContext) {
      try {
        const returnCtx = JSON.parse(returnContext);
        if (returnCtx.fromDetailPage && Date.now() - returnCtx.timestamp < 10000) {
          contextToUse = returnCtx;
          isSearchContext = false;
        }
      } catch (error) {
        console.error('Error parsing return context:', error);
        sessionStorage.removeItem('return-context');
      }
    }

    if (!contextToUse) return;

    console.log('Performing auto-scroll for', contextToUse.type, isSearchContext ? '(search context)' : '(detail page context)');

    // Find the appropriate section to scroll to
    let targetElement: Element | null = null;
    
    if (contextToUse.type === 'anime') {
      // For search context, prioritize search results
      if (isSearchContext) {
        targetElement = 
          document.querySelector('[data-section="anime-search"]') ||
          document.querySelector('[data-section="anime-recommendations"]') ||
          document.querySelector('[data-section="trending-anime"]');
      } else {
        // For detail page returns, prioritize recommendations/trending
        targetElement = 
          document.querySelector('[data-section="anime-recommendations"]') ||
          document.querySelector('[data-section="anime-search"]') ||
          document.querySelector('[data-section="trending-anime"]');
      }
    } else if (contextToUse.type === 'manga') {
      // For search context, prioritize search results
      if (isSearchContext) {
        targetElement = 
          document.querySelector('[data-section="manga-search"]') ||
          document.querySelector('[data-section="manga-recommendations"]') ||
          document.querySelector('[data-section="trending-manga"]');
      } else {
        // For detail page returns, prioritize recommendations/trending
        targetElement = 
          document.querySelector('[data-section="manga-recommendations"]') ||
          document.querySelector('[data-section="manga-search"]') ||
          document.querySelector('[data-section="trending-manga"]');
      }
    }

    if (targetElement) {
      console.log('Auto-scrolling to', contextToUse.type, 'section');
      
      // Smooth scroll to the section with a small offset
      const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;
      const offset = 100; // 100px offset from top
      
      window.scrollTo({
        top: Math.max(0, elementTop - offset),
        behavior: 'smooth'
      });

      // Clear the appropriate context after successful scroll
      setTimeout(() => {
        if (isSearchContext) {
          sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
        } else {
          sessionStorage.removeItem('return-context');
        }
      }, 2000);
    } else {
      console.log('Target section not found for auto-scroll');
    }
  }, [scrollKey]);

  // Detect browser back navigation
  useEffect(() => {
    if (scrollKey !== '/') return;

    const handlePopState = (event: PopStateEvent) => {
      console.log('Browser back navigation detected');
      
      // Small delay to ensure content is rendered, then check for saved position first
      setTimeout(() => {
        const scrollPositions = JSON.parse(
          sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
        );
        const savedPosition: ScrollPosition = scrollPositions[scrollKey];
        
        if (!savedPosition || (savedPosition.x === 0 && savedPosition.y === 0)) {
          // Only use auto-scroll if no exact position is saved
          performAutoScroll();
        }
      }, 300);
    };

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [scrollKey, performAutoScroll]);

  // Enhanced restore scroll position with better validation and retry logic
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
      
      console.log('Restoring exact scroll position:', savedPosition);
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Try to restore scroll
      window.scrollTo({
        left: savedPosition.x,
        top: savedPosition.y,
        behavior: 'auto'
      });
      
      // Enhanced verification with retry logic
      const verifyAndRetry = (attempt = 1, maxAttempts = 3) => {
        setTimeout(() => {
          const actualY = window.scrollY;
          const targetY = savedPosition.y;
          const tolerance = 200; // Increased tolerance to 200px
          
          if (Math.abs(actualY - targetY) > tolerance && attempt < maxAttempts) {
            console.log(`Scroll restoration attempt ${attempt} failed, retrying...`);
            window.scrollTo({
              left: savedPosition.x,
              top: savedPosition.y,
              behavior: 'auto'
            });
            verifyAndRetry(attempt + 1, maxAttempts);
          } else if (Math.abs(actualY - targetY) <= tolerance) {
            console.log('Exact scroll position restoration successful');
            isRestoringRef.current = false;
          } else {
            console.log('Exact scroll restoration failed after all attempts, but position is acceptable');
            isRestoringRef.current = false;
            // Do NOT fallback to auto-scroll here - the position is close enough
          }
        }, 300 * attempt); // Increasing delay for each attempt
      };
      
      verifyAndRetry();
    } else {
      console.log('No saved position found for', scrollKey, '- trying auto-scroll');
      // Only use auto-scroll if there's absolutely no saved position
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

  return { clearScrollPosition, storeSearchContext };
};
