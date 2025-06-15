
import { ScrollPosition } from './types';
import { getScrollPosition } from './scrollStorage';
import { performAutoScroll } from './autoScroll';

export const restoreScrollPosition = async (scrollKey: string) => {
  if (typeof window === 'undefined') return;

  const savedPosition = getScrollPosition(scrollKey);
  
  console.log('Attempting to restore scroll for', scrollKey, savedPosition);
  
  if (savedPosition && (savedPosition.x > 0 || savedPosition.y > 0)) {
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
        } else {
          console.log('Exact scroll restoration failed after all attempts, but position is acceptable');
          // Do NOT fallback to auto-scroll here - the position is close enough
        }
      }, 300 * attempt); // Increasing delay for each attempt
    };
    
    verifyAndRetry();
    return true; // Indicate that we attempted exact restoration
  } else {
    console.log('No saved position found for', scrollKey, '- trying auto-scroll');
    // Only use auto-scroll if there's absolutely no saved position
    setTimeout(() => performAutoScroll(scrollKey), 500);
    return false; // Indicate that we used auto-scroll
  }
};
