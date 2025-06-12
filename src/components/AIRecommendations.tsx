import React, { useState } from 'react';
import { Sparkles, Calendar, Tags, RotateCcw } from 'lucide-react';

interface Genre {
  mal_id: number;
  name: string;
}

interface AIRecommendationsProps {
  animeGenres: Genre[];
  mangaGenres: Genre[];
  onRecommendationRequest: (genres: string[], year: string) => void;
  isLoading?: boolean;
}

const POPULAR_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller', 'Mystery', 'Horror'
];

const YEAR_RANGES = [
  { label: 'Recent (2020-2024)', value: '2020-2024' },
  { label: 'Modern (2010-2019)', value: '2010-2019' },
  { label: 'Classic (2000-2009)', value: '2000-2009' },
  { label: 'Retro (1990-1999)', value: '1990-1999' },
  { label: 'Any Year', value: 'any' }
];

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ 
  animeGenres, 
  mangaGenres, 
  onRecommendationRequest, 
  isLoading = false 
}) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('any');

  // Combine and filter genres
  const allGenres = [...animeGenres, ...mangaGenres].reduce((acc, genre) => {
    if (!acc.find(g => g.name === genre.name) && POPULAR_GENRES.includes(genre.name)) {
      acc.push(genre);
    }
    return acc;
  }, [] as Genre[]).sort((a, b) => {
    const aIndex = POPULAR_GENRES.indexOf(a.name);
    const bIndex = POPULAR_GENRES.indexOf(b.name);
    return aIndex - bIndex;
  });

  const handleGenreToggle = (genreName: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreName) 
        ? prev.filter(g => g !== genreName)
        : [...prev, genreName]
    );
  };

  const handleGetRecommendations = () => {
    if (selectedGenres.length > 0) {
      onRecommendationRequest(selectedGenres, selectedYear);
    }
  };

  const handleReset = () => {
    setSelectedGenres([]);
    setSelectedYear('any');
    // Call the parent to reset recommendations
    onRecommendationRequest([], 'reset');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-bold gradient-text flex items-center justify-center gap-2">
            <Sparkles className="w-5 md:w-6 h-5 md:h-6" />
            AI Recommendations
          </h2>
          <p className="text-sm md:text-base text-muted-foreground px-4">Personalized anime & manga suggestions</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <div className="space-y-3">
            <div className="h-5 md:h-6 w-24 md:w-32 bg-secondary animate-pulse rounded" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-8 md:h-10 w-16 md:w-20 bg-secondary animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-5 md:h-6 w-24 md:w-32 bg-secondary animate-pulse rounded" />
            <div className="h-10 md:h-12 w-full bg-secondary animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold gradient-text flex items-center justify-center gap-2">
          <Sparkles className="w-5 md:w-6 h-5 md:h-6" />
          AI Recommendations
        </h2>
        <p className="text-sm md:text-base text-muted-foreground px-4">Get personalized anime & manga suggestions based on your preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Genre Selection */}
        <div className="space-y-3">
          <h3 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
            <Tags className="w-4 md:w-5 h-4 md:h-5" />
            Select Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((genre) => (
              <button
                key={genre.mal_id}
                onClick={() => handleGenreToggle(genre.name)}
                className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                  selectedGenres.includes(genre.name)
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Year Selection */}
        <div className="space-y-3">
          <h3 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 md:w-5 h-4 md:h-5" />
            Time Period
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-3 bg-input border border-border rounded-lg text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {YEAR_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Get Recommendations Button */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGetRecommendations}
            disabled={selectedGenres.length === 0}
            className={`px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-all duration-200 ${
              selectedGenres.length > 0
                ? 'bg-gradient-to-r from-primary to-purple-400 text-white hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 md:w-5 h-4 md:h-5 inline mr-2" />
            Get AI Recommendations
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200"
          >
            <RotateCcw className="w-4 md:w-5 h-4 md:h-5 inline mr-2" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
