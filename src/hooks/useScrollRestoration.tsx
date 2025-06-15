
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

  // Enhanced context-aware scroll with better section detection
  const performContextAwareScroll = useCallback(() => {
    if (scrollKey !== '/') return;

    // Check for any navigation context
    const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
    const returnContext = sessionStorage.getItem('return-context');
    
    let targetType = null;
    let contextSource = null;

    // Prioritize search context if recent
    if (searchContext) {
      try {
        const searchCtx = JSON.parse(searchContext);
        if (Date.now() - searchCtx.timestamp < 30000) {
          targetType = searchCtx.type;
          contextSource = 'search';
        }
      } catch (error) {
        console.error('Error parsing search context:', error);
        sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
      }
    }

    // Fall back to return context
    if (!targetType && returnContext) {
      try {
        const returnCtx = JSON.parse(returnContext);
        if (returnCtx.fromDetailPage && Date.now() - returnCtx.timestamp < 30000) {
          targetType = returnCtx.type;
          contextSource = 'detail-return';
        }
      } catch (error) {
        console.error('Error parsing return context:', error);
        sessionStorage.removeItem('return-context');
      }
    }

    if (!targetType) {
      console.log('No valid context found for auto-scroll');
      return;
    }

    console.log(`Performing context-aware scroll for ${targetType} (${contextSource})`);

    // Wait for content to be rendered
    const attemptScroll = (attempt = 1, maxAttempts = 5) => {
      let targetElement: Element | null = null;
      
      if (targetType === 'anime') {
        // Try multiple selectors for anime sections
        targetElement = 
          document.querySelector('[data-section="anime-search"]') ||
          document.querySelector('[data-section="anime-recommendations"]') ||
          document.querySelector('[data-section="trending-anime"]') ||
          document.querySelector('section:has(h2:contains("Anime"))') ||
          document.querySelector('section:has([data-testid*="anime"])');
      } else if (targetType === 'manga') {
        // Try multiple selectors for manga sections
        targetElement = 
          document.querySelector('[data-section="manga-search"]') ||
          document.querySelector('[data-section="manga-recommendations"]') ||
          document.querySelector('[data-section="trending-manga"]') ||
          document.querySelector('section:has(h2:contains("Manga"))') ||
          document.querySelector('section:has([data-testid*="manga"])');
      }

      if (targetElement) {
        console.log(`Found target section for ${targetType}, scrolling...`);
        
        const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;
        const offset = 80; // Header offset
        
        window.scrollTo({
          top: Math.max(0, elementTop - offset),
          behavior: 'smooth'
        });

        // Clear context after successful scroll
        setTimeout(() => {
          if (contextSource === 'search') {
            sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
          } else {
            sessionStorage.removeItem('return-context');
          }
          console.log(`Cleared ${contextSource} context after scroll`);
        }, 1000);

        return true;
      } else if (attempt < maxAttempts) {
        console.log(`Target section not found (attempt ${attempt}), retrying...`);
        setTimeout(() => attemptScroll(attempt + 1, maxAttempts), 200 * attempt);
        return false;
      } else {
        console.log(`Failed to find target section after ${maxAttempts} attempts`);
        return false;
      }
    };

    // Start the scroll attempt
    setTimeout(() => attemptScroll(), 100);
  }, [scrollKey]);

  // Detect browser back navigation
  useEffect(() => {
    if (scrollKey !== '/') return;

    const handlePopState = () => {
      console.log('Browser back navigation detected');
      
      setTimeout(() => {
        const scrollPositions = JSON.parse(
          sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
        );
        const savedPosition: ScrollPosition = scrollPositions[scrollKey];
        
        // Always try context-aware scroll on back navigation
        // Even if there's a saved position, it might be stale
        performContextAwareScroll();
      }, 200);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [scrollKey, performContextAwareScroll]);

  // Enhanced restore scroll position
  const restoreScrollPosition = useCallback(async () => {
    if (typeof window === 'undefined' || hasRestoredRef.current || isRestoringRef.current) {
      return;
    }

    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    const savedPosition: ScrollPosition = scrollPositions[scrollKey];
    
    console.log('=== SCROLL RESTORATION DEBUG ===');
    console.log('Attempting to restore scroll for key:', scrollKey);
    console.log('Saved position:', savedPosition);
    console.log('Current scroll position:', { x: window.scrollX, y: window.scrollY });
    
    // Check if we have a meaningful saved position
    if (savedPosition && savedPosition.y > 100) {
      console.log('Found saved position, attempting exact restoration:', savedPosition);
      
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 150));
      
      window.scrollTo({
        left: savedPosition.x,
        top: savedPosition.y,
        behavior: 'auto'
      });
      
      // Verify restoration with retry logic
      const verifyAndRetry = (attempt = 1, maxAttempts = 3) => {
        setTimeout(() => {
          const actualY = window.scrollY;
          const targetY = savedPosition.y;
          const tolerance = 100;
          
          console.log(`Attempt ${attempt}: Current Y: ${actualY}, Target Y: ${targetY}, Difference: ${Math.abs(actualY - targetY)}`);
          
          if (Math.abs(actualY - targetY) > tolerance && attempt < maxAttempts) {
            console.log(`Scroll restoration attempt ${attempt} failed, retrying...`);
            window.scrollTo({
              left: savedPosition.x,
              top: savedPosition.y,
              behavior: 'auto'
            });
            verifyAndRetry(attempt + 1, maxAttempts);
          } else {
            console.log('Exact scroll position restoration successful');
            isRestoringRef.current = false;
          }
        }, 300 * attempt);
      };
      
      verifyAndRetry();
    } else {
      console.log('No meaningful saved position, trying context-aware scroll');
      // Use context-aware scroll as primary fallback
      setTimeout(performContextAwareScroll, 300);
    }
  }, [scrollKey, performContextAwareScroll]);

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

    return () => clearTimeout(timeoutId);
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
    
    console.log('Cleared scroll position for:', keyToClear || scrollKey);
  }, [scrollKey]);

  return { clearScrollPosition, storeSearchContext };
};
