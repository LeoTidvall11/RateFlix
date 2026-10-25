const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const TOKEN = process.env.EXPO_PUBLIC_TMDB_TOKEN;

async function request(path, params = {}) {
  const query = new URLSearchParams({ language: 'en-US', ...params }).toString();
  const res = await fetch(`${BASE_URL}${path}?${query}`, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.status_message || `TMDB request failed: ${res.status}`);
  }

  return res.json();
}

//  storlekar: w185, w342, w500, w780 och original
export function imageUrl(path, size = 'w342') {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export const getTrendingMovies = (timeWindow = 'week') => request(`/trending/movie/${timeWindow}`);
export const getPopularMovies = (page = 1) => request('/movie/popular', { page });
export const getTopRatedMovies = (page = 1) => request('/movie/top_rated', { page });
export const getUpcomingMovies = (page = 1) => request('/movie/upcoming', { page });
export const getNowPlayingMovies = (page = 1) => request('/movie/now_playing', { page });

export const getMovieDetails = (id) =>
  request(`/movie/${id}`, { append_to_response: 'credits,videos,similar' });

export const getGenres = () => request('/genre/movie/list');
export const getMoviesByGenre = (genreId, page = 1) =>
  request('/discover/movie', { with_genres: genreId, page, sort_by: 'popularity.desc' });

export const searchMovies = (query, page = 1) => request('/search/movie', { query, page });
