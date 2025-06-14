
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import TrendingContentSection from '../components/TrendingContentSection';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { useQuery } from '@tanstack/react-query';
import { fetchTrendingAnimeAniList, fetchTrendingMangaAniList } from '../services/anilistApi';
import { convertAniListToJikan } from '../utils/dataConverter';

const TrendingPage = () => {
  const navigate = useNavigate();
  
  // Use route-specific scroll restoration
  useScrollRestoration('/trending');

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
        {/* Trending Content */}
        <TrendingContentSection
          trendingAnimeData={trendingAnimeData}
          trendingMangaData={trendingMangaData}
          trendingAnimeLoading={trendingAnimeLoading}
          trendingMangaLoading={trendingMangaLoading}
        />
      </div>
    </div>
  );
};

export default TrendingPage;
