
import React, { useState } from 'react';
import { Sparkles, Calendar, Tags } from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold gradient-text flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            AI Recommendations
          </h2>
          <p className="text-muted-foreground">Personalized anime & manga suggestions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="h-6 w-32 bg-secondary animate-pulse rounded" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-10 w-20 bg-secondary animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-6 w-32 bg-secondary animate-pulse rounded" />
            <div className="h-12 w-full bg-secondary animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold gradient-text flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6" />
          AI Recommendations
        </h2>
        <p className="text-muted-foreground">Get personalized anime & manga suggestions based on your preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Genre Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Select Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((genre) => (
              <button
                key={genre.mal_id}
                onClick={() => handleGenreToggle(genre.name)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Time Period
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
      <div className="text-center">
        <button
          onClick={handleGetRecommendations}
          disabled={selectedGenres.length === 0}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            selectedGenres.length > 0
              ? 'bg-gradient-to-r from-primary to-purple-400 text-white hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5'
              : 'bg-secondary text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5 inline mr-2" />
          Get AI Recommendations
        </button>
      </div>
    </div>
  );
};

export default AIRecommendations;
