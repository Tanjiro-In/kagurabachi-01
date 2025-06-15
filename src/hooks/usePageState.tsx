
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
  // New state properties for better preservation
  lastActiveSection: 'trending' | 'search' | 'recommendations';
  expandedStates: Record<string, boolean>;
  filterStates: Record<string, any>;
  loadingStates: Record<string, boolean>;
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
  lastActiveSection: 'trending',
  expandedStates: {},
  filterStates: {},
  loadingStates: {},
};

export const usePageState = () => {
  const location = useLocation();
  const [pageState, setPageState] = useState<PageState>(() => {
    // Try to restore state from sessionStorage on initial load
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('pageState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          console.log('Restored page state from sessionStorage:', parsed);
          return { ...initialState, ...parsed };
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

  // Track navigation state to preserve context
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Only handle home page navigation
    if (currentPath === '/') {
      // Check if this is navigation back from detail page using React Router state
      const isFromDetailPage = location.state?.fromDetailPage === true;
      const preserveState = location.state?.preserveState === true;
      
      console.log('Navigation to home page detected:', {
        isFromDetailPage,
        preserveState,
        locationState: location.state,
        pathname: currentPath
      });
      
      // Don't reset state when navigating back from detail pages
      if (isFromDetailPage && preserveState) {
        console.log('Preserving state - user came from detail page');
        // Clear the navigation state to prevent issues on subsequent navigations
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
        return;
      }
      
      // Only reset on actual page refresh (not navigation)
      // Check if this is a genuine page refresh by looking at performance navigation timing
      const isPageRefresh = window.performance?.getEntriesByType?.('navigation')?.[0]?.type === 'reload';
      
      if (isPageRefresh) {
        console.log('Page refresh detected - clearing state');
        resetPageState();
      } else {
        console.log('Navigation detected (not refresh) - preserving state');
      }
    }
  }, [location]);

  const updatePageState = (updates: Partial<PageState>) => {
    setPageState(prev => {
      const newState = { ...prev, ...updates };
      
      // Automatically update lastActiveSection based on what's being updated
      if (updates.isSearchingAnime || updates.isSearchingManga) {
        newState.lastActiveSection = 'search';
      } else if (updates.hasRecommendations) {
        newState.lastActiveSection = 'recommendations';
      } else if (!updates.isSearchingAnime && !updates.isSearchingManga && !updates.hasRecommendations) {
        newState.lastActiveSection = 'trending';
      }
      
      return newState;
    });
  };

  const updateExpandedState = (key: string, value: boolean) => {
    setPageState(prev => ({
      ...prev,
      expandedStates: {
        ...prev.expandedStates,
        [key]: value
      }
    }));
  };

  const updateFilterState = (key: string, value: any) => {
    setPageState(prev => ({
      ...prev,
      filterStates: {
        ...prev.filterStates,
        [key]: value
      }
    }));
  };

  const updateLoadingState = (key: string, value: boolean) => {
    setPageState(prev => ({
      ...prev,
      loadingStates: {
        ...prev.loadingStates,
        [key]: value
      }
    }));
  };

  const resetPageState = () => {
    console.log('Resetting page state to initial values');
    setPageState(initialState);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pageState');
    }
  };

  const preserveNavigationState = () => {
    // Mark that we're navigating to a detail page
    if (window.history.pushState) {
      window.history.replaceState(
        { ...(window.history.state || {}), fromDetailPage: false },
        ''
      );
    }
  };

  return {
    pageState,
    updatePageState,
    updateExpandedState,
    updateFilterState,
    updateLoadingState,
    resetPageState,
    preserveNavigationState,
  };
};
