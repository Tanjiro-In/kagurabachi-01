
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageGallery from '../components/ImageGallery';
import DetailedInfo from '../components/DetailedInfo';

const fetchMangaDetails = async (id: string) => {
  const response = await fetch(`https://api.jikan.moe/v4/manga/${id}/full`);
  if (!response.ok) throw new Error('Failed to fetch manga details');
  return response.json();
};

const fetchMangaPictures = async (id: string) => {
  const response = await fetch(`https://api.jikan.moe/v4/manga/${id}/pictures`);
  if (!response.ok) throw new Error('Failed to fetch manga pictures');
  return response.json();
};

const MangaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: mangaData, isLoading: mangaLoading, error: mangaError } = useQuery({
    queryKey: ['manga-details', id],
    queryFn: () => fetchMangaDetails(id!),
    enabled: !!id,
  });

  const { data: picturesData, isLoading: picturesLoading } = useQuery({
    queryKey: ['manga-pictures', id],
    queryFn: () => fetchMangaPictures(id!),
    enabled: !!id,
  });

  if (mangaLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (mangaError || !mangaData?.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Manga not found</h2>
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

  const manga = mangaData.data;
  const pictures = picturesData?.data || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={manga.images.jpg.large_image_url}
          alt={manga.title}
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
              src={manga.images.jpg.large_image_url}
              alt={manga.title}
              className="w-48 h-64 object-cover rounded-xl shadow-2xl"
            />
            <div className="space-y-4 flex-1">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                {manga.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <span>{manga.published?.from ? new Date(manga.published.from).getFullYear() : 'Unknown Year'}</span>
                <span>•</span>
                <span>{manga.chapters ? `${manga.chapters} Chapters` : 'Unknown Chapters'}</span>
                <span>•</span>
                <span>{manga.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        {/* Image Gallery */}
        {!picturesLoading && (
          <ImageGallery images={pictures} title={manga.title} />
        )}

        {/* Detailed Information */}
        <DetailedInfo data={manga} type="manga" />
      </div>
    </div>
  );
};

export default MangaDetailPage;
