
import React from 'react';
import AnimeCard from './AnimeCard';
import YearFilter from './YearFilter';
import { Film, BookOpen } from 'lucide-react';

interface GenreResultsProps {
  animeResults: any[];
  mangaResults: any[];
  selectedYearRange: [number, number];
  onYearRangeChange: (range: [number, number]) => void;
  isLoading: boolean;
}

const GenreResults: React.FC<GenreResultsProps> = ({ 
  animeResults, 
  mangaResults, 
  selectedYearRange, 
  onYearRangeChange,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold gradient-text">Genre Results</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-secondary rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-96 bg-secondary rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const hasResults = animeResults.length > 0 || mangaResults.length > 0;

  if (!hasResults) {
    return (
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold gradient-text">Genre Results</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
        </div>
        <YearFilter 
          selectedYearRange={selectedYearRange}
          onYearRangeChange={onYearRangeChange}
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No results found for the selected filters.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Genre Results</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
      </div>

      <YearFilter 
        selectedYearRange={selectedYearRange}
        onYearRangeChange={onYearRangeChange}
      />

      {/* Anime Results */}
      {animeResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">
              Anime ({animeResults.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {animeResults.map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </div>
      )}

      {/* Manga Results */}
      {mangaResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">
              Manga ({mangaResults.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {mangaResults.map((manga) => (
              <AnimeCard key={manga.mal_id} anime={manga} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default GenreResults;
