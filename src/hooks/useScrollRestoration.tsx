
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Constants for scroll restoration with mobile optimizations
const SCROLL_RESTORATION_KEY = 'scroll_positions';
const SEARCH_CONTEXT_KEY = 'search_context';
const MOBILE_CONTEXT_TIMEOUT = 45 * 60 * 1000; // 45 minutes for mobile
const DESKTOP_CONTEXT_TIMEOUT = 30 * 60 * 1000; // 30 minutes for desktop
const MAX_SCROLL_ATTEMPTS = 5; // Increased for mobile
const MOBILE_DELAY = 500; // Longer delay for mobile content loading
const DESKTOP_DELAY = 200;

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
  isAtBottom?: boolean;
  isMobile?: boolean;
}

interface SearchContext {
  type: 'anime' | 'manga';
  query: string;
  timestamp: number;
  scrollAttempts: number;
  fromDetailScroll?: boolean;
  lastScrollY?: number;
  contextPreserved?: boolean;
  isMobile?: boolean;
  navigationMethod?: 'browser-back' | 'touch-gesture' | 'link-click' | 'unknown';
}

// Mobile device detection utility
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobile || (isTouchDevice && isSmallScreen);
};

// Get appropriate timeout based on device
const getContextTimeout = () => {
  return isMobileDevice() ? MOBILE_CONTEXT_TIMEOUT : DESKTOP_CONTEXT_TIMEOUT;
};

// Get appropriate delay based on device
const getScrollDelay = () => {
  return isMobileDevice() ? MOBILE_DELAY : DESKTOP_DELAY;
};

// Enhanced mobile navigation detection
const detectNavigationMethod = () => {
  if (typeof window === 'undefined') return 'unknown';
  
  // Check for mobile browser back button or gesture
  const navigationEntries = window.performance?.getEntriesByType?.('navigation');
  if (navigationEntries && navigationEntries.length > 0) {
    const entry = navigationEntries[0] as PerformanceNavigationTiming;
    if (entry.type === 'back_forward') {
      return isMobileDevice() ? 'touch-gesture' : 'browser-back';
    }
  }
  
  // Check for mobile touch events in recent history
  if (isMobileDevice() && window.history.length > 1) {
    return 'touch-gesture';
  }
  
  return 'link-click';
};

export const useScrollRestoration = (key?: string) => {
  const location = useLocation();
  const scrollKey = key || location.pathname;
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const currentContextRef = useRef<string | null>(null);
  const lastNavigationRef = useRef<string | null>(null);
  const navigationContextRef = useRef<string | null>(null);
  const mobileDetectionRef = useRef<boolean>(false);

  // Initialize mobile detection
  useEffect(() => {
    mobileDetectionRef.current = isMobileDevice();
  }, []);

  // Store search context with mobile enhancements
  const storeSearchContext = useCallback((type: 'anime' | 'manga', query: string) => {
    if (typeof window === 'undefined') return;
    
    const navigationMethod = detectNavigationMethod();
    const searchContext: SearchContext = {
      type,
      query,
      timestamp: Date.now(),
      scrollAttempts: 0,
      fromDetailScroll: false,
      lastScrollY: window.scrollY,
      contextPreserved: true,
      isMobile: isMobileDevice(),
      navigationMethod
    };
    
    sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(searchContext));
    currentContextRef.current = `${type}-${query}`;
    console.log('Stored mobile-enhanced search context:', searchContext);
  }, []);

  // Enhanced save scroll position with mobile tracking
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
      isAtBottom,
      isMobile: isMobileDevice()
    };
    
    // Enhanced context preservation for mobile detail pages
    if (scrollKey.includes('/anime/') || scrollKey.includes('/manga/')) {
      const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
      if (searchContext) {
        try {
          const ctx: SearchContext = JSON.parse(searchContext);
          ctx.fromDetailScroll = true;
          ctx.timestamp = Date.now();
          ctx.lastScrollY = currentY;
          ctx.contextPreserved = true;
          ctx.isMobile = isMobileDevice();
          ctx.navigationMethod = detectNavigationMethod();
          sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(ctx));
          console.log('Mobile-enhanced context preservation for detail scroll:', ctx);
        } catch (error) {
          console.error('Error updating mobile search context:', error);
        }
      }
    }
    
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
    console.log('Saved mobile scroll position for', scrollKey, scrollPositions[scrollKey]);
  }, [scrollKey]);

  // Enhanced mobile-friendly section detection
  const findTargetSection = useCallback((targetType: 'anime' | 'manga') => {
    return new Promise<Element | null>((resolve) => {
      const attemptFind = (attempt = 1, maxAttempts = isMobileDevice() ? 20 : 15) => {
        // Mobile-optimized selectors with viewport considerations
        const mobileSelectors = targetType === 'anime' 
          ? [
              '[data-section="anime-search"]',
              '[data-section="anime-recommendations"]', 
              '[data-section="trending-anime"]',
              'section:has(h2[class*="gradient-text"]):has(*:contains("Anime"))',
              'div[class*="space-y"]:has(h2:contains("Anime"))',
              'section:has(input[placeholder*="anime" i])',
              '[class*="search"]:has(input)',
              'main section:nth-of-type(2)',
              'main > div:nth-child(2)',
              'section:contains("Anime")',
              '.grid:has([class*="card"])',
            ]
          : [
              '[data-section="manga-search"]',
              '[data-section="manga-recommendations"]',
              '[data-section="trending-manga"]', 
              'section:has(h2[class*="gradient-text"]):has(*:contains("Manga"))',
              'div[class*="space-y"]:has(h2:contains("Manga"))',
              'section:has(input[placeholder*="manga" i])',
              '[class*="search"]:has(input)',
              'main section:nth-of-type(3)',
              'main > div:nth-child(3)',
              'section:contains("Manga")',
              '.grid:has([class*="card"])',
            ];

        for (const selector of mobileSelectors) {
          try {
            const element = document.querySelector(selector);
            if (element && element.getBoundingClientRect().height > 0) {
              console.log(`Mobile: Found target section using selector: ${selector}`);
              resolve(element);
              return;
            }
          } catch (error) {
            continue;
          }
        }
        
        // Enhanced mobile fallback detection
        const allSections = document.querySelectorAll('section, div[class*="space-y"], main > div, [class*="search"], .grid');
        for (const section of allSections) {
          const text = section.textContent?.toLowerCase() || '';
          const hasTargetContent = text.includes(targetType) || 
                                 text.includes('search') || 
                                 text.includes('recommendation') ||
                                 text.includes('trending');
          const rect = section.getBoundingClientRect();
          const isVisible = rect.height > (isMobileDevice() ? 30 : 50) && rect.width > 0;
          
          if (hasTargetContent && isVisible) {
            console.log(`Mobile: Found target section via enhanced text search for: ${targetType}`);
            resolve(section);
            return;
          }
        }
        
        if (attempt < maxAttempts) {
          const delay = isMobileDevice() ? 200 * attempt : 150 * attempt;
          console.log(`Mobile section detection attempt ${attempt} failed, retrying in ${delay}ms...`);
          setTimeout(() => attemptFind(attempt + 1, maxAttempts), delay);
        } else {
          console.log('Mobile: Failed to find target section after all enhanced attempts');
          resolve(null);
        }
      };
      
      attemptFind();
    });
  }, []);

  // Enhanced mobile context-aware scroll with better state management
  const performContextAwareScroll = useCallback(async (forceAttempt = false) => {
    if (scrollKey !== '/') return false;

    console.log('=== MOBILE-ENHANCED CONTEXT-AWARE SCROLL DEBUG ===');
    console.log('Mobile device detected:', isMobileDevice());
    
    const currentNavigationContext = `${location.pathname}-${Date.now()}`;
    
    if (!forceAttempt && navigationContextRef.current === currentNavigationContext && hasRestoredRef.current) {
      console.log('Already handled this mobile navigation context');
      return false;
    }
    
    if (forceAttempt || navigationContextRef.current !== currentNavigationContext) {
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
      navigationContextRef.current = currentNavigationContext;
      console.log('Reset mobile state for new navigation context');
    }

    const navigationState = location.state;
    const isFromDetailPage = navigationState?.fromDetailPage;
    const navigationSection = navigationState?.lastActiveSection;
    const navigationMethod = detectNavigationMethod();
    
    let targetType = null;
    let contextSource = null;
    let shouldScroll = false;

    console.log('Mobile navigation analysis:', {
      isFromDetailPage,
      navigationSection,
      navigationState,
      navigationMethod,
      currentNavigationContext
    });

    // Primary: Enhanced mobile navigation state detection
    if (isFromDetailPage || navigationMethod === 'touch-gesture' || navigationMethod === 'browser-back') {
      shouldScroll = true;
      contextSource = `mobile-navigation-${navigationMethod}`;
      
      if (navigationState?.type) {
        targetType = navigationState.type;
      } else if (navigationSection === 'search') {
        const pageState = sessionStorage.getItem('pageState');
        if (pageState) {
          try {
            const parsed = JSON.parse(pageState);
            if (parsed.isSearchingAnime) targetType = 'anime';
            else if (parsed.isSearchingManga) targetType = 'manga';
          } catch (error) {
            console.error('Error parsing mobile page state:', error);
          }
        }
      }
    }

    // Secondary: Enhanced mobile search context detection
    if (!targetType || forceAttempt) {
      const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
      if (searchContext) {
        try {
          const searchCtx: SearchContext = JSON.parse(searchContext);
          const contextTimeout = getContextTimeout();
          const isContextValid = Date.now() - searchCtx.timestamp < contextTimeout;
          const hasAttemptsLeft = searchCtx.scrollAttempts < MAX_SCROLL_ATTEMPTS;
          const isContextPreserved = searchCtx.contextPreserved;
          const isMobileContext = searchCtx.isMobile !== undefined ? searchCtx.isMobile : isMobileDevice();
          
          console.log('Mobile search context analysis:', {
            isContextValid,
            hasAttemptsLeft,
            isContextPreserved,
            isMobileContext,
            scrollAttempts: searchCtx.scrollAttempts,
            fromDetailScroll: searchCtx.fromDetailScroll,
            navigationMethod: searchCtx.navigationMethod
          });
          
          if (isContextValid && (hasAttemptsLeft || forceAttempt || isContextPreserved)) {
            targetType = searchCtx.type;
            contextSource = searchCtx.fromDetailScroll ? 'mobile-detail-scroll-context' : 'mobile-search-context';
            shouldScroll = true;
            
            // Update attempt count with mobile considerations
            searchCtx.scrollAttempts += 1;
            searchCtx.contextPreserved = false;
            searchCtx.isMobile = isMobileDevice();
            searchCtx.navigationMethod = navigationMethod;
            sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(searchCtx));
          }
        } catch (error) {
          console.error('Error parsing mobile search context:', error);
          sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
        }
      }
    }

    if (!shouldScroll || !targetType) {
      console.log('No valid mobile context found for auto-scroll');
      return false;
    }

    console.log(`Performing mobile context-aware scroll for ${targetType} (${contextSource})`);

    try {
      isRestoringRef.current = true;
      
      // Mobile-optimized delay
      const scrollDelay = getScrollDelay();
      await new Promise(resolve => setTimeout(resolve, scrollDelay));
      
      // Find target section with mobile-enhanced detection
      const targetElement = await findTargetSection(targetType);

      if (targetElement) {
        console.log(`Mobile: Found target section for ${targetType}, scrolling...`);
        
        const elementRect = targetElement.getBoundingClientRect();
        const elementTop = elementRect.top + window.scrollY;
        const mobileOffset = isMobileDevice() ? 60 : 80; // Smaller offset for mobile
        const targetScrollY = Math.max(0, elementTop - mobileOffset);
        
        // Mobile-optimized smooth scroll
        window.scrollTo({
          top: targetScrollY,
          behavior: isMobileDevice() ? 'auto' : 'smooth' // Auto for better mobile performance
        });

        hasRestoredRef.current = true;
        
        // Mobile-optimized context cleanup
        setTimeout(() => {
          const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
          if (searchContext && contextSource.includes('context')) {
            try {
              const searchCtx: SearchContext = JSON.parse(searchContext);
              if (searchCtx.scrollAttempts >= MAX_SCROLL_ATTEMPTS && !searchCtx.contextPreserved) {
                sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
                console.log('Cleared mobile search context after max attempts');
              }
            } catch (error) {
              sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
            }
          }
          isRestoringRef.current = false;
        }, isMobileDevice() ? 3000 : 2000);

        return true;
      } else {
        console.log('Mobile: Target section not found, using enhanced mobile fallback scroll');
        
        // Enhanced mobile fallback with viewport awareness
        const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
        let fallbackPosition = window.innerHeight * (isMobileDevice() ? 0.5 : 0.7);
        
        if (searchContext) {
          try {
            const searchCtx: SearchContext = JSON.parse(searchContext);
            if (searchCtx.lastScrollY && searchCtx.lastScrollY > 100) {
              const maxFallback = window.innerHeight * (isMobileDevice() ? 1.0 : 1.2);
              fallbackPosition = Math.min(searchCtx.lastScrollY, maxFallback);
            }
          } catch (error) {
            // Use default mobile fallback
          }
        }
        
        window.scrollTo({
          top: fallbackPosition,
          behavior: isMobileDevice() ? 'auto' : 'smooth'
        });
        
        hasRestoredRef.current = true;
        isRestoringRef.current = false;
        return true;
      }
    } catch (error) {
      console.error('Error in mobile context-aware scroll:', error);
      isRestoringRef.current = false;
      return false;
    }
  }, [scrollKey, location.state, findTargetSection, location.pathname]);

  // Enhanced mobile restore scroll position
  const restoreScrollPosition = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const navigationContext = `${location.pathname}-${location.state?.fromDetailPage}-${location.state?.type}-${detectNavigationMethod()}-${Date.now()}`;
    
    if (lastNavigationRef.current !== navigationContext) {
      console.log('New mobile navigation context detected, resetting state');
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
      lastNavigationRef.current = navigationContext;
    }

    if (hasRestoredRef.current || isRestoringRef.current) {
      console.log('Mobile scroll restoration already completed or in progress');
      return;
    }

    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    
    const savedPosition: ScrollPosition = scrollPositions[scrollKey];
    
    console.log('=== MOBILE SCROLL RESTORATION DEBUG ===');
    console.log('Mobile navigation context:', navigationContext);
    console.log('Saved position:', savedPosition);
    console.log('Navigation state:', location.state);
    console.log('Navigation method:', detectNavigationMethod());
    
    // Enhanced mobile context-aware scroll detection
    const isFromDetailPageOrBack = location.state?.fromDetailPage || 
                                  detectNavigationMethod() === 'touch-gesture' || 
                                  detectNavigationMethod() === 'browser-back';
    
    if (isFromDetailPageOrBack && location.state?.preserveState) {
      console.log('Mobile: Coming from detail page or back navigation - using enhanced context-aware scroll');
      const scrolled = await performContextAwareScroll();
      if (scrolled) {
        console.log('Mobile context-aware scroll successful');
        return;
      }
    }
    
    if (savedPosition && savedPosition.y > 100 && !savedPosition.isAtBottom) {
      console.log('Mobile: Using saved scroll position:', savedPosition);
      
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      const restoreDelay = getScrollDelay() + 150; // Extra delay for mobile
      await new Promise(resolve => setTimeout(resolve, restoreDelay));
      
      window.scrollTo({
        left: savedPosition.x,
        top: savedPosition.y,
        behavior: 'auto' // Auto for better mobile performance
      });
      
      // Mobile-optimized scroll verification
      setTimeout(() => {
        const actualY = window.scrollY;
        const tolerance = isMobileDevice() ? 200 : 150; // Higher tolerance for mobile
        
        if (Math.abs(actualY - savedPosition.y) > tolerance) {
          console.log('Mobile scroll verification failed, retrying...');
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: 'auto'
          });
        }
        
        isRestoringRef.current = false;
      }, isMobileDevice() ? 800 : 500);
    } else {
      console.log('Mobile: No meaningful saved position, trying enhanced context-aware scroll');
      await performContextAwareScroll(true);
    }
  }, [scrollKey, performContextAwareScroll, location.state, location.pathname]);

  // Enhanced mobile scroll events handling
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringRef.current) return;
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Mobile-optimized debounce timing
      const debounceTime = isMobileDevice() ? 300 : 200;
      saveTimeoutRef.current = setTimeout(saveScrollPosition, debounceTime);
    };

    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveScrollPosition();
    };

    const handlePopState = () => {
      console.log('Mobile: Enhanced browser back/forward navigation detected');
      
      hasRestoredRef.current = false;
      isRestoringRef.current = false;
      lastNavigationRef.current = null;
      navigationContextRef.current = null;
      
      const popstateDelay = isMobileDevice() ? 800 : 500;
      setTimeout(async () => {
        console.log('Mobile: Attempting enhanced popstate scroll restoration');
        await performContextAwareScroll(true);
      }, popstateDelay);
    };

    // Mobile-optimized event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Additional mobile-specific events
    if (isMobileDevice()) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log('Mobile: Page became visible, checking scroll restoration');
          setTimeout(() => {
            if (!hasRestoredRef.current) {
              performContextAwareScroll(true);
            }
          }, 300);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        saveScrollPosition();
      };
    }

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

  // Mobile-optimized restore on mount
  useEffect(() => {
    const mountDelay = getScrollDelay();
    const timeoutId = setTimeout(() => {
      restoreScrollPosition();
    }, mountDelay);

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
    
    console.log('Cleared mobile scroll position for:', keyToClear || scrollKey);
  }, [scrollKey]);

  return { clearScrollPosition, storeSearchContext };
};
