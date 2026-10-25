import Constants from 'expo-constants';

// På en telefon är localhost telefonen själv, så utan EXPO_PUBLIC_API_URL används
// samma dator som Expo-servern körs på (hostUri är t.ex. "192.168.1.10:8081")
function defaultBaseUrl() {
  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  return `http://${host}:8080/api`;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl();

let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) {
  authToken = token;
}

// authContext registrerar en funktion här som loggar ut när token inte längre är giltig
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `API request failed: ${status}`);
    this.status = status;
    this.errors = body?.errors ?? null;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    if (res.status === 401 && authToken && onUnauthorized) onUnauthorized();
    throw new ApiError(res.status, errorBody);
  }

  // 204 No Content, t.ex. när en film tas bort helt från biblioteket
  if (res.status === 204) return null;
  return res.json();
}

export const register = (name, email, password) =>
  request('/auth/register', { method: 'POST', body: { name, email, password } });
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password } });
export const getCurrentUser = () => request('/users/me');

export const getLibrary = () => request('/library');
export const updateLibraryEntry = (tmdbId, changes) =>
  request(`/library/${tmdbId}`, { method: 'PATCH', body: changes });

export const getRating = (tmdbId) => request(`/ratings/${tmdbId}`);
export const setRating = (tmdbId, score, movie) =>
  request(`/ratings/${tmdbId}`, { method: 'PUT', body: { score, movie } });
export const deleteRating = (tmdbId) => request(`/ratings/${tmdbId}`, { method: 'DELETE' });

// Kommentarer hämtas alltid för den inloggade användaren, backend visar aldrig andras
export const getComments = (tmdbId) => request(`/comments/movie/${tmdbId}`);
export const getMyComments = () => request('/comments/me');
export const addComment = (tmdbId, text, movie) =>
  request(`/comments/movie/${tmdbId}`, { method: 'POST', body: { text, movie } });
export const updateComment = (commentId, text) =>
  request(`/comments/${commentId}`, { method: 'PUT', body: { text } });
export const deleteComment = (commentId) => request(`/comments/${commentId}`, { method: 'DELETE' });
