
import { ScrollPosition, SearchContext, SCROLL_RESTORATION_KEY, SEARCH_CONTEXT_KEY } from './types';

export const saveScrollPosition = (scrollKey: string) => {
  if (typeof window === 'undefined') return;
  
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
};

export const getScrollPosition = (scrollKey: string): ScrollPosition | null => {
  if (typeof window === 'undefined') return null;
  
  const scrollPositions = JSON.parse(
    sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
  );
  
  return scrollPositions[scrollKey] || null;
};

export const clearScrollPosition = (scrollKey: string) => {
  if (typeof window === 'undefined') return;
  
  const scrollPositions = JSON.parse(
    sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
  );
  
  delete scrollPositions[scrollKey];
  sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
};

export const storeSearchContext = (type: 'anime' | 'manga', query: string) => {
  if (typeof window === 'undefined') return;
  
  const searchContext: SearchContext = {
    type,
    query,
    timestamp: Date.now()
  };
  
  sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(searchContext));
  console.log('Stored search context:', searchContext);
};

export const getSearchContext = (): SearchContext | null => {
  if (typeof window === 'undefined') return null;
  
  const searchContext = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
  if (!searchContext) return null;
  
  try {
    const searchCtx = JSON.parse(searchContext);
    if (Date.now() - searchCtx.timestamp < 30000) { // 30 seconds validity
      return searchCtx;
    }
    sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
    return null;
  } catch (error) {
    console.error('Error parsing search context:', error);
    sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
    return null;
  }
};

export const getReturnContext = () => {
  if (typeof window === 'undefined') return null;
  
  const returnContext = sessionStorage.getItem('return-context');
  if (!returnContext) return null;
  
  try {
    const returnCtx = JSON.parse(returnContext);
    if (returnCtx.fromDetailPage && Date.now() - returnCtx.timestamp < 10000) {
      return returnCtx;
    }
    sessionStorage.removeItem('return-context');
    return null;
  } catch (error) {
    console.error('Error parsing return context:', error);
    sessionStorage.removeItem('return-context');
    return null;
  }
};
