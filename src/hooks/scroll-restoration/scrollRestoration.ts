
import { ScrollPosition } from './types';
import { getScrollPosition } from './scrollStorage';
import { performAutoScroll } from './autoScroll';

export const restoreScrollPosition = async (scrollKey: string) => {
  if (typeof window === 'undefined') return;

  const savedPosition = getScrollPosition(scrollKey);
  
  console.log('=== SCROLL RESTORATION DEBUG ===');
  console.log('Attempting to restore scroll for key:', scrollKey);
  console.log('Saved position:', savedPosition);
  console.log('Current scroll position:', { x: window.scrollX, y: window.scrollY });
  
  if (savedPosition && (savedPosition.x > 0 || savedPosition.y > 0)) {
    console.log('Found saved position, attempting exact restoration:', savedPosition);
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check if we're coming from a detail page
    const returnContext = sessionStorage.getItem('return-context');
    console.log('Return context found:', returnContext);
    
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
        const tolerance = 200;
        
        console.log(`Attempt ${attempt}: Current Y: ${actualY}, Target Y: ${targetY}, Difference: ${Math.abs(actualY - targetY)}`);
        
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
          console.log('Exact scroll restoration failed after all attempts, falling back to auto-scroll');
          // Fallback to auto-scroll if exact restoration repeatedly fails
          setTimeout(() => performAutoScroll(scrollKey), 500);
        }
      }, 300 * attempt);
    };
    
    verifyAndRetry();
    return true;
  } else {
    console.log('No saved position found for', scrollKey, '- trying auto-scroll');
    setTimeout(() => performAutoScroll(scrollKey), 500);
    return false;
  }
};
