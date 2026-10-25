import ScreenBackground from 'components/ScreenBackground';
import Categories from '../components/buttons/Categories';
import { View, ActivityIndicator } from 'react-native';
import ErrorMessage from 'components/ErrorMessage';
import colors from 'theme/colors';
import Title from 'components/text/Title';
import { useFetch } from 'hooks/useFetch';
import { useCallback } from 'react';
import {
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  getUpcomingMovies,
} from 'services/externalApi';
import TrendingFan from 'components/cards/TrendingFan';
import MovieCarousel from 'components/Carousel/MovieCarousel';
export default function HomeScreen({ navigation, route }) {
  const fetcher = useCallback(() => getTrendingMovies('week'), []);
  const trending = useFetch(fetcher);

  const popular = useFetch(getPopularMovies);
  const topRated = useFetch(getTopRatedMovies);
  const upcoming = useFetch(getUpcomingMovies);
  const nowPlaying = useFetch(getNowPlayingMovies);
  const openMovie = (movie) => navigation.navigate('movieDetail', { movieId: movie.id });

  // Varje lista hämtas för sig, så ett fel döljer bara den listan. "Försök igen" hämtar om de som misslyckades.
  const failed = [trending, popular, topRated, upcoming, nowPlaying].filter((list) => list.error);
  const retryFailed = () => failed.forEach((list) => list.reload());

  return (
    <ScreenBackground>
      <View className="flex-1 items-center justify-center">
        {trending.loading && <ActivityIndicator color={colors.blood[600]} />}
        {failed.length > 0 && (
          <ErrorMessage
            message="Kunde inte hämta alla filmer. Kontrollera din anslutning."
            onRetry={retryFailed}
            className="px-6"
          />
        )}
      </View>

      <View className=" justify-center pt-8">
        <Title />
        <View className="mb-8 p-6">
          <Categories label={'trending'} />
        </View>
      </View>

      <View className="mb-24">
        {trending.data && <TrendingFan movies={trending.data.results} onPressMovie={openMovie} />}
      </View>
      <View>
        {popular.data && (
          <MovieCarousel title={'Popular'} movies={popular.data.results} onPressMovie={openMovie} />
        )}
        {topRated.data && (
          <MovieCarousel
            title={'Top rated'}
            movies={topRated.data.results}
            onPressMovie={openMovie}
          />
        )}
        {upcoming.data && (
          <MovieCarousel
            title={'Upcoming'}
            movies={upcoming.data.results}
            onPressMovie={openMovie}
          />
        )}
        {nowPlaying.data && (
          <MovieCarousel
            title={'In theatres'}
            movies={nowPlaying.data.results}
            onPressMovie={openMovie}
          />
        )}
      </View>
    </ScreenBackground>
  );
}
