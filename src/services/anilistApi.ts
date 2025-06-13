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
  query($genres: [String], $startDateGreater: FuzzyDateInt, $startDateLesser: FuzzyDateInt, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
        lastPage
      }
      media(
        type: ANIME, 
        genre_in: $genres, 
        startDate_greater: $startDateGreater,
        startDate_lesser: $startDateLesser,
        sort: [SCORE_DESC, POPULARITY_DESC],
        averageScore_greater: 50
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
  query($genres: [String], $startDateGreater: FuzzyDateInt, $startDateLesser: FuzzyDateInt, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
        lastPage
      }
      media(
        type: MANGA, 
        genre_in: $genres, 
        startDate_greater: $startDateGreater,
        startDate_lesser: $startDateLesser,
        sort: [SCORE_DESC, POPULARITY_DESC],
        averageScore_greater: 50
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

export const fetchAnimeByGenresAniList = async (genres: string[], yearRange: string, page: number = 1): Promise<{ data: AniListAnime[], hasNextPage: boolean }> => {
  let startDateGreater = null;
  let startDateLesser = null;
  
  if (yearRange !== 'any') {
    const [start, end] = yearRange.split('-').map(y => parseInt(y));
    startDateGreater = start * 10000 + 101; // January 1st of start year
    startDateLesser = (end + 1) * 10000 + 101; // January 1st of year after end
  }

  console.log('Fetching anime with genres:', genres, 'year range:', yearRange, 'page:', page);

  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: ANIME_BY_GENRE_QUERY,
      variables: { 
        genres, 
        startDateGreater, 
        startDateLesser,
        page,
        perPage: 12
      },
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
    return { data: [], hasNextPage: false };
  }
  
  const filteredData = data.data.Page.media.filter((anime: AniListAnime) => 
    anime.title && anime.coverImage && anime.genres && anime.genres.length > 0
  );
  
  return {
    data: filteredData,
    hasNextPage: data.data.Page.pageInfo.hasNextPage
  };
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

  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: MANGA_BY_GENRE_QUERY,
      variables: { 
        genres, 
        startDateGreater, 
        startDateLesser,
        page,
        perPage: 12
      },
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
    return { data: [], hasNextPage: false };
  }
  
  const filteredData = data.data.Page.media.filter((manga: AniListManga) => 
    manga.title && manga.coverImage && manga.genres && manga.genres.length > 0
  );
  
  return {
    data: filteredData,
    hasNextPage: data.data.Page.pageInfo.hasNextPage
  };
};
