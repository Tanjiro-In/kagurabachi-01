
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Simplified constants for better mobile performance
const SCROLL_RESTORATION_KEY = 'scroll_positions';
const SEARCH_CONTEXT_KEY = 'search_context';
const MOBILE_CONTEXT_TIMEOUT = 45 * 60 * 1000; // 45 minutes for mobile
const DESKTOP_CONTEXT_TIMEOUT = 30 * 60 * 1000; // 30 minutes for desktop
const MAX_SCROLL_ATTEMPTS = 3; // Reduced for better performance
const MOBILE_DELAY = 600; // Increased for mobile content loading
const DESKTOP_DELAY = 300;

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
  targetSection?: string; // Added for direct section targeting
}

// Simplified mobile device detection
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 1024; // Increased threshold for tablets
  
  return isMobile || (isTouchDevice && isSmallScreen);
};

// Get appropriate timeout and delay based on device
const getContextTimeout = () => isMobileDevice() ? MOBILE_CONTEXT_TIMEOUT : DESKTOP_CONTEXT_TIMEOUT;
const getScrollDelay = () => isMobileDevice() ? MOBILE_DELAY : DESKTOP_DELAY;

// Enhanced navigation method detection for mobile
const detectNavigationMethod = () => {
  if (typeof window === 'undefined') return 'unknown';
  
  // Check for browser back/forward navigation
  const navigationEntries = window.performance?.getEntriesByType?.('navigation');
  if (navigationEntries && navigationEntries.length > 0) {
    const entry = navigationEntries[0] as PerformanceNavigationTiming;
    if (entry.type === 'back_forward') {
      return isMobileDevice() ? 'touch-gesture' : 'browser-back';
    }
  }
  
  // Check for mobile gesture navigation
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
  const navigationContextRef = useRef<string | null>(null);

  // Store search context with enhanced mobile support
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
      navigationMethod,
      targetSection: `${type}-search` // Direct section targeting
    };
    
    sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(searchContext));
    console.log('Stored enhanced search context:', searchContext);
  }, []);

  // Enhanced save scroll position
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
          ctx.isMobile = isMobileDevice();
          ctx.navigationMethod = detectNavigationMethod();
          // Preserve the original target section
          if (!ctx.targetSection) {
            ctx.targetSection = ctx.type === 'anime' ? 'anime-search' : 'manga-search';
          }
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

  // Simplified and reliable section detection
  const findTargetSection = useCallback((targetType: 'anime' | 'manga', targetSection?: string) => {
    return new Promise<Element | null>((resolve) => {
      const attemptFind = (attempt = 1, maxAttempts = 10) => {
        console.log(`Attempting to find ${targetType} section (attempt ${attempt})`);
        
        // Primary: Use data-section attributes for reliable detection
        const primarySelectors = [
          `[data-section="${targetType}-search"]`,
          `[data-section="${targetType}-recommendations"]`,
          `[data-section="trending-${targetType}"]`
        ];
        
        // If we have a specific target section, prioritize it
        if (targetSection) {
          primarySelectors.unshift(`[data-section="${targetSection}"]`);
        }
        
        for (const selector of primarySelectors) {
          try {
            const element = document.querySelector(selector);
            if (element && element.getBoundingClientRect().height > 50) {
              console.log(`Found target section using: ${selector}`);
              resolve(element);
              return;
            }
          } catch (error) {
            continue;
          }
        }
        
        // Secondary: Fallback to content-based detection
        const fallbackSelectors = [
          `section:has(h2:contains("${targetType.charAt(0).toUpperCase() + targetType.slice(1)}"))`
        ];
        
        for (const selector of fallbackSelectors) {
          try {
            const element = document.querySelector(selector);
            if (element && element.getBoundingClientRect().height > 50) {
              console.log(`Found target section using fallback: ${selector}`);
              resolve(element);
              return;
            }
          } catch (error) {
            continue;
          }
        }
        
        // Tertiary: Manual text search as last resort
        const allSections = document.querySelectorAll('section, div[class*="space-y"], main > div');
        for (const section of allSections) {
          const text = section.textContent?.toLowerCase() || '';
          const hasTargetContent = text.includes(targetType);
          const rect = section.getBoundingClientRect();
          const isVisible = rect.height > 100 && rect.width > 0;
          
          if (hasTargetContent && isVisible) {
            console.log(`Found target section via text search for: ${targetType}`);
            resolve(section);
            return;
          }
        }
        
        if (attempt < maxAttempts) {
          const delay = isMobileDevice() ? 300 * attempt : 200 * attempt;
          console.log(`Section detection attempt ${attempt} failed, retrying in ${delay}ms...`);
          setTimeout(() => attemptFind(attempt + 1, maxAttempts), delay);
        } else {
          console.log('Failed to find target section after all attempts');
          resolve(null);
        }
      };
      
      attemptFind();
    });
  }, []);

  // Enhanced context-aware scroll with proper section targeting
  const performContextAwareScroll = useCallback(async (forceAttempt = false) => {
    if (scrollKey !== '/') return false;

    console.log('=== ENHANCED CONTEXT-AWARE SCROLL DEBUG ===');
    console.log('Mobile device detected:', isMobileDevice());
    
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
    const navigationMethod = detectNavigationMethod();
    
    let targetType = null;
    let targetSection = null;
    let contextSource = null;
    let shouldScroll = false;

    console.log('Navigation analysis:', {
      isFromDetailPage,
      navigationState,
      navigationMethod
    });

    // Primary: Check navigation state for direct type info
    if (isFromDetailPage && navigationState?.type) {
      targetType = navigationState.type;
      targetSection = `${targetType}-search`;
      shouldScroll = true;
      contextSource = 'navigation-state';
      console.log('Using navigation state:', { targetType, targetSection });
    }

    // Secondary: Check search context
    if (!targetType || forceAttempt) {
      const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
      if (searchContext) {
        try {
          const searchCtx: SearchContext = JSON.parse(searchContext);
          const contextTimeout = getContextTimeout();
          const isContextValid = Date.now() - searchCtx.timestamp < contextTimeout;
          const hasAttemptsLeft = searchCtx.scrollAttempts < MAX_SCROLL_ATTEMPTS;
          
          console.log('Search context analysis:', {
            isContextValid,
            hasAttemptsLeft,
            scrollAttempts: searchCtx.scrollAttempts,
            targetSection: searchCtx.targetSection,
            fromDetailScroll: searchCtx.fromDetailScroll
          });
          
          if (isContextValid && (hasAttemptsLeft || forceAttempt)) {
            targetType = searchCtx.type;
            targetSection = searchCtx.targetSection || `${targetType}-search`;
            contextSource = searchCtx.fromDetailScroll ? 'detail-scroll-context' : 'search-context';
            shouldScroll = true;
            
            // Update attempt count
            searchCtx.scrollAttempts += 1;
            searchCtx.navigationMethod = navigationMethod;
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
      
      // Optimized delay for mobile
      const scrollDelay = getScrollDelay();
      await new Promise(resolve => setTimeout(resolve, scrollDelay));
      
      // Find target section with enhanced detection
      const targetElement = await findTargetSection(targetType, targetSection);

      if (targetElement) {
        console.log(`Found target section for ${targetType}, scrolling...`);
        
        const elementRect = targetElement.getBoundingClientRect();
        const elementTop = elementRect.top + window.scrollY;
        const offset = isMobileDevice() ? 80 : 100; // Adjusted for mobile
        const targetScrollY = Math.max(0, elementTop - offset);
        
        // Mobile-optimized scroll behavior
        window.scrollTo({
          top: targetScrollY,
          behavior: isMobileDevice() ? 'auto' : 'smooth'
        });

        hasRestoredRef.current = true;
        
        // Cleanup after successful scroll
        setTimeout(() => {
          isRestoringRef.current = false;
          // Clean up context if max attempts reached
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
        }, 2000);

        return true;
      } else {
        console.log('Target section not found, using enhanced fallback scroll');
        
        // Enhanced fallback with viewport awareness
        const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
        let fallbackPosition = window.innerHeight * (isMobileDevice() ? 0.6 : 0.8);
        
        if (searchContext) {
          try {
            const searchCtx: SearchContext = JSON.parse(searchContext);
            if (searchCtx.lastScrollY && searchCtx.lastScrollY > 200) {
              const maxFallback = window.innerHeight * (isMobileDevice() ? 1.2 : 1.5);
              fallbackPosition = Math.min(searchCtx.lastScrollY, maxFallback);
            }
          } catch (error) {
            // Use default fallback
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
      console.error('Error in context-aware scroll:', error);
      isRestoringRef.current = false;
      return false;
    }
  }, [scrollKey, location.state, findTargetSection, location.pathname]);

  // Enhanced restore scroll position
  const restoreScrollPosition = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const navigationContext = `${location.pathname}-${location.state?.fromDetailPage}-${location.state?.type}-${detectNavigationMethod()}`;
    
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
    console.log('Navigation method:', detectNavigationMethod());
    
    // Enhanced context-aware scroll detection
    const isFromDetailPageOrBack = location.state?.fromDetailPage || 
                                  detectNavigationMethod() === 'touch-gesture' || 
                                  detectNavigationMethod() === 'browser-back';
    
    if (isFromDetailPageOrBack && location.state?.preserveState) {
      console.log('Coming from detail page or back navigation - using enhanced context-aware scroll');
      const scrolled = await performContextAwareScroll();
      if (scrolled) {
        console.log('Context-aware scroll successful');
        return;
      }
    }
    
    // Always try context-aware scroll if we have valid context
    const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
    if (searchContext) {
      try {
        const searchCtx: SearchContext = JSON.parse(searchContext);
        const contextTimeout = getContextTimeout();
        const isContextValid = Date.now() - searchCtx.timestamp < contextTimeout;
        
        if (isContextValid && searchCtx.scrollAttempts < MAX_SCROLL_ATTEMPTS) {
          console.log('Valid search context found, attempting context-aware scroll');
          const scrolled = await performContextAwareScroll();
          if (scrolled) {
            console.log('Context-aware scroll successful');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking search context:', error);
      }
    }
    
    if (savedPosition && savedPosition.y > 100 && !savedPosition.isAtBottom) {
      console.log('Using saved scroll position:', savedPosition);
      
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      const restoreDelay = getScrollDelay() + 100;
      await new Promise(resolve => setTimeout(resolve, restoreDelay));
      
      window.scrollTo({
        left: savedPosition.x,
        top: savedPosition.y,
        behavior: 'auto'
      });
      
      // Scroll verification with higher tolerance for mobile
      setTimeout(() => {
        const actualY = window.scrollY;
        const tolerance = isMobileDevice() ? 300 : 200;
        
        if (Math.abs(actualY - savedPosition.y) > tolerance) {
          console.log('Scroll verification failed, retrying...');
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: 'auto'
          });
        }
        
        isRestoringRef.current = false;
      }, isMobileDevice() ? 1000 : 600);
    } else {
      console.log('No meaningful saved position, trying context-aware scroll as fallback');
      await performContextAwareScroll(true);
    }
  }, [scrollKey, performContextAwareScroll, location.state, location.pathname]);

  // Enhanced scroll events handling
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringRef.current) return;
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Mobile-optimized debounce timing
      const debounceTime = isMobileDevice() ? 400 : 300;
      saveTimeoutRef.current = setTimeout(saveScrollPosition, debounceTime);
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
      navigationContextRef.current = null;
      
      const popstateDelay = isMobileDevice() ? 1000 : 600;
      setTimeout(async () => {
        console.log('Attempting enhanced popstate scroll restoration');
        await performContextAwareScroll(true);
      }, popstateDelay);
    };

    // Enhanced event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Mobile-specific events
    if (isMobileDevice()) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log('Mobile: Page became visible, checking scroll restoration');
          setTimeout(() => {
            if (!hasRestoredRef.current) {
              performContextAwareScroll(true);
            }
          }, 500);
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
    navigationContextRef.current = null;
    
    console.log('Cleared scroll position for:', keyToClear || scrollKey);
  }, [scrollKey]);

  return { clearScrollPosition, storeSearchContext };
};
