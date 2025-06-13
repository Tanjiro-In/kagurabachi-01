import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import MangaSearchBar from '../components/MangaSearchBar';
import AIRecommendations from '../components/AIRecommendations';
import RecommendationSections from '../components/RecommendationSections';
import TrendingSection from '../components/TrendingSection';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimeCard from '../components/AnimeCard';
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
  const location = useLocation();
  const [animeSearchQuery, setAnimeSearchQuery] = useState('');
  const [mangaSearchQuery, setMangaSearchQuery] = useState('');
  const [animeSearchResults, setAnimeSearchResults] = useState<any[]>([]);
  const [mangaSearchResults, setMangaSearchResults] = useState<any[]>([]);
  const [isSearchingAnime, setIsSearchingAnime] = useState(false);
  const [isSearchingManga, setIsSearchingManga] = useState(false);
  const [animeRecommendations, setAnimeRecommendations] = useState<any[]>([]);
  const [mangaRecommendations, setMangaRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [currentGenres, setCurrentGenres] = useState<string[]>([]);
  const [currentYearRange, setCurrentYearRange] = useState<string>('any');
  const [animeCurrentPage, setAnimeCurrentPage] = useState(1);
  const [mangaCurrentPage, setMangaCurrentPage] = useState(1);
  const [hasMoreAnime, setHasMoreAnime] = useState(false);
  const [hasMoreManga, setHasMoreManga] = useState(false);
  const [isLoadingMoreAnime, setIsLoadingMoreAnime] = useState(false);
  const [isLoadingMoreManga, setIsLoadingMoreManga] = useState(false);

  // Reset only search results when coming back to home page, but keep recommendations
  useEffect(() => {
    if (location.pathname === '/') {
      setIsSearchingAnime(false);
      setIsSearchingManga(false);
      setAnimeSearchResults([]);
      setMangaSearchResults([]);
    }
  }, [location.pathname]);

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

  const handleAnimeSearch = async (query: string) => {
    if (!query.trim()) {
      setAnimeSearchResults([]);
      setIsSearchingAnime(false);
      return;
    }
    setIsSearchingAnime(true);
    setAnimeSearchQuery(query);
    setHasRecommendations(false);
    try {
      const data = await searchAnimeAniList(query);
      setAnimeSearchResults(data.map(convertAniListToJikan));
    } catch (error) {
      console.error('Anime search failed:', error);
      setAnimeSearchResults([]);
    }
  };

  const handleMangaSearch = async (query: string) => {
    if (!query.trim()) {
      setMangaSearchResults([]);
      setIsSearchingManga(false);
      return;
    }
    setIsSearchingManga(true);
    setMangaSearchQuery(query);
    setHasRecommendations(false);
    try {
      const data = await searchMangaAniList(query);
      setMangaSearchResults(data.map(convertAniListToJikan));
    } catch (error) {
      console.error('Manga search failed:', error);
      setMangaSearchResults([]);
    }
  };

  const handleRecommendationRequest = async (genres: string[], yearRange: string) => {
    // Handle reset case
    if (yearRange === 'reset') {
      setHasRecommendations(false);
      setAnimeRecommendations([]);
      setMangaRecommendations([]);
      setIsLoadingRecommendations(false);
      setCurrentGenres([]);
      setCurrentYearRange('any');
      setAnimeCurrentPage(1);
      setMangaCurrentPage(1);
      setHasMoreAnime(false);
      setHasMoreManga(false);
      return;
    }

    console.log('Starting recommendation request with genres:', genres, 'and year:', yearRange);
    setIsLoadingRecommendations(true);
    setIsSearchingAnime(false);
    setIsSearchingManga(false);
    setAnimeSearchResults([]);
    setMangaSearchResults([]);
    setCurrentGenres(genres);
    setCurrentYearRange(yearRange);
    setAnimeCurrentPage(1);
    setMangaCurrentPage(1);

    try {
      const [animeResult, mangaResult] = await Promise.all([
        fetchAnimeByGenresAniList(genres, yearRange, 1),
        fetchMangaByGenresAniList(genres, yearRange, 1)
      ]);
      
      console.log('Final anime recommendations:', animeResult.data);
      console.log('Final manga recommendations:', mangaResult.data);
      
      setAnimeRecommendations(animeResult.data.map(convertAniListToJikan));
      setMangaRecommendations(mangaResult.data.map(convertAniListToJikan));
      setHasMoreAnime(animeResult.hasNextPage);
      setHasMoreManga(mangaResult.hasNextPage);
      setHasRecommendations(true);
    } catch (error) {
      console.error('Recommendation fetch failed:', error);
      setAnimeRecommendations([]);
      setMangaRecommendations([]);
      setHasMoreAnime(false);
      setHasMoreManga(false);
      setHasRecommendations(true);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleLoadMoreAnime = async () => {
    if (isLoadingMoreAnime || !hasMoreAnime) return;
    
    setIsLoadingMoreAnime(true);
    const nextPage = animeCurrentPage + 1;
    
    try {
      const result = await fetchAnimeByGenresAniList(currentGenres, currentYearRange, nextPage);
      setAnimeRecommendations(prev => [...prev, ...result.data.map(convertAniListToJikan)]);
      setHasMoreAnime(result.hasNextPage);
      setAnimeCurrentPage(nextPage);
    } catch (error) {
      console.error('Failed to load more anime:', error);
    } finally {
      setIsLoadingMoreAnime(false);
    }
  };

  const handleLoadMoreManga = async () => {
    if (isLoadingMoreManga || !hasMoreManga) return;
    
    setIsLoadingMoreManga(true);
    const nextPage = mangaCurrentPage + 1;
    
    try {
      const result = await fetchMangaByGenresAniList(currentGenres, currentYearRange, nextPage);
      setMangaRecommendations(prev => [...prev, ...result.data.map(convertAniListToJikan)]);
      setHasMoreManga(result.hasNextPage);
      setMangaCurrentPage(nextPage);
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
      <div className="relative py-12 md:py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div className="relative max-w-6xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-7xl gradient-text font-bold">
              Kagura<span className="text-foreground">bachi</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Discover the best anime and manga recommendations with AI-powered suggestions
            </p>
          </div>
          
          {/* Dual Search Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
            <div className="space-y-2">
              <h3 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Search Anime</h3>
              <SearchBar onSearch={handleAnimeSearch} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Search Manga</h3>
              <MangaSearchBar onSearch={handleMangaSearch} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-12 md:space-y-16 pb-16 md:pb-20">
        {/* AI Recommendations */}
        <AIRecommendations 
          animeGenres={mockGenres} 
          mangaGenres={mockGenres} 
          onRecommendationRequest={handleRecommendationRequest} 
          isLoading={false} 
        />

        {/* AI Recommendation Results */}
        {hasRecommendations && (
          <RecommendationSections
            animeRecommendations={animeRecommendations}
            mangaRecommendations={mangaRecommendations}
            isLoading={isLoadingRecommendations}
            onLoadMoreAnime={handleLoadMoreAnime}
            onLoadMoreManga={handleLoadMoreManga}
            hasMoreAnime={hasMoreAnime}
            hasMoreManga={hasMoreManga}
            isLoadingMoreAnime={isLoadingMoreAnime}
            isLoadingMoreManga={isLoadingMoreManga}
          />
        )}

        {/* Anime Search Results */}
        {isSearchingAnime && (
          <section className="space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center gradient-text px-4">
              Anime Results for "{animeSearchQuery}"
            </h2>
            {animeSearchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {animeSearchResults.map(anime => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12 px-4">
                <p className="text-muted-foreground text-base md:text-lg">No anime found matching your search criteria.</p>
              </div>
            )}
          </section>
        )}

        {/* Manga Search Results */}
        {isSearchingManga && (
          <section className="space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center gradient-text px-4">
              Manga Results for "{mangaSearchQuery}"
            </h2>
            {mangaSearchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {mangaSearchResults.map(manga => (
                  <AnimeCard key={manga.mal_id} anime={manga} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12 px-4">
                <p className="text-muted-foreground text-base md:text-lg">No manga found matching your search criteria.</p>
              </div>
            )}
          </section>
        )}

        {/* Trending Content - only show if not searching or getting recommendations */}
        {!isSearchingAnime && !isSearchingManga && !hasRecommendations && (
          <>
            {/* Trending Anime */}
            {trendingAnimeLoading ? (
              <LoadingSpinner />
            ) : (
              <TrendingSection animes={trendingAnimeData || []} title="Trending Anime" />
            )}

            {/* Trending Manga */}
            {trendingMangaLoading ? (
              <LoadingSpinner />
            ) : trendingMangaData && (
              <section className="space-y-4 md:space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold gradient-text">Trending Manga</h2>
                  <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                  {trendingMangaData.map((manga: any) => (
                    <AnimeCard key={manga.mal_id} anime={manga} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
