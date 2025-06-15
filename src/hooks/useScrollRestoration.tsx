
import { useEffect } from 'react';
import { saveScrollPosition } from './scroll-restoration/scrollStorage';
import { restoreScrollPosition } from './scroll-restoration/scrollRestoration';
import { storeSearchContext } from './scroll-restoration/scrollStorage';

export const useScrollRestoration = (scrollKey: string = window.location.pathname) => {
  useEffect(() => {
    // Restore scroll position when component mounts
    const restore = async () => {
      await restoreScrollPosition(scrollKey);
    };
    
    // Wait a bit for content to load before restoring
    const timeoutId = setTimeout(restore, 100);
    
    // Also listen for custom event indicating content is ready
    const handleContentReady = () => {
      restoreScrollPosition(scrollKey);
    };
    
    window.addEventListener('home-content-ready', handleContentReady);
    
    // Save scroll position when component unmounts or page changes
    const handleSaveScroll = () => {
      saveScrollPosition(scrollKey);
    };
    
    window.addEventListener('beforeunload', handleSaveScroll);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('home-content-ready', handleContentReady);
      window.removeEventListener('beforeunload', handleSaveScroll);
      // Save scroll position when component unmounts
      saveScrollPosition(scrollKey);
    };
  }, [scrollKey]);

  // Return utility functions for external use
  return {
    saveScrollPosition: () => saveScrollPosition(scrollKey),
    clearScrollPosition: () => {
      if (typeof window !== 'undefined') {
        const scrollPositions = JSON.parse(
          sessionStorage.getItem('scroll-positions') || '{}'
        );
        delete scrollPositions[scrollKey];
        sessionStorage.setItem('scroll-positions', JSON.stringify(scrollPositions));
      }
    },
    storeSearchContext
  };
};
