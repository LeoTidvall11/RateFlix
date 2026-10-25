import { View, Text, Image, Pressable } from 'react-native';
import { Heart, CircleCheck } from 'lucide-react-native';
import { imageUrl } from 'services/externalApi';
import colors from '../../theme/colors';

export default function PosterTile({ movie, width, onPress, showFavorite, showWatched }) {
  const height = width * 1.5;
  const year = movie.release_date?.split('-')[0];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={year ? `${movie.title}, ${year}` : movie.title}
      style={{ width }}
      className="active:opacity-80">
      <View
        style={{ width, height }}
        className="overflow-hidden rounded-xl bg-ink-600 shadow-lg shadow-blood-600">
        {movie.poster_path ? (
          <Image
            source={{ uri: imageUrl(movie.poster_path, 'w342') }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center p-2">
            <Text className="text-center text-xs text-text-secondary">{movie.title}</Text>
          </View>
        )}

        {showFavorite || showWatched ? (
          <View className="absolute right-1.5 top-1.5 flex-row gap-1">
            {showFavorite ? (
              <View className="rounded-full p-1" style={{ backgroundColor: colors.glass.dark }}>
                <Heart size={12} color={colors.blood[500]} fill={colors.blood[500]} />
              </View>
            ) : null}
            {showWatched ? (
              <View className="rounded-full p-1" style={{ backgroundColor: colors.glass.dark }}>
                <CircleCheck size={12} color={colors.mint} />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <Text numberOfLines={1} className="mt-1.5 text-xs font-semibold text-text-primary">
        {movie.title}
      </Text>
      {year ? <Text className="text-[11px] text-text-muted">{year}</Text> : null}
    </Pressable>
  );
}
