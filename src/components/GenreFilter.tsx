
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Genre {
  mal_id: number;
  name: string;
}

interface GenreFilterProps {
  animeGenres: Genre[];
  mangaGenres: Genre[];
  selectedGenres: number[];
  onGenreToggle: (genreId: number) => void;
  isLoading?: boolean;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ 
  animeGenres, 
  mangaGenres, 
  selectedGenres, 
  onGenreToggle, 
  isLoading = false 
}) => {
  const [showAllGenres, setShowAllGenres] = useState(false);

  // Combine and deduplicate genres
  const allGenres = [...animeGenres, ...mangaGenres].reduce((acc, genre) => {
    if (!acc.find(g => g.mal_id === genre.mal_id)) {
      acc.push(genre);
    }
    return acc;
  }, [] as Genre[]).sort((a, b) => a.name.localeCompare(b.name));

  const displayedGenres = showAllGenres ? allGenres : allGenres.slice(0, 12);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Filter by Genre</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="h-10 w-20 bg-secondary animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filter by Genre</h3>
        {allGenres.length > 12 && (
          <button
            onClick={() => setShowAllGenres(!showAllGenres)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            {showAllGenres ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show More <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayedGenres.map((genre) => (
          <button
            key={genre.mal_id}
            onClick={() => onGenreToggle(genre.mal_id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedGenres.includes(genre.mal_id)
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreFilter;
