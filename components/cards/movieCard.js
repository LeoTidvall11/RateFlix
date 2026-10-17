import { Pressable, View, Text, Image } from 'react-native';
import { imageUrl } from 'services/externalApi';

export default function MovieCard({ item, onPress }) {
  const releaseYear = item.release_date ? item.release_date.split('-')[0] : '';

  return (
    <Pressable onPress={() => onPress && onPress(item)} activeOpacity={0.8} className="mr-4 w-36">
      <View className="h-52 w-36 overflow-hidden rounded-xl bg-ink-600 shadow-lg shadow-blood-600">
        {item.poster_path ? (
          <Image
            source={{ uri: imageUrl(item.poster_path, 'w342') }}
            className="h-full w-full rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center p-2">
            <Text className="text-center text-xs text-text-secondary">{item.title}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
