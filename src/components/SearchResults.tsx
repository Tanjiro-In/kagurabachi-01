
import React from 'react';
import AnimeCard from './AnimeCard';
import { Film, BookOpen } from 'lucide-react';

interface SearchResultsProps {
  animeResults: any[];
  mangaResults: any[];
  searchQuery: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ animeResults, mangaResults, searchQuery }) => {
  const hasResults = animeResults.length > 0 || mangaResults.length > 0;

  if (!hasResults) {
    return (
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center gradient-text">
          Search Results for "{searchQuery}"
        </h2>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No results found matching your search criteria.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold text-center gradient-text">
        Search Results for "{searchQuery}"
      </h2>

      {/* Anime Results */}
      {animeResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">
              Anime Results ({animeResults.length})
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
              Manga Results ({mangaResults.length})
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

export default SearchResults;
