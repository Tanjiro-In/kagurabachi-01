
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AnimeCardProps {
  anime: any;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    const currentPath = location.pathname + location.search;
    const routePath = anime.type === 'Manga' || anime.type === 'Manhwa' || anime.type === 'Manhua' || anime.type === 'Novel'
      ? `/manga/${anime.mal_id}?from=${encodeURIComponent(currentPath)}`
      : `/anime/${anime.mal_id}?from=${encodeURIComponent(currentPath)}`;
    
    navigate(routePath);
  };

  return (
    <div 
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-lg md:rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '/placeholder.svg'}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-1 md:mb-2">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between text-xs md:text-sm opacity-90">
            <span>{anime.year || 'Unknown'}</span>
            <span className="px-2 py-1 bg-primary/80 rounded text-xs">
              {anime.score ? `★ ${anime.score}` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;
