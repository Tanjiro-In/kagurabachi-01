import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchBar from '../components/SearchBar';
import MangaSearchBar from '../components/MangaSearchBar';
import GenreFilter from '../components/GenreFilter';
import TrendingSection from '../components/TrendingSection';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimeCard from '../components/AnimeCard';
import { 
  fetchTrendingAnimeAniList, 
  fetchTrendingMangaAniList, 
  searchAnimeAniList, 
  searchMangaAniList 
} from '../services/anilistApi';
import { convertAniListToJikan } from '../utils/dataConverter';

// Keep Jikan API for genres and fallback
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
  const [animeSearchQuery, setAnimeSearchQuery] = useState('');
  const [mangaSearchQuery, setMangaSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [animeSearchResults, setAnimeSearchResults] = useState<any[]>([]);
  const [mangaSearchResults, setMangaSearchResults] = useState<any[]>([]);
  const [isSearchingAnime, setIsSearchingAnime] = useState(false);
  const [isSearchingManga, setIsSearchingManga] = useState(false);
  const [genreResults, setGenreResults] = useState<any[]>([]);
  const [isLoadingGenreResults, setIsLoadingGenreResults] = useState(false);

  // Fetch trending anime from AniList
  const {
    data: trendingAnimeData,
    isLoading: trendingAnimeLoading
  } = useQuery({
    queryKey: ['trending-anime-anilist'],
    queryFn: async () => {
      const anilistData = await fetchTrendingAnimeAniList();
      return anilistData.map(convertAniListToJikan);
    }
  });

  // Fetch trending manga from AniList
  const {
    data: trendingMangaData,
    isLoading: trendingMangaLoading
  } = useQuery({
    queryKey: ['trending-manga-anilist'],
    queryFn: async () => {
      const anilistData = await fetchTrendingMangaAniList();
      return anilistData.map(convertAniListToJikan);
    }
  });

  // Fetch genres from Jikan
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

  const handleAnimeSearch = async (query: string) => {
    if (!query.trim()) {
      setAnimeSearchResults([]);
      setIsSearchingAnime(false);
      return;
    }
    setIsSearchingAnime(true);
    setAnimeSearchQuery(query);
    setSelectedGenres([]);
    setGenreResults([]);
    try {
      const data = await searchAnimeAniList(query);
      setAnimeSearchResults(data.map(convertAniListToJikan));
    } catch (error) {
      console.error('Anime search failed:', error);
      setAnimeSearchResults([]);
    }
  };

  const handleMangaSearch = async (query: string) => {
    if (!query.trim()) {
      setMangaSearchResults([]);
      setIsSearchingManga(false);
      return;
    }
    setIsSearchingManga(true);
    setMangaSearchQuery(query);
    setSelectedGenres([]);
    setGenreResults([]);
    try {
      const data = await searchMangaAniList(query);
      setMangaSearchResults(data.map(convertAniListToJikan));
    } catch (error) {
      console.error('Manga search failed:', error);
      setMangaSearchResults([]);
    }
  };

  const handleGenreToggle = async (genreId: number) => {
    const newSelectedGenres = selectedGenres.includes(genreId) 
      ? selectedGenres.filter(id => id !== genreId) 
      : [genreId];

    setSelectedGenres(newSelectedGenres);
    setIsSearchingAnime(false);
    setIsSearchingManga(false);
    setAnimeSearchResults([]);
    setMangaSearchResults([]);

    if (newSelectedGenres.length === 0) {
      setGenreResults([]);
      return;
    }

    setIsLoadingGenreResults(true);
    try {
      const [animeData, mangaData] = await Promise.all([
        fetchAnimeByGenre(genreId), 
        fetchMangaByGenre(genreId)
      ]);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl gradient-text font-bold md:text-7xl">
              Kagura<span className="text-foreground">bachi</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the best anime and manga recommendations with real-time trending data
            </p>
          </div>
          
          {/* Dual Search Bars */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Search Anime</h3>
              <SearchBar onSearch={handleAnimeSearch} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Search Manga</h3>
              <MangaSearchBar onSearch={handleMangaSearch} />
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
          <section className="space-y-6">
            {isLoadingGenreResults ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold gradient-text">Genre Results</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
                </div>
                {genreResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {genreResults.map(item => (
                      <AnimeCard key={item.mal_id} anime={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No results found for the selected genre.</p>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Anime Search Results */}
        {isSearchingAnime && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-center gradient-text">
              Anime Results for "{animeSearchQuery}"
            </h2>
            {animeSearchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {animeSearchResults.map(anime => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No anime found matching your search criteria.</p>
              </div>
            )}
          </section>
        )}

        {/* Manga Search Results */}
        {isSearchingManga && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-center gradient-text">
              Manga Results for "{mangaSearchQuery}"
            </h2>
            {mangaSearchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {mangaSearchResults.map(manga => (
                  <AnimeCard key={manga.mal_id} anime={manga} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No manga found matching your search criteria.</p>
              </div>
            )}
          </section>
        )}

        {/* Trending Content - only show if not searching or filtering */}
        {!isSearchingAnime && !isSearchingManga && selectedGenres.length === 0 && (
          <>
            {/* Trending Anime */}
            {trendingAnimeLoading ? (
              <LoadingSpinner />
            ) : (
              <TrendingSection animes={trendingAnimeData || []} title="Trending Anime" />
            )}

            {/* Trending Manga */}
            {trendingMangaLoading ? (
              <LoadingSpinner />
            ) : trendingMangaData && (
              <section className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold gradient-text">Trending Manga</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {trendingMangaData.map((manga: any) => (
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
