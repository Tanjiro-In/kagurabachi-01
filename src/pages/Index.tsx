
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchBar from '../components/SearchBar';
import GenreFilter from '../components/GenreFilter';
import TrendingSection from '../components/TrendingSection';
import LoadingSpinner from '../components/LoadingSpinner';

// Jikan API functions
const fetchTrendingAnime = async () => {
  const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=12');
  if (!response.ok) throw new Error('Failed to fetch trending anime');
  return response.json();
};

const fetchAnimeBySearch = async (query: string) => {
  const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`);
  if (!response.ok) throw new Error('Failed to search anime');
  return response.json();
};

const fetchTopManga = async () => {
  const response = await fetch('https://api.jikan.moe/v4/top/manga?limit=8');
  if (!response.ok) throw new Error('Failed to fetch top manga');
  return response.json();
};

const POPULAR_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural'
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch trending anime
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-anime'],
    queryFn: fetchTrendingAnime,
  });

  // Fetch top manga
  const { data: mangaData, isLoading: mangaLoading } = useQuery({
    queryKey: ['top-manga'],
    queryFn: fetchTopManga,
  });

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    
    try {
      const data = await fetchAnimeBySearch(query);
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const filteredResults = searchResults.filter(anime => {
    if (selectedGenres.length === 0) return true;
    return anime.genres?.some((genre: any) => selectedGenres.includes(genre.name));
  });

  const filteredTrending = trendingData?.data?.filter((anime: any) => {
    if (selectedGenres.length === 0) return true;
    return anime.genres?.some((genre: any) => selectedGenres.includes(genre.name));
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text">
              Kagura<span className="text-foreground">bachi</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the best anime and manga recommendations in our immersive, dark-themed platform
            </p>
          </div>
          
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-16 pb-20">
        {/* Genre Filter */}
        <GenreFilter 
          genres={POPULAR_GENRES}
          selectedGenres={selectedGenres}
          onGenreToggle={handleGenreToggle}
        />

        {/* Search Results */}
        {isSearching && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-center gradient-text">
              Search Results for "{searchQuery}"
            </h2>
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredResults.map((anime) => (
                  <div key={anime.mal_id} className="anime-card group">
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
                      <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {anime.title}
                      </h3>

                      {anime.synopsis && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Synopsis
                          </h4>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {anime.synopsis.length > 150 ? anime.synopsis.slice(0, 150) + '...' : anime.synopsis}
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Genre
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {anime.genres?.slice(0, 3).map((genre: any, index: number) => (
                              <span key={genre.name} className="genre-tag">
                                {genre.name}
                                {index < Math.min(anime.genres.length - 1, 2) ? ' |' : ''}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Episodes
                          </h4>
                          <div className="text-2xl font-bold text-foreground">
                            {anime.episodes || 'N/A'}
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                              Episodes
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No anime found matching your search criteria.</p>
              </div>
            )}
          </section>
        )}

        {/* Trending Anime */}
        {!isSearching && (
          <>
            {trendingLoading ? (
              <LoadingSpinner />
            ) : (
              <TrendingSection 
                animes={filteredTrending}
                title="Trending Anime"
              />
            )}

            {/* Top Manga */}
            {mangaLoading ? (
              <LoadingSpinner />
            ) : mangaData?.data && (
              <section className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold gradient-text">Top Manga</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {mangaData.data.filter((manga: any) => {
                    if (selectedGenres.length === 0) return true;
                    return manga.genres?.some((genre: any) => selectedGenres.includes(genre.name));
                  }).map((manga: any) => (
                    <div key={manga.mal_id} className="anime-card group">
                      <div className="relative h-80 overflow-hidden">
                        <img
                          src={manga.images.jpg.large_image_url}
                          alt={manga.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                        
                        <div className="absolute top-4 left-4">
                          <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                            {manga.published?.from ? new Date(manga.published.from).getFullYear() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                          {manga.title}
                        </h3>

                        {manga.synopsis && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                              Synopsis
                            </h4>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {manga.synopsis.length > 150 ? manga.synopsis.slice(0, 150) + '...' : manga.synopsis}
                            </p>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Genre
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {manga.genres?.slice(0, 3).map((genre: any, index: number) => (
                                <span key={genre.name} className="genre-tag">
                                  {genre.name}
                                  {index < Math.min(manga.genres.length - 1, 2) ? ' |' : ''}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Chapters
                            </h4>
                            <div className="text-2xl font-bold text-foreground">
                              {manga.chapters || 'N/A'}
                              <span className="text-sm font-normal text-muted-foreground ml-1">
                                Chapters
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
