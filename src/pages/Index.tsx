import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchBar from '../components/SearchBar';
import GenreFilter from '../components/GenreFilter';
import TrendingSection from '../components/TrendingSection';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimeCard from '../components/AnimeCard';

// API functions
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
const fetchAnimeGenres = async () => {
  const response = await fetch('https://api.jikan.moe/v4/genres/anime');
  if (!response.ok) throw new Error('Failed to fetch anime genres');
  return response.json();
};
const fetchMangaGenres = async () => {
  const response = await fetch('https://api.jikan.moe/v4/genres/manga');
  if (!response.ok) throw new Error('Failed to fetch manga genres');
  return response.json();
};
const fetchAnimeByGenre = async (genreId: number) => {
  const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&limit=16`);
  if (!response.ok) throw new Error('Failed to fetch anime by genre');
  return response.json();
};
const fetchMangaByGenre = async (genreId: number) => {
  const response = await fetch(`https://api.jikan.moe/v4/manga?genres=${genreId}&limit=16`);
  if (!response.ok) throw new Error('Failed to fetch manga by genre');
  return response.json();
};
const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [genreResults, setGenreResults] = useState<any[]>([]);
  const [isLoadingGenreResults, setIsLoadingGenreResults] = useState(false);

  // Fetch trending anime
  const {
    data: trendingData,
    isLoading: trendingLoading
  } = useQuery({
    queryKey: ['trending-anime'],
    queryFn: fetchTrendingAnime
  });

  // Fetch top manga
  const {
    data: mangaData,
    isLoading: mangaLoading
  } = useQuery({
    queryKey: ['top-manga'],
    queryFn: fetchTopManga
  });

  // Fetch genres
  const {
    data: animeGenresData,
    isLoading: animeGenresLoading
  } = useQuery({
    queryKey: ['anime-genres'],
    queryFn: fetchAnimeGenres
  });
  const {
    data: mangaGenresData,
    isLoading: mangaGenresLoading
  } = useQuery({
    queryKey: ['manga-genres'],
    queryFn: fetchMangaGenres
  });
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setSearchQuery(query);
    setSelectedGenres([]);
    setGenreResults([]);
    try {
      const data = await fetchAnimeBySearch(query);
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  };
  const handleGenreToggle = async (genreId: number) => {
    const newSelectedGenres = selectedGenres.includes(genreId) ? selectedGenres.filter(id => id !== genreId) : [genreId]; // Only allow one genre at a time for simplicity

    setSelectedGenres(newSelectedGenres);
    setIsSearching(false);
    setSearchResults([]);
    if (newSelectedGenres.length === 0) {
      setGenreResults([]);
      return;
    }
    setIsLoadingGenreResults(true);
    try {
      // Fetch both anime and manga for the selected genre
      const [animeData, mangaData] = await Promise.all([fetchAnimeByGenre(genreId), fetchMangaByGenre(genreId)]);
      const combinedResults = [...(animeData.data || []), ...(mangaData.data || [])];
      setGenreResults(combinedResults);
    } catch (error) {
      console.error('Genre fetch failed:', error);
      setGenreResults([]);
    } finally {
      setIsLoadingGenreResults(false);
    }
  };
  const animeGenres = animeGenresData?.data || [];
  const mangaGenres = mangaGenresData?.data || [];
  const isGenresLoading = animeGenresLoading || mangaGenresLoading;
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl gradient-text font-bold md:text-7xl">
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
        <GenreFilter animeGenres={animeGenres} mangaGenres={mangaGenres} selectedGenres={selectedGenres} onGenreToggle={handleGenreToggle} isLoading={isGenresLoading} />

        {/* Genre Results */}
        {selectedGenres.length > 0 && <section className="space-y-6">
            {isLoadingGenreResults ? <LoadingSpinner /> : <>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold gradient-text">
                    Genre Results
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
                </div>
                {genreResults.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {genreResults.map(item => <AnimeCard key={item.mal_id} anime={item} />)}
                  </div> : <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No results found for the selected genre.</p>
                  </div>}
              </>}
          </section>}

        {/* Search Results */}
        {isSearching && <section className="space-y-6">
            <h2 className="text-3xl font-bold text-center gradient-text">
              Search Results for "{searchQuery}"
            </h2>
            {searchResults.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {searchResults.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)}
              </div> : <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No anime found matching your search criteria.</p>
              </div>}
          </section>}

        {/* Trending Anime - only show if not searching or filtering */}
        {!isSearching && selectedGenres.length === 0 && <>
            {trendingLoading ? <LoadingSpinner /> : <TrendingSection animes={trendingData?.data || []} title="Trending Anime" />}

            {/* Top Manga */}
            {mangaLoading ? <LoadingSpinner /> : mangaData?.data && <section className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold gradient-text">Top Manga</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {mangaData.data.map((manga: any) => <AnimeCard key={manga.mal_id} anime={manga} />)}
                </div>
              </section>}
          </>}
      </div>
    </div>;
};
export default Index;