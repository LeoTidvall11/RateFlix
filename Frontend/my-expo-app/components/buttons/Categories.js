import { Pressable, Text, View } from 'react-native';
import { LiquidGlassView, isLiquidGlassSupported } from '../liquidGlass';
import { BlurView } from 'expo-blur';

export default function Categories({ label, active = false, onPress }) {
  const containerStyle = `self-start overflow-hidden rounded-full border ${
    active ? 'border-ember/60' : 'border-glass-border'
  }`;

  const content = (
    <View className={`p-4 ${active ? 'bg-glass-tint' : 'bg-glass'}`}>
      <Text
        numberOfLines={1}
        className={`text-center font-semibold uppercase tracking-wide ${
          active ? 'text-ember' : 'text-text-primary'
        }`}>
        {label}
      </Text>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
      className="max-w-full">
      {isLiquidGlassSupported ? (
        <LiquidGlassView effect="clear" interactive className={containerStyle}>
          {content}
        </LiquidGlassView>
      ) : (
        <View className={`${containerStyle} bg-black/20 shadow-lg`}>
          <BlurView intensity={40} tint="dark">
            {content}
          </BlurView>
        </View>
      )}
    </Pressable>
  );
}
