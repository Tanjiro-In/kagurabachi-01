
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
      <div className="space-y-16">
        {/* Loading state for both sections */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 w-64 bg-secondary animate-pulse rounded mx-auto" />
            <div className="h-1 w-24 bg-secondary animate-pulse rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="h-80 bg-secondary animate-pulse rounded-xl" />
                <div className="space-y-2">
                  <div className="h-6 bg-secondary animate-pulse rounded" />
                  <div className="h-4 bg-secondary animate-pulse rounded w-3/4" />
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
    <div className="space-y-16">
      {/* Anime Recommendations Section */}
      {animeRecommendations.length > 0 && (
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold gradient-text flex items-center justify-center gap-3">
              <Play className="w-8 h-8 text-primary" />
              Recommended Anime
              <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">Animation</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
            <p className="text-muted-foreground">AI-curated anime based on your preferences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {animeRecommendations.map(anime => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </section>
      )}

      {/* Manga Recommendations Section */}
      {mangaRecommendations.length > 0 && (
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold gradient-text flex items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-400" />
              Recommended Manga
              <span className="text-sm bg-purple-400/20 text-purple-400 px-2 py-1 rounded-full">Manga / Novel</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-primary mx-auto rounded-full"></div>
            <p className="text-muted-foreground">AI-curated manga based on your preferences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
