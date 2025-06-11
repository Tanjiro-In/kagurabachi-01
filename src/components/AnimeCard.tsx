
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AnimeCardProps {
  anime: {
    mal_id: number;
    title: string;
    year?: number;
    synopsis?: string;
    genres: { name: string }[];
    images: {
      jpg: {
        large_image_url: string;
      };
    };
    type?: string;
    published?: {
      from: string;
    };
  };
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const navigate = useNavigate();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleCardClick = () => {
    // Use the mal_id for navigation
    const id = anime.mal_id;
    if (anime.type === 'Manga' || anime.type === 'MANGA') {
      navigate(`/manga/${id}`);
    } else {
      navigate(`/anime/${id}`);
    }
  };

  const getYear = () => {
    if (anime.year) return anime.year;
    if (anime.published?.from) return new Date(anime.published.from).getFullYear();
    return 'N/A';
  };

  // Get the highest quality image available
  const getHighQualityImage = () => {
    return anime.images.jpg.large_image_url;
  };

  return (
    <div 
      className="anime-card group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-80 overflow-hidden">
        <img
          src={getHighQualityImage()}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
          loading="lazy"
          onError={(e) => {
            // Fallback to a placeholder if image fails to load
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
        
        <div className="absolute top-4 left-4">
          <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            {getYear()}
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
              {anime.genres.map((genre, index) => (
                <span key={genre.name} className="genre-tag">
                  {genre.name}
                  {index < anime.genres.length - 1 ? ' |' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;
