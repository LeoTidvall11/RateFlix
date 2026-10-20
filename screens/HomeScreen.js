import ScreenBackground from 'components/ScreenBackground';
import Categories from '../components/buttons/Categories';
import { View, Text, ActivityIndicator } from 'react-native';
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
  const { data, loading, error } = useFetch(fetcher);

  const { data: popular } = useFetch(getPopularMovies);
  const { data: topRated } = useFetch(getTopRatedMovies);
  const { data: upcoming } = useFetch(getUpcomingMovies);
  const { data: nowPlaying } = useFetch(getNowPlayingMovies);
  const openMovie = (movie) => navigation.navigate('movieDetail', { movieId: movie.id });

  return (
    <ScreenBackground>
      <View className="flex-1 items-center justify-center">
        {loading && <ActivityIndicator className="text-xl color-blood-700" />}
        {error && <Text className="p-4 text-center text-text-primary">Fel uppstod: {error}</Text>}
      </View>

      <View className=" justify-center pt-8">
        <Title />
        <View className="mb-8 p-6">
          <Categories label={'trending'} />
        </View>
      </View>

      <View className="mb-24">{data && <TrendingFan movies={data.results} />}</View>
      <View>
        <MovieCarousel title={'Popular'} movies={popular?.results} onPressMovie={openMovie} />
        <MovieCarousel title={'Top rated'} movies={topRated?.results} onPressMovie={openMovie} />
        <MovieCarousel title={'Upcoming'} movies={upcoming?.results} onPressMovie={openMovie} />
        <MovieCarousel
          title={'In theatres'}
          movies={nowPlaying?.results}
          onPressMovie={openMovie}
        />
      </View>
    </ScreenBackground>
  );
}
