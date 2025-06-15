import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
  isAtBottom?: boolean; // Add the missing property
}

interface SearchContext {
  type: 'anime' | 'manga';
  query: string;
  timestamp: number;
  scrollAttempts: number;
  fromDetailScroll?: boolean;
  lastScrollY?: number;
  contextPreserved?: boolean;
}

// ... keep existing code (constants and hook definition)

export const useScrollRestoration = (key?: string) => {
  const location = useLocation();
  const scrollKey = key || location.pathname;
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const currentContextRef = useRef<string | null>(null);
  const lastNavigationRef = useRef<string | null>(null);
  const navigationContextRef = useRef<string | null>(null);

  // Store search context with enhanced tracking
  const storeSearchContext = useCallback((type: 'anime' | 'manga', query: string) => {
    if (typeof window === 'undefined') return;
    
    const searchContext: SearchContext = {
      type,
      query,
      timestamp: Date.now(),
      scrollAttempts: 0,
      fromDetailScroll: false,
      lastScrollY: window.scrollY,
      contextPreserved: true
    };
    
    sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(searchContext));
    currentContextRef.current = `${type}-${query}`;
    console.log('Stored enhanced search context:', searchContext);
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
    
    // Enhanced context preservation for detail pages
    if (scrollKey.includes('/anime/') || scrollKey.includes('/manga/')) {
      const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
      if (searchContext) {
        try {
          const ctx: SearchContext = JSON.parse(searchContext);
          ctx.fromDetailScroll = true;
          ctx.timestamp = Date.now();
          ctx.lastScrollY = currentY;
          ctx.contextPreserved = true;
          sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(ctx));
          console.log('Enhanced context preservation for detail scroll:', ctx);
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
        const attemptFind = (attempt = 1, maxAttempts = 15) => {
          const selectors = targetType === 'anime' 
            ? [
                '[data-section="anime-search"]',
                '[data-section="anime-recommendations"]', 
                '[data-section="trending-anime"]',
                'section:has(h2:contains("Anime"))',
                'div[class*="space-y"]:has(*:contains("Anime"))',
                '[class*="search"]:has(input)',
                'section:nth-of-type(2)',
                'main > div:nth-child(2)',
              ]
            : [
                '[data-section="manga-search"]',
                '[data-section="manga-recommendations"]',
                '[data-section="trending-manga"]', 
                'section:has(h2:contains("Manga"))',
                'div[class*="space-y"]:has(*:contains("Manga"))',
                '[class*="search"]:has(input)',
                'section:nth-of-type(3)',
                'main > div:nth-child(3)',
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
          
          const allSections = document.querySelectorAll('section, div[class*="space-y"], main > div, [class*="search"]');
          for (const section of allSections) {
            const text = section.textContent?.toLowerCase() || '';
            const hasTargetContent = text.includes(targetType) || 
                                   text.includes('search') || 
                                   text.includes('recommendation');
            if (hasTargetContent && section.getBoundingClientRect().height > 50) {
              console.log(`Found target section via enhanced text search for: ${targetType}`);
              resolve(section);
              return;
            }
          }
          
          if (attempt < maxAttempts) {
            console.log(`Enhanced section detection attempt ${attempt} failed, retrying...`);
            setTimeout(() => attemptFind(attempt + 1, maxAttempts), 150 * attempt);
          } else {
            console.log('Failed to find target section after all enhanced attempts');
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

    console.log('=== ENHANCED CONTEXT-AWARE SCROLL DEBUG ===');
    
    const currentNavigationContext = `${location.pathname}-${Date.now()}`;
    
    if (!forceAttempt && navigationContextRef.current === currentNavigationContext && hasRestoredRef.current) {
      console.log('Already handled this navigation context');
      return false;
    }
    
    if (forceAttempt || navigationContextRef.current !== currentNavigationContext) {
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
      navigationContextRef.current = currentNavigationContext;
      console.log('Reset state for new navigation context');
    }

    const navigationState = location.state;
    const isFromDetailPage = navigationState?.fromDetailPage;
    const navigationSection = navigationState?.lastActiveSection;
    
    let targetType = null;
    let contextSource = null;
    let shouldScroll = false;

    console.log('Enhanced navigation analysis:', {
      isFromDetailPage,
      navigationSection,
      navigationState,
      currentNavigationContext
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
          const isContextPreserved = searchCtx.contextPreserved;
          
          console.log('Enhanced search context analysis:', {
            isContextValid,
            hasAttemptsLeft,
            isContextPreserved,
            scrollAttempts: searchCtx.scrollAttempts,
            fromDetailScroll: searchCtx.fromDetailScroll
          });
          
          if (isContextValid && (hasAttemptsLeft || forceAttempt || isContextPreserved)) {
            targetType = searchCtx.type;
            contextSource = searchCtx.fromDetailScroll ? 'detail-scroll-context' : 'search-context';
            shouldScroll = true;
            
            // Update attempt count
            searchCtx.scrollAttempts += 1;
            searchCtx.contextPreserved = false;
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

    console.log(`Performing enhanced context-aware scroll for ${targetType} (${contextSource})`);

    try {
      isRestoringRef.current = true;
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
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
              if (searchCtx.scrollAttempts >= MAX_SCROLL_ATTEMPTS && !searchCtx.contextPreserved) {
                sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
                console.log('Cleared search context after max attempts');
              }
            } catch (error) {
              sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
            }
          }
          isRestoringRef.current = false;
        }, 2000);

        return true;
      } else {
        console.log('Target section not found, using enhanced fallback scroll');
        
        // Enhanced fallback: scroll to a reasonable position
        const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
        let fallbackPosition = window.innerHeight * 0.7;
        
        if (searchContext) {
          try {
            const searchCtx: SearchContext = JSON.parse(searchContext);
            if (searchCtx.lastScrollY && searchCtx.lastScrollY > 100) {
              fallbackPosition = Math.min(searchCtx.lastScrollY, window.innerHeight * 1.2);
            }
          } catch (error) {
            // Use default fallback
          }
        }
        
        window.scrollTo({
          top: fallbackPosition,
          behavior: 'smooth'
        });
        
        hasRestoredRef.current = true;
        isRestoringRef.current = false;
        return true;
      }
    } catch (error) {
      console.error('Error in enhanced context-aware scroll:', error);
      isRestoringRef.current = false;
      return false;
    }
  }, [scrollKey, location.state, findTargetSection, location.pathname]);

  // Enhanced restore scroll position with better state management
  const restoreScrollPosition = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const navigationContext = `${location.pathname}-${location.state?.fromDetailPage}-${location.state?.type}-${Date.now()}`;
    
    if (lastNavigationRef.current !== navigationContext) {
      console.log('New enhanced navigation context detected, resetting state');
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
      lastNavigationRef.current = navigationContext;
    }

    if (hasRestoredRef.current || isRestoringRef.current) {
      console.log('Enhanced scroll restoration already completed or in progress');
      return;
    }

    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    const savedPosition: ScrollPosition = scrollPositions[scrollKey];
    
    console.log('=== ENHANCED SCROLL RESTORATION DEBUG ===');
    console.log('Enhanced navigation context:', navigationContext);
    console.log('Saved position:', savedPosition);
    console.log('Navigation state:', location.state);
    
    if (location.state?.fromDetailPage && location.state?.preserveState) {
      console.log('Coming from detail page - using enhanced context-aware scroll');
      const scrolled = await performContextAwareScroll();
      if (scrolled) {
        console.log('Enhanced context-aware scroll successful');
        return;
      }
    }
    
    if (savedPosition && savedPosition.y > 100 && !savedPosition.isAtBottom) {
      console.log('Using saved scroll position:', savedPosition);
      
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      await new Promise(resolve => setTimeout(resolve, 350));
      
      window.scrollTo({
        left: savedPosition.x,
        top: savedPosition.y,
        behavior: 'auto'
      });
      
      setTimeout(() => {
        const actualY = window.scrollY;
        const tolerance = 150;
        
        if (Math.abs(actualY - savedPosition.y) > tolerance) {
          console.log('Enhanced scroll verification failed, retrying...');
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: 'auto'
          });
        }
        
        isRestoringRef.current = false;
      }, 500);
    } else {
      console.log('No meaningful saved position, trying enhanced context-aware scroll');
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

    const handlePopState = () => {
      console.log('Enhanced browser back/forward navigation detected');
      
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
      lastNavigationRef.current = null;
      navigationContextRef.current = null;
      
      setTimeout(async () => {
        console.log('Attempting enhanced popstate scroll restoration');
        await performContextAwareScroll(true);
      }, 500);
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
    }, 200);

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
    navigationContextRef.current = null;
    
    console.log('Cleared enhanced scroll position for:', keyToClear || scrollKey);
  }, [scrollKey]);

  return { clearScrollPosition, storeSearchContext };
};
