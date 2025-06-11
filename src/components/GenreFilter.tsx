
import React from 'react';

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

// Most popular/watched genres based on MAL data
const POPULAR_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller', 'Mystery', 'Horror'
];

const GenreFilter: React.FC<GenreFilterProps> = ({ 
  animeGenres, 
  mangaGenres, 
  selectedGenres, 
  onGenreToggle, 
  isLoading = false 
}) => {
  // Combine and filter to show only popular genres
  const allGenres = [...animeGenres, ...mangaGenres].reduce((acc, genre) => {
    if (!acc.find(g => g.mal_id === genre.mal_id) && POPULAR_GENRES.includes(genre.name)) {
      acc.push(genre);
    }
    return acc;
  }, [] as Genre[]).sort((a, b) => {
    // Sort by popularity order
    const aIndex = POPULAR_GENRES.indexOf(a.name);
    const bIndex = POPULAR_GENRES.indexOf(b.name);
    return aIndex - bIndex;
  });

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
      <h3 className="text-lg font-semibold text-foreground">Popular Genres</h3>
      <div className="flex flex-wrap gap-2">
        {allGenres.map((genre) => (
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
