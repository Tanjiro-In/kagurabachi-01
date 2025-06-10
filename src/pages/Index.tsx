
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchBar from '../components/SearchBar';
import GenreFilter from '../components/GenreFilter';
import TrendingSection from '../components/TrendingSection';
import LoadingSpinner from '../components/LoadingSpinner';
import AIRecommendations from '../components/AIRecommendations';
import SearchResults from '../components/SearchResults';
import GenreResults from '../components/GenreResults';

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

const fetchMangaBySearch = async (query: string) => {
  const response = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=12`);
  if (!response.ok) throw new Error('Failed to search manga');
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

const fetchAnimeByGenreAndYear = async (genreId: number, yearRange: [number, number]) => {
  const [startYear, endYear] = yearRange;
  const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&start_date=${startYear}-01-01&end_date=${endYear}-12-31&limit=16`);
  if (!response.ok) throw new Error('Failed to fetch anime by genre and year');
  return response.json();
};

const fetchMangaByGenreAndYear = async (genreId: number, yearRange: [number, number]) => {
  const [startYear, endYear] = yearRange;
  const response = await fetch(`https://api.jikan.moe/v4/manga?genres=${genreId}&start_date=${startYear}-01-01&end_date=${endYear}-12-31&limit=16`);
  if (!response.ok) throw new Error('Failed to fetch manga by genre and year');
  return response.json();
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedYearRange, setSelectedYearRange] = useState<[number, number]>([1950, new Date().getFullYear()]);
  const [animeSearchResults, setAnimeSearchResults] = useState<any[]>([]);
  const [mangaSearchResults, setMangaSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [animeGenreResults, setAnimeGenreResults] = useState<any[]>([]);
  const [mangaGenreResults, setMangaGenreResults] = useState<any[]>([]);
  const [isLoadingGenreResults, setIsLoadingGenreResults] = useState(false);

  // Fetch trending anime
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-anime'],
    queryFn: fetchTrendingAnime,
  });

  const { data: mangaData, isLoading: mangaLoading } = useQuery({
    queryKey: ['top-manga'],
    queryFn: fetchTopManga,
  });

  const { data: animeGenresData, isLoading: animeGenresLoading } = useQuery({
    queryKey: ['anime-genres'],
    queryFn: fetchAnimeGenres,
  });

  const { data: mangaGenresData, isLoading: mangaGenresLoading } = useQuery({
    queryKey: ['manga-genres'],
    queryFn: fetchMangaGenres,
  });

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setAnimeSearchResults([]);
      setMangaSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    setSelectedGenres([]);
    setAnimeGenreResults([]);
    setMangaGenreResults([]);
    
    try {
      const [animeData, mangaData] = await Promise.all([
        fetchAnimeBySearch(query),
        fetchMangaBySearch(query)
      ]);
      
      setAnimeSearchResults(animeData.data || []);
      setMangaSearchResults(mangaData.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setAnimeSearchResults([]);
      setMangaSearchResults([]);
    }
  };

  const handleGenreToggle = async (genreId: number) => {
    const newSelectedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [genreId];

    setSelectedGenres(newSelectedGenres);
    setIsSearching(false);
    setAnimeSearchResults([]);
    setMangaSearchResults([]);

    if (newSelectedGenres.length === 0) {
      setAnimeGenreResults([]);
      setMangaGenreResults([]);
      return;
    }

    await fetchGenreResults(genreId, selectedYearRange);
  };

  const handleYearRangeChange = async (yearRange: [number, number]) => {
    setSelectedYearRange(yearRange);
    
    if (selectedGenres.length > 0) {
      await fetchGenreResults(selectedGenres[0], yearRange);
    }
  };

  const fetchGenreResults = async (genreId: number, yearRange: [number, number]) => {
    setIsLoadingGenreResults(true);
    
    try {
      const [animeData, mangaData] = await Promise.all([
        fetchAnimeByGenreAndYear(genreId, yearRange),
        fetchMangaByGenreAndYear(genreId, yearRange)
      ]);
      
      setAnimeGenreResults(animeData.data || []);
      setMangaGenreResults(mangaData.data || []);
    } catch (error) {
      console.error('Genre fetch failed:', error);
      setAnimeGenreResults([]);
      setMangaGenreResults([]);
    } finally {
      setIsLoadingGenreResults(false);
    }
  };

  const animeGenres = animeGenresData?.data || [];
  const mangaGenres = mangaGenresData?.data || [];
  const isGenresLoading = animeGenresLoading || mangaGenresLoading;

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
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="w-full lg:w-96">
              <AIRecommendations selectedGenres={selectedGenres} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-16 pb-20">
        {/* Genre Filter */}
        <GenreFilter 
          animeGenres={animeGenres}
          mangaGenres={mangaGenres}
          selectedGenres={selectedGenres}
          onGenreToggle={handleGenreToggle}
          isLoading={isGenresLoading}
        />

        {/* Genre Results */}
        {selectedGenres.length > 0 && (
          <GenreResults
            animeResults={animeGenreResults}
            mangaResults={mangaGenreResults}
            selectedYearRange={selectedYearRange}
            onYearRangeChange={handleYearRangeChange}
            isLoading={isLoadingGenreResults}
          />
        )}

        {/* Search Results */}
        {isSearching && (
          <SearchResults
            animeResults={animeSearchResults}
            mangaResults={mangaSearchResults}
            searchQuery={searchQuery}
          />
        )}

        {/* Trending Anime - only show if not searching or filtering */}
        {!isSearching && selectedGenres.length === 0 && (
          <>
            {trendingLoading ? (
              <LoadingSpinner />
            ) : (
              <TrendingSection 
                animes={trendingData?.data || []}
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
                  {mangaData.data.map((manga: any) => (
                    <AnimeCard key={manga.mal_id} anime={manga} />
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
