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

const ANIME_BY_GENRE_QUERY = `
  query($genres: [String], $seasonYear: Int) {
    Page(page: 1, perPage: 8) {
      media(
        type: ANIME, 
        genre_in: $genres, 
        seasonYear: $seasonYear,
        sort: SCORE_DESC,
        averageScore_greater: 60
      ) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description
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

const MANGA_BY_GENRE_QUERY = `
  query($genres: [String], $seasonYear: Int) {
    Page(page: 1, perPage: 8) {
      media(
        type: MANGA, 
        genre_in: $genres, 
        seasonYear: $seasonYear,
        sort: SCORE_DESC,
        averageScore_greater: 60
      ) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description
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
  return data.data.Page.media.filter((anime: AniListAnime) => 
    anime.title && anime.coverImage && anime.genres && anime.genres.length > 0
  );
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
  return data.data.Page.media.filter((manga: AniListManga) => 
    manga.title && manga.coverImage && manga.genres && manga.genres.length > 0
  );
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

export const fetchAnimeByGenresAniList = async (genres: string[], yearRange: string): Promise<AniListAnime[]> => {
  let seasonYear = null;
  
  if (yearRange !== 'any') {
    const [start, end] = yearRange.split('-').map(y => parseInt(y));
    // Use the middle year of the range for seasonYear
    seasonYear = Math.floor((start + end) / 2);
  }

  console.log('Fetching anime with genres:', genres, 'and seasonYear:', seasonYear);

  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: ANIME_BY_GENRE_QUERY,
      variables: { genres, seasonYear },
    }),
  });

  if (!response.ok) {
    console.error('Failed to fetch anime by genres from AniList');
    throw new Error('Failed to fetch anime by genres from AniList');
  }
  
  const data = await response.json();
  console.log('Anime by genres response:', data);
  
  if (data.errors) {
    console.error('GraphQL errors:', data.errors);
    return [];
  }
  
  return data.data.Page.media.filter((anime: AniListAnime) => 
    anime.title && anime.coverImage && anime.genres && anime.genres.length > 0
  );
};

export const fetchMangaByGenresAniList = async (genres: string[], yearRange: string): Promise<AniListManga[]> => {
  let seasonYear = null;
  
  if (yearRange !== 'any') {
    const [start, end] = yearRange.split('-').map(y => parseInt(y));
    // Use the middle year of the range for seasonYear
    seasonYear = Math.floor((start + end) / 2);
  }

  console.log('Fetching manga with genres:', genres, 'and seasonYear:', seasonYear);

  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: MANGA_BY_GENRE_QUERY,
      variables: { genres, seasonYear },
    }),
  });

  if (!response.ok) {
    console.error('Failed to fetch manga by genres from AniList');
    throw new Error('Failed to fetch manga by genres from AniList');
  }
  
  const data = await response.json();
  console.log('Manga by genres response:', data);
  
  if (data.errors) {
    console.error('GraphQL errors:', data.errors);
    return [];
  }
  
  return data.data.Page.media.filter((manga: AniListManga) => 
    manga.title && manga.coverImage && manga.genres && manga.genres.length > 0
  );
};
