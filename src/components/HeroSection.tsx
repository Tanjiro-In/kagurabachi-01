
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import MangaSearchBar from './MangaSearchBar';

interface HeroSectionProps {
  onAnimeSearch: (query: string) => Promise<void>;
  onMangaSearch: (query: string) => Promise<void>;
  focusType?: 'anime' | 'manga';
}

const HeroSection: React.FC<HeroSectionProps> = ({ onAnimeSearch, onMangaSearch, focusType }) => {
  const navigate = useNavigate();

  const handleGetRecommendations = () => {
    navigate('/recommendations');
  };

  const handleViewTrending = () => {
    navigate('/trending');
  };

  return (
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
          <div className={`space-y-2 ${focusType === 'anime' ? 'order-1' : ''}`}>
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Search Anime</h3>
            <SearchBar onSearch={onAnimeSearch} />
          </div>
          <div className={`space-y-2 ${focusType === 'manga' ? 'order-1' : ''}`}>
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Search Manga</h3>
            <MangaSearchBar onSearch={onMangaSearch} />
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={handleGetRecommendations}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
          >
            Get AI Recommendations
          </button>
          <button
            onClick={handleViewTrending}
            className="px-4 py-2 bg-secondary/10 text-secondary-foreground rounded-lg hover:bg-secondary/20 transition-colors text-sm"
          >
            View Trending
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
