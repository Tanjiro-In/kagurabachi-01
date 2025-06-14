
import React from 'react';
import TrendingSection from './TrendingSection';
import AnimeCard from './AnimeCard';
import LoadingSpinner from './LoadingSpinner';

interface TrendingContentSectionProps {
  trendingAnimeData: any[] | undefined;
  trendingMangaData: any[] | undefined;
  trendingAnimeLoading: boolean;
  trendingMangaLoading: boolean;
}

const TrendingContentSection: React.FC<TrendingContentSectionProps> = ({
  trendingAnimeData,
  trendingMangaData,
  trendingAnimeLoading,
  trendingMangaLoading
}) => {
  return (
    <>
      {/* Trending Anime */}
      {trendingAnimeLoading ? (
        <LoadingSpinner />
      ) : (
        <div data-section="trending-anime">
          <TrendingSection animes={trendingAnimeData || []} title="Trending Anime" />
        </div>
      )}

      {/* Trending Manga */}
      {trendingMangaLoading ? (
        <LoadingSpinner />
      ) : trendingMangaData && (
        <section className="space-y-4 md:space-y-6" data-section="trending-manga">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text">Trending Manga</h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {trendingMangaData.map((manga: any) => (
              <AnimeCard key={manga.mal_id} anime={manga} />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default TrendingContentSection;
