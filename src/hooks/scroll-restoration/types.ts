
export interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

export interface SearchContext {
  type: 'anime' | 'manga';
  query: string;
  timestamp: number;
}

export const SCROLL_RESTORATION_KEY = 'scroll-positions';
export const SEARCH_CONTEXT_KEY = 'search-context';
