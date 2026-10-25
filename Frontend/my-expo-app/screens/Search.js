import PosterTile from 'components/cards/PosterTile';
import ScreenBackground from 'components/ScreenBackground';
import MovieCarousel from 'components/Carousel/MovieCarousel';
import ErrorMessage from 'components/ErrorMessage';
import { SearchIcon, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { getGenres, getMoviesByGenre, searchMovies } from 'services/externalApi';
import colors from '../theme/colors';

const COLUMNS = 3;
const GAP = 12;
const SIDE_PADDING = 16;

export default function Search({ navigation }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [genreSections, setGenreSections] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [genreError, setGenreError] = useState(null);
  const [genreReloadKey, setGenreReloadKey] = useState(0);

  const { width } = useWindowDimensions();
  const latestQuery = useRef('');
  const isFetching = useRef(false);

  const tileWidth = (width - SIDE_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  useEffect(() => {
    const loadGenreContent = async () => {
      try {
        const { genres } = await getGenres();

        // TMDB-ID Äventyr 12, fantasy 14, animerat 16,  Action 28, Komedi 35, kriminalare 80, Sci-Fi 878
        const featuredIds = [12, 14, 16, 27, 28, 35, 80, 878];
        const selectedGenres = genres.filter((g) => featuredIds.includes(g.id));

        const requests = selectedGenres.map(async (genre) => {
          const data = await getMoviesByGenre(genre.id);
          return {
            id: genre.id,
            title: genre.name,
            movies: data.results || [],
          };
        });

        const sections = await Promise.all(requests);
        setGenreSections(sections);
      } catch (err) {
        console.error('Fel vid hämtning av genreinnehåll:', err);
        setGenreError('Kunde inte hämta filmer per genre. Kontrollera din anslutning.');
      } finally {
        setLoadingGenres(false);
      }
    };

    loadGenreContent();
  }, [genreReloadKey]);

  const retryGenres = () => {
    setLoadingGenres(true);
    setGenreError(null);
    setGenreReloadKey((key) => key + 1);
  };

  const fetchPage = async (q, pageToLoad) => {
    isFetching.current = true;
    setSearchError(null);
    try {
      const data = await searchMovies(q, pageToLoad);
      if (q !== latestQuery.current) return;

      const newResults = data.results || [];
      setResults((prev) => {
        if (pageToLoad === 1) return newResults;
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...newResults.filter((m) => !seen.has(m.id))];
      });
      setPage(pageToLoad);
      setTotalPages(data.total_pages || 0);
    } catch (err) {
      console.error('Sökfel:', err);
      if (q === latestQuery.current) {
        setSearchError('Sökningen misslyckades. Kontrollera din anslutning och försök igen.');
      }
    } finally {
      if (q === latestQuery.current) {
        isFetching.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = query.trim();
      if (q === latestQuery.current) return;

      latestQuery.current = q;
      isFetching.current = false;
      setDebouncedQuery(q);
      setResults([]);
      setPage(0);
      setTotalPages(0);
      setLoadingMore(false);
      setSearchError(null);
      setLoading(Boolean(q));
      if (q) fetchPage(q, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const loadMore = () => {
    // Vid fel laddas inget automatiskt, användaren får trycka "Försök igen"
    if (searchError || !debouncedQuery || isFetching.current || page === 0 || page >= totalPages)
      return;
    setLoadingMore(true);
    fetchPage(debouncedQuery, page + 1);
  };

  const retrySearch = () => {
    if (page === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    fetchPage(debouncedQuery, page + 1);
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('movieDetail', { movieId: movie.id });
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="mt-12 items-center">
          <ActivityIndicator color={colors.blood[600]} size="large" />
        </View>
      );
    }
    if (searchError) {
      return <ErrorMessage message={searchError} onRetry={retrySearch} className="mt-12 px-6" />;
    }
    if (debouncedQuery) {
      return (
        <Text className="mt-12 px-6 text-center text-base text-text-secondary">
          Inga filmer hittades för ”{debouncedQuery}”
        </Text>
      );
    }
    return null;
  };

  return (
    <ScreenBackground
      list={{
        data: results,
        numColumns: COLUMNS,
        keyExtractor: (item) => item.id.toString(),
        columnWrapperStyle: { gap: GAP, paddingHorizontal: SIDE_PADDING, marginBottom: 18 },
        renderItem: ({ item }) => (
          <PosterTile movie={item} width={tileWidth} onPress={() => handleMoviePress(item)} />
        ),
        onEndReached: loadMore,
        onEndReachedThreshold: 0.6,
        ListEmptyComponent: renderEmpty,
        ListFooterComponent: loadingMore ? (
          <ActivityIndicator className="my-6" color={colors.blood[600]} />
        ) : searchError && results.length > 0 ? (
          <ErrorMessage message={searchError} onRetry={retrySearch} className="px-6" />
        ) : null,
      }}>
      <View className="px-6 pb-6 pt-4">
        <View className="flex-row items-center rounded-2xl border border-glass-border bg-glass px-4 py-3">
          <SearchIcon size={20} color={'#BDB1AE'} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Sök efter film, serie ..."
            placeholderTextColor={'#7E7371'}
            className="ml-3 flex-1 text-base text-text-primary"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Rensa sökning">
              <X size={18} color={'#BDB1AE'} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!debouncedQuery && (
        <View className="mt-2 gap-6 pb-6">
          {loadingGenres ? (
            <ActivityIndicator color={colors.blood[600]} size="small" className="my-4" />
          ) : genreError ? (
            <ErrorMessage message={genreError} onRetry={retryGenres} className="px-6" />
          ) : (
            genreSections.map((section) => (
              <View key={section.id}>
                <MovieCarousel
                  movies={section.movies}
                  title={section.title}
                  onPressMovie={handleMoviePress}
                />
              </View>
            ))
          )}
        </View>
      )}
    </ScreenBackground>
  );
}
