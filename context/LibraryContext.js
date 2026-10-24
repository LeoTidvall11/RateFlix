import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { libraryStorage } from 'services/libraryStorage';

const EMPTY_STATUS = { inWatchlist: false, isFavorite: false, watched: false };

// Sparar bara det vi behöver för att visa kort/statistik inte hela TMDB-svaret
function pickMovieFields(movie) {
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

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [library, setLibrary] = useState({});
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  // Läs in sparat bibliotek vid start
  useEffect(() => {
    libraryStorage.load().then((savedLibrary) => {
      setLibrary(savedLibrary);
      setLoading(false);
      hasLoaded.current = true;
    });
  }, []);

  // Spara varje gång biblioteket ändras (men inte innan det har laddats)
  useEffect(() => {
    if (hasLoaded.current) libraryStorage.save(library);
  }, [library]);

  // Uppdaterar en films post. getChanges får den nuvarande posten och
  // returnerar de fält som ska ändras.
  const updateEntry = (movie, getChanges) => {
    setLibrary((prevLibrary) => {
      const currentEntry = prevLibrary[movie.id] ?? { movie: {}, ...EMPTY_STATUS };

      const updatedEntry = {
        ...currentEntry,
        ...getChanges(currentEntry),
        movie: { ...currentEntry.movie, ...pickMovieFields(movie) },
      };

      // Ingen flagga kvar: ta bort filmen helt från biblioteket
      if (!hasAnyStatus(updatedEntry)) {
        const { [movie.id]: _removed, ...remainingLibrary } = prevLibrary;
        return remainingLibrary;
      }

      return { ...prevLibrary, [movie.id]: updatedEntry };
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

  // Markeras en film som sedd försvinner den från watchlisten
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
