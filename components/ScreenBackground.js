import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = require('../assets/bg_rateflix.jpg');
const BG_RATIO = 5592 / 1290; // bildens höjd / bredd
const PARALLAX = 0.35; // hur mycket bakgrunden följer med scrollen (1 = lika snabbt som innehållet)

export default function ScreenBackground({ children, contentContainerStyle, ...scrollProps }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const imageHeight = width * BG_RATIO;
  const maxShift = Math.max(imageHeight - height, 0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const bgStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-height, 0, maxShift / PARALLAX],
          [height * PARALLAX, 0, -maxShift],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#040304' }}>
      <Animated.Image
        source={BG}
        resizeMode="cover"
        pointerEvents="none"
        style={[{ position: 'absolute', top: 0, left: 0, width, height: imageHeight }, bgStyle]}
      />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            flexGrow: 1,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 120, // plats för den flytande TabBar
          },
          contentContainerStyle,
        ]}
        {...scrollProps}>
        {children}
      </Animated.ScrollView>
    </View>
  );
}
