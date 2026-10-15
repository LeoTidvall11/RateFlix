import ScreenBackground from 'components/ScreenBackground';
import Categories from '../components/labels/Categories';
import { View, FlatList, Text, Image, ActivityIndicator } from 'react-native';
import Title from 'components/text/Title';
import { useFetch } from 'hooks/useFetch';
import { useCallback } from 'react';
import { getTrendingMovies, imageUrl } from 'services/externalApi';
export default function HomeScreen() {
  const fetcher = useCallback(() => getTrendingMovies('week'), []);
  const { data, loading, error } = useFetch(fetcher);

  return (
    <ScreenBackground>
      <View className=" justify-center pt-8">
        <Title />
        <View className="p-6">
          <Categories label={'trending'} />
        </View>
      </View>
      <View>
        {loading && <ActivityIndicator size="large" color="#F6F1EF" />}
        {error && <Text className="text-text-primary p-4">Fel uppstod: {error}</Text>}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data?.results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="p-4">
              <Text className="text-text-primary">{item.title}</Text>
              {item.poster_path && (
                <Image
                  source={{ uri: imageUrl(item.poster_path, 'w185') }}
                  style={{ width: 100, height: 150 }}
                />
              )}
            </View>
          )}
        />
      </View>
    </ScreenBackground>
  );
}
