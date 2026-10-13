import ScreenBackground from 'components/ScreenBackground';
import Categories from '../components/labels/Categories';
import { View } from 'react-native';
import Title from 'components/text/Title';
export default function HomeScreen() {
  return (
    <ScreenBackground>
      <View className=" justify-center pt-8">
        <Title />
        <View className="p-6">
          <Categories label={'trending'} />
        </View>
      </View>
    </ScreenBackground>
  );
}
