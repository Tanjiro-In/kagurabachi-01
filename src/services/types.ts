
export interface AniListAnime {
  id: number;
  idMal?: number;
  title: {
    romaji: string;
    english?: string;
    native: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
  };
  averageScore?: number;
  genres: string[];
  format: string;
  status: string;
  episodes?: number;
  startDate?: {
    year?: number;
  };
}

export interface AniListManga {
  id: number;
  idMal?: number;
  title: {
    romaji: string;
    english?: string;
    native: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
  };
  averageScore?: number;
  genres: string[];
  format: string;
  status: string;
  chapters?: number;
  startDate?: {
    year?: number;
  };
}

export interface AniListAnimeDetail {
  id: number;
  idMal?: number;
  title: {
    romaji: string;
    english?: string;
    native: string;
  };
  description?: string;
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
  };
  bannerImage?: string;
  averageScore?: number;
  genres: string[];
  tags: {
    name: string;
  }[];
  format: string;
  status: string;
  episodes?: number;
  duration?: number;
  source?: string;
  studios: {
    nodes: {
      name: string;
    }[];
  };
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
}

export interface AniListMangaDetail {
  id: number;
  idMal?: number;
  title: {
    romaji: string;
    english?: string;
    native: string;
  };
  description?: string;
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
  };
  bannerImage?: string;
  averageScore?: number;
  genres: string[];
  tags: {
    name: string;
  }[];
  format: string;
  status: string;
  chapters?: number;
  volumes?: number;
  staff: {
    nodes: {
      name: {
        full: string;
      };
    }[];
  };
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
}
