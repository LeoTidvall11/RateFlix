import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from 'context/authContext';
import { useToast } from 'context/ToastContext';
import { getLibrary, updateLibraryEntry } from 'services/api';

const EMPTY_STATUS = { inWatchlist: false, isFavorite: false, watched: false };

// Skickar bara det vi behöver för att visa kort/statistik inte hela TMDB-svaret
export function pickMovieFields(movie) {
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
  const definedFields = Object.entries(fields).filter(([, value]) => value !== undefined);
  return Object.fromEntries(definedFields);
}

function hasAnyStatus(entry) {
  return entry.inWatchlist || entry.isFavorite || entry.watched;
}

// Skapar en sorteringsfunktion som lägger senast tillagda först
function newestFirst(dateKey) {
  return (entryA, entryB) => (entryB[dateKey] ?? '').localeCompare(entryA[dateKey] ?? '');
}

function getTimestamp() {
  return new Date().toISOString();
}

// Backend skickar tre listor här blir de ett objekt med TMDB-id som nyckel
function toLibraryMap({ watchlist, favorites, watched }) {
  const library = {};
  [...watchlist, ...favorites, ...watched].forEach((entry) => {
    library[entry.movie.id] = entry;
  });
  return library;
}

function withEntry(library, movieId, entry) {
  const { [movieId]: _removed, ...remainingLibrary } = library;
  return entry ? { ...remainingLibrary, [movieId]: entry } : remainingLibrary;
}

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [loadedLibrary, setLibrary] = useState({});
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { showToast } = useToast();

  // Hämta biblioteket från backend när användaren loggar in
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    getLibrary()
      .then((data) => {
        if (cancelled) return;
        setLibrary(toLibraryMap(data));
        setError(null);
        setLoadedUserId(userId);
      })
      .catch((error) => {
        console.error('Kunde inte ladda biblioteket:', error);
        if (cancelled) return;
        setLibrary({});
        setError('Kunde inte hämta ditt bibliotek. Kontrollera din anslutning.');
        setLoadedUserId(userId);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const reload = () => {
    setError(null);
    setLoadedUserId(null);
    setReloadKey((key) => key + 1);
  };

  const library = useMemo(
    () => (userId && loadedUserId === userId ? loadedLibrary : {}),
    [userId, loadedUserId, loadedLibrary]
  );
  const loading = userId !== null && loadedUserId !== userId;

  // Uppdaterar en films post direkt i appen och skickar sedan ändringen till backend.
  // getChanges får den nuvarande posten och returnerar de fält som ska ändras.
  // Går anropet fel återställs posten.
  const updateEntry = (movie, getChanges) => {
    const previousEntry = library[movie.id];
    const currentEntry = previousEntry ?? { movie: {}, ...EMPTY_STATUS };
    const changes = getChanges(currentEntry);

    const updatedEntry = {
      ...currentEntry,
      ...changes,
      movie: { ...currentEntry.movie, ...pickMovieFields(movie) },
    };

    setLibrary((prevLibrary) =>
      withEntry(prevLibrary, movie.id, hasAnyStatus(updatedEntry) ? updatedEntry : null)
    );

    const { watchlistAt, favoriteAt, watchedAt, ...flags } = changes;
    updateLibraryEntry(movie.id, { movie: updatedEntry.movie, ...flags })
      .then((savedEntry) =>
        setLibrary((prevLibrary) => withEntry(prevLibrary, movie.id, savedEntry))
      )
      .catch((error) => {
        console.error('Kunde inte spara i biblioteket:', error);
        setLibrary((prevLibrary) => withEntry(prevLibrary, movie.id, previousEntry));
        showToast('Kunde inte spara ändringen', 'error');
      });
  };

  const toggleWatchlist = (movie) =>
    updateEntry(movie, (entry) => ({
      inWatchlist: !entry.inWatchlist,
      watchlistAt: entry.inWatchlist ? null : getTimestamp(),
    }));

  const toggleFavorite = (movie) =>
    updateEntry(movie, (entry) => ({
      isFavorite: !entry.isFavorite,
      favoriteAt: entry.isFavorite ? null : getTimestamp(),
    }));

  const toggleWatched = (movie) =>
    updateEntry(movie, (entry) => {
      if (entry.watched) {
        return { watched: false, watchedAt: null };
      }
      return {
        watched: true,
        watchedAt: getTimestamp(),
        inWatchlist: false,
        watchlistAt: null,
      };
    });

  const getStatus = (movieId) => {
    const entry = library[movieId];
    if (!entry) return EMPTY_STATUS;

    return {
      inWatchlist: entry.inWatchlist,
      isFavorite: entry.isFavorite,
      watched: entry.watched,
    };
  };

  const lists = useMemo(() => {
    const allEntries = Object.values(library);

    return {
      watchlist: allEntries.filter((entry) => entry.inWatchlist).sort(newestFirst('watchlistAt')),
      favorites: allEntries.filter((entry) => entry.isFavorite).sort(newestFirst('favoriteAt')),
      watched: allEntries.filter((entry) => entry.watched).sort(newestFirst('watchedAt')),
    };
  }, [library]);

  return (
    <LibraryContext.Provider
      value={{
        loading,
        error: userId ? error : null,
        reload,
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
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary måste användas inuti <LibraryProvider>');
  return context;
}
