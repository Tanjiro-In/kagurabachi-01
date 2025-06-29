
import { AniListAnime, AniListManga } from '../services/types';

export const convertAniListToJikan = (item: AniListAnime | AniListManga) => {
  return {
    mal_id: item.idMal || item.id, // Use MAL ID if available, fallback to AniList ID
    anilist_id: item.id, // Store original AniList ID
    title: item.title.english || item.title.romaji,
    title_english: item.title.english,
    title_japanese: item.title.native,
    title_romaji: item.title.romaji, // Add romaji for better matching
    images: {
      jpg: {
        image_url: item.coverImage.extraLarge || item.coverImage.large,
        large_image_url: item.coverImage.extraLarge || item.coverImage.large,
      },
    },
    score: item.averageScore ? item.averageScore / 10 : null,
    genres: item.genres.map((genre, index) => ({ mal_id: index, name: genre })),
    type: item.format,
    status: item.status,
    episodes: 'episodes' in item ? item.episodes : undefined,
    chapters: 'chapters' in item ? item.chapters : undefined,
    year: item.startDate?.year,
    data_source: 'anilist', // Track the source
  };
};
