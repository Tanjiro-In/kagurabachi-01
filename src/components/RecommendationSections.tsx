
import React, { useState } from 'react';
import { Play, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import AnimeCard from './AnimeCard';

interface RecommendationSectionsProps {
  animeRecommendations: any[];
  mangaRecommendations: any[];
  isLoading: boolean;
  onLoadMoreAnime?: () => void;
  onLoadMoreManga?: () => void;
  hasMoreAnime?: boolean;
  hasMoreManga?: boolean;
  isLoadingMoreAnime?: boolean;
  isLoadingMoreManga?: boolean;
}

const RecommendationSections: React.FC<RecommendationSectionsProps> = ({
  animeRecommendations,
  mangaRecommendations,
  isLoading,
  onLoadMoreAnime,
  onLoadMoreManga,
  hasMoreAnime = false,
  hasMoreManga = false,
  isLoadingMoreAnime = false,
  isLoadingMoreManga = false
}) => {
  const [showAllAnime, setShowAllAnime] = useState(false);
  const [showAllManga, setShowAllManga] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-12 md:space-y-16">
        {/* Loading state for both sections */}
        <section className="space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <div className="h-6 md:h-8 w-48 md:w-64 bg-secondary animate-pulse rounded mx-auto" />
            <div className="h-1 w-16 md:w-24 bg-secondary animate-pulse rounded mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="space-y-2 md:space-y-4">
                <div className="h-48 md:h-64 lg:h-80 bg-secondary animate-pulse rounded-xl" />
                <div className="space-y-1 md:space-y-2 p-2 md:p-4">
                  <div className="h-4 md:h-6 bg-secondary animate-pulse rounded" />
                  <div className="h-3 md:h-4 bg-secondary animate-pulse rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (animeRecommendations.length === 0 && mangaRecommendations.length === 0) {
    return (
      <div className="text-center py-8 md:py-12 px-4">
        <p className="text-muted-foreground text-base md:text-lg">No recommendations found for the selected criteria. Try different genres or time periods.</p>
      </div>
    );
  }

  const getDisplayedAnime = () => {
    if (showAllAnime || animeRecommendations.length <= 9) {
      return animeRecommendations;
    }
    return animeRecommendations.slice(0, 9);
  };

  const getDisplayedManga = () => {
    if (showAllManga || mangaRecommendations.length <= 9) {
      return mangaRecommendations;
    }
    return mangaRecommendations.slice(0, 9);
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Anime Recommendations Section */}
      {animeRecommendations.length > 0 && (
        <section className="space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <Play className="w-6 md:w-8 h-6 md:h-8 text-primary" />
              <span>Recommended Anime</span>
              <span className="text-xs md:text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">
                {animeRecommendations.length} found
              </span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
            <p className="text-sm md:text-base text-muted-foreground px-4">AI-curated anime based on your preferences</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {getDisplayedAnime().map(anime => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>

          {/* Show More Button for Anime */}
          {(animeRecommendations.length > 9 || hasMoreAnime) && (
            <div className="text-center space-y-4">
              {animeRecommendations.length > 9 && !showAllAnime && (
                <button
                  onClick={() => setShowAllAnime(true)}
                  className="px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <ChevronDown className="w-4 h-4" />
                  Show All {animeRecommendations.length} Anime
                </button>
              )}
              
              {showAllAnime && animeRecommendations.length > 9 && (
                <button
                  onClick={() => setShowAllAnime(false)}
                  className="px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </button>
              )}

              {hasMoreAnime && onLoadMoreAnime && (
                <button
                  onClick={onLoadMoreAnime}
                  disabled={isLoadingMoreAnime}
                  className="px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  {isLoadingMoreAnime ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading More...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Load More Anime
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* Manga Recommendations Section */}
      {mangaRecommendations.length > 0 && (
        <section className="space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <BookOpen className="w-6 md:w-8 h-6 md:h-8 text-purple-400" />
              <span>Recommended Manga</span>
              <span className="text-xs md:text-sm bg-purple-400/20 text-purple-400 px-2 py-1 rounded-full">
                {mangaRecommendations.length} found
              </span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-purple-400 to-primary mx-auto rounded-full"></div>
            <p className="text-sm md:text-base text-muted-foreground px-4">AI-curated manga based on your preferences</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {getDisplayedManga().map(manga => (
              <AnimeCard key={manga.mal_id} anime={manga} />
            ))}
          </div>

          {/* Show More Button for Manga */}
          {(mangaRecommendations.length > 9 || hasMoreManga) && (
            <div className="text-center space-y-4">
              {mangaRecommendations.length > 9 && !showAllManga && (
                <button
                  onClick={() => setShowAllManga(true)}
                  className="px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <ChevronDown className="w-4 h-4" />
                  Show All {mangaRecommendations.length} Manga
                </button>
              )}
              
              {showAllManga && mangaRecommendations.length > 9 && (
                <button
                  onClick={() => setShowAllManga(false)}
                  className="px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </button>
              )}

              {hasMoreManga && onLoadMoreManga && (
                <button
                  onClick={onLoadMoreManga}
                  disabled={isLoadingMoreManga}
                  className="px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  {isLoadingMoreManga ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading More...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Load More Manga
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default RecommendationSections;
