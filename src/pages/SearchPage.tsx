
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import SearchResultsSection from '../components/SearchResultsSection';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { searchAnimeAniList, searchMangaAniList } from '../services/anilistApi';
import { convertAniListToJikan } from '../utils/dataConverter';

interface SearchPageProps {
  type: 'anime' | 'manga';
}

const SearchPage: React.FC<SearchPageProps> = ({ type }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Use route-specific scroll restoration
  useScrollRestoration(`/search/${type}`);

  const { data, isLoading } = useQuery({
    queryKey: [`search-${type}`, query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const searchFn = type === 'anime' ? searchAnimeAniList : searchMangaAniList;
      const results = await searchFn(query);
      return results.map(convertAniListToJikan);
    },
    enabled: !!query.trim()
  });

  useEffect(() => {
    if (data) {
      setSearchResults(data);
    }
  }, [data]);

  const handleAnimeSearch = async (searchQuery: string) => {
    if (type === 'anime') {
      navigate(`/search/anime?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMangaSearch = async (searchQuery: string) => {
    if (type === 'manga') {
      navigate(`/search/manga?q=${encodeURIComponent(searchQuery)}`);
    }
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

      {/* Hero Section with Search */}
      <HeroSection 
        onAnimeSearch={handleAnimeSearch} 
        onMangaSearch={handleMangaSearch}
        focusType={type}
      />

      <div className="max-w-7xl mx-auto px-4 space-y-12 md:space-y-16 pb-16 md:pb-20">
        {/* Search Results */}
        <SearchResultsSection
          isSearchingAnime={type === 'anime' && !!query}
          isSearchingManga={type === 'manga' && !!query}
          animeSearchQuery={type === 'anime' ? query : ''}
          mangaSearchQuery={type === 'manga' ? query : ''}
          animeSearchResults={type === 'anime' ? searchResults : []}
          mangaSearchResults={type === 'manga' ? searchResults : []}
        />
      </div>
    </div>
  );
};

export default SearchPage;
