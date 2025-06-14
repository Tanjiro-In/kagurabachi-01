
const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

export const fetchFromAniList = async (query: string, variables: any = {}) => {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    console.error('GraphQL errors:', data.errors);
    throw new Error('GraphQL query failed');
  }

  return data;
};
