import ScreenBackground from 'components/ScreenBackground';
import Categories from '../components/labels/categories';
import { View } from 'react-native';
export default function HomeScreen() {
  return (
    <ScreenBackground>
      <View className="mt-52 justify-center pt-20">
        <Categories />
      </View>
    </ScreenBackground>
  );
}
