
export const TRENDING_ANIME_QUERY = `
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

export const TRENDING_MANGA_QUERY = `
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

export const SEARCH_ANIME_QUERY = `
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

export const SEARCH_MANGA_QUERY = `
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

export const ANIME_BY_GENRE_QUERY = `
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

export const MANGA_BY_GENRE_QUERY = `
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

export const ANIME_DETAIL_QUERY = `
  query($id: Int, $idMal: Int) {
    Media(id: $id, idMal: $idMal, type: ANIME) {
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
      bannerImage
      averageScore
      genres
      tags {
        name
      }
      format
      status
      episodes
      duration
      source
      studios {
        nodes {
          name
        }
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
    }
  }
`;

export const MANGA_DETAIL_QUERY = `
  query($id: Int, $idMal: Int) {
    Media(id: $id, idMal: $idMal, type: MANGA) {
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
      bannerImage
      averageScore
      genres
      tags {
        name
      }
      format
      status
      chapters
      volumes
      staff {
        nodes {
          name {
            full
          }
        }
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
    }
  }
`;
