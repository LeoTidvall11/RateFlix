import ViewAll from 'components/buttons/ViewAll';
import MovieCard from 'components/cards/movieCard';
import CategoryTitle from 'components/text/CategoryTitle';
import { View, FlatList } from 'react-native';

export default function MovieCarousel({ title, movies, onPressMovie }) {
  const limitedSelection = movies?.slice(0, 7) || [];
  return (
    <View className="mx-2  p-4 ">
      <CategoryTitle title={title} />
      <FlatList
        horizontal
        data={limitedSelection}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item }) => <MovieCard item={item} onPress={onPressMovie} />}
      />

      <View className="flex-row justify-end ">
        <ViewAll />
      </View>
    </View>
  );
}
