import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageGallery from '../components/ImageGallery';
import DetailedInfo from '../components/DetailedInfo';
import { fetchMangaDetailAniList } from '../services/details';
import { convertAniListMangaDetailToJikan } from '../utils/detailConverter';

const fetchMangaDetails = async (id: string, expectedTitle?: string) => {
  try {
    // First try AniList (primary source) with title validation
    console.log('Fetching manga details from AniList for ID:', id, 'Expected title:', expectedTitle);
    const anilistData = await fetchMangaDetailAniList(id, expectedTitle);
    return { data: convertAniListMangaDetailToJikan(anilistData), source: 'anilist' };
  } catch (anilistError) {
    console.log('AniList failed, trying Jikan API:', anilistError);
    
    // Fallback to Jikan API
    try {
      const response = await fetch(`https://api.jikan.moe/v4/manga/${id}/full`);
      if (response.ok) {
        const jikanData = await response.json();
        
        // Validate title if provided
        if (expectedTitle && jikanData.data?.title) {
          const fetchedTitle = jikanData.data.title;
          console.log('Jikan API title validation - Expected:', expectedTitle, 'Got:', fetchedTitle);
        }
        
        return { data: jikanData.data, source: 'jikan' };
      }
    } catch (jikanError) {
      console.log('Jikan API also failed:', jikanError);
    }

    // Final attempt with search
    try {
      const searchResponse = await fetch(`https://api.jikan.moe/v4/manga?q=${id}&limit=1`);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.data && searchData.data.length > 0) {
          const mangaId = searchData.data[0].mal_id;
          const detailResponse = await fetch(`https://api.jikan.moe/v4/manga/${mangaId}/full`);
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            return { data: detailData.data, source: 'jikan-search' };
          }
        }
      }
    } catch (searchError) {
      console.log('Search fallback failed:', searchError);
    }

    throw new Error('Failed to fetch manga details from all sources');
  }
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
  
  return { data: [] };
};

const MangaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract expected title from navigation state if available
  const expectedTitle = location.state?.title || location.state?.expectedTitle;

  const { data: mangaData, isLoading: mangaLoading, error: mangaError } = useQuery({
    queryKey: ['manga-details', id, expectedTitle],
    queryFn: () => fetchMangaDetails(id!, expectedTitle),
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
    console.log('Navigating back to home from manga detail page');
    
    sessionStorage.setItem('return-context', JSON.stringify({
      type: 'manga',
      timestamp: Date.now(),
      fromDetailPage: true
    }));
    
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

  const manga = mangaData.data;
  const pictures = picturesData?.data || [];

  console.log('Manga data source:', mangaData.source);
  console.log('Final manga title:', manga.title);

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
        {!picturesLoading && (
          <ImageGallery images={pictures} title={manga.title} />
        )}

        <DetailedInfo data={manga} type="manga" />
      </div>
    </div>
  );
};

export default MangaDetailPage;
