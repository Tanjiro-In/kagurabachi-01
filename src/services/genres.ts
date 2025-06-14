
import { fetchFromAniList } from './anilistClient';
import { ANIME_BY_GENRE_QUERY, MANGA_BY_GENRE_QUERY } from './queries';
import { AniListAnime, AniListManga } from './types';

export const fetchAnimeByGenresAniList = async (genres: string[], yearRange: string, page: number = 1): Promise<{ data: AniListAnime[], hasNextPage: boolean }> => {
  let startDateGreater = null;
  let startDateLesser = null;
  
  if (yearRange !== 'any') {
    const [start, end] = yearRange.split('-').map(y => parseInt(y));
    startDateGreater = start * 10000 + 101; // January 1st of start year
    startDateLesser = (end + 1) * 10000 + 101; // January 1st of year after end
  }

  console.log('Fetching anime with genres:', genres, 'year range:', yearRange, 'page:', page);

  try {
    const data = await fetchFromAniList(ANIME_BY_GENRE_QUERY, { 
      genres, 
      startDateGreater, 
      startDateLesser,
      page,
      perPage: 12
    });

    console.log('Anime by genres response:', data);
    
    const filteredData = data.data.Page.media.filter((anime: AniListAnime) => 
      anime.title && anime.coverImage && anime.genres && anime.genres.length > 0
    );
    
    return {
      data: filteredData,
      hasNextPage: data.data.Page.pageInfo.hasNextPage
    };
  } catch (error) {
    console.error('Failed to fetch anime by genres from AniList');
    return { data: [], hasNextPage: false };
  }
};

export const fetchMangaByGenresAniList = async (genres: string[], yearRange: string, page: number = 1): Promise<{ data: AniListManga[], hasNextPage: boolean }> => {
  let startDateGreater = null;
  let startDateLesser = null;
  
  if (yearRange !== 'any') {
    const [start, end] = yearRange.split('-').map(y => parseInt(y));
    startDateGreater = start * 10000 + 101; // January 1st of start year
    startDateLesser = (end + 1) * 10000 + 101; // January 1st of year after end
  }

  console.log('Fetching manga with genres:', genres, 'year range:', yearRange, 'page:', page);

  try {
    const data = await fetchFromAniList(MANGA_BY_GENRE_QUERY, { 
      genres, 
      startDateGreater, 
      startDateLesser,
      page,
      perPage: 12
    });

    console.log('Manga by genres response:', data);
    
    const filteredData = data.data.Page.media.filter((manga: AniListManga) => 
      manga.title && manga.coverImage && manga.genres && manga.genres.length > 0
    );
    
    return {
      data: filteredData,
      hasNextPage: data.data.Page.pageInfo.hasNextPage
    };
  } catch (error) {
    console.error('Failed to fetch manga by genres from AniList');
    return { data: [], hasNextPage: false };
  }
};
