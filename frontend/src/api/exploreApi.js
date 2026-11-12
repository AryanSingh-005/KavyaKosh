import client from './client';

/**
 * Fetch a paginated page of poems from the Explore feed.
 *
 * @param {Object} params
 * @param {string}  [params.search]    - Free-text search string
 * @param {string}  [params.mood]      - e.g. "Romance", "Melancholy"
 * @param {string}  [params.theme]     - e.g. "Love", "Loss"
 * @param {string}  [params.language]  - e.g. "Hindi", "Urdu"
 * @param {string}  [params.category]  - e.g. "Ghazal", "Doha"
 * @param {string}  [params.sortBy]    - "trending" | "newest" | "popular" | "discussed"
 * @param {number}  [params.page=0]    - Zero-based page index
 * @param {number}  [params.size=12]   - Items per page
 * @returns {Promise<{ content: [], totalPages: number, totalElements: number, last: boolean }>}
 */
export async function fetchExplorePoems(params = {}) {
  const { data } = await client.get('/explore/poems', {
    params: {
      search:   params.search   || undefined,
      mood:     params.mood     || undefined,
      theme:    params.theme    || undefined,
      language: params.language || undefined,
      category: params.category || undefined,
      sortBy:   params.sortBy   || 'trending',
      page:     params.page     ?? 0,
      size:     params.size     ?? 12,
    },
  });
  return data;
}

/**
 * Fetch available filter options (distinct mood/theme/language/category values).
 * @returns {Promise<{ moods: [], themes: [], languages: [], categories: [] }>}
 */
export async function fetchExploreFilters() {
  const { data } = await client.get('/explore/filters');
  return data;
}
