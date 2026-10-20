import React, { useCallback } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useFetch } from 'hooks/useFetch';
import { getMovieDetails, imageUrl } from 'services/externalApi';
import { SkipBack } from 'lucide-react-native';
import colors from '../theme/colors';
import ScreenBackground from 'components/ScreenBackground';

export default function MovieDetailScreen({ route, navigation }) {
  const { movieId } = route.params;

  const fetcher = useCallback(() => getMovieDetails(movieId), [movieId]);
  const { data: movie, loading, error } = useFetch(fetcher);

  const releaseYear = movie?.release_date ? movie.release_date.split('-')[0] : '';

  return (
    <ScreenBackground>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator className="color-blood-700" size="large" />
        </View>
      ) : error || !movie ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center text-text-primary">
            Det gick inte att ladda filmen: {error}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="relative h-80 w-full bg-ink-800">
            {movie.backdrop_path || movie.poster_path ? (
              <Image
                source={{
                  uri: imageUrl(movie.backdrop_path || movie.poster_path, 'w780'),
                }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : null}

            <View className="from-background absolute inset-0 bg-gradient-to-t via-transparent to-black/40" />

            <Pressable
              onPress={() => navigation.goBack()}
              className="absolute left-4 top-12 items-center justify-center rounded-full bg-black/50 p-2 ">
              <SkipBack color={'#F6F1EF'} size={24} />
            </Pressable>
          </View>

          <View className="-mt-8 px-6">
            <Text className="text-3xl font-extrabold text-text-primary">{movie.title}</Text>

            <View className="mt-2 flex-row items-center space-x-4">
              {releaseYear ? (
                <Text className="text-sm text-text-secondary">{releaseYear}</Text>
              ) : null}
              {movie.runtime ? (
                <Text className="text-sm text-text-secondary">{movie.runtime} min</Text>
              ) : null}
              {movie.vote_average ? (
                <View className="rounded-md bg-blood-700/30 px-2 py-0.5">
                  <Text className="text-xs font-bold text-blood-500">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="mt-6">
              <Text className="mb-2 text-lg font-bold text-text-primary">Handling</Text>
              <Text className="text-base leading-6 text-text-secondary">
                {movie.overview || 'Ingen beskrivning tillgänglig.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </ScreenBackground>
  );
}
