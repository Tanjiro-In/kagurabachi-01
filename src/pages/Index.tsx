import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '../components/HeroSection';
import AIRecommendations from '../components/AIRecommendations';
import RecommendationSections from '../components/RecommendationSections';
import SearchResultsSection from '../components/SearchResultsSection';
import TrendingContentSection from '../components/TrendingContentSection';
import { usePageState } from '../hooks/usePageState';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { 
  fetchTrendingAnimeAniList, 
  fetchTrendingMangaAniList, 
  searchAnimeAniList, 
  searchMangaAniList,
  fetchAnimeByGenresAniList,
  fetchMangaByGenresAniList
} from '../services/anilistApi';
import { convertAniListToJikan } from '../utils/dataConverter';

// Keep some genres data for the AI recommendations component
const POPULAR_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller', 'Mystery', 'Horror'
];

const createMockGenres = () => {
  return POPULAR_GENRES.map((name, index) => ({ mal_id: index + 1, name }));
};

const Index = () => {
  const { pageState, updatePageState, resetPageState, updateExpandedState, updateLoadingState } = usePageState();
  // Get both scroll restoration functions
  const { clearScrollPosition, storeSearchContext } = useScrollRestoration();
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isLoadingMoreAnime, setIsLoadingMoreAnime] = useState(false);
  const [isLoadingMoreManga, setIsLoadingMoreManga] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Clear scroll position only when explicitly resetting
  const handleReset = () => {
    resetPageState();
    clearScrollPosition();
    setIsLoadingRecommendations(false);
  };

  // Fetch trending anime from AniList
  const {
    data: trendingAnimeData,
    isLoading: trendingAnimeLoading
  } = useQuery({
    queryKey: ['trending-anime-anilist'],
    queryFn: async () => {
      const anilistData = await fetchTrendingAnimeAniList();
      return anilistData.map(convertAniListToJikan);
    }
  });

  // Fetch trending manga from AniList
  const {
    data: trendingMangaData,
    isLoading: trendingMangaLoading
  } = useQuery({
    queryKey: ['trending-manga-anilist'],
    queryFn: async () => {
      const anilistData = await fetchTrendingMangaAniList();
      return anilistData.map(convertAniListToJikan);
    }
  });

  // Mark content as loaded when data is available and notify scroll restoration
  useEffect(() => {
    const hasData = trendingAnimeData || trendingMangaData || 
                   pageState.animeSearchResults.length > 0 || 
                   pageState.mangaSearchResults.length > 0 ||
                   pageState.animeRecommendations.length > 0 ||
                   pageState.mangaRecommendations.length > 0;
    
    if (hasData && !contentLoaded) {
      // Mark content as loaded for scroll restoration
      setTimeout(() => {
        setContentLoaded(true);
        // Signal that content is ready for scroll restoration
        window.dispatchEvent(new CustomEvent('home-content-ready', {
          detail: { 
            section: pageState.lastActiveSection,
            hasSearchResults: pageState.isSearchingAnime || pageState.isSearchingManga,
            hasRecommendations: pageState.hasRecommendations
          }
        }));
      }, 100);
    }
  }, [trendingAnimeData, trendingMangaData, pageState, contentLoaded]);

  const handleAnimeSearch = async (query: string) => {
    if (!query.trim()) {
      updatePageState({
        animeSearchResults: [],
        isSearchingAnime: false,
        animeSearchQuery: ''
      });
      return;
    }
    
    // Store search context for auto-scroll
    storeSearchContext('anime', query);
    
    updatePageState({
      isSearchingAnime: true,
      animeSearchQuery: query,
      hasRecommendations: false
    });
    
    updateLoadingState('animeSearch', true);
    
    try {
      const data = await searchAnimeAniList(query);
      updatePageState({
        animeSearchResults: data.map(convertAniListToJikan)
      });
    } catch (error) {
      console.error('Anime search failed:', error);
      updatePageState({
        animeSearchResults: []
      });
    } finally {
      updateLoadingState('animeSearch', false);
    }
  };

  const handleMangaSearch = async (query: string) => {
    if (!query.trim()) {
      updatePageState({
        mangaSearchResults: [],
        isSearchingManga: false,
        mangaSearchQuery: ''
      });
      return;
    }
    
    // Store search context for auto-scroll
    storeSearchContext('manga', query);
    
    updatePageState({
      isSearchingManga: true,
      mangaSearchQuery: query,
      hasRecommendations: false
    });
    
    updateLoadingState('mangaSearch', true);
    
    try {
      const data = await searchMangaAniList(query);
      updatePageState({
        mangaSearchResults: data.map(convertAniListToJikan)
      });
    } catch (error) {
      console.error('Manga search failed:', error);
      updatePageState({
        mangaSearchResults: []
      });
    } finally {
      updateLoadingState('mangaSearch', false);
    }
  };

  const handleResetAnimeSearch = () => {
    updatePageState({
      animeSearchResults: [],
      isSearchingAnime: false,
      animeSearchQuery: ''
    });
  };

  const handleResetMangaSearch = () => {
    updatePageState({
      mangaSearchResults: [],
      isSearchingManga: false,
      mangaSearchQuery: ''
    });
  };

  const handleRecommendationRequest = async (genres: string[], yearRange: string) => {
    // Handle reset case - only reset recommendations, not search results
    if (yearRange === 'reset') {
      updatePageState({
        animeRecommendations: [],
        mangaRecommendations: [],
        hasRecommendations: false,
        currentGenres: [],
        currentYearRange: 'any',
        animeCurrentPage: 1,
        mangaCurrentPage: 1,
        hasMoreAnime: false,
        hasMoreManga: false
      });
      setIsLoadingRecommendations(false);
      updateLoadingState('recommendations', false);
      return;
    }

    console.log('Starting recommendation request with genres:', genres, 'and year:', yearRange);
    setIsLoadingRecommendations(true);
    updateLoadingState('recommendations', true);
    
    updatePageState({
      isSearchingAnime: false,
      isSearchingManga: false,
      animeSearchResults: [],
      mangaSearchResults: [],
      currentGenres: genres,
      currentYearRange: yearRange,
      animeCurrentPage: 1,
      mangaCurrentPage: 1
    });

    try {
      const [animeResult, mangaResult] = await Promise.all([
        fetchAnimeByGenresAniList(genres, yearRange, 1),
        fetchMangaByGenresAniList(genres, yearRange, 1)
      ]);
      
      console.log('Final anime recommendations:', animeResult.data);
      console.log('Final manga recommendations:', mangaResult.data);
      
      updatePageState({
        animeRecommendations: animeResult.data.map(convertAniListToJikan),
        mangaRecommendations: mangaResult.data.map(convertAniListToJikan),
        hasMoreAnime: animeResult.hasNextPage,
        hasMoreManga: mangaResult.hasNextPage,
        hasRecommendations: true
      });
    } catch (error) {
      console.error('Recommendation fetch failed:', error);
      updatePageState({
        animeRecommendations: [],
        mangaRecommendations: [],
        hasMoreAnime: false,
        hasMoreManga: false,
        hasRecommendations: true
      });
    } finally {
      setIsLoadingRecommendations(false);
      updateLoadingState('recommendations', false);
    }
  };

  const handleLoadMoreAnime = async () => {
    if (isLoadingMoreAnime || !pageState.hasMoreAnime) return;
    
    setIsLoadingMoreAnime(true);
    const nextPage = pageState.animeCurrentPage + 1;
    
    try {
      const result = await fetchAnimeByGenresAniList(pageState.currentGenres, pageState.currentYearRange, nextPage);
      updatePageState({
        animeRecommendations: [...pageState.animeRecommendations, ...result.data.map(convertAniListToJikan)],
        hasMoreAnime: result.hasNextPage,
        animeCurrentPage: nextPage
      });
    } catch (error) {
      console.error('Failed to load more anime:', error);
    } finally {
      setIsLoadingMoreAnime(false);
    }
  };

  const handleLoadMoreManga = async () => {
    if (isLoadingMoreManga || !pageState.hasMoreManga) return;
    
    setIsLoadingMoreManga(true);
    const nextPage = pageState.mangaCurrentPage + 1;
    
    try {
      const result = await fetchMangaByGenresAniList(pageState.currentGenres, pageState.currentYearRange, nextPage);
      updatePageState({
        mangaRecommendations: [...pageState.mangaRecommendations, ...result.data.map(convertAniListToJikan)],
        hasMoreManga: result.hasNextPage,
        mangaCurrentPage: nextPage
      });
    } catch (error) {
      console.error('Failed to load more manga:', error);
    } finally {
      setIsLoadingMoreManga(false);
    }
  };

  const mockGenres = createMockGenres();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection onAnimeSearch={handleAnimeSearch} onMangaSearch={handleMangaSearch} />

      <div className="max-w-7xl mx-auto px-4 space-y-12 md:space-y-16 pb-16 md:pb-20">
        {/* AI Recommendations */}
        <div data-section="ai-recommendations">
          <AIRecommendations 
            animeGenres={mockGenres} 
            mangaGenres={mockGenres} 
            onRecommendationRequest={handleRecommendationRequest} 
            isLoading={false} 
          />
        </div>

        {/* AI Recommendation Results */}
        {pageState.hasRecommendations && (
          <div data-section="recommendation-results">
            <RecommendationSections
              animeRecommendations={pageState.animeRecommendations}
              mangaRecommendations={pageState.mangaRecommendations}
              isLoading={isLoadingRecommendations}
              onLoadMoreAnime={handleLoadMoreAnime}
              onLoadMoreManga={handleLoadMoreManga}
              hasMoreAnime={pageState.hasMoreAnime}
              hasMoreManga={pageState.hasMoreManga}
              isLoadingMoreAnime={isLoadingMoreAnime}
              isLoadingMoreManga={isLoadingMoreManga}
            />
          </div>
        )}

        {/* Search Results */}
        <div data-section="search-results">
          <SearchResultsSection
            isSearchingAnime={pageState.isSearchingAnime}
            isSearchingManga={pageState.isSearchingManga}
            animeSearchQuery={pageState.animeSearchQuery}
            mangaSearchQuery={pageState.mangaSearchQuery}
            animeSearchResults={pageState.animeSearchResults}
            mangaSearchResults={pageState.mangaSearchResults}
            onResetAnimeSearch={handleResetAnimeSearch}
            onResetMangaSearch={handleResetMangaSearch}
          />
        </div>

        {/* Trending Content - only show if not searching or getting recommendations */}
        {!pageState.isSearchingAnime && !pageState.isSearchingManga && !pageState.hasRecommendations && (
          <div data-section="trending-content">
            <TrendingContentSection
              trendingAnimeData={trendingAnimeData}
              trendingMangaData={trendingMangaData}
              trendingAnimeLoading={trendingAnimeLoading}
              trendingMangaLoading={trendingMangaLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
