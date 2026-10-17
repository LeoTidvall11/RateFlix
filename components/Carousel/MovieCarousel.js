import ViewAll from 'components/buttons/ViewAll';
import MovieCard from 'components/cards/movieCard';
import CategoryTitle from 'components/text/CategoryTitle';
import { View, FlatList } from 'react-native';

export default function MovieCarousel({ title, movies, onPressMovie }) {
  return (
    <View className="mx-2  p-4 ">
      <CategoryTitle title={title} />
      <FlatList
        horizontal
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        showHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item }) => <MovieCard item={item} onPress={onPressMovie} />}
      />

      <View className="flex-row justify-end ">
        <ViewAll />
      </View>
    </View>
  );
}
