import { Pressable, Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import colors from 'theme/colors';

export default function ErrorMessage({ message, onRetry, className = '' }) {
  return (
    <View className={`items-center gap-2 py-4 ${className}`} accessibilityRole="alert">
      <AlertCircle size={28} color={colors.blood[400]} />
      <Text className="text-center text-sm text-blood-300">{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          className="mt-1 rounded-xl border border-glass-border bg-glass px-4 py-2 active:opacity-70">
          <Text className="text-sm font-semibold text-text-primary">Försök igen</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
