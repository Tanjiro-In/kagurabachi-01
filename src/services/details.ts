
import { fetchFromAniList } from './anilistClient';
import { ANIME_DETAIL_QUERY, MANGA_DETAIL_QUERY } from './queries';
import { AniListAnimeDetail, AniListMangaDetail } from './types';

const normalizeTitle = (title: string): string => {
  return title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
};

const titleMatches = (title1: string, title2: string): boolean => {
  const normalized1 = normalizeTitle(title1);
  const normalized2 = normalizeTitle(title2);
  return normalized1 === normalized2 || 
         normalized1.includes(normalized2) || 
         normalized2.includes(normalized1);
};

export const fetchAnimeDetailAniList = async (id: string, expectedTitle?: string): Promise<AniListAnimeDetail> => {
  console.log(`Fetching anime details for ID: ${id}, expected title: ${expectedTitle}`);
  
  const numericId = parseInt(id);
  
  // Strategy 1: Try as MAL ID first
  try {
    console.log('Attempting fetch with MAL ID:', numericId);
    const data = await fetchFromAniList(ANIME_DETAIL_QUERY, { idMal: numericId });
    if (data.data?.Media) {
      const anime = data.data.Media;
      console.log('Found by MAL ID, title:', anime.title.english || anime.title.romaji);
      
      // Validate title if provided
      if (expectedTitle) {
        const fetchedTitle = anime.title.english || anime.title.romaji;
        if (!titleMatches(expectedTitle, fetchedTitle)) {
          console.warn(`Title mismatch - Expected: ${expectedTitle}, Got: ${fetchedTitle}`);
          // Continue to try AniList ID
        } else {
          console.log('Title validation passed for MAL ID');
          return anime;
        }
      } else {
        return anime;
      }
    }
  } catch (error) {
    console.log('Failed to fetch by MAL ID:', error.message);
  }

  // Strategy 2: Try as AniList ID
  try {
    console.log('Attempting fetch with AniList ID:', numericId);
    const data = await fetchFromAniList(ANIME_DETAIL_QUERY, { id: numericId });
    if (data.data?.Media) {
      const anime = data.data.Media;
      console.log('Found by AniList ID, title:', anime.title.english || anime.title.romaji);
      
      // Validate title if provided
      if (expectedTitle) {
        const fetchedTitle = anime.title.english || anime.title.romaji;
        if (!titleMatches(expectedTitle, fetchedTitle)) {
          console.error(`Critical title mismatch - Expected: ${expectedTitle}, Got: ${fetchedTitle}`);
          // Still return the data but log the issue
        } else {
          console.log('Title validation passed for AniList ID');
        }
      }
      return anime;
    }
  } catch (error) {
    console.log('Failed to fetch by AniList ID:', error.message);
  }

  throw new Error(`Anime not found in AniList database for ID: ${id}`);
};

export const fetchMangaDetailAniList = async (id: string, expectedTitle?: string): Promise<AniListMangaDetail> => {
  console.log(`Fetching manga details for ID: ${id}, expected title: ${expectedTitle}`);
  
  const numericId = parseInt(id);
  
  // Strategy 1: Try as MAL ID first
  try {
    console.log('Attempting fetch with MAL ID:', numericId);
    const data = await fetchFromAniList(MANGA_DETAIL_QUERY, { idMal: numericId });
    if (data.data?.Media) {
      const manga = data.data.Media;
      console.log('Found by MAL ID, title:', manga.title.english || manga.title.romaji);
      
      // Validate title if provided
      if (expectedTitle) {
        const fetchedTitle = manga.title.english || manga.title.romaji;
        if (!titleMatches(expectedTitle, fetchedTitle)) {
          console.warn(`Title mismatch - Expected: ${expectedTitle}, Got: ${fetchedTitle}`);
          // Continue to try AniList ID
        } else {
          console.log('Title validation passed for MAL ID');
          return manga;
        }
      } else {
        return manga;
      }
    }
  } catch (error) {
    console.log('Failed to fetch by MAL ID:', error.message);
  }

  // Strategy 2: Try as AniList ID
  try {
    console.log('Attempting fetch with AniList ID:', numericId);
    const data = await fetchFromAniList(MANGA_DETAIL_QUERY, { id: numericId });
    if (data.data?.Media) {
      const manga = data.data.Media;
      console.log('Found by AniList ID, title:', manga.title.english || manga.title.romaji);
      
      // Validate title if provided
      if (expectedTitle) {
        const fetchedTitle = manga.title.english || manga.title.romaji;
        if (!titleMatches(expectedTitle, fetchedTitle)) {
          console.error(`Critical title mismatch - Expected: ${expectedTitle}, Got: ${fetchedTitle}`);
          // Still return the data but log the issue
        } else {
          console.log('Title validation passed for AniList ID');
        }
      }
      return manga;
    }
  } catch (error) {
    console.log('Failed to fetch by AniList ID:', error.message);
  }

  throw new Error(`Manga not found in AniList database for ID: ${id}`);
};
