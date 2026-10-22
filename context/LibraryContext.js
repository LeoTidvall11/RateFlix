import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { libraryStorage } from 'services/libraryStorage';

// library: { [movieId]: { movie, inWatchlist, isFavorite, watched, watchlistAt, favoriteAt, watchedAt } }
// En post per film – listorna nedan är bara filter på samma data.

const EMPTY_STATUS = { inWatchlist: false, isFavorite: false, watched: false };

// Sparar bara det vi behöver för att visa kort/statistik, inte hela TMDB-svaret
function snapshot(movie) {
  const fields = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    runtime: movie.runtime,
    genres: movie.genres,
  };
  // Ta bort undefined så att vi inte skriver över data vi redan har
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
}

const byNewest = (key) => (a, b) => (b[key] ?? '').localeCompare(a[key] ?? '');

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [library, setLibrary] = useState({});
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  useEffect(() => {
    libraryStorage.load().then((data) => {
      setLibrary(data);
      setLoading(false);
      hasLoaded.current = true;
    });
  }, []);

  // Spara varje gång biblioteket ändras (men inte innan det har laddats)
  useEffect(() => {
    if (hasLoaded.current) libraryStorage.save(library);
  }, [library]);

  const updateEntry = (movie, getChanges) => {
    setLibrary((prev) => {
      const current = prev[movie.id] ?? { movie: {}, ...EMPTY_STATUS };
      const next = {
        ...current,
        ...getChanges(current),
        movie: { ...current.movie, ...snapshot(movie) },
      };

      const { [movie.id]: _removed, ...rest } = prev;
      // Ingen flagga kvar → ta bort filmen helt
      if (!next.inWatchlist && !next.isFavorite && !next.watched) return rest;
      return { ...rest, [movie.id]: next };
    });
  };

  const now = () => new Date().toISOString();

  const toggleWatchlist = (movie) =>
    updateEntry(movie, (e) => ({
      inWatchlist: !e.inWatchlist,
      watchlistAt: e.inWatchlist ? null : now(),
    }));

  const toggleFavorite = (movie) =>
    updateEntry(movie, (e) => ({
      isFavorite: !e.isFavorite,
      favoriteAt: e.isFavorite ? null : now(),
    }));

  // Markeras en film som sedd försvinner den från watchlisten
  const toggleWatched = (movie) =>
    updateEntry(movie, (e) =>
      e.watched
        ? { watched: false, watchedAt: null }
        : { watched: true, watchedAt: now(), inWatchlist: false, watchlistAt: null }
    );

  const getStatus = (movieId) => {
    const entry = library[movieId];
    return entry
      ? { inWatchlist: entry.inWatchlist, isFavorite: entry.isFavorite, watched: entry.watched }
      : EMPTY_STATUS;
  };

  const lists = useMemo(() => {
    const entries = Object.values(library);
    return {
      watchlist: entries.filter((e) => e.inWatchlist).sort(byNewest('watchlistAt')),
      favorites: entries.filter((e) => e.isFavorite).sort(byNewest('favoriteAt')),
      watched: entries.filter((e) => e.watched).sort(byNewest('watchedAt')),
    };
  }, [library]);

  return (
    <LibraryContext.Provider
      value={{
        loading,
        ...lists,
        toggleWatchlist,
        toggleFavorite,
        toggleWatched,
        getStatus,
      }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary måste användas inuti <LibraryProvider>');
  return ctx;
}
