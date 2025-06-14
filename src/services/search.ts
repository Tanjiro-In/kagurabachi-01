
import { fetchFromAniList } from './anilistClient';
import { SEARCH_ANIME_QUERY, SEARCH_MANGA_QUERY } from './queries';
import { AniListAnime, AniListManga } from './types';

export const searchAnimeAniList = async (query: string): Promise<AniListAnime[]> => {
  const data = await fetchFromAniList(SEARCH_ANIME_QUERY, { search: query });
  return data.data.Page.media;
};

export const searchMangaAniList = async (query: string): Promise<AniListManga[]> => {
  const data = await fetchFromAniList(SEARCH_MANGA_QUERY, { search: query });
  return data.data.Page.media;
};
