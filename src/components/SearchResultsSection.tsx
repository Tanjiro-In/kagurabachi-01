
import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import AnimeCard from './AnimeCard';

interface SearchResultsSectionProps {
  isSearchingAnime: boolean;
  isSearchingManga: boolean;
  animeSearchQuery: string;
  mangaSearchQuery: string;
  animeSearchResults: any[];
  mangaSearchResults: any[];
  onResetAnimeSearch?: () => void;
  onResetMangaSearch?: () => void;
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text">
              Anime Results for "{animeSearchQuery}"
            </h2>
            {onResetAnimeSearch && (
              <Button
                onClick={onResetAnimeSearch}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <X size={16} />
                Clear Search
              </Button>
            )}
          </div>
          {animeSearchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {animeSearchResults.map(anime => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 px-4">
              <p className="text-muted-foreground text-base md:text-lg">No anime found matching your search criteria.</p>
            </div>
          )}
        </section>
      )}

      {/* Manga Search Results */}
      {isSearchingManga && (
        <section className="space-y-4 md:space-y-6" data-section="manga-search">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text">
              Manga Results for "{mangaSearchQuery}"
            </h2>
            {onResetMangaSearch && (
              <Button
                onClick={onResetMangaSearch}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <X size={16} />
                Clear Search
              </Button>
            )}
          </div>
          {mangaSearchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {mangaSearchResults.map(manga => (
                <AnimeCard key={manga.mal_id} anime={manga} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 px-4">
              <p className="text-muted-foreground text-base md:text-lg">No manga found matching your search criteria.</p>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default SearchResultsSection;
