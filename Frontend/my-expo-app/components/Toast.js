import { Pressable, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleCheck, CircleAlert } from 'lucide-react-native';
import colors from 'theme/colors';

const VARIANTS = {
  success: { Icon: CircleCheck, color: colors.mint },
  error: { Icon: CircleAlert, color: colors.blood[400] },
};

export default function Toast({ message, type = 'success', onPress }) {
  const insets = useSafeAreaInsets();
  const { Icon, color } = VARIANTS[type] ?? VARIANTS.success;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16 }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        className="flex-row items-center gap-3 rounded-2xl border bg-ink-800 px-4 py-3"
        style={{ borderColor: color }}>
        <Icon size={20} color={color} />
        <Text className="flex-1 text-sm font-semibold text-text-primary">{message}</Text>
      </Pressable>
    </Animated.View>
  );
}
