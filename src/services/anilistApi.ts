const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

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

const TRENDING_ANIME_QUERY = `
  query {
    Page(page: 1, perPage: 12) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
        }
        averageScore
        genres
        format
        status
        episodes
        startDate {
          year
        }
      }
    }
  }
`;

const TRENDING_MANGA_QUERY = `
  query {
    Page(page: 1, perPage: 12) {
      media(type: MANGA, sort: TRENDING_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
        }
        averageScore
        genres
        format
        status
        chapters
        startDate {
          year
        }
      }
    }
  }
`;

const SEARCH_ANIME_QUERY = `
  query($search: String!) {
    Page(page: 1, perPage: 12) {
      media(type: ANIME, search: $search) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
        }
        averageScore
        genres
        format
        status
        episodes
        startDate {
          year
        }
      }
    }
  }
`;

const SEARCH_MANGA_QUERY = `
  query($search: String!) {
    Page(page: 1, perPage: 12) {
      media(type: MANGA, search: $search) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
        }
        averageScore
        genres
        format
        status
        chapters
        startDate {
          year
        }
      }
    }
  }
`;

export const fetchTrendingAnimeAniList = async (): Promise<AniListAnime[]> => {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: TRENDING_ANIME_QUERY,
    }),
  });

  if (!response.ok) throw new Error('Failed to fetch trending anime from AniList');
  const data = await response.json();
  return data.data.Page.media;
};

export const fetchTrendingMangaAniList = async (): Promise<AniListManga[]> => {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: TRENDING_MANGA_QUERY,
    }),
  });

  if (!response.ok) throw new Error('Failed to fetch trending manga from AniList');
  const data = await response.json();
  return data.data.Page.media;
};

export const searchAnimeAniList = async (query: string): Promise<AniListAnime[]> => {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: SEARCH_ANIME_QUERY,
      variables: { search: query },
    }),
  });

  if (!response.ok) throw new Error('Failed to search anime on AniList');
  const data = await response.json();
  return data.data.Page.media;
};

export const searchMangaAniList = async (query: string): Promise<AniListManga[]> => {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: SEARCH_MANGA_QUERY,
      variables: { search: query },
    }),
  });

  if (!response.ok) throw new Error('Failed to search manga on AniList');
  const data = await response.json();
  return data.data.Page.media;
};
