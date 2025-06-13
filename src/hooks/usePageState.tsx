import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageState {
  animeSearchQuery: string;
  mangaSearchQuery: string;
  animeSearchResults: any[];
  mangaSearchResults: any[];
  isSearchingAnime: boolean;
  isSearchingManga: boolean;
  animeRecommendations: any[];
  mangaRecommendations: any[];
  hasRecommendations: boolean;
  currentGenres: string[];
  currentYearRange: string;
  animeCurrentPage: number;
  mangaCurrentPage: number;
  hasMoreAnime: boolean;
  hasMoreManga: boolean;
}

const initialState: PageState = {
  animeSearchQuery: '',
  mangaSearchQuery: '',
  animeSearchResults: [],
  mangaSearchResults: [],
  isSearchingAnime: false,
  isSearchingManga: false,
  animeRecommendations: [],
  mangaRecommendations: [],
  hasRecommendations: false,
  currentGenres: [],
  currentYearRange: 'any',
  animeCurrentPage: 1,
  mangaCurrentPage: 1,
  hasMoreAnime: false,
  hasMoreManga: false,
};

export const usePageState = () => {
  const location = useLocation();
  const [pageState, setPageState] = useState<PageState>(() => {
    // Try to restore state from sessionStorage on initial load
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('pageState');
      if (savedState) {
        try {
          return { ...initialState, ...JSON.parse(savedState) };
        } catch (error) {
          console.log('Failed to parse saved state');
        }
      }
    }
    return initialState;
  });

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pageState', JSON.stringify(pageState));
    }
  }, [pageState]);

  // Only reset search results when coming from external navigation (not back button)
  useEffect(() => {
    if (location.pathname === '/' && !window.history.state?.fromDetailPage) {
      // This is a fresh navigation to home, not a back button press
      // Keep recommendations but clear search if user navigated away from detail pages
    }
  }, [location.pathname]);

  const updatePageState = (updates: Partial<PageState>) => {
    setPageState(prev => ({ ...prev, ...updates }));
  };

  const resetPageState = () => {
    setPageState(initialState);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pageState');
    }
  };

  return {
    pageState,
    updatePageState,
    resetPageState,
  };
};
