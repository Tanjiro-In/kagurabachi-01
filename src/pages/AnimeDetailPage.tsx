import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageGallery from '../components/ImageGallery';
import DetailedInfo from '../components/DetailedInfo';
import { fetchAnimeDetailAniList } from '../services/details';
import { convertAniListAnimeDetailToJikan } from '../utils/detailConverter';

const fetchAnimeDetails = async (id: string, expectedTitle?: string) => {
  console.log('Fetching anime details from AniList for ID:', id, 'Expected title:', expectedTitle);
  const anilistData = await fetchAnimeDetailAniList(id, expectedTitle);
  return { data: convertAniListAnimeDetailToJikan(anilistData), source: 'anilist' };
};

const fetchAnimeImages = async (animeData: any, expectedTitle?: string) => {
  const images = [];
  
  // Add AniList images if available
  if (animeData?.images?.jpg?.large_image_url) {
    images.push({
      jpg: {
        image_url: animeData.images.jpg.large_image_url,
        large_image_url: animeData.images.jpg.large_image_url
      }
    });
  }

  // Fetch Jikan pictures if we have a valid MAL ID
  if (animeData?.mal_id) {
    // Title validation if provided
    if (expectedTitle && animeData.title) {
      const normalizeTitle = (title: string) => title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      const expectedNormalized = normalizeTitle(expectedTitle);
      const actualNormalized = normalizeTitle(animeData.title);
      
      if (!actualNormalized.includes(expectedNormalized) && !expectedNormalized.includes(actualNormalized)) {
        console.log(`Title mismatch for pictures - Expected: ${expectedTitle}, Got: ${animeData.title}. Using only AniList images.`);
        return { data: images };
      }
    }

    try {
      console.log('Fetching Jikan pictures for MAL ID:', animeData.mal_id, 'Title:', animeData.title);
      const response = await fetch(`https://api.jikan.moe/v4/anime/${animeData.mal_id}/pictures`);
      if (response.ok) {
        const picturesData = await response.json();
        if (picturesData.data && picturesData.data.length > 0) {
          console.log('Successfully fetched', picturesData.data.length, 'Jikan pictures for', animeData.title);
          images.push(...picturesData.data);
        }
      } else {
        console.log('Failed to fetch Jikan pictures, status:', response.status);
      }
    } catch (error) {
      console.log('Failed to fetch Jikan pictures:', error);
    }
  }
  
  console.log('Total images found:', images.length);
  return { data: images };
};

const AnimeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract expected title from navigation state if available
  const expectedTitle = location.state?.title || location.state?.expectedTitle;

  const { data: animeData, isLoading: animeLoading, error: animeError } = useQuery({
    queryKey: ['anime-details', id, expectedTitle],
    queryFn: () => fetchAnimeDetails(id!, expectedTitle),
    enabled: !!id,
    retry: 2,
  });

  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['anime-images', animeData?.data?.mal_id, animeData?.data?.title, expectedTitle],
    queryFn: () => fetchAnimeImages(animeData?.data, expectedTitle),
    enabled: !!animeData?.data,
    retry: 1,
  });

  const handleBackToHome = () => {
    console.log('Navigating back to home from anime detail page');
    
    // Get the current page state to preserve context
    const savedPageState = sessionStorage.getItem('pageState');
    let lastActiveSection = 'trending';
    
    if (savedPageState) {
      try {
        const pageState = JSON.parse(savedPageState);
        lastActiveSection = pageState.lastActiveSection || 'trending';
      } catch (error) {
        console.log('Failed to parse saved page state');
      }
    }
    
    // Navigate with proper state to prevent reset
    navigate('/', { 
      state: { 
        fromDetailPage: true, 
        type: 'anime',
        preserveState: true,
        lastActiveSection
      } 
    });
  };

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
        <div className="text-center space-y-4 px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Anime not found</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            This anime might not be available in our database or the ID might be incorrect.
          </p>
          {expectedTitle && (
            <p className="text-sm text-muted-foreground">
              Expected: {expectedTitle}
            </p>
          )}
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

  const anime = animeData.data;
  const images = imagesData?.data || [];

  console.log('Anime data source:', animeData.source);
  console.log('Final anime title:', anime.title);
  console.log('Images count:', images.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Optimized Hero Section for Mobile */}
      <div className="relative h-48 sm:h-64 md:h-96 overflow-hidden">
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className="w-full h-full object-cover filter blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        
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

        <div className="absolute bottom-3 sm:bottom-4 md:bottom-8 left-3 sm:left-4 md:left-8 right-3 sm:right-4 md:right-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-8 items-center sm:items-start">
            <img
              src={anime.images.jpg.large_image_url}
              alt={anime.title}
              className="w-24 h-32 sm:w-32 sm:h-44 md:w-48 md:h-64 object-cover rounded-lg md:rounded-xl shadow-2xl"
            />
            <div className="space-y-1 sm:space-y-2 md:space-y-4 flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-6xl font-bold gradient-text leading-tight">
                {anime.title}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 md:gap-4 text-xs sm:text-sm md:text-base text-muted-foreground">
                <span>{anime.year || 'Unknown Year'}</span>
                <span>•</span>
                <span>{anime.episodes ? `${anime.episodes} Episodes` : 'Unknown Episodes'}</span>
                <span>•</span>
                <span className="truncate max-w-20 sm:max-w-none">{anime.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8 md:space-y-12">
        {!imagesLoading && (
          <ImageGallery images={images} title={anime.title} />
        )}

        <DetailedInfo data={anime} type="anime" />
      </div>
    </div>
  );
};

export default AnimeDetailPage;
