
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
}

const SCROLL_RESTORATION_KEY = 'scroll-positions';
const SEARCH_CONTEXT_KEY = 'search-context';
const CONTEXT_TIMEOUT = 60000; // 1 minute
const MAX_SCROLL_ATTEMPTS = 3;

export const useScrollRestoration = (key?: string) => {
  const location = useLocation();
  const scrollKey = key || location.pathname;
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const currentContextRef = useRef<string | null>(null);

  // Store search context with attempt tracking
  const storeSearchContext = useCallback((type: 'anime' | 'manga', query: string) => {
    if (typeof window === 'undefined') return;
    
    const searchContext: SearchContext = {
      type,
      query,
      timestamp: Date.now(),
      scrollAttempts: 0
    };
    
    sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(searchContext));
    currentContextRef.current = `${type}-${query}`;
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

  // Enhanced section detection with multiple selectors
  const findTargetSection = useCallback((targetType: 'anime' | 'manga') => {
    const selectors = targetType === 'anime' 
      ? [
          '[data-section="anime-search"]',
          '[data-section="anime-recommendations"]',
          '[data-section="trending-anime"]',
          'section:has(h2[class*="gradient-text"]:contains("Anime"))',
          'section:has([data-testid*="anime"])',
          'section:has(h2:contains("Recommended Anime"))',
          'section:has(h2:contains("Anime Results"))',
          'div:has(h2:contains("Anime"))',
          'section:nth-of-type(2)', // Fallback to second section
        ]
      : [
          '[data-section="manga-search"]',
          '[data-section="manga-recommendations"]',
          '[data-section="trending-manga"]',
          'section:has(h2[class*="gradient-text"]:contains("Manga"))',
          'section:has([data-testid*="manga"])',
          'section:has(h2:contains("Recommended Manga"))',
          'section:has(h2:contains("Manga Results"))',
          'div:has(h2:contains("Manga"))',
          'section:nth-of-type(3)', // Fallback to third section
        ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`Found target section using selector: ${selector}`);
          return element;
        }
      } catch (error) {
        // Skip invalid selectors (like :contains which isn't standard)
        continue;
      }
    }
    
    // Final fallback - look for any section with anime/manga content
    const allSections = document.querySelectorAll('section, div[class*="space-y"]');
    for (const section of allSections) {
      const text = section.textContent?.toLowerCase() || '';
      if (text.includes(targetType)) {
        console.log(`Found target section via text content search for: ${targetType}`);
        return section;
      }
    }
    
    return null;
  }, []);

  // Enhanced context-aware scroll with retry mechanism
  const performContextAwareScroll = useCallback((forceAttempt = false) => {
    if (scrollKey !== '/') return false;

    // Check navigation state first
    const isFromDetailPage = location.state?.fromDetailPage;
    const navigationSection = location.state?.lastActiveSection;
    
    let targetType = null;
    let contextSource = null;
    let shouldScroll = false;

    // Always try to scroll when coming from detail page
    if (isFromDetailPage) {
      shouldScroll = true;
      
      if (navigationSection === 'search') {
        const pageState = sessionStorage.getItem('pageState');
        if (pageState) {
          try {
            const parsed = JSON.parse(pageState);
            if (parsed.isSearchingAnime) targetType = 'anime';
            else if (parsed.isSearchingManga) targetType = 'manga';
          } catch (error) {
            console.error('Error parsing page state for scroll:', error);
          }
        }
      } else if (navigationSection === 'recommendations') {
        targetType = 'anime'; // Default to anime for recommendations
      }
      contextSource = 'navigation-state';
    }

    // Check search context
    if (!targetType || forceAttempt) {
      const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
      if (searchContext) {
        try {
          const searchCtx: SearchContext = JSON.parse(searchContext);
          const isContextValid = Date.now() - searchCtx.timestamp < CONTEXT_TIMEOUT;
          const hasAttemptsLeft = searchCtx.scrollAttempts < MAX_SCROLL_ATTEMPTS;
          
          if (isContextValid && (hasAttemptsLeft || forceAttempt)) {
            targetType = searchCtx.type;
            contextSource = 'search-context';
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

    // Wait for content to be rendered
    const attemptScroll = (attempt = 1, maxAttempts = 5) => {
      const targetElement = findTargetSection(targetType);

      if (targetElement) {
        console.log(`Found target section for ${targetType}, scrolling...`);
        
        const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;
        const offset = 80; // Header offset
        
        window.scrollTo({
          top: Math.max(0, elementTop - offset),
          behavior: 'smooth'
        });

        // Clear context after successful scroll (with delay)
        setTimeout(() => {
          if (contextSource === 'search-context') {
            const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
            if (searchContext) {
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
          }
        }, 2000);

        return true;
      } else if (attempt < maxAttempts) {
        console.log(`Target section not found (attempt ${attempt}), retrying...`);
        setTimeout(() => attemptScroll(attempt + 1, maxAttempts), 300 * attempt);
        return false;
      } else {
        console.log(`Failed to find target section after ${maxAttempts} attempts`);
        
        // Fallback scroll to middle of page if we have search context
        if (contextSource === 'search-context') {
          console.log('Using fallback scroll position');
          window.scrollTo({
            top: window.innerHeight * 0.5,
            behavior: 'smooth'
          });
        }
        
        return false;
      }
    };

    // Start the scroll attempt
    setTimeout(() => attemptScroll(), 150);
    return true;
  }, [scrollKey, location.state, findTargetSection]);

  // Enhanced restore scroll position
  const restoreScrollPosition = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    // Reset restoration state for new navigation context
    const newContext = `${location.pathname}-${location.state?.fromDetailPage}-${Date.now()}`;
    if (currentContextRef.current !== newContext) {
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
      currentContextRef.current = newContext;
    }

    if (hasRestoredRef.current || isRestoringRef.current) {
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
    console.log('Navigation state:', location.state);
    
    // Check if we're coming from a detail page first
    if (location.state?.fromDetailPage && location.state?.preserveState) {
      console.log('Coming from detail page - prioritizing context-aware scroll');
      const scrolled = performContextAwareScroll();
      if (scrolled) {
        hasRestoredRef.current = true;
        return;
      }
    }
    
    // Check if we have a meaningful saved position
    if (savedPosition && savedPosition.y > 100) {
      console.log('Found saved position, attempting exact restoration:', savedPosition);
      
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 200));
      
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
            console.log('Exact scroll position restoration completed');
            isRestoringRef.current = false;
          }
        }, 400 * attempt);
      };
      
      verifyAndRetry();
    } else {
      console.log('No meaningful saved position, trying context-aware scroll');
      // Use context-aware scroll as primary fallback
      const scrolled = performContextAwareScroll(true); // Force attempt
      if (scrolled) {
        hasRestoredRef.current = true;
      }
    }
  }, [scrollKey, performContextAwareScroll, location.state, location.pathname]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringRef.current) return;
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(saveScrollPosition, 150);
    };

    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveScrollPosition();
    };

    // Handle browser back button
    const handlePopState = () => {
      console.log('Browser back button detected');
      // Reset restoration state to allow new scroll attempt
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
      
      // Try context-aware scroll after a delay
      setTimeout(() => {
        performContextAwareScroll(true);
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

  // Restore on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      restoreScrollPosition();
    }, 100);

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
    
    console.log('Cleared scroll position for:', keyToClear || scrollKey);
  }, [scrollKey]);

  return { clearScrollPosition, storeSearchContext };
};
