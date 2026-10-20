import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockLibraryApi } from 'services/mockLibraryApi';

const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [wList, fList] = await Promise.all([
        mockLibraryApi.getWishlist(),
        mockLibraryApi.getFavorites(),
      ]);
      setWishlist(wList);
      setFavorites(fList);
      setLoading(false);
    }
    loadData();
  }, []);

  const toggleWishlist = async (movie) => {
    const exists = wishlist.some((m) => m.id === movie.id);
    if (exists) {
      const updated = await mockLibraryApi.removeFromWishlist(movie.id);
      setWishlist(updated);
    } else {
      const updated = await mockLibraryApi.addToWishlist(movie);
      setWishlist(updated);
    }
  };

  const toggleFavorite = async (movie) => {
    const exists = favorites.some((m) => m.id === movie.id);
    if (exists) {
      const updated = await mockLibraryApi.removeFromFavorites(movie.id);
      setFavorites(updated);
    } else {
      const updated = await mockLibraryApi.addToFavorites(movie);
      setFavorites(updated);
    }
  };

  const isInWishlist = (movieId) => wishlist.some((m) => m.id === movieId);
  const isInFavorites = (movieId) => favorites.some((m) => m.id === movieId);

  return (
    <LibraryContext.Provider
      value={{
        wishlist,
        favorites,
        loading,
        toggleWishlist,
        toggleFavorite,
        isInWishlist,
        isInFavorites,
      }}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => useContext(LibraryContext);
