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
  const timeoutRef = useRef<number>();

  // Save scroll position
  const saveScrollPosition = useCallback(() => {
    if (typeof window === 'undefined' || isRestoringRef.current) return;

    try {
      const scrollPositions = JSON.parse(
        sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
      );

      scrollPositions[scrollKey] = {
        x: window.scrollX,
        y: window.scrollY,
      };

      sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
    } catch (e) {
      console.warn('Failed to save scroll position:', e);
    }
  }, [scrollKey]);

  // Restore scroll position with proper timing
  const restoreScrollPosition = useCallback(() => {
    if (typeof window === 'undefined' || hasRestoredRef.current) return;

    let scrollPositions: Record<string, ScrollPosition> = {};
    try {
      scrollPositions = JSON.parse(
        sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
      );
    } catch (e) {
      console.warn('Failed to load scroll position:', e);
    }

    const savedPosition = scrollPositions[scrollKey];

    if (savedPosition) {
      isRestoringRef.current = true;
      hasRestoredRef.current = true;

      const attemptRestore = (attempts = 0) => {
        if (attempts > 50) {
          isRestoringRef.current = false;
          return;
        }

        const hasContent = document.body.scrollHeight > window.innerHeight;

        if (hasContent) {
          requestAnimationFrame(() => {
            window.scrollTo(savedPosition.x, savedPosition.y);

            setTimeout(() => {
              const currentY = window.scrollY;
              const targetY = savedPosition.y;

              if (Math.abs(currentY - targetY) > 10 && attempts < 20) {
                attemptRestore(attempts + 1);
              } else {
                isRestoringRef.current = false;
              }
            }, 50);
          });
        } else {
          setTimeout(() => attemptRestore(attempts + 1), 100);
        }
      };

      attemptRestore();
    }
  }, [scrollKey]);

  // Save scroll position on scroll events
  useEffect(() => {
    let timeoutId: number;

    const handleScroll = () => {
      if (isRestoringRef.current) return;

      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(saveScrollPosition, 150);
    };

    const handleBeforeUnload = () => {
      clearTimeout(timeoutId);
      saveScrollPosition();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveScrollPosition();
    };
  }, [saveScrollPosition]);

  // Restore scroll position when component mounts
  useEffect(() => {
    hasRestoredRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const restoreWithDelay = () => {
      restoreScrollPosition();
    };

    if (document.readyState === 'complete') {
      restoreWithDelay();
    } else {
      const handleLoad = () => {
        restoreWithDelay();
        window.removeEventListener('load', handleLoad);
      };

      window.addEventListener('load', handleLoad);

      if (document.readyState === 'interactive') {
        setTimeout(restoreWithDelay, 50);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scrollKey, restoreScrollPosition]);

  // Clear stored scroll position
  const clearScrollPosition = useCallback(
    (keyToClear?: string) => {
      if (typeof window === 'undefined') return;

      try {
        const scrollPositions = JSON.parse(
          sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
        );

        delete scrollPositions[keyToClear || scrollKey];
        sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
      } catch (e) {
        console.warn('Failed to clear scroll position:', e);
      }

      hasRestoredRef.current = false;
      isRestoringRef.current = false;
    },
    [scrollKey]
  );

  return { clearScrollPosition };
};
