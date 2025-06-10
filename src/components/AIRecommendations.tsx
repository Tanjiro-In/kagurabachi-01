
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Calendar, Tags } from 'lucide-react';
import AnimeCard from './AnimeCard';
import LoadingSpinner from './LoadingSpinner';

interface AIRecommendationsProps {
  selectedGenres: number[];
}

const fetchRecommendations = async (genreIds: number[]) => {
  const currentYear = new Date().getFullYear();
  const genreParam = genreIds.length > 0 ? genreIds[0] : 1; // Default to Action if no genre selected
  
  // Fetch recent popular anime and manga
  const [animeResponse, mangaResponse] = await Promise.all([
    fetch(`https://api.jikan.moe/v4/anime?genres=${genreParam}&order_by=score&sort=desc&start_date=${currentYear - 3}-01-01&limit=4`),
    fetch(`https://api.jikan.moe/v4/manga?genres=${genreParam}&order_by=score&sort=desc&start_date=${currentYear - 3}-01-01&limit=4`)
  ]);

  if (!animeResponse.ok || !mangaResponse.ok) {
    throw new Error('Failed to fetch recommendations');
  }

  const [animeData, mangaData] = await Promise.all([
    animeResponse.json(),
    mangaResponse.json()
  ]);

  return {
    anime: animeData.data || [],
    manga: mangaData.data || []
  };
};

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ selectedGenres }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['ai-recommendations', selectedGenres],
    queryFn: () => fetchRecommendations(selectedGenres),
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  const recommendations = [
    ...(data?.anime?.slice(0, 2) || []),
    ...(data?.manga?.slice(0, 2) || [])
  ];

  if (!recommendations.length) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Tags className="w-4 h-4" />
            <span>Based on {selectedGenres.length > 0 ? 'selected genres' : 'popular trends'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Recent releases</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((item) => (
          <AnimeCard key={item.mal_id} anime={item} />
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;
