
import React from 'react';

interface AnimeCardProps {
  anime: {
    mal_id: number;
    title: string;
    year?: number;
    synopsis?: string;
    genres: { name: string }[];
    episodes?: number;
    chapters?: number;
    images: {
      jpg: {
        large_image_url: string;
      };
    };
    type?: string;
  };
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="anime-card group">
      <div className="relative h-80 overflow-hidden">
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
        
        <div className="absolute top-4 left-4">
          <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            {anime.year || 'N/A'}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {anime.title}
          </h3>
        </div>

        {anime.synopsis && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Synopsis
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {truncateText(anime.synopsis, 150)}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Genre
            </h4>
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 3).map((genre, index) => (
                <span key={genre.name} className="genre-tag">
                  {genre.name}
                  {index < anime.genres.slice(0, 3).length - 1 && index < 2 ? ' |' : ''}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {anime.type === 'Manga' ? 'Chapters' : 'Episodes'}
            </h4>
            <div className="text-2xl font-bold text-foreground">
              {anime.type === 'Manga' ? (anime.chapters || 'N/A') : (anime.episodes || 'N/A')}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {anime.type === 'Manga' ? 'Chapters' : 'Episodes'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;
