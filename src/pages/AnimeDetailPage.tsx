
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageGallery from '../components/ImageGallery';
import DetailedInfo from '../components/DetailedInfo';

const fetchAnimeDetails = async (id: string) => {
  const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
  if (!response.ok) throw new Error('Failed to fetch anime details');
  return response.json();
};

const fetchAnimePictures = async (id: string) => {
  const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/pictures`);
  if (!response.ok) throw new Error('Failed to fetch anime pictures');
  return response.json();
};

const AnimeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: animeData, isLoading: animeLoading, error: animeError } = useQuery({
    queryKey: ['anime-details', id],
    queryFn: () => fetchAnimeDetails(id!),
    enabled: !!id,
  });

  const { data: picturesData, isLoading: picturesLoading } = useQuery({
    queryKey: ['anime-pictures', id],
    queryFn: () => fetchAnimePictures(id!),
    enabled: !!id,
  });

  if (animeLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (animeError || !animeData?.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Anime not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const anime = animeData.data;
  const pictures = picturesData?.data || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className="w-full h-full object-cover filter blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        
        <div className="absolute top-8 left-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-card/80 backdrop-blur-sm text-foreground px-4 py-2 rounded-lg hover:bg-card transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img
              src={anime.images.jpg.large_image_url}
              alt={anime.title}
              className="w-48 h-64 object-cover rounded-xl shadow-2xl"
            />
            <div className="space-y-4 flex-1">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                {anime.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <span>{anime.year || 'Unknown Year'}</span>
                <span>•</span>
                <span>{anime.episodes ? `${anime.episodes} Episodes` : 'Unknown Episodes'}</span>
                <span>•</span>
                <span>{anime.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        {/* Image Gallery */}
        {!picturesLoading && (
          <ImageGallery images={pictures} title={anime.title} />
        )}

        {/* Detailed Information */}
        <DetailedInfo data={anime} type="anime" />
      </div>
    </div>
  );
};

export default AnimeDetailPage;
