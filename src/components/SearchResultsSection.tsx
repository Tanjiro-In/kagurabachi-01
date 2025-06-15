
import React from 'react';
import { X, Search, Play, BookOpen } from 'lucide-react';
import AnimeCard from './AnimeCard';

interface SearchResultsSectionProps {
  isSearchingAnime: boolean;
  isSearchingManga: boolean;
  animeSearchQuery: string;
  mangaSearchQuery: string;
  animeSearchResults: any[];
  mangaSearchResults: any[];
  onResetAnimeSearch: () => void;
  onResetMangaSearch: () => void;
}

const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  isSearchingAnime,
  isSearchingManga,
  animeSearchQuery,
  mangaSearchQuery,
  animeSearchResults,
  mangaSearchResults,
  onResetAnimeSearch,
  onResetMangaSearch
}) => {
  return (
    <>
      {/* Anime Search Results */}
      {isSearchingAnime && (
        <section className="space-y-4 md:space-y-6" data-section="anime-search">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <Play className="w-6 md:w-8 h-6 md:h-8 text-primary" />
              <span>Anime Search Results</span>
              {animeSearchQuery && (
                <span className="text-xs md:text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">
                  "{animeSearchQuery}"
                </span>
              )}
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
            <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
              <p className="text-sm md:text-base text-muted-foreground">
                Found {animeSearchResults.length} anime{animeSearchResults.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={onResetAnimeSearch}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <X className="w-3 md:w-4 h-3 md:h-4" />
                Clear Search
              </button>
            </div>
          </div>
          
          {animeSearchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {animeSearchResults.map(anime => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 px-4">
              <Search className="w-12 md:w-16 h-12 md:h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-base md:text-lg">
                No anime found for "{animeSearchQuery}". Try different search terms.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Manga Search Results */}
      {isSearchingManga && (
        <section className="space-y-4 md:space-y-6" data-section="manga-search">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <BookOpen className="w-6 md:w-8 h-6 md:h-8 text-purple-400" />
              <span>Manga Search Results</span>
              {mangaSearchQuery && (
                <span className="text-xs md:text-sm bg-purple-400/20 text-purple-400 px-2 py-1 rounded-full">
                  "{mangaSearchQuery}"
                </span>
              )}
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-purple-400 to-primary mx-auto rounded-full"></div>
            <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
              <p className="text-sm md:text-base text-muted-foreground">
                Found {mangaSearchResults.length} manga{mangaSearchResults.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={onResetMangaSearch}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <X className="w-3 md:w-4 h-3 md:h-4" />
                Clear Search
              </button>
            </div>
          </div>
          
          {mangaSearchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {mangaSearchResults.map(manga => (
                <AnimeCard key={manga.mal_id} anime={manga} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 px-4">
              <Search className="w-12 md:w-16 h-12 md:h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-base md:text-lg">
                No manga found for "{mangaSearchQuery}". Try different search terms.
              </p>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default SearchResultsSection;
