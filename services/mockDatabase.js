let mockWishlist = [];
let mockFavorites = [];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockLibraryApi = {
  getWishlist: async () => {
    await delay();
    return [...mockWishlist];
  },
  addToWishList: async (movie) => {
    await delay();
    if (!mockWishlist.some((m) => m.id === movie.id)) {
      mockWishlist.push(movie);
    }
    return [...mockWishlist];
  },
  removeFromWishlist: async (movieId) => {
    await delay();
    mockWishlist = mockWishlist.filter((m) => m.id !== movieId);
    return [...mockWishlist];
  },

  getFavorites: async () => {
    await delay();
    return [...mockFavorites];
  },
  addToFavotites: async () => {
    await delay();
    if (!mockFavorites.some((m) => m.id === movie.id)) {
      mockFavorites.push(movie);
    }
    return [...mockFavorites];
  },
  removeFromFavorites: async (movieId) => {
    await delay();
    mockFavorites = mockFavorites.filter((m) => m.id !== movieId);
    return [...mockFavorites];
  },
};
