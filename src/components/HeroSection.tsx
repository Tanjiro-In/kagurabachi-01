
import React from 'react';
import SearchBar from './SearchBar';
import MangaSearchBar from './MangaSearchBar';

interface HeroSectionProps {
  onAnimeSearch: (query: string) => Promise<void>;
  onMangaSearch: (query: string) => Promise<void>;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onAnimeSearch, onMangaSearch }) => {
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
          <div className="space-y-2">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Search Anime</h3>
            <SearchBar onSearch={onAnimeSearch} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Search Manga</h3>
            <MangaSearchBar onSearch={onMangaSearch} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
