
import { fetchFromAniList } from './anilistClient';
import { TRENDING_ANIME_QUERY, TRENDING_MANGA_QUERY } from './queries';
import { AniListAnime, AniListManga } from './types';

export const fetchTrendingAnimeAniList = async (): Promise<AniListAnime[]> => {
  const data = await fetchFromAniList(TRENDING_ANIME_QUERY);
  return data.data.Page.media.filter((anime: AniListAnime) => 
    anime.title && anime.coverImage && anime.genres && anime.genres.length > 0
  );
};

export const fetchTrendingMangaAniList = async (): Promise<AniListManga[]> => {
  const data = await fetchFromAniList(TRENDING_MANGA_QUERY);
  return data.data.Page.media.filter((manga: AniListManga) => 
    manga.title && manga.coverImage && manga.genres && manga.genres.length > 0
  );
};
