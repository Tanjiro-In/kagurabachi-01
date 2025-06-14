
import { fetchFromAniList } from './anilistClient';
import { ANIME_DETAIL_QUERY, MANGA_DETAIL_QUERY } from './queries';
import { AniListAnimeDetail, AniListMangaDetail } from './types';

export const fetchAnimeDetailAniList = async (id: string): Promise<AniListAnimeDetail> => {
  // First try with the ID as MAL ID
  try {
    const data = await fetchFromAniList(ANIME_DETAIL_QUERY, { idMal: parseInt(id) });
    if (data.data?.Media) {
      return data.data.Media;
    }
  } catch (error) {
    console.log('Failed to fetch by MAL ID, trying AniList ID');
  }

  // If not found by MAL ID, try with AniList ID
  try {
    const data = await fetchFromAniList(ANIME_DETAIL_QUERY, { id: parseInt(id) });
    if (data.data?.Media) {
      return data.data.Media;
    }
  } catch (error) {
    console.log('Failed to fetch by AniList ID');
  }

  throw new Error('Anime not found in AniList database');
};

export const fetchMangaDetailAniList = async (id: string): Promise<AniListMangaDetail> => {
  // First try with the ID as MAL ID
  try {
    const data = await fetchFromAniList(MANGA_DETAIL_QUERY, { idMal: parseInt(id) });
    if (data.data?.Media) {
      return data.data.Media;
    }
  } catch (error) {
    console.log('Failed to fetch by MAL ID, trying AniList ID');
  }

  // If not found by MAL ID, try with AniList ID
  try {
    const data = await fetchFromAniList(MANGA_DETAIL_QUERY, { id: parseInt(id) });
    if (data.data?.Media) {
      return data.data.Media;
    }
  } catch (error) {
    console.log('Failed to fetch by AniList ID');
  }

  throw new Error('Manga not found in AniList database');
};
