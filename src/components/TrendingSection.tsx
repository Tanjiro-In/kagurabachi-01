
import React from 'react';
import AnimeCard from './AnimeCard';

interface TrendingSectionProps {
  animes: any[];
  title: string;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ animes, title }) => {
  return (
    <section className="space-y-4 md:space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text">{title}</h2>
        <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {animes.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    </section>
  );
};

export default TrendingSection;
