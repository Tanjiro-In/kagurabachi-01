
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
  scrollAttempts: number;
  fromDetailScroll?: boolean; // Track if coming from detail page scroll
}

const SCROLL_RESTORATION_KEY = 'scroll-positions';
const SEARCH_CONTEXT_KEY = 'search-context';
const CONTEXT_TIMEOUT = 300000; // 5 minutes (increased)
const MAX_SCROLL_ATTEMPTS = 5; // Increased attempts

export const useScrollRestoration = (key?: string) => {
  const location = useLocation();
  const scrollKey = key || location.pathname;
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const currentContextRef = useRef<string | null>(null);
  const lastNavigationRef = useRef<string | null>(null);

  // Store search context with enhanced tracking
  const storeSearchContext = useCallback((type: 'anime' | 'manga', query: string) => {
    if (typeof window === 'undefined') return;
    
    const searchContext: SearchContext = {
      type,
      query,
      timestamp: Date.now(),
      scrollAttempts: 0,
      fromDetailScroll: false
    };
    
    sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(searchContext));
    currentContextRef.current = `${type}-${query}`;
    console.log('Stored search context:', searchContext);
  }, []);

  // Enhanced save scroll position with detail page tracking
  const saveScrollPosition = useCallback(() => {
    if (typeof window === 'undefined' || isRestoringRef.current) return;
    
    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    const currentY = window.scrollY;
    const isAtBottom = currentY + window.innerHeight >= document.documentElement.scrollHeight - 100;
    
    scrollPositions[scrollKey] = {
      x: window.scrollX,
      y: currentY,
      timestamp: Date.now(),
      isAtBottom // Track if user was at bottom
    };
    
    // If user scrolled to bottom of detail page, mark search context
    if (isAtBottom && (scrollKey.includes('/anime/') || scrollKey.includes('/manga/'))) {
      const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
      if (searchContext) {
        try {
          const ctx: SearchContext = JSON.parse(searchContext);
          ctx.fromDetailScroll = true;
          ctx.timestamp = Date.now(); // Refresh timestamp
          sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(ctx));
          console.log('Marked search context for detail scroll:', ctx);
        } catch (error) {
          console.error('Error updating search context:', error);
        }
      }
    }
    
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
    console.log('Saved scroll position for', scrollKey, scrollPositions[scrollKey]);
  }, [scrollKey]);

  // Enhanced section detection with more reliable selectors
  const findTargetSection = useCallback((targetType: 'anime' | 'manga') => {
    // Wait for content to be fully rendered
    const waitForContent = () => {
      return new Promise<Element | null>((resolve) => {
        const attemptFind = (attempt = 1, maxAttempts = 10) => {
          const selectors = targetType === 'anime' 
            ? [
                '[data-section="anime-search"]',
                '[data-section="anime-recommendations"]', 
                '[data-section="trending-anime"]',
                'section:has(h2:contains("Anime"))',
                'div[class*="space-y"]:has(*:contains("Anime"))',
                'section:nth-of-type(2)', // Fallback
              ]
            : [
                '[data-section="manga-search"]',
                '[data-section="manga-recommendations"]',
                '[data-section="trending-manga"]', 
                'section:has(h2:contains("Manga"))',
                'div[class*="space-y"]:has(*:contains("Manga"))',
                'section:nth-of-type(3)', // Fallback
              ];

          for (const selector of selectors) {
            try {
              const element = document.querySelector(selector);
              if (element && element.getBoundingClientRect().height > 0) {
                console.log(`Found target section using selector: ${selector}`);
                resolve(element);
                return;
              }
            } catch (error) {
              continue;
            }
          }
          
          // Text-based fallback search
          const allSections = document.querySelectorAll('section, div[class*="space-y"], main > div');
          for (const section of allSections) {
            const text = section.textContent?.toLowerCase() || '';
            const hasTargetContent = text.includes(targetType) || 
                                   text.includes('search') || 
                                   text.includes('recommendation');
            if (hasTargetContent && section.getBoundingClientRect().height > 100) {
              console.log(`Found target section via text search for: ${targetType}`);
              resolve(section);
              return;
            }
          }
          
          if (attempt < maxAttempts) {
            console.log(`Section detection attempt ${attempt} failed, retrying...`);
            setTimeout(() => attemptFind(attempt + 1, maxAttempts), 200 * attempt);
          } else {
            console.log('Failed to find target section after all attempts');
            resolve(null);
          }
        };
        
        attemptFind();
      });
    };
    
    return waitForContent();
  }, []);

  // Enhanced context-aware scroll with better state management
  const performContextAwareScroll = useCallback(async (forceAttempt = false) => {
    if (scrollKey !== '/') return false;

    console.log('=== CONTEXT-AWARE SCROLL DEBUG ===');
    
    // Reset restoration flags for new attempts
    if (forceAttempt) {
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
    }

    const navigationState = location.state;
    const isFromDetailPage = navigationState?.fromDetailPage;
    const navigationSection = navigationState?.lastActiveSection;
    
    let targetType = null;
    let contextSource = null;
    let shouldScroll = false;

    console.log('Navigation analysis:', {
      isFromDetailPage,
      navigationSection,
      navigationState
    });

    // Primary: Check navigation state
    if (isFromDetailPage) {
      shouldScroll = true;
      contextSource = 'navigation-state';
      
      // Determine target type from navigation
      if (navigationState?.type) {
        targetType = navigationState.type;
      } else if (navigationSection === 'search') {
        // Check page state for search type
        const pageState = sessionStorage.getItem('pageState');
        if (pageState) {
          try {
            const parsed = JSON.parse(pageState);
            if (parsed.isSearchingAnime) targetType = 'anime';
            else if (parsed.isSearchingManga) targetType = 'manga';
          } catch (error) {
            console.error('Error parsing page state:', error);
          }
        }
      }
    }

    // Secondary: Check search context (enhanced for detail scrolls)
    if (!targetType || forceAttempt) {
      const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
      if (searchContext) {
        try {
          const searchCtx: SearchContext = JSON.parse(searchContext);
          const isContextValid = Date.now() - searchCtx.timestamp < CONTEXT_TIMEOUT;
          const hasAttemptsLeft = searchCtx.scrollAttempts < MAX_SCROLL_ATTEMPTS;
          
          console.log('Search context analysis:', {
            isContextValid,
            hasAttemptsLeft,
            scrollAttempts: searchCtx.scrollAttempts,
            fromDetailScroll: searchCtx.fromDetailScroll
          });
          
          if (isContextValid && (hasAttemptsLeft || forceAttempt)) {
            targetType = searchCtx.type;
            contextSource = searchCtx.fromDetailScroll ? 'detail-scroll-context' : 'search-context';
            shouldScroll = true;
            
            // Update attempt count
            searchCtx.scrollAttempts += 1;
            sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(searchCtx));
          }
        } catch (error) {
          console.error('Error parsing search context:', error);
          sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
        }
      }
    }

    if (!shouldScroll || !targetType) {
      console.log('No valid context found for auto-scroll');
      return false;
    }

    console.log(`Performing context-aware scroll for ${targetType} (${contextSource})`);

    try {
      isRestoringRef.current = true;
      
      // Find target section with enhanced detection
      const targetElement = await findTargetSection(targetType);

      if (targetElement) {
        console.log(`Found target section for ${targetType}, scrolling...`);
        
        const elementRect = targetElement.getBoundingClientRect();
        const elementTop = elementRect.top + window.scrollY;
        const offset = 80; // Header offset
        const targetScrollY = Math.max(0, elementTop - offset);
        
        // Smooth scroll to target
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });

        // Mark as successfully restored
        hasRestoredRef.current = true;
        
        // Clean up context after successful scroll (with delay)
        setTimeout(() => {
          const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
          if (searchContext && contextSource.includes('context')) {
            try {
              const searchCtx: SearchContext = JSON.parse(searchContext);
              if (searchCtx.scrollAttempts >= MAX_SCROLL_ATTEMPTS) {
                sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
                console.log('Cleared search context after max attempts');
              }
            } catch (error) {
              sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
            }
          }
          isRestoringRef.current = false;
        }, 3000);

        return true;
      } else {
        console.log('Target section not found, using fallback scroll');
        
        // Enhanced fallback: scroll to a reasonable position
        const fallbackPosition = targetType === 'anime' ? window.innerHeight * 0.6 : window.innerHeight * 0.8;
        window.scrollTo({
          top: fallbackPosition,
          behavior: 'smooth'
        });
        
        hasRestoredRef.current = true;
        isRestoringRef.current = false;
        return true;
      }
    } catch (error) {
      console.error('Error in context-aware scroll:', error);
      isRestoringRef.current = false;
      return false;
    }
  }, [scrollKey, location.state, findTargetSection]);

  // Enhanced restore scroll position with better state management
  const restoreScrollPosition = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Create navigation context identifier
    const navigationContext = `${location.pathname}-${location.state?.fromDetailPage}-${location.state?.type}-${Date.now()}`;
    
    // Reset state for new navigation context
    if (lastNavigationRef.current !== navigationContext) {
      console.log('New navigation context detected, resetting state');
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
      lastNavigationRef.current = navigationContext;
    }

    if (hasRestoredRef.current || isRestoringRef.current) {
      console.log('Scroll restoration already completed or in progress');
      return;
    }

    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    const savedPosition: ScrollPosition = scrollPositions[scrollKey];
    
    console.log('=== ENHANCED SCROLL RESTORATION DEBUG ===');
    console.log('Navigation context:', navigationContext);
    console.log('Saved position:', savedPosition);
    console.log('Navigation state:', location.state);
    
    // Priority 1: Handle detail page navigation with context-aware scroll
    if (location.state?.fromDetailPage && location.state?.preserveState) {
      console.log('Coming from detail page - using context-aware scroll');
      const scrolled = await performContextAwareScroll();
      if (scrolled) {
        console.log('Context-aware scroll successful');
        return;
      }
    }
    
    // Priority 2: Use saved position if meaningful and not from bottom of detail page
    if (savedPosition && savedPosition.y > 100 && !savedPosition.isAtBottom) {
      console.log('Using saved scroll position:', savedPosition);
      
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      window.scrollTo({
        left: savedPosition.x,
        top: savedPosition.y,
        behavior: 'auto'
      });
      
      // Verify restoration
      setTimeout(() => {
        const actualY = window.scrollY;
        const tolerance = 150;
        
        if (Math.abs(actualY - savedPosition.y) > tolerance) {
          console.log('Scroll verification failed, retrying...');
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: 'auto'
          });
        }
        
        isRestoringRef.current = false;
      }, 500);
    } else {
      // Priority 3: Fallback to context-aware scroll
      console.log('No meaningful saved position, trying context-aware scroll');
      await performContextAwareScroll(true);
    }
  }, [scrollKey, performContextAwareScroll, location.state, location.pathname]);

  // Handle scroll events with enhanced debouncing
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringRef.current) return;
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(saveScrollPosition, 200);
    };

    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveScrollPosition();
    };

    // Enhanced popstate handling for browser navigation
    const handlePopState = () => {
      console.log('Browser back/forward navigation detected');
      
      // Reset state to allow new scroll restoration
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
      lastNavigationRef.current = null;
      
      // Delay scroll restoration to allow page to settle
      setTimeout(async () => {
        console.log('Attempting popstate scroll restoration');
        await performContextAwareScroll(true);
      }, 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      saveScrollPosition();
    };
  }, [saveScrollPosition, performContextAwareScroll]);

  // Restore on mount with enhanced timing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      restoreScrollPosition();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [restoreScrollPosition]);

  const clearScrollPosition = useCallback((keyToClear?: string) => {
    if (typeof window === 'undefined') return;
    
    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    delete scrollPositions[keyToClear || scrollKey];
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
    
    hasRestoredRef.current = false;
    isRestoringRef.current = false;
    currentContextRef.current = null;
    lastNavigationRef.current = null;
    
    console.log('Cleared scroll position for:', keyToClear || scrollKey);
  }, [scrollKey]);

  return { clearScrollPosition, storeSearchContext };
};
