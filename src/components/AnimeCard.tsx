
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
    chapters?: number;
    volumes?: number;
    episodes?: number;
  };
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const navigate = useNavigate();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleCardClick = () => {
    const id = anime.mal_id;
    
    // Enhanced detection logic for manga vs anime
    const isManga = 
      // Direct type checks (case insensitive)
      anime.type?.toLowerCase().includes('manga') ||
      anime.type?.toLowerCase().includes('manhwa') ||
      anime.type?.toLowerCase().includes('manhua') ||
      anime.type?.toLowerCase().includes('novel') ||
      anime.type?.toLowerCase().includes('one-shot') ||
      anime.type?.toLowerCase().includes('doujin') ||
      
      // Check if it has manga-specific properties but no anime properties
      ((anime.chapters || anime.volumes) && !anime.episodes && !anime.aired) ||
      
      // If it has published date but no aired date, it's likely manga
      (anime.published && !anime.aired) ||
      
      // If it has authors but no studios, it's likely manga
      (anime.authors && !anime.studios) ||
      
      // Additional safety check: if episodes is null/undefined but chapters exist
      (anime.episodes === null && anime.chapters) ||
      (anime.episodes === undefined && anime.chapters);
    
    console.log(`Content ${id} - Type: ${anime.type}, Episodes: ${anime.episodes}, Chapters: ${anime.chapters}, Volumes: ${anime.volumes}, isManga: ${isManga}`);
    
    if (isManga) {
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
      <div className="relative h-48 md:h-64 lg:h-80 overflow-hidden">
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
        
        <div className="absolute top-2 md:top-4 left-2 md:left-4">
          <span className="bg-primary/90 text-primary-foreground px-2 md:px-3 py-1 rounded-full text-xs font-semibold">
            {getYear()}
          </span>
        </div>
      </div>

      <div className="p-3 md:p-4 lg:p-6 space-y-2 md:space-y-3 lg:space-y-4">
        <div>
          <h3 className="text-sm md:text-lg lg:text-xl font-bold text-foreground mb-1 md:mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {anime.title}
          </h3>
        </div>

        {anime.synopsis && (
          <div className="space-y-1 md:space-y-2 hidden md:block">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Synopsis
            </h4>
            <p className="text-xs md:text-sm text-foreground/80 leading-relaxed">
              {truncateText(anime.synopsis, 100)}
            </p>
          </div>
        )}

        <div className="space-y-2 md:space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 md:mb-2">
              Genre
            </h4>
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 3).map((genre, index) => (
                <span key={genre.name} className="bg-secondary text-secondary-foreground px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-medium">
                  {genre.name}
                </span>
              ))}
              {anime.genres.length > 3 && (
                <span className="bg-secondary text-secondary-foreground px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-medium">
                  +{anime.genres.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;
