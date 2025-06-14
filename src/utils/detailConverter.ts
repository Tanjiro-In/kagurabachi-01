
import { AniListAnimeDetail, AniListMangaDetail } from '../services/anilistApi';

export const convertAniListAnimeDetailToJikan = (anime: AniListAnimeDetail) => {
  return {
    mal_id: anime.idMal || anime.id,
    title: anime.title.english || anime.title.romaji,
    title_english: anime.title.english,
    title_japanese: anime.title.native,
    images: {
      jpg: {
        image_url: anime.coverImage.extraLarge || anime.coverImage.large,
        large_image_url: anime.coverImage.extraLarge || anime.coverImage.large,
      },
    },
    synopsis: anime.description?.replace(/<[^>]*>/g, '') || 'No synopsis available',
    score: anime.averageScore ? anime.averageScore / 10 : null,
    genres: anime.genres.map((genre, index) => ({ mal_id: index, name: genre })),
    themes: anime.tags?.slice(0, 5).map((tag, index) => ({ mal_id: index, name: tag.name })) || [],
    type: anime.format,
    status: anime.status,
    episodes: anime.episodes,
    duration: anime.duration,
    source: anime.source,
    studios: anime.studios?.nodes?.map((studio, index) => ({ mal_id: index, name: studio.name })) || [],
    aired: {
      from: anime.startDate ? `${anime.startDate.year}-${anime.startDate.month || 1}-${anime.startDate.day || 1}` : null,
      to: anime.endDate ? `${anime.endDate.year}-${anime.endDate.month || 12}-${anime.endDate.day || 31}` : null,
    },
    year: anime.startDate?.year,
  };
};

export const convertAniListMangaDetailToJikan = (manga: AniListMangaDetail) => {
  return {
    mal_id: manga.idMal || manga.id,
    title: manga.title.english || manga.title.romaji,
    title_english: manga.title.english,
    title_japanese: manga.title.native,
    images: {
      jpg: {
        image_url: manga.coverImage.extraLarge || manga.coverImage.large,
        large_image_url: manga.coverImage.extraLarge || manga.coverImage.large,
      },
    },
    synopsis: manga.description?.replace(/<[^>]*>/g, '') || 'No synopsis available',
    score: manga.averageScore ? manga.averageScore / 10 : null,
    genres: manga.genres.map((genre, index) => ({ mal_id: index, name: genre })),
    themes: manga.tags?.slice(0, 5).map((tag, index) => ({ mal_id: index, name: tag.name })) || [],
    type: manga.format,
    status: manga.status,
    chapters: manga.chapters,
    volumes: manga.volumes,
    authors: manga.staff?.nodes?.map((author, index) => ({ mal_id: index, name: author.name.full })) || [],
    published: {
      from: manga.startDate ? `${manga.startDate.year}-${manga.startDate.month || 1}-${manga.startDate.day || 1}` : null,
      to: manga.endDate ? `${manga.endDate.year}-${manga.endDate.month || 12}-${manga.endDate.day || 31}` : null,
    },
    year: manga.startDate?.year,
  };
};
