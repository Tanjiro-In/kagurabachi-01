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
  query($genres: [String], $year: Int) {
    Page(page: 1, perPage: 8) {
      media(type: ANIME, genre_in: $genres, startDate_greater: $year, sort: SCORE_DESC) {
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

const MANGA_BY_GENRE_QUERY = `
  query($genres: [String], $year: Int) {
    Page(page: 1, perPage: 8) {
      media(type: MANGA, genre_in: $genres, startDate_greater: $year, sort: SCORE_DESC) {
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

const ANIME_BY_GENRES_QUERY = `
  query ($genres: [String], $year_greater: Int, $year_lesser: Int, $sort: [MediaSort]) {
    Page(page: 1, perPage: 8) {
      media(type: ANIME, genre_in: $genres, startDate_greater: $year_greater, startDate_lesser: $year_lesser, sort: $sort, isAdult: false) {
        id
        title {
          romaji
          english
          native
        }
        startDate {
          year
        }
        genres
        averageScore
        description
        coverImage {
          large
          extraLarge
        }
        format
        status
        episodes
      }
    }
  }
`;

const MANGA_BY_GENRES_QUERY = `
  query ($genres: [String], $year_greater: Int, $year_lesser: Int, $sort: [MediaSort]) {
    Page(page: 1, perPage: 8) {
      media(type: MANGA, genre_in: $genres, startDate_greater: $year_greater, startDate_lesser: $year_lesser, sort: $sort, isAdult: false) {
        id
        title {
          romaji
          english
          native
        }
        startDate {
          year
        }
        genres
        averageScore
        description
        coverImage {
          large
          extraLarge
        }
        format
        status
        chapters
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

export const fetchAnimeByGenresAniList = async (genres: string[], yearRange: string) => {
  try {
    console.log('Fetching anime by genres:', genres, 'year range:', yearRange);
    
    let year_greater = null;
    let year_lesser = null;
    
    if (yearRange !== 'any') {
      const [startYear, endYear] = yearRange.split('-');
      if (startYear && endYear) {
        year_greater = parseInt(startYear) * 10000; // AniList format: YYYYMMDD
        year_lesser = (parseInt(endYear) + 1) * 10000; // Next year to include end year
      }
    }

    const variables = {
      genres: genres,
      year_greater,
      year_lesser,
      sort: ['SCORE_DESC', 'POPULARITY_DESC']
    };

    console.log('AniList anime query variables:', variables);

    const response = await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: ANIME_BY_GENRES_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('AniList anime by genres response:', data);

    if (data.errors) {
      throw new Error(`AniList API error: ${data.errors[0].message}`);
    }

    return data.data.Page.media || [];
  } catch (error) {
    console.error('Failed to fetch anime by genres from AniList:', error);
    throw new Error('Failed to fetch anime by genres from AniList');
  }
};

export const fetchMangaByGenresAniList = async (genres: string[], yearRange: string) => {
  try {
    console.log('Fetching manga by genres:', genres, 'year range:', yearRange);
    
    let year_greater = null;
    let year_lesser = null;
    
    if (yearRange !== 'any') {
      const [startYear, endYear] = yearRange.split('-');
      if (startYear && endYear) {
        year_greater = parseInt(startYear) * 10000; // AniList format: YYYYMMDD
        year_lesser = (parseInt(endYear) + 1) * 10000; // Next year to include end year
      }
    }

    const variables = {
      genres: genres,
      year_greater,
      year_lesser,
      sort: ['SCORE_DESC', 'POPULARITY_DESC']
    };

    console.log('AniList manga query variables:', variables);

    const response = await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: MANGA_BY_GENRES_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('AniList manga by genres response:', data);

    if (data.errors) {
      throw new Error(`AniList API error: ${data.errors[0].message}`);
    }

    return data.data.Page.media || [];
  } catch (error) {
    console.error('Failed to fetch manga by genres from AniList:', error);
    throw new Error('Failed to fetch manga by genres from AniList');
  }
};
