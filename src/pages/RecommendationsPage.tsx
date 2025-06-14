
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import AIRecommendations from '../components/AIRecommendations';
import RecommendationSections from '../components/RecommendationSections';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { fetchAnimeByGenresAniList, fetchMangaByGenresAniList } from '../services/anilistApi';
import { convertAniListToJikan } from '../utils/dataConverter';

const POPULAR_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller', 'Mystery', 'Horror'
];

const createMockGenres = () => {
  return POPULAR_GENRES.map((name, index) => ({ mal_id: index + 1, name }));
};

const RecommendationsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const genres = searchParams.get('genres')?.split(',') || [];
  const year = searchParams.get('year') || 'any';
  
  const [animeRecommendations, setAnimeRecommendations] = useState<any[]>([]);
  const [mangaRecommendations, setMangaRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMoreAnime, setIsLoadingMoreAnime] = useState(false);
  const [isLoadingMoreManga, setIsLoadingMoreManga] = useState(false);
  const [hasMoreAnime, setHasMoreAnime] = useState(false);
  const [hasMoreManga, setHasMoreManga] = useState(false);
  const [animeCurrentPage, setAnimeCurrentPage] = useState(1);
  const [mangaCurrentPage, setMangaCurrentPage] = useState(1);

  // Use route-specific scroll restoration
  useScrollRestoration('/recommendations');

  const mockGenres = createMockGenres();

  useEffect(() => {
    if (genres.length > 0) {
      fetchRecommendations();
    }
  }, [genres, year]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const [animeResult, mangaResult] = await Promise.all([
        fetchAnimeByGenresAniList(genres, year, 1),
        fetchMangaByGenresAniList(genres, year, 1)
      ]);
      
      setAnimeRecommendations(animeResult.data.map(convertAniListToJikan));
      setMangaRecommendations(mangaResult.data.map(convertAniListToJikan));
      setHasMoreAnime(animeResult.hasNextPage);
      setHasMoreManga(mangaResult.hasNextPage);
      setAnimeCurrentPage(1);
      setMangaCurrentPage(1);
    } catch (error) {
      console.error('Recommendation fetch failed:', error);
      setAnimeRecommendations([]);
      setMangaRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationRequest = async (requestGenres: string[], yearRange: string) => {
    if (yearRange === 'reset') {
      navigate('/');
      return;
    }

    const genresParam = requestGenres.join(',');
    navigate(`/recommendations?genres=${encodeURIComponent(genresParam)}&year=${encodeURIComponent(yearRange)}`);
  };

  const handleLoadMoreAnime = async () => {
    if (isLoadingMoreAnime || !hasMoreAnime) return;
    
    setIsLoadingMoreAnime(true);
    const nextPage = animeCurrentPage + 1;
    
    try {
      const result = await fetchAnimeByGenresAniList(genres, year, nextPage);
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
      const result = await fetchMangaByGenresAniList(genres, year, nextPage);
      setMangaRecommendations(prev => [...prev, ...result.data.map(convertAniListToJikan)]);
      setHasMoreManga(result.hasNextPage);
      setMangaCurrentPage(nextPage);
    } catch (error) {
      console.error('Failed to load more manga:', error);
    } finally {
      setIsLoadingMoreManga(false);
    }
  };

  const handleAnimeSearch = async (query: string) => {
    navigate(`/search/anime?q=${encodeURIComponent(query)}`);
  };

  const handleMangaSearch = async (query: string) => {
    navigate(`/search/manga?q=${encodeURIComponent(query)}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <HeroSection onAnimeSearch={handleAnimeSearch} onMangaSearch={handleMangaSearch} />

      <div className="max-w-7xl mx-auto px-4 space-y-12 md:space-y-16 pb-16 md:pb-20">
        {/* AI Recommendations */}
        <AIRecommendations 
          animeGenres={mockGenres} 
          mangaGenres={mockGenres} 
          onRecommendationRequest={handleRecommendationRequest} 
          isLoading={false}
          defaultGenres={genres}
          defaultYear={year}
        />

        {/* Recommendation Results */}
        {genres.length > 0 && (
          <RecommendationSections
            animeRecommendations={animeRecommendations}
            mangaRecommendations={mangaRecommendations}
            isLoading={isLoading}
            onLoadMoreAnime={handleLoadMoreAnime}
            onLoadMoreManga={handleLoadMoreManga}
            hasMoreAnime={hasMoreAnime}
            hasMoreManga={hasMoreManga}
            isLoadingMoreAnime={isLoadingMoreAnime}
            isLoadingMoreManga={isLoadingMoreManga}
          />
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
