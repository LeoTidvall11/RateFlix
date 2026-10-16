import ScreenBackground from 'components/ScreenBackground';
import Categories from '../components/labels/Categories';
import { View, Text, ActivityIndicator } from 'react-native';
import Title from 'components/text/Title';
import { useFetch } from 'hooks/useFetch';
import { useCallback } from 'react';
import { getTrendingMovies } from 'services/externalApi';
import TrendingFan from 'components/cards/TrendingFan';
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
        {loading && <ActivityIndicator className="text-xl color-blood-700" />}
        {error && <Text className="p-4 text-center text-text-primary">Fel uppstod: {error}</Text>}
        {data && <TrendingFan movies={data.results} />}
      </View>
    </ScreenBackground>
  );
}
