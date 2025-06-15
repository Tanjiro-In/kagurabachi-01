
import { getSearchContext, getReturnContext } from './scrollStorage';

export const performAutoScroll = (scrollKey: string) => {
  console.log('=== AUTO-SCROLL DEBUG ===');
  console.log('Auto-scroll triggered for key:', scrollKey);
  
  if (scrollKey !== '/') {
    console.log('Not home page, skipping auto-scroll');
    return;
  }

  // Check for search context first
  const searchContext = getSearchContext();
  const returnContext = getReturnContext();
  
  console.log('Search context:', searchContext);
  console.log('Return context:', returnContext);
  
  let contextToUse = null;
  let isSearchContext = false;

  // Prioritize search context if it's more recent
  if (searchContext) {
    contextToUse = searchContext;
    isSearchContext = true;
  } else if (returnContext) {
    contextToUse = returnContext;
    isSearchContext = false;
  }

  if (!contextToUse) {
    console.log('No context found for auto-scroll');
    return;
  }

  console.log('Using context for auto-scroll:', contextToUse, isSearchContext ? '(search)' : '(detail page)');

  // Find the appropriate section to scroll to
  let targetElement: Element | null = null;
  
  if (contextToUse.type === 'anime') {
    if (isSearchContext) {
      targetElement = 
        document.querySelector('[data-section="anime-search"]') ||
        document.querySelector('[data-section="anime-recommendations"]') ||
        document.querySelector('[data-section="trending-anime"]');
    } else {
      targetElement = 
        document.querySelector('[data-section="anime-recommendations"]') ||
        document.querySelector('[data-section="anime-search"]') ||
        document.querySelector('[data-section="trending-anime"]');
    }
  } else if (contextToUse.type === 'manga') {
    if (isSearchContext) {
      targetElement = 
        document.querySelector('[data-section="manga-search"]') ||
        document.querySelector('[data-section="manga-recommendations"]') ||
        document.querySelector('[data-section="trending-manga"]');
    } else {
      targetElement = 
        document.querySelector('[data-section="manga-recommendations"]') ||
        document.querySelector('[data-section="manga-search"]') ||
        document.querySelector('[data-section="trending-manga"]');
    }
  }

  console.log('Target element found:', targetElement);

  if (targetElement) {
    console.log('Auto-scrolling to', contextToUse.type, 'section');
    
    const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;
    const offset = 100;
    const targetY = Math.max(0, elementTop - offset);
    
    console.log('Scrolling to Y position:', targetY);
    
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });

    // Clear the appropriate context after successful scroll
    setTimeout(() => {
      if (isSearchContext) {
        sessionStorage.removeItem('search-context');
        console.log('Cleared search context');
      } else {
        sessionStorage.removeItem('return-context');
        console.log('Cleared return context');
      }
    }, 2000);
  } else {
    console.log('Target section not found for auto-scroll');
  }
};
