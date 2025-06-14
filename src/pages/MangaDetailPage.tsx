import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageGallery from '../components/ImageGallery';
import DetailedInfo from '../components/DetailedInfo';
import { useScrollRestoration } from '../hooks/useScrollRestoration';

const SCROLL_RESTORATION_KEY = 'scroll-positions';

const fetchMangaDetails = async (id: string) => {
  // First try to fetch from Jikan with the provided ID
  try {
    const response = await fetch(`https://api.jikan.moe/v4/manga/${id}/full`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.log('Jikan API failed, trying alternative approach');
  }

  // If that fails, try to search for the manga by ID or title
  try {
    const searchResponse = await fetch(`https://api.jikan.moe/v4/manga?q=${id}&limit=1`);
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.data && searchData.data.length > 0) {
        const mangaId = searchData.data[0].mal_id;
        const detailResponse = await fetch(`https://api.jikan.moe/v4/manga/${mangaId}/full`);
        if (detailResponse.ok) {
          return detailResponse.json();
        }
      }
    }
  } catch (error) {
    console.log('Alternative search failed');
  }

  throw new Error('Failed to fetch manga details');
};

const fetchMangaPictures = async (id: string) => {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/manga/${id}/pictures`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.log('Failed to fetch pictures');
  }
  
  // Return empty data if pictures can't be fetched
  return { data: [] };
};

const MangaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Function to save scroll position for the home page ('/')
  const saveHomeScrollPosition = () => {
    if (typeof window === 'undefined') return;
    const scrollPositions = JSON.parse(
      sessionStorage.getItem(SCROLL_RESTORATION_KEY) || '{}'
    );
    scrollPositions['/'] = {
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    };
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
    console.log('Saved scroll position for home (/):', scrollPositions['/']);
  };

  // Add scroll restoration for this page only
  useScrollRestoration(`manga-detail-${id}`);

  const { data: mangaData, isLoading: mangaLoading, error: mangaError } = useQuery({
    queryKey: ['manga-details', id],
    queryFn: () => fetchMangaDetails(id!),
    enabled: !!id,
    retry: 2,
  });

  const { data: picturesData, isLoading: picturesLoading } = useQuery({
    queryKey: ['manga-pictures', id],
    queryFn: () => fetchMangaPictures(id!),
    enabled: !!id,
    retry: 1,
  });

  const handleBackToHome = () => {
    console.log('Setting navigation state for home page preservation');
    // Save the current scroll position for home
    saveHomeScrollPosition();
    // Mark navigation state to preserve home page state
    if (window.history.pushState) {
      window.history.replaceState(
        { ...(window.history.state || {}), fromDetailPage: true },
        ''
      );
    }
    navigate('/');
  };

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
        <div className="text-center space-y-4 px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Manga not found</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            This manga might not be available in our database or the ID might be incorrect.
          </p>
          <button 
            onClick={handleBackToHome}
            className="bg-primary text-primary-foreground px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm md:text-base"
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
      {/* Optimized Hero Section for Mobile */}
      <div className="relative h-48 sm:h-64 md:h-96 overflow-hidden">
        <img
          src={manga.images.jpg.large_image_url}
          alt={manga.title}
          className="w-full h-full object-cover filter blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        
        {/* Enhanced Back Button with Better Mobile Positioning */}
        <div className="absolute top-3 left-3 md:top-8 md:left-8 z-20">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-1.5 md:gap-2 bg-black/80 backdrop-blur-sm text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-black/90 transition-colors text-sm md:text-base border border-white/20"
          >
            <ArrowLeft size={16} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>

        {/* Optimized Content Layout for Mobile */}
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-8 left-3 sm:left-4 md:left-8 right-3 sm:right-4 md:right-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-8 items-center sm:items-start">
            <img
              src={manga.images.jpg.large_image_url}
              alt={manga.title}
              className="w-24 h-32 sm:w-32 sm:h-44 md:w-48 md:h-64 object-cover rounded-lg md:rounded-xl shadow-2xl"
            />
            <div className="space-y-1 sm:space-y-2 md:space-y-4 flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-6xl font-bold gradient-text leading-tight">
                {manga.title}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 md:gap-4 text-xs sm:text-sm md:text-base text-muted-foreground">
                <span>{manga.published?.from ? new Date(manga.published.from).getFullYear() : 'Unknown Year'}</span>
                <span>•</span>
                <span>{manga.chapters ? `${manga.chapters} Chapters` : 'Unknown Chapters'}</span>
                <span>•</span>
                <span className="truncate max-w-20 sm:max-w-none">{manga.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8 md:space-y-12">
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
