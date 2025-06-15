
import { getSearchContext, getReturnContext } from './scrollStorage';

export const performAutoScroll = (scrollKey: string) => {
  if (scrollKey !== '/') return;

  // Check for search context first
  const searchContext = getSearchContext();
  const returnContext = getReturnContext();
  
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

  if (!contextToUse) return;

  console.log('Performing auto-scroll for', contextToUse.type, isSearchContext ? '(search context)' : '(detail page context)');

  // Find the appropriate section to scroll to
  let targetElement: Element | null = null;
  
  if (contextToUse.type === 'anime') {
    // For search context, prioritize search results
    if (isSearchContext) {
      targetElement = 
        document.querySelector('[data-section="anime-search"]') ||
        document.querySelector('[data-section="anime-recommendations"]') ||
        document.querySelector('[data-section="trending-anime"]');
    } else {
      // For detail page returns, prioritize recommendations/trending
      targetElement = 
        document.querySelector('[data-section="anime-recommendations"]') ||
        document.querySelector('[data-section="anime-search"]') ||
        document.querySelector('[data-section="trending-anime"]');
    }
  } else if (contextToUse.type === 'manga') {
    // For search context, prioritize search results
    if (isSearchContext) {
      targetElement = 
        document.querySelector('[data-section="manga-search"]') ||
        document.querySelector('[data-section="manga-recommendations"]') ||
        document.querySelector('[data-section="trending-manga"]');
    } else {
      // For detail page returns, prioritize recommendations/trending
      targetElement = 
        document.querySelector('[data-section="manga-recommendations"]') ||
        document.querySelector('[data-section="manga-search"]') ||
        document.querySelector('[data-section="trending-manga"]');
    }
  }

  if (targetElement) {
    console.log('Auto-scrolling to', contextToUse.type, 'section');
    
    // Smooth scroll to the section with a small offset
    const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;
    const offset = 100; // 100px offset from top
    
    window.scrollTo({
      top: Math.max(0, elementTop - offset),
      behavior: 'smooth'
    });

    // Clear the appropriate context after successful scroll
    setTimeout(() => {
      if (isSearchContext) {
        sessionStorage.removeItem('search-context');
      } else {
        sessionStorage.removeItem('return-context');
      }
    }, 2000);
  } else {
    console.log('Target section not found for auto-scroll');
  }
};
