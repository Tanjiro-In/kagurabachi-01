
import React from 'react';
import { Play, BookOpen } from 'lucide-react';
import AnimeCard from './AnimeCard';

interface RecommendationSectionsProps {
  animeRecommendations: any[];
  mangaRecommendations: any[];
  isLoading: boolean;
}

const RecommendationSections: React.FC<RecommendationSectionsProps> = ({
  animeRecommendations,
  mangaRecommendations,
  isLoading
}) => {
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
            {Array.from({ length: 8 }).map((_, index) => (
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
    return null;
  }

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Anime Recommendations Section */}
      {animeRecommendations.length > 0 && (
        <section className="space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <Play className="w-6 md:w-8 h-6 md:h-8 text-primary" />
              <span>Recommended Anime</span>
              <span className="text-xs md:text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">Animation</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
            <p className="text-sm md:text-base text-muted-foreground px-4">AI-curated anime based on your preferences</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {animeRecommendations.map(anime => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </section>
      )}

      {/* Manga Recommendations Section */}
      {mangaRecommendations.length > 0 && (
        <section className="space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <BookOpen className="w-6 md:w-8 h-6 md:h-8 text-purple-400" />
              <span>Recommended Manga</span>
              <span className="text-xs md:text-sm bg-purple-400/20 text-purple-400 px-2 py-1 rounded-full">Manga / Novel</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-purple-400 to-primary mx-auto rounded-full"></div>
            <p className="text-sm md:text-base text-muted-foreground px-4">AI-curated manga based on your preferences</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {mangaRecommendations.map(manga => (
              <AnimeCard key={manga.mal_id} anime={manga} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default RecommendationSections;
